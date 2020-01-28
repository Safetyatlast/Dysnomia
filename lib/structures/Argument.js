class Argument {
  constructor(options) {
    if (typeof options.name === 'string' && options.name !== "") this.name = options.name;
    else throw new Error("Name must be a valid string!");

    if (typeof options.typeReader === 'string' && options.typeReader !== "") this.typeReader = options.typeReader;
    else throw new Error("typeReader must be a valid string!");

    if (typeof options.optional === "boolean") this.optional = options.optional;
    else this.optional = false;

    if (typeof options.repeatable === "boolean") this.repeatable = options.repeatable;
    else this.optional = false;

    if (typeof options.maxRepeats === "number") this.maxRepeats = options.maxRepeats;
    else this.maxRepeats = -1;

    if (options.defaultValue) this.defaultValue = options.defaultValue;
  }
}

module.exports = Argument;