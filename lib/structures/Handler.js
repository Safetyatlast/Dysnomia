const CommandError = require('../enums/CommandError');

module.exports = class Handler {
  constructor(options) {
    if (options.prefix && options.prefix !== "") this.prefix = options.prefix;
    else throw new Error("Invalid prefix");

    this.guildPrefixes = new Map();
    this.commands = [];
  }

  setGuildPrefix(guildID, prefix) {
    if (prefix === this.prefix) this.guildPrefixes.delete(guildID);
    else if (prefix && prefix !== "") this.guildPrefixes.set(guildID, prefix);
  }

  registerCommands(commands) {
    if (Array.isArray(commands)) this.commands.concat(commands);
    else if (commands) this.commands.push(commands);
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

  async run(msg) {
    const result = this.parseCommand(msg);
    if (result) {
      if (result.Command) {
        
      } else {
        return {
          Error: CommandError.UnknownCommand
        }
      }
    } else {
      // What to return if no prefix detected
    }
  }

};