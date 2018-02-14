const fs = require('fs');
const path = require('path');
const request = require('request');
const mime = require('mime');
const debug = require('debug')('upload-it');
const Storage = require('@google-cloud/storage');
const crypto = require('crypto');

function filehash(filepath, secret) {
  const stream = fs.createReadStream(filepath);
  const hmac = crypto.createHmac('sha256', secret);

  return new Promise(function(resolve, reject) {
    stream
      .on('data', function(data) {
        hmac.update(data);
      })
      .on('end', function() {
        resolve(hmac.digest('hex'));
      })
      .on('error', reject);
  });
}

async function uploadRemote(url, options = {}, cache) {
  const storage = Storage({ projectId: options.projectId });
  const bucket = storage.bucket(options.bucket);
  const hmac = crypto.createHmac('sha1', options.secret);
  const digest = hmac.update(url).digest('hex');
  const m1 = path.extname(url).match(/(\.[a-zA-Z0-9]+)/);
  if (!m1) throw new Error(`Cannot find ext for ${url}`);

  const filename = `${digest}${m1[1]}`;
  const contentType = mime.getType(filename);

  if (cache && cache[url]) {
    debug(`cache hit: ${url}`);
    return cache[url];
  }

  return new Promise(function(resolve, reject) {
    const stream = bucket.file(filename).createWriteStream({
      metadata: { contentType }
    });

    request.get(url).pipe(stream);

    stream.on('error', reject);
    stream.on('finish', function() {
      if (options.cachePath) {
        cache[url] = filename;
        debug(`cache set: ${url}, ${filename}`);
        writeFile(options.cachePath, JSON.stringify(cache, '', 2))
          .then(() => {
            resolve(filename);
          })
          .catch(reject);
      }
    });
  });
}

async function uploadLocal(filepath, options = {}, cache) {
  const storage = Storage({ projectId: options.projectId });
  const bucket = storage.bucket(options.bucket);
  const hash = await filehash(filepath, options.secret);

  const m1 = path.extname(filepath).match(/(\.[a-zA-Z0-9]+)/);
  if (!m1) throw new Error(`Cannot find ext for ${filepath}`);

  const filename = `${hash}${m1[1]}`;
  const contentType = mime.getType(filename);

  if (cache && cache[filepath] && cache[filepath] === filename) {
    debug(`cache hit: ${filepath}`);
    return cache[filepath];
  }

  return new Promise((resolve, reject) => {
    const stream = bucket.file(filename).createWriteStream({
      metadata: { contentType }
    });

    fs.createReadStream(filepath).pipe(stream);

    stream.on('error', reject);
    stream.on('finish', function() {
      if (options.cachePath) {
        cache[filepath] = filename;
        debug(`cache set: ${filepath}, ${filename}`);
        writeFile(options.cachePath, JSON.stringify(cache, '', 2))
          .then(() => {
            resolve(filename);
          })
          .catch(reject);
      }
    });
  });
}

function writeFile(file, content) {
  return new Promise(function(resolve, reject) {
    fs.writeFile(file, content, 'utf-8', function(err) {
      if (err) return reject(err);
      return resolve();
    });
  });
}

function uploadIt(options = {}) {
  const cache = (function() {
    try {
      return require(options.cachePath);
    } catch (e) {
      return {};
    }
  })();

  return async function(str) {
    let res = null;

    if (str.match(/^http/)) {
      res = await uploadRemote(str, options, cache);
    } else {
      res = await uploadLocal(str, options, cache);
    }

    return res;
  };
}

module.exports = uploadIt;
