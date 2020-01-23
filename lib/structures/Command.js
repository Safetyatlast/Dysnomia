"use strict";

module.exports = class Command {
  constructor(options) {
    if (Array.isArray(options.names)) this.names = options.names;
    else if (typeof options.names === 'string' && options.names !== "") this.names = [options.names];
    else throw new Error("Invalid Command Name(s) provided");

    this.guildOnly = options.guildOnly != null ? options.guildOnly : false;

    if (Array.isArray(options.permissions)) this.permissions = options.permissions;
    else if (typeof options.permissions === 'string' && options.permissions !== "") this.permissions = [options.permissions];
    else this.permissions = [];
  }

  async run() {};
};