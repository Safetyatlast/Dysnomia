import {Dirent} from "node:fs";

const fs = require('fs');

export default async function MultiRequire (path: string) : Promise<any[]> {
  const files: Dirent[] = await fs.promises.readdir(path, { withFileTypes: true });
  if (files.length === 0) return [];
  let resolved: any[] = [];

  for (const file of files) {
    if (file.isDirectory()) resolved = resolved.concat(await MultiRequire(path + file.name + '/'));
    else if (file.isFile()) {
      const splitName: string[] = file.name.split('.');
      const imported: any = await import (path + file.name);
      if (splitName[splitName.length-1] === 'js') resolved.push(imported);
    }
  }

  return resolved;
}