"use strict";
/**
 *
 * @property {String|String[]} names Names of the command
 * @property {boolean} guildOnly If the command can only be run in a guild
 * @property {String|String[]} permissions Permissions the bot requires to run the command
 * @property {Number} cooldown How long until a member can run the command again
 * @property {String|String[]} preconditions Preconditions to run before running the command
 * @property {String|String[]} middleware Middleware to run before running the command
 * @property {String|String[]} arguments Arguments for the commands
 */
class Command {
  /**
   *
   * @param {Object} options
   * @param {String[] | String} options.names
   * @param {String[] | String} options.permissions
   * @param {Number} options.cooldown
   * @param {String[] | String} options.preconditions
   * @param {String[] | String} options.middleware
   * @param {Argument[] | Argument} options.arguments
   * @returns Command
   */
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

    if (Array.isArray(options.middleware)) this.middleware = options.middleware;
    else if (typeof options.middleware === 'string' && options.middleware !== "") this.middleware = [options.middleware];
    else this.middleware = [];

    if (Array.isArray(options.arguments)) this.arguments = options.arguments;
    else if (typeof options.arguments === "object") this.arguments = [options.arguments];
    else this.arguments = [];
  }

  /**
   *
   * @param {String} userID
   * @returns {boolean} whether the user is allowed to run the command again.
   */
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

  /**
   * Sets the last time the user used the command to now.
   * @param {String} userID
   */
  updateCooldown(userID) {
    this.cooldowns.set(userID, Date.now());
  }

  /**
   *
   * @param {Eris.Message} message
   * @param {Object} arguments
   */
  async run() {};
}

module.exports = Command;