'use strict';

const npmPackage = require("./package");

module.exports = {
  "plugins": ["plugins/markdown"],
  "opts": {
    "template": "node_modules/tui-jsdoc-template",
    "recurse": true
  },
  "source": {
    "include": ["index.js", "lib"]
  },
  "templates": {
    "name": "Dysnomia",
    "footerText": `Dysnomia ${npmPackage.version}`,
    "useCollapsibles": true
  }
};