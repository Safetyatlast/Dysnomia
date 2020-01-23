module.exports = class Handler {
  constructor(options) {
    if (options.prefix && options.prefix !== "") this.prefix = options.prefix;
    else throw new Error("Invalid Prefix");

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
      const content = msg.content.slice(prefix.length);

    } else return false;
  }

  async run(msg) {
    this.parseCommand(msg);
  }

};