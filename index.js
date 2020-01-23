"use strict";

const Handler = require('./lib/structures/Handler');

function Dysnomia (options) {
  return new Handler(options);
}

Dysnomia.Handler = Handler;
Dysnomia.Command = require('./lib/structures/Command');

module.exports = Dysnomia;