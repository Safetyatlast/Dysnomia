module.exports = class Argument {
  constructor(options) {
    if (typeof options.name === 'string' && options.name !== "") this.name = options.name;
    else throw new Error("Name must be a valid string!");

    if (typeof options.typeReader === 'string' && options.typeReader !== "") this.typeReader = options.typeReader;
    else throw new Error("typeReader must be a valid string!");

    if (typeof options.optional === "boolean") this.optional = options.optional;

    if (typeof options.repeatable === "boolean") this.repeatable = options.repeatable;

    if (typeof options.maxRepeats === "number") this.maxRepeats = options.maxRepeats;

    if (options.defaultValue) this.defaultValue = options.defaultValue;
  }
};