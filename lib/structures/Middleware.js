"use strict";
/**
 *
 * @property {String} name Name of the middleware
 */
class Middleware {
  /**
   *
   * @param {Object} options
   * @param {String} options.name
   */
  constructor(options) {
    if (typeof options.name === 'string' && options.name !== "") this.name = options.name;
    else throw new Error("Name must be a valid string!")
  }

  /**
   *
   * @param {Eris.Message} message
   * @param {Command} command
   */
  async run () {}
}

module.exports = Middleware;