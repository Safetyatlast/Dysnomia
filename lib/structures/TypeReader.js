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
   * @param {Eris.Message} message
   * @param {Command} command
   * @return {any}
   */
  async run () {

  }
}

module.exports = TypeReader;