"use strict";
const CommandError = require('../enums/CommandError');
const Constants = require('../Constants');
const Argument = require('./Argument');
const TypeReader = require('./TypeReader');
const Precondition = require('./Precondition');
const Middleware = require('./Middleware');
const Command = require('./Command');
const MultiRequire = require('../util/MultiRequire');

/**
 *
 * @property {String} prefix Default guild prefix
 * @property {RegExp} argumentRegex Regex used for spiting arguments
 * @property {Map} guildPrefixes Map of registered guild prefixes
 * @property {Command[]} commands Array of registered commands
 * @property {Map} commands Map of registered middleware
 * @property {Map} typeReaders Map of registered typeReaders
 */
class Handler {
  /**
   *
   * @param {import("eris").Client} client Eris client
   * @param {Object} options
   * @param {String} options.prefix Default guild prefix
   * @param {RegExp?} options.argumentRegex Regex used for spiting arguments
   * @returns Handler
   */
  constructor(client, options) {
    if (client) this.client = client
    else throw new Error("Client Undefined");

    if (options.prefix && options.prefix !== "") this.prefix = options.prefix;
    else throw new Error("Invalid prefix");

    if (options.argumentRegex) {
      if (options.argumentRegex instanceof RegExp) this.argumentRegex = options.argumentRegex;
      else throw new Error("Invalid argument regex");
    } else this.argumentRegex = Constants.regexes.argumentRegex;

    this.guildPrefixes = new Map();
    this.commands = [];
    this.preconditions = new Map();
    this.middleware = new Map();
    this.typeReaders = new Map();

  }

  /**
   *
   * @return {Promise<void>}
   */
  async loadDefaultTypeReaders() {
    this.registerTypeReaders(await MultiRequire(__dirname + '/../typereaders/'));
  }

  /**
   *
   * @param {String} guildID
   * @param {String} prefix
   */
  registerGuildPrefix(guildID, prefix) {
    if (prefix === this.prefix) this.guildPrefixes.delete(guildID);
    else if (prefix && prefix !== "") this.guildPrefixes.set(guildID, prefix);
  }

  /**
   *
   * @param {Command[] | Command} commands
   */
  registerCommands(commands) {
    if (!Array.isArray(commands)) commands = [commands];

    const names = commands.map(c => c.names);
    for (const command of commands) {
      if (!command instanceof Command) throw new Error("Commands must be a instance of Command");
	  if (command.preconditions.length > 0) {
		  for (const precondition of command.preconditions) {
			  if (!this.preconditions.has(precondition)) throw new Error(`${command.names[0]} - Unknown precondition ${precondition}`);
		  }
	  }
	  if (command.middleware.length > 0) {
		  for (const middleware of command.middleware) {
			  if (!this.middleware.has(middleware)) throw new Error(`${command.names[0]} - Unknown middleware ${middleware}`);
		  }
	  }

      if (this.commands.find(c => c.names.includes(c)) || names.filter(nl => nl.find(n => command.names.includes(n))).length !== 1) throw new Error(`Command ${command.names[0]} already exist`);
    }

    this.commands = this.commands.concat(commands);
  }

  /**
   * @param {Precondition[] | Precondition} preconditions
   */
  registerPreconditions(preconditions) {
    if (!Array.isArray(preconditions)) preconditions = [preconditions];

    const names = preconditions.map(p => p.name);
    for (const precondition of preconditions) {
      if (!precondition instanceof Precondition) throw new Error("Precondition must be a instance of Preconditions");
      if (this.preconditions.has(precondition.name) || names.filter(n => n === precondition.name).length !== 1) throw new Error(`Precondition ${precondition.name} already exist`);
    }
    for (const p of preconditions) {
      this.preconditions.set(p.name, p);
    }
  }

  /**
   *
   * @param {Middleware[] | Middleware} middleware
   */
  registerMiddleware(middleware) {
    if (!Array.isArray(middleware)) middleware = [middleware];

    const names = middleware.map(m => m.name);
    for (const m of middleware) {
      if (!m instanceof Middleware) throw new Error("Middleware must be a instance of Middleware");
      if (this.middleware.has(m.name) || names.filter(n => n === m.name).length !== 1) throw new Error(`Middleware ${m.name} already exist`);
    }

    for (const m of middleware) {
      this.middleware.set(m.name, m);
    }
  }

  /**
   *
   * @param {TypeReader[] | TypeReader} typeReaders
   */
  registerTypeReaders(typeReaders) {
    if (!Array.isArray(typeReaders)) typeReaders = [typeReaders];

    const names = typeReaders.map(t => t.name);
    for (const typeReader of typeReaders) {
      if (!typeReader instanceof TypeReader) throw new Error("TypeReader must be a instance of TypeReader");
      if (this.typeReaders.has(typeReader.name) || names.filter(n => n === typeReader.name).length !== 1) throw new Error(`TypeReader ${typeReader.name} already exist`);
    }

    for (const t of typeReaders) {
      this.typeReaders.set(t.name, t);
    }
  }

