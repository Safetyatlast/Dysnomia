"use strict";

const Handler = require('./lib/structures/Handler');

/**
 *
 * @param {Object} options
 * @param {String} options.prefix Default guild prefix
 * @param {RegExp?} options.argumentRegex Regex used for spiting arguments
 * @returns Handler
 */
function Dysnomia (options) {
  return new Handler(options);
}

Dysnomia.Handler = Handler;
Dysnomia.Command = require('./lib/structures/Command');
Dysnomia.Middleware = require('./lib/structures/Middleware');
Dysnomia.Precondition = require('./lib/structures/Precondition');
Dysnomia.Argument = require('./lib/structures/Argument');
Dysnomia.TypeReader = require('./lib/structures/TypeReader');

Dysnomia.MultiRequire = require('./lib/util/MultiRequire');
Dysnomia.Constants = require('./lib/Constants');

Dysnomia.CommandError = require('./lib/enums/CommandError');

module.exports = Dysnomia;