"use strict";
import { Message } from 'eris';
import Argument from "./Argument";

/**
 *
 * @property {string[]} names Names of the command
 * @property {boolean} guildOnly If the command can only be run in a guild
 * @property {string[]} permissions Permissions the bot requires to run the command
 * @property {Number} cooldown How long until a member can run the command again
 * @property {string[]} preconditions Preconditions to run before running the command
 * @property {string[]} middleware Middleware to run before running the command
 * @property {Argument[]} arguments Arguments for the commands
 */
export default class Command {
  names: string[];
  guildOnly: boolean;
  permissions: string[];
  preconditions: string[];
  middleware: string[];
  arguments: Argument[];
  nameUsed?: string;
  /**
   *
   * @param {object} options
   * @param {string[] | string} options.names
   * @param {string[] | string?} options.permissions
   * @param {string[] | string?} options.preconditions
   * @param {string[] | string?} options.middleware
   * @param {Argument[] | Argument?} options.arguments
   * @param {boolean?} options.guildOnly
   * @returns Command
   */
  constructor(options) {
    if (Array.isArray(options.names)) this.names = options.names;
    else if (typeof options.names === 'string' && options.names !== "") this.names = [options.names];
    else throw new Error("Invalid command name(s) provided");

    this.guildOnly = options.guildOnly !== null ? options.guildOnly : false;

    if (Array.isArray(options.permissions)) this.permissions = options.permissions;
    else if (typeof options.permissions === 'string' && options.permissions !== "") this.permissions = [options.permissions];
    else this.permissions = [];

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
   * @param {Message} message
   * @param {Command} command
   * @param {object} args
   */
  async run(message: Message, command: Command, args: { [key: string]: any }) {}
}