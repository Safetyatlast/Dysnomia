"use strict";

module.exports = class Command {
  constructor(options) {
    if (Array.isArray(options.names)) this.names = options.names;
    else if (typeof options.names === 'string') this.names = [options.names];
    else throw new Error("Invalid Command Name(s) provided");

  }

  async run() {};
};