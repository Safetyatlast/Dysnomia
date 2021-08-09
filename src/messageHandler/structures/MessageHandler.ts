"use strict";
import {Client, GuildChannel, Member, Message, Permission, User, Role, Channel, Constants as ErisConstants } from 'eris';

import CommandError from '../enums/CommandError';
import Constants from '../Constants';
import Argument from './Argument';
import TypeReader from './TypeReader';
import Precondition from './Precondition';
import Middleware from './Middleware';
import Command from './Command';
import MultiRequire from '../../util/MultiRequire';

/**
 *
 * @property {string} prefix Default guild prefix
 * @property {RegExp} argumentRegex Regex used for spiting arguments
 * @property {Map} guildPrefixes Map of registered guild prefixes
 * @property {Command[]} commands Array of registered commands
 * @property {Map} commands Map of registered middleware
 * @property {Map} typeReaders Map of registered typeReaders
 * @property {Map} cooldowns Map of User Cooldowns
 */
export default class MessageHandler {
  client: Client;
  prefix: string;
  argumentRegex: RegExp;
  cooldown: number;
  guildPrefixes: Map<string, string>;
  commands: Command[];
  preconditions: Map<string, Precondition>;
  middleware: Map<string, Middleware>;
  typeReaders: Map<string, TypeReader>;
  cooldowns: Map<string, number>;

  /**
   *
   * @param {Client} client Eris client
   * @param {object} options
   * @param {string} options.prefix Default guild prefix
   * @param {RegExp?} options.argumentRegex Regex used for spiting arguments
   * @param {Number} options.cooldown How long before a user can use a command again
   * @returns MessageHandler
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

    if (options.cooldown) {
      if (!isNaN(options.cooldown)) this.cooldown = options.cooldown;
      else throw new Error("Cooldown must be a number");
    } else this.cooldown = 0;

    this.guildPrefixes = new Map();
    this.commands = [];
    this.preconditions = new Map();
    this.middleware = new Map();
    this.typeReaders = new Map();
    this.cooldowns = new Map();

  }

  /**
   *
   * @return {Promise<void>}
   */
  async loadDefaultTypeReaders() {
    this.registerTypeReaders(await MultiRequire(__dirname + '/../typeReaders/'));
  }

  /**
   *
   * @param {string} guildID
   * @param {string} prefix
   */
  registerGuildPrefix(guildID: string, prefix: string) {
    if (prefix === this.prefix) this.guildPrefixes.delete(guildID);
    else if (prefix && prefix !== "") this.guildPrefixes.set(guildID, prefix);
  }

  /**
   *
   * @param {string} guildID
   */
  deregisterGuildPrefix(guildID: string) {
    this.guildPrefixes.delete(guildID);
  }

  /**
   *
   * @param {Command[] | Command} commands
   */
  registerCommands(commands: any[] | any) {
    if (!Array.isArray(commands)) commands = [commands];

    const names = this.commands.map(c => c.names);
    for (const command of commands) {
      if (!(command instanceof Command)) throw new Error("Commands must be a instance of Command");
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

      if (command.arguments.length > 0) {
        const argumentNames = command.arguments.map(a => a.name);
        for (const argument of command.arguments) {
          if (argumentNames.filter(an => an === argument.name).length > 1) throw new Error(`Command ${command.names[0]} already has a duplicate argument name`);
          if (!argument.typeReaders.find(trn => this.typeReaders.has(trn))) throw new Error(`Command ${command.names[0]}, argument ${argument.name} references unknown typeReader`);
        }
      }

      if (names.filter(nl => nl.find(n => command.names.includes(n))).length > 0) throw new Error(`Command ${command.names[0]} already exist`);
      else names.push(command.names);
    }

    this.commands = this.commands.concat(commands);
  }

