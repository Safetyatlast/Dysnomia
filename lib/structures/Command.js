"use strict";

module.exports = class Command {
  constructor(options) {
    if (Array.isArray(options.names)) this.names = options.names;
    else if (typeof options.names === 'string' && options.names !== "") this.names = [options.names];
    else throw new Error("Invalid command name(s) provided");

    this.guildOnly = options.guildOnly != null ? options.guildOnly : false;

    if (Array.isArray(options.permissions)) this.permissions = options.permissions;
    else if (typeof options.permissions === 'string' && options.permissions !== "") this.permissions = [options.permissions];
    else this.permissions = [];

    if (options.cooldown) {
      if (!isNaN(options.cooldown)) this.cooldown = options.cooldown;
      else throw new Error("Cooldown must be a number");
    } else this.cooldown = 0;

    this.cooldowns = new Map();

    if (Array.isArray(options.preconditions)) this.preconditions = options.preconditions;
    else if (typeof options.preconditions === 'string' && options.preconditions !== "") this.preconditions = [options.preconditions];
    else this.preconditions = [];
  }

  checkCooldown(userID) {
    if (this.cooldowns.has(userID)) {
      if (this.cooldowns.get(userID) + this.cooldown > Date.now()) return true;
      else {
        this.cooldowns.delete(userID);
        return false;
      }
    }
    else return false;
  }

  updateCooldown(userID) {
    this.cooldowns.set(userID, Date.now());
  }

  async run() {};
};