"use strict";
import type { Message } from 'eris';
import type Command from './Command';
/**
 *
 * @property {string} name Name of the middleware
 */
export default class Precondition {
  name: string

  /**
   *
   * @param {object} options
   * @param {string} options.name
   */
  constructor(options) {
    if (typeof options.name === 'string' && options.name !== "") this.name = options.name;
    else throw new Error("Name must be a valid string!")
  }

  /**
   *
   * @param {Message} message
   * @param {Command} command
   * @return {Promise<Boolean>}
   */
  async run(message: Message, command: Command) : Promise<boolean> { return true; }
}