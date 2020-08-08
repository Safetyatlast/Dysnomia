"use strict";
/**
 *
 * @property {String} name Name of the middleware
 */
class TypeReader {
  /**
   *
   * @param {Object} options
   * @param {String} options.name
   * @returns TypeReader
   */
  constructor (options) {
    if (typeof options.name === 'string' && options.name !== "") this.name = options.name;
    else throw new Error("Name must be a valid string!");
  }

  /**
   *
   * @param {String} content
   * @param {import("eris").Message} message
   * @param {object} options
   * @param {Command} command
   * @param {Handler} handler
   * @return {any}
   */
  async run (content, message, options, command, handler) {

  }
}

module.exports = TypeReader;