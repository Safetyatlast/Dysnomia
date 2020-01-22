module.exports = class Handler {
  constructor(options) {
    if (options.prefix && options.prefix !== "") this.prefix = options.prefix;
    else throw new Error("Invalid Prefix");

    this.guildPrefixes = new Map();
    this.commands = new Map();
  }

  setGuildPrefix(guildID, prefix) {
    if (prefix === this.prefix) this.guildPrefixes.delete(guildID);
    else if (prefix && prefix !== "") this.guildPrefixes.set(guildID, prefix);
  }

  async run(msg) {

  }

};