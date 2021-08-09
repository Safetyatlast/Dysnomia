"use strict";
import { Message } from 'eris';
import type Command from './Command';
import type MessageHandler from './MessageHandler'
/**
 *
 * @property {string} name Name of the middleware
 */
export default class TypeReader {
  name: string;
  /**
   *
   * @param {object} options
   * @param {string} options.name
   * @returns TypeReader
   */
  protected constructor (options) {
    if (typeof options.name === 'string' && options.name !== "") this.name = options.name;
    else throw new Error("Name must be a valid string!");
  }

  /**
   *
   * @param {string} content
   * @param {Message} message
   * @param {object} options
   * @param {Command} command
   * @param {MessageHandler} handler
   * @return {Promise<any>}
   */
  run (content: string, message: Message, options: any, command: Command, handler: MessageHandler): Promise<any> | any | void {}
}