  /**
   *
   * @private
   * @param {import("eris").Message} message
   * @returns {{Command: Command, Content: String, Prefix: String}|boolean}
   */
  parseCommand(message) {
    const prefix = message.channel.guild && this.guildPrefixes.has(message.channel.guild.id) ? this.guildPrefixes.get(message.channel.guild.id) : this.prefix;
    if (new RegExp('^' + prefix + '.{1,}', 'i').test(message.content)) {
      let Content = message.content.slice(prefix.length);
      let Commands = this.commands.filter(c => {
        if (c.guildOnly && message.channel.type !== 0) return false;
        const nameFound = c.names.find(n => {
          if (new RegExp('^' + n + '(( .{0,})|$)', 'i').test(Content)) {
            return true;
          } else return false;
        });
        if (nameFound) c.NameUsed = nameFound;
        return !!nameFound;
      });
      let command;
      if (Commands.length === 0) return undefined;
      else if (Commands.length > 1) {
        Commands = Commands.map(c => {
          return {c, l: c.NameUsed.split(" ").length}
        }).sort((a, b) => b.l - a.l);
        command = Commands[0].c;
      } else command = Commands[0];
      Content = Content.slice(command.NameUsed.length).trim();
      return {
        Command: command,
        Content: Content || '',
        Prefix: prefix
      }
    } else return false;
  }

  /**
   *
   * @private
   * @param {import("eris").Message} message
   * @param {Command} command
   * @returns {String[]|[]}
   */
  checkPermissions(message, command) {
    if (command.permissions.length > 0) {
      const perms = message.channel.permissionsOf(this.client.user.id);

      return command.permissions.filter(p => !perms.has(p));
    } else return [];
  }

  /**
   * Default getUser function, override if you want to use a custom getter
   * @param {String} userID
   * @returns {import("eris").User}
   */
  async getUser(userID) {
    return this.client.users.get(userID);
  }

  /**
   * Default getMember function, override if you want to use a custom getter
   * @param {String} guildID
   * @param {String} memberID
   * @returns {import("eris").User}
   */
  async getMember(guildID, memberID) {
    return this.client.guilds.get(guildID).members.get(memberID);
  }

  /**
   * Default getRole function, override if you want to use a custom getter
   * @param {String} guildID
   * @param {String} roleID
   * @returns {import("eris").Role}
   */
  async getRole(guildID, roleID) {
    return this.client.guilds.get(guildID).roles.get(roleID);
  }

  /**
   * Default getChannel function, override if you want to use a custom getter
   * @param {String} guildID
   * @param {String} channelID
   * @returns {import("eris").channel}
   */
  async getChannel(guildID, channelID) {
    return this.client.guilds.get(guildID).channels.get(channelID);
  }

  /**
   *
   * @private
   * @param {import("eris").Message} message
   * @param {Command} command
   * @returns {Promise<{precondition: Precondition}|{}>}
   */
  async executePreconditions(message, command) {
    if (command.preconditions.length > 0) {
      for (const pn of command.preconditions) {
        const precondition = this.preconditions.get(pn);
        const r = await Promise.resolve(precondition.run(message, command));
        if (r) continue;
        return precondition;
      }
    }
  }

  /**
   *
   * @private
   * @param {import("eris").Message} message
   * @param {Command} command
   * @returns {Promise<import("eris").Message>}
   */
  async executeMiddleware(message, command) {
    if (command.middleware.length > 0) {
      for (const m of command.middleware) {
        const mw = this.middleware.get(m);
        await Promise.resolve(mw.run(message, command));
      }
    }
  }

