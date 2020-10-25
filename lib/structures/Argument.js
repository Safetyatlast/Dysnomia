"use strict";
/**
 *
 * @property {String} name Name of the Argument
 * @property {String} typeReader Name of the type reader the argument calls, if an array of type reader names are provided it will match the first one which successfully runs
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
   * @param {String | String[]} options.typeReader
   * @param {boolean?} options.optional
   * @param {boolean?} options.repeatable
   * @param {number?} options.maxRepeats
   * @param {any?} options.defaultValue
   * @param {object?} options.typeReaderOptions
   * @returns Argument
   */
  constructor(options) {
    if (typeof options.name === 'string' && options.name !== "") this.name = options.name;
    else throw new Error("Name must be a valid string!");

    if ((typeof options.typeReader === 'string' && options.typeReader !== "") || (Array.isArray(options.typeReader) && options.typeReader.length > 0)) this.typeReader = options.typeReader;
    else throw new Error("typeReader must be a valid string or array!");

    if (typeof options.optional === "boolean") this.optional = options.optional;
    else this.optional = false;

    if (typeof options.repeatable === "boolean") this.repeatable = options.repeatable;
    else this.repeatable = false;

    if (typeof options.maxRepeats === "number") this.maxRepeats = options.maxRepeats;
    else this.maxRepeats = 511;

    if (options.defaultValue) this.defaultValue = options.defaultValue;

    if (typeof options.typeReaderOptions === "object") this.typeReaderOptions = options.typeReaderOptions;
    else this.typeReaderOptions = {};
  }
}

module.exports = Argument;