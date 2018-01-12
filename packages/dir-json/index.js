const fs = require('fs');
const path = require('path');

const IGNORE = -1;

function stat(x) {
  return new Promise(function(resolve, reject) {
    fs.stat(x, function(err, stats) {
      if (err) return reject(err);
      return resolve(stats);
    });
  });
}

function readdir(dir) {
  return new Promise(function(resolve, reject) {
    fs.readdir(dir, function(err, files) {
      if (err) return reject(err);
      return resolve(files);
    });
  });
}

async function walk(x, fn) {
  if (fn && !fn(x)) return IGNORE;

  const name = path.basename(x);
  const stats = await stat(x);

  if (stats.isDirectory()) {
    const dir = {
      type: 'directory',
      name,
      children: []
    };
    const files = await readdir(x);

    for (const file of files) {
      const child = await walk(path.join(x, file), fn);

      if (child !== IGNORE) {
        dir.children.push(child);
      }
    }

    return dir;
  } else if (stats.isFile()) {
    const file = {
      type: 'file',
      name
    };
    return file;
  }
}

async function dirJSON(x, fn) {
  return await walk(x, fn);
}

module.exports = dirJSON;
