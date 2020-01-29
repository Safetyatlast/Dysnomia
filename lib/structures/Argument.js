"use strict";
/**
 *
 * @property {String} name Name of the Argument
 * @property {String} typeReader
 * @property {Boolean} optional If the argument is optional
 * @property {Boolean} repeatable If the argument should repeat
 * @property {Number} maxRepeats How many times should the argument repeat before stopping
 * @property {any} defaultValue The defaultValue for an optional argument
 */
class Argument {
  /**
   *
   * @param {Object} options
   * @param {String} options.name
   * @param {String} options.typeReader
   * @param {boolean?} options.optional
   * @param {boolean?} options.repeatable
   * @param {number?} options.maxRepeats
   * @param {any?} options.defaultValue
   * @returns Argument
   */
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