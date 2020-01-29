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

  async run () {

  }
}

module.exports = TypeReader;