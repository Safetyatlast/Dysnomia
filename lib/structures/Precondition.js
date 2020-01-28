module.exports = class Precondition {
  /**
   *
   * @param {Object} options
   * @param {String} options.name
   */
  constructor(options) {
    if (typeof options.name === 'string' && options.name !== "") this.name = options.name;
    else throw new Error("Name must be a valid string!")
  }

  async run() {}
};
