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
    /* TODO Check Commands
    * - Instance of Command (Done)
    * - Preconditions exist (Done)
    * - Middleware exist (Done)
    * - Names are not already taken
    */
    for (const command of commands) {
      if (command instanceof Command) {
        for (const precondition of command.preconditions) {
          if (!this.preconditions.has(precondition)) throw new Error(`${command.name[0]} - Unknown precondition ${precondition}`);
        }
        for (const middleware of command.middleware) {
          if (!this.middleware.has(middleware)) throw new Error(`${command.name[0]} - Unknown middleware ${middleware}`);
        }
      } else throw new Error("Commands must be a instance of Command")
    }

    if (Array.isArray(commands)) this.commands.concat(commands);
    else if (commands) this.commands.push(commands);
  }

  /**
   * @param {Precondition[] | Precondition} preconditions
   */
  registerPreconditions(preconditions) {
    if (Array.isArray(preconditions)) {
      for (const p of preconditions) {
        this.preconditions.set(p.name, p);
      }
    }
    else if (preconditions) this.preconditions.set(preconditions.name, preconditions);
  }

  /**
   *
   * @param {Middleware[] | Middleware} middleware
   */
  registerMiddleware(middleware) {
    if (Array.isArray(middleware)) {
      for (const m of middleware) {
        this.middleware.set(m.name, m);
      }
    }
    else if (middleware) this.middleware.set(middleware.name, middleware);
  }

  /**
   *
   * @param {TypeReader[] | TypeReader} typeReaders
   */
  registerTypeReaders(typeReaders) {
    if (Array.isArray(typeReaders)) {
      for (const t of typeReaders) {
        this.typeReaders.set(t.name, t);
      }
    }
    else if (typeReaders) this.typeReaders.set(typeReaders.name, typeReaders);
  }

  /**
   *
   * @private
   * @param {Eris.Message} message
   * @returns {{Command: Command, Content: string}|boolean}
   */
  parseCommand(msg) {
    const prefix = msg.channel.guild && this.guildPrefixes.has(msg.channel.guild.id) ? this.guildPrefixes.get(msg.channel.guild.id) : this.prefix;
    if (new RegExp('^' + prefix + '.{1,}', 'i').test(msg.content)) {
      let Content = msg.content.slice(prefix.length);
      const Command = this.commands.find(c => {
        if (c.guildOnly && msg.channel.type !== 0) return false;
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
   * @param {Eris.Message} message
   * @param {Command} command
   * @returns {boolean|String[]}
   */
  checkPermissions(msg, command) {
    if (command.permissions.length > 0) {
      const botMember = msg.channel.guild.get(msg._client.user.id);
      return command.permissions.filter(p => !botMember.permission.has(p));
    } else return true;
  }

  /**
   *
   * @private
   * @param {Eris.Message} message
   * @param {Command} command
   * @returns {Promise<{precondition: Precondition}|{}>}
   */
  async executePreconditions(msg, command) {
    if (command.preconditions.length > 0) {
      for (const pn of command.preconditions) {
        const precondition = this.preconditions.get(pn);
        const r = await Promise.resolve(precondition.run(msg, command));
        if (r) continue;
        return precondition;
      }
    }
  }

  /**
   *
   * @private
   * @param {Eris.Message} message
   * @param {Command} command
   * @returns {Promise<Eris.Message>}
   */
  async executeMiddleware(msg, command) {
    if (command.middleware.length > 0) {
      for (const m of command.middleware) {
        const mw = this.middleware.get(m);
        await Promise.resolve(mw.run(msg, command));
      }
    }
  }

  /**
   *
   * @private
   * @param {String} content
   * @param {Eris.Message} message
   * @param {Command} command
   * @returns {Promise<Object>}
   */
  async parseArguments(content, msg, command) {
    if (command.arguments.length === 0) return {};
    const splitContent = content.split(this.argumentRegex);
    const args = {};
    let splitContentIndex = 0;
    for (let i = 0; i < command.arguments.length; i++) {
      const argument = command.arguments[i];
      const typeReader = this.typeReaders.get(argument.typeReader);
      if (argument.repeatable) {
        for (let o = 0; o < argument.maxRepeats; o++) {
          try {
            args[argument.name] = await Promise.resolve(typeReader.run(splitContent[i], msg, command));
            splitContentIndex++;
          } catch (err) {
            splitContentIndex++;
            if (!argument.optional) return { Argument, Error: err };
            else args[argument.name] = argument.defaultValue;
          }
        }
      } else {
        try {
          args[argument.name] = await Promise.resolve(typeReader.run(splitContent[i], msg, command));
          splitContentIndex++;
        } catch (err) {
          splitContentIndex++;
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
   * @param {Eris.Message} message
   * @param {Command} command
   * @param {Object} arguments
   * @returns {Promise<Object>}
   */
  async executeCommand(msg, command, args) {
    try {
      await Promise.resolve(command.run(msg, args));
    } catch (err) {
      return err;
    }
  }

  /**
   * Returns command if succeeded
   * @param {Eris.Message} msg
   * @returns {Promise<{MissingPermissions: String[], Error: symbol}|{Precondition: Precondition, Error: symbol}|{Argument: Argument, ErrorMessage: String, Error: symbol}|{Exception: Error, Error: symbol}|{Error: symbol}|Command>}
   */
  async run(msg) {
    const result = this.parseCommand(msg);
    if (result) {
      if (result.Command) {
        if (!result.Command.checkCooldown(msg.author.id)) {
          let MissingPermissions = this.checkPermissions(msg, result.Command);
          if (MissingPermissions.length === 0) {
            const Precondition = await this.executePreconditions(msg, result.Command);
            if (!Precondition) {
                await this.executeMiddleware(msg, result.Command);
                const argumentResult = await this.parseArguments(result.Content, msg, result.Command);
                if (!argumentResult.Argument) {
                  const commandError = await this.executeCommand(msg, result.Command, argumentResult);
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