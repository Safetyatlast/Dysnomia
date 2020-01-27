const CommandError = require('../enums/CommandError');
const Constants = require('../Constants');

module.exports = class Handler {
  constructor(options) {
    if (options.prefix && options.prefix !== "") this.prefix = options.prefix;
    else throw new Error("Invalid prefix");

    if (options.argumentRegex) {
      if (options.argumentRegex instanceof RegExp) this.argumentRegex = options.argumentRegex;
      else throw new Error("Invalid argument regex");
    }

    this.guildPrefixes = new Map();
    this.commands = [];
    this.preconditions = new Map();
    this.middleware = new Map();
  }

  setGuildPrefix(guildID, prefix) {
    if (prefix === this.prefix) this.guildPrefixes.delete(guildID);
    else if (prefix && prefix !== "") this.guildPrefixes.set(guildID, prefix);
  }

  registerCommands(commands) {
    /* TODO Check Commands
    * - Instance of Command
    * - Preconditions exist
    * - Middleware exist
    * - Names are not already taken
    */
    if (Array.isArray(commands)) this.commands.concat(commands);
    else if (commands) this.commands.push(commands);
  }

  registerPreconditions(preconditions) {
    if (Array.isArray(preconditions)) {
      for (const p of preconditions) {
        this.preconditions.set(p.name, p);
      }
    }
    else if (preconditions) this.preconditions.set(preconditions.name, preconditions);
  }

  registerMiddleware(middleware) {
    if (Array.isArray(middleware)) {
      for (const m of middleware) {
        this.middleware.set(m.name, m);
      }
    }
    else if (middleware) this.preconditions.set(middleware.name, middleware);
  }

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

  checkPermissions(msg, command) {
    if (command.permissions.length > 0) {
      const botMember = msg.channel.guild.get(msg._client.user.id);
      return command.permissions.filter(p => !botMember.permission.has(p));
    } else return true;
  }

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

  async executeMiddleware(msg, command) {
    if (command.middleware.length > 0) {
      for (const m of command.middleware) {
        const mw = this.middleware.get(m);
        const r = await Promise.resolve(mw.run(msg, command));
        if (r) msg = r;
      }
    }
  }

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
                const args = result.content.split(this.argumentRegex || Constants.regexes.argumentRegex);
                  //TODO Run Type Readers
                    //TODO Execute Command.run()
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
      //TODO: What to return if no prefix detected
    }
  }

};