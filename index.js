"use strict";

const Handler = require('./lib/structures/Handler');

function Dysnomia (options) {
  return new Handler(options);
}

Dysnomia.Handler = Handler;
Dysnomia.Command = require('./lib/structures/Command');
Dysnomia.Middleware = require('./lib/structures/Middleware');
Dysnomia.Precondition = require('./lib/structures/Precondition');
Dysnomia.Argument = require('./lib/structures/Argument');
Dysnomia.TypeReader = require('./lib/structures/TypeReader');

Dysnomia.Constants = require('./lib/Constants');

module.exports = Dysnomia;