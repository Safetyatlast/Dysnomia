module.exports = class Typereader {
  constructor (options) {
    if (typeof options.name === 'string' && options.name !== "") this.name = options.name;
    else throw new Error("Name must be a valid string!");
  }

  async run () {

  }
};