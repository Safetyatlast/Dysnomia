const fs = require('fs');

async function MultiRequire (path) {
  const files = await fs.promises.readdir(path, { withFileTypes: true });
  if (files.length === 0) return [];
  const resolved = [];

  for (const file of files) {
    if (file.isDirectory()) resolved.concat(await MultiRequire(path + file.name));
    else if (file.isFile()) {
      const splitName = file.name.split('.');
      if (splitName[splitName.length-1] === 'js') resolved.push(require(path + file.name));
    }
  }

  return resolved;
}

module.exports = MultiRequire;