  /**
   * @param {Precondition[] | Precondition} preconditions
   */
  registerPreconditions(preconditions: Precondition[] | Precondition) {
    if (!Array.isArray(preconditions)) preconditions = [preconditions];

    const names = preconditions.map(p => p.name);
    for (const precondition of preconditions) {
      if (!(precondition instanceof Precondition)) throw new Error("Precondition must be a instance of Preconditions");
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
  registerMiddleware(middleware: Middleware[] | Middleware) {
    if (!Array.isArray(middleware)) middleware = [middleware];

    const names = middleware.map(m => m.name);
    for (const m of middleware) {
      if (!(m instanceof Middleware)) throw new Error("Middleware must be a instance of Middleware");
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
  registerTypeReaders(typeReaders: any[] | any) {
    if (!Array.isArray(typeReaders)) typeReaders = [typeReaders];

    const names: string[] = [];
    for (let typeReader of typeReaders) {
      if (typeof typeReader === "function") typeReader = new typeReader(); // not constructed, construct it
      if (typeof typeReader.default === "function") typeReader = new typeReader.default(); // dynamic import, construct it from default export
      if (!(typeReader instanceof TypeReader)) throw new Error("TypeReader" + " must be a instance of TypeReader");
      if (this.typeReaders.has(typeReader.name) || names.filter(n => n === typeReader.name).length !== 0) throw new Error(`TypeReader ${typeReader.name} already exist`);
      names.push(typeReader.name);
      this.typeReaders.set(typeReader.name, typeReader);
    }
  }

  /**
   *
   * @private
   * @param {Message} message
   * @returns {{Command: Command, Content: string, Prefix: string}|boolean}
   */
  parseCommand(message: Message) : {Command: Command, Content: string, Prefix: string} | void {
    let prefix: string = this.prefix;
    if (message.channel instanceof GuildChannel) {
      if (this.guildPrefixes.has(message.channel.guild.id)) prefix = this.guildPrefixes.get(message.channel.guild.id);
    }
    if (new RegExp('^' + prefix + '.{1,}', 'i').test(message.content)) {
      let Content = message.content.slice(prefix.length);
      let Commands = this.commands.filter(c => {
        if (c.guildOnly && message.channel.type !== 0) return false;
        const nameFound = c.names.find(n => {
          return new RegExp('^' + n + '(( .{0,})|$)', 'i').test(Content);
        });
        if (nameFound) c.nameUsed = nameFound;
        return !!nameFound;
      });
      let command;
      if (Commands.length === 0) return;
      else if (Commands.length > 1) {
        const CommandsNameLength = Commands.map(c => {
          return {c, l: c.nameUsed.split(" ").length}
        }).sort((a: {c: Command, l: number}, b: {c: Command, l: number}) => b.l - a.l);
        command = CommandsNameLength[0].c;
      } else command = Commands[0];
      Content = Content.slice(command.nameUsed.length).trim();
      return {
        Command: command,
        Content: Content || '',
        Prefix: prefix
      }
    } else return;
  }

  /**
   *
   * @private
   * @param {Message} message
   * @param {Command} command
   * @returns {string[]|[]}
   */
  checkPermissions(message: Message, command: Command) : string[] | String {
    if (command.permissions.length > 0 && message.channel instanceof GuildChannel) {
      const perms: Permission = message.channel.permissionsOf(this.client.user.id);

      return command.permissions.filter(p => !perms.has(ErisConstants["Permissions"][p]));
    } else return [];
  }

  /**
   * Default getUser function, override if you want to use a custom getter
   * @param {string} userID
   * @returns {User}
   */
  async getUser(userID: string) : Promise<User> {
    return this.client.users.get(userID);
  }

  /**
   * Default getMember function, override if you want to use a custom getter
   * @param {string} guildID
   * @param {string} memberID
   * @returns {Member}
   */
  async getMember(guildID: string, memberID: string) : Promise<Member> {
    return this.client.guilds.get(guildID).members.get(memberID);
  }

  /**
   * Default getRole function, override if you want to use a custom getter
   * @param {string} guildID
   * @param {string} roleID
   * @returns {Role}
   */
  async getRole(guildID: string, roleID: string) : Promise<Role> {
    return this.client.guilds.get(guildID).roles.get(roleID);
  }

  /**
   * Default getChannel function, override if you want to use a custom getter
   * @param {string} guildID
   * @param {string} channelID
   * @returns {Channel}
   */
  async getChannel(guildID: string, channelID: string) : Promise<Channel> {
    return this.client.guilds.get(guildID).channels.get(channelID);
  }

  /**
   *
   * @private
   * @param {Message} message
   * @param {Command} command
   * @returns {Promise<Precondition|{}>}
   */
  async executePreconditions(message: Message, command: Command) : Promise<Precondition | {}> {
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
   * @param {Message} message
   * @param {Command} command
   * @returns {Promise<Message | void>}
   */
  async executeMiddleware(message: Message, command: Command) : Promise<Message | void> {
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
   * @param {string} content
   * @param {Message} message
   * @param {Command} command
   * @returns {Promise<object>}
   */
  async parseArguments(content: string, message: Message, command: Command) : Promise<{ Argument: Argument, Error: { Message: string, Errors: {[key: string]: Error} } } | { [key: string]: any } | {}> {
    if (command.arguments.length === 0) return {};
    const splitContent = content.split(this.argumentRegex);
    const args = {};
    let splitContentIndex = 0;
    for (let i = 0; i < command.arguments.length; i++) {
      const argument = command.arguments[i];
      if (argument.repeatable) {
        args[argument.name] = [];
        for (let o = 0; o < argument.maxRepeats; o++) {
          if (argument.typeReaders.length > 1) {
            const errors: {[key: string]: Error} = {};
            let match = false;
            for (const trn of argument.typeReaders) {
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
                Argument: argument,
                Error: {
                  Message: 'No typeReader matched',
                  Errors: errors
                }
              };
              else args[argument.name].push(argument.defaultValue);
            }
          } else {
            const typeReader = this.typeReaders.get(argument.typeReaders[0]);
            try {
              args[argument.name].push(await Promise.resolve(typeReader.run(splitContent[splitContentIndex], message, argument.typeReaderOptions, command, this)));
              splitContentIndex++;
            } catch (err) {
              if (splitContentIndex > 0) break;
              if (!argument.optional) return { Argument: argument, Error: err };
              else break;
            }
          }
        }
      } else {
        if (argument.typeReaders.length > 1) {
          const errors = {};
          let match = false;
          for (const trn of argument.typeReaders) {
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
              Argument: argument,
              Error: {
                Message: 'No typeReader matched',
                Errors: errors
              }
            };
            else args[argument.name] = argument.defaultValue;
          }
        } else {
          const typeReader = this.typeReaders.get(argument.typeReaders[0]);
          try {
            args[argument.name] = await Promise.resolve(typeReader.run(splitContent[splitContentIndex], message, argument.typeReaderOptions, command, this));
            splitContentIndex++;
          } catch (err) {
            if (!argument.optional) return { Argument: argument, Error: err };
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
   * @param {Message} message
   * @param {Command} command
   * @param {object} args
   * @returns {Promise<object>}
   */
  async executeCommand(message: Message, command: Command, args: { [key: string]: any }) : Promise<object> {
    try {
      await Promise.resolve(command.run(message, command, args));
    } catch (err) {
      return err;
    }
  }

  /**
   * Check if the user has exceeded their limits
   * @param {string} userID
   * @returns {boolean} whether the user is on a cooldown.
   */
  checkCooldown(userID: string) : boolean {
    if (this.cooldowns.has(userID)) {
      if (this.cooldowns.get(userID) + this.cooldown > Date.now()) return true;
      else {
        this.cooldowns.delete(userID);
        return false;
      }
    }
    else return false;
  }

  /**
   * Sets the last time the user used a command to now.
   * @param {string} userID
   */
  updateCooldown(userID: string) {
    this.cooldowns.set(userID, Date.now());
  }

  /**
   * Returns command if succeeded
   * @param {Message} message
   * @returns {Promise<{Command: Command, Prefix: string, MissingPermissions: string[], Error: symbol}|{Command: Command, Prefix: string, Precondition: Precondition, Error: symbol}|{Command: Command, Prefix: string, Argument: Argument, ErrorMessage: string, Error: symbol}|{Command: Command, Prefix: string, Exception: Error, Error: symbol}|{Command: Command, Prefix: string, Error: symbol}|{Prefix: string, Error: symbol}|{Error: symbol}|{Command: Command, Prefix: string}>}
   */
  async run(message) {
    const result = this.parseCommand(message);
    if (result && typeof result !== 'boolean') {
      if (result.Command) {
        if (this.cooldown === 0 || !this.checkCooldown(message.author.id)) {
          if (this.cooldown > 0) this.updateCooldown(message.author.id);
          let MissingPermissions = message.channel.type === 0 ? this.checkPermissions(message, result.Command) : [];
          if (MissingPermissions.length === 0) {
            const Precondition = await this.executePreconditions(message, result.Command);
            if (!Precondition) {
                await this.executeMiddleware(message, result.Command);
                const argumentResult = await this.parseArguments(result.Content, message, result.Command);
                if (!('Argument' in argumentResult)) {
                  message.prefix = result.Prefix;
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

module.exports = MessageHandler;