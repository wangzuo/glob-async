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

async function walk(x, fn, s) {
  const stats = await stat(x);
  const type = stats.isDirectory() ? 'directory' : 'file';
  const r = path.relative(s, x);
  const id = r ? `/${r}` : '/';
  const data = fn ? await fn(id, type) : {};

  if (data === false) return IGNORE;

  if (type === 'directory') {
    const dir = {
      id,
      type,
      children: []
    };

    const files = data && data._children ? data._children : await readdir(x);

    for (const file of files) {
      const child = await walk(path.join(x, file), fn, s);

      if (child !== IGNORE) {
        dir.children.push(child);
      }
    }

    if (data && data._children) {
      delete data._children;
    }

    return typeof data !== 'undefined' ? Object.assign(dir, data) : dir;
  } else if (type === 'file') {
    const file = {
      id,
      type
    };
    return typeof data !== 'undefined' ? Object.assign(file, data) : file;
  }
}

async function dirJSON(x, fn) {
  return await walk(x, fn, x);
}

module.exports = dirJSON;
