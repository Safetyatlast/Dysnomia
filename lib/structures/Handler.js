"use strict";
const CommandError = require('../enums/CommandError');
const Constants = require('../Constants');
const Argument = require('./Argument');
const TypeReader = require('./TypeReader');
const Precondition = require('./Precondition');
const Middleware = require('./Middleware');
const Command = require('./Command');

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
   * @param {Object} options
   * @param {String} options.prefix Default guild prefix
   * @param {RegExp?} options.argumentRegex Regex used for spiting arguments
   * @returns Handler
   */
  constructor(options) {
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
			if (!this.preconditions.has(precondition)) throw new Error(`${command.name[0]} - Unknown precondition ${precondition}`);
		  }
	  }
	  if (command.middleware.length > 0) {
		  for (const middleware of command.middleware) {
			if (!this.middleware.has(middleware)) throw new Error(`${command.name[0]} - Unknown middleware ${middleware}`);
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
   * @returns {{Command: Command, Content: string}|boolean}
   */
  parseCommand(message) {
    const prefix = message.channel.guild && this.guildPrefixes.has(message.channel.guild.id) ? this.guildPrefixes.get(message.channel.guild.id) : this.prefix;
    if (new RegExp('^' + prefix + '.{1,}', 'i').test(message.content)) {
      let Content = message.content.slice(prefix.length);
      const Command = this.commands.find(c => {
        if (c.guildOnly && message.channel.type !== 0) return false;
        return !!c.names.find(n => {
          if (new RegExp('^' + n + ' ?.{0,}', 'i').test(Content)) {
            Content = Content.slice(n.length).trim();
            return true;
          } else return false;
        });
      });
      return {
        Command,
        Content
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
      const botMember = message.channel.guild.members.get(message._client.user.id);
      return command.permissions.filter(p => !botMember.permission.has(p));
    } else return [];
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
      const typeReader = this.typeReaders.get(argument.typeReader);
      if (argument.repeatable) {
        for (let o = 0; o < argument.maxRepeats; o++) {
          splitContentIndex++;
          try {
            args[argument.name] = await Promise.resolve(typeReader.run(splitContent[i], message, command));
          } catch (err) {
            if (!argument.optional) return { Argument, Error: err };
            else args[argument.name] = argument.defaultValue;
          }
        }
      } else {
        splitContentIndex++;
        try {
          args[argument.name] = await Promise.resolve(typeReader.run(splitContent[i], message, command));
        } catch (err) {
          if (!argument.optional) return { Argument, Error: err };
          else args[argument.name] = argument.defaultValue;
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
   * @param {Object} arguments
   * @returns {Promise<Object>}
   */
  async executeCommand(message, command, args) {
    try {
      await Promise.resolve(command.run(message, args));
    } catch (err) {
      return err;
    }
  }

  /**
   * Returns command if succeeded
   * @param {import("eris").Message} message
   * @returns {Promise<{MissingPermissions: String[], Error: symbol}|{Precondition: Precondition, Error: symbol}|{Argument: Argument, ErrorMessage: String, Error: symbol}|{Exception: Error, Error: symbol}|{Error: symbol}|Command>}
   */
  async run(message) {
    const result = this.parseCommand(message);
    if (result) {
      if (result.Command) {
        if (!result.Command.checkCooldown(message.author.id)) {
          let MissingPermissions = this.checkPermissions(message, result.Command);
          if (MissingPermissions.length === 0) {
            const Precondition = await this.executePreconditions(message, result.Command);
            if (!Precondition) {
                await this.executeMiddleware(message, result.Command);
                const argumentResult = await this.parseArguments(result.Content, message, result.Command);
                if (!argumentResult.Argument) {
                  const commandError = await this.executeCommand(message, result.Command, argumentResult);
                  if (!commandError) return result.Command;
                  else {
                    return {
                      Error: CommandError.Exception,
                      Exception: commandError
                    }
                  }
                } else {
                  return {
                    Error: CommandError.Argument,
                    Argument: argumentResult.Argument,
                    ErrorMessage: argumentResult.Error
                  }
                }
            } else {
              return {
                Error: CommandError.Precondition,
                Precondition
              }
            }
          } else {
            return {
              Error: CommandError.MissingPermissions,
              MissingPermissions,
            }
          }
        } else {
          return {
            Error: CommandError.Cooldown
          }
        }
      } else {
        return {
          Error: CommandError.UnknownCommand
        }
      }
    } else {
      return {
        Error: CommandError.Prefix
      }
    }
  }
}

module.exports = Handler;