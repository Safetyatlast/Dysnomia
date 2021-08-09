"use strict";
import { Message } from 'eris';
import Command from './Command';
/**
 *
 * @property {string} name Name of the middleware
 */
export default class Middleware {
  name: string;

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
   * @return {Promise<Message>}
   */
  async run (message: Message, command: Command) {}
}