  /**
   *
   * @private
   * @param {String} content
   * @param {import("eris").Message} message
   * @param {Command} command
   * @returns {Promise<Object>}
   */
  async parseArguments(content, message, command) {
    if (command.arguments.length === 0) return {};
    const splitContent = content.split(this.argumentRegex);
    const args = {};
    let splitContentIndex = 0;
    for (let i = 0; i < command.arguments.length; i++) {
      const argument = command.arguments[i];
      if (argument.repeatable) {
        args[argument.name] = [];
        for (let o = 0; o < argument.maxRepeats; o++) {
          if (Array.isArray(argument.typeReader)) {
            const errors = {};
            let match = false;
            for (const trn of argument.typeReader) {
              const tr = this.typeReaders.get(trn);
              try {
                args[argument.name].push(await Promise.resolve(tr.run(splitContent[splitContentIndex], message, argument.typeReaderOptions, command, this)));
                splitContentIndex++;
                match = true;
                break;
              } catch (err) {
                errors[tr.name] = err;
              }
            }
            if (!match) {
              if (splitContentIndex > 0) break;
              if (!argument.optional) return {
                Argument,
                Error: {
                  Message: 'No typeReader matched',
                  Errors: errors
                }
              };
              else args[argument.name].push(argument.defaultValue);
            }
          } else {
            const typeReader = this.typeReaders.get(argument.typeReader);
            try {
              args[argument.name].push(await Promise.resolve(typeReader.run(splitContent[splitContentIndex], message, argument.typeReaderOptions, command, this)));
              splitContentIndex++;
            } catch (err) {
              if (splitContentIndex > 0) break;
              if (!argument.optional) return { Argument, Error: err };
              else args[argument.name].push(argument.defaultValue);
            }
          }
        }
      } else {
        if (Array.isArray(argument.typeReader)) {
          const errors = {};
          let match = false;
          for (const trn of argument.typeReader) {
            const tr = this.typeReaders.get(trn);
            try {
              args[argument.name] = await Promise.resolve(tr.run(splitContent[splitContentIndex], message, argument.typeReaderOptions, command, this));
              splitContentIndex++;
              match = true;
              break;
            } catch (err) {
              errors[tr.name] = err;
            }
          }
          if (!match) {
            if (!argument.optional) return {
              Argument,
              Error: {
                Message: 'No typeReader matched',
                Errors: errors
              }
            };
            else args[argument.name] = argument.defaultValue;
          }
        } else {
          const typeReader = this.typeReaders.get(argument.typeReader);
          try {
            args[argument.name] = await Promise.resolve(typeReader.run(splitContent[splitContentIndex], message, argument.typeReaderOptions, command, this));
            splitContentIndex++;
          } catch (err) {
            if (!argument.optional) return { Argument, Error: err };
            else args[argument.name] = argument.defaultValue;
          }
        }
      }
    }
    return args;
  }

  /**
   *
   * @private
   * @param {import("eris").Message} message
   * @param {Command} command
   * @param {Object} args
   * @returns {Promise<Object>}
   */
  async executeCommand(message, command, args) {
    try {
      await Promise.resolve(command.run(message, command, args));
    } catch (err) {
      return err;
    }
  }

  /**
   * Returns command if succeeded
   * @param {import("eris").Message} message
   * @returns {Promise<{Command: Command, Prefix: String, MissingPermissions: String[], Error: symbol}|{Command: Command, Prefix: String, Precondition: Precondition, Error: symbol}|{Command: Command, Prefix: String, Argument: Argument, ErrorMessage: String, Error: symbol}|{Command: Command, Prefix: String, Exception: Error, Error: symbol}|{Command: Command, Prefix: String, Error: symbol}|{Prefix: String, Error: symbol}|{Error: symbol}|{Command: Command, Prefix: String}>}
   */
  async run(message) {
    const result = this.parseCommand(message);
    if (result) {
      if (result.Command) {
        if (!result.Command.checkCooldown(message.author.id)) {
          result.Command.updateCooldown(message.author.id);
          let MissingPermissions = this.checkPermissions(message, result.Command);
          if (MissingPermissions.length === 0) {
            const Precondition = await this.executePreconditions(message, result.Command);
            if (!Precondition) {
                await this.executeMiddleware(message, result.Command);
                const argumentResult = await this.parseArguments(result.Content, message, result.Command);
                if (!argumentResult.Argument) {
                  const commandError = await this.executeCommand(message, result.Command, argumentResult);
                  if (!commandError) return {
                    Command: result.Command,
                    Prefix: result.Prefix
                  };
                  else return {
                    Command: result.Command,
                    Prefix: result.Prefix,
                    Error: CommandError.Exception,
                    Exception: commandError
                  }
                } else return {
                  Command: result.Command,
                  Prefix: result.Prefix,
                  Error: CommandError.Argument,
                  Argument: argumentResult.Argument,
                  ErrorMessage: argumentResult.Error
                }
            } else return {
              Command: result.Command,
              Prefix: result.Prefix,
              Error: CommandError.Precondition,
              Precondition
            }
          } else return {
            Command: result.Command,
            Prefix: result.Prefix,
            Error: CommandError.MissingPermissions,
            MissingPermissions,
          }
        } else return {
          Command: result.Command,
          Prefix: result.Prefix,
          Error: CommandError.Cooldown
        }
      } else return {
        Prefix: result.Prefix,
        Error: CommandError.UnknownCommand
      }
    } else return {
      Error: CommandError.Prefix
    }
  }
}

module.exports = Handler;