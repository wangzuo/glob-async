const fs = require('fs');
const path = require('path');
const request = require('request');
const mime = require('mime');
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

async function uploadRemote(url, options = {}) {
  const storage = Storage({ projectId: options.projectId });
  const bucket = storage.bucket(options.bucket);
  const hmac = crypto.createHmac('sha1', options.secret);
  const digest = hmac.update(url).digest('hex');
  const m1 = path.extname(url).match(/(\.[a-zA-Z0-9]+)/);
  if (!m1) throw new Error(`Cannot find ext for ${url}`);

  const filename = `${digest}${m1[1]}`;
  const contentType = mime.getType(filename);

  return new Promise(function(resolve, reject) {
    const stream = bucket.file(filename).createWriteStream({
      metadata: { contentType }
    });

    request.get(url).pipe(stream);

    stream.on('error', reject);
    stream.on('finish', function() {
      resolve(filename);
    });
  });
}

async function uploadLocal(filepath, options = {}) {
  const storage = Storage({ projectId: options.projectId });
  const bucket = storage.bucket(options.bucket);
  const hash = await filehash(filepath, options.secret);

  const m1 = path.extname(filepath).match(/(\.[a-zA-Z0-9]+)/);
  if (!m1) throw new Error(`Cannot find ext for ${filepath}`);

  const filename = `${hash}${m1[1]}`;
  const contentType = mime.getType(filename);

  return new Promise((resolve, reject) => {
    const stream = bucket.file(filename).createWriteStream({
      metadata: { contentType }
    });

    fs.createReadStream(filepath).pipe(stream);

    stream.on('error', reject);
    stream.on('finish', function() {
      resolve(filename);
    });
  });
}

function upload(options = {}) {
  return async function(str) {
    if (str.match(/^http/)) {
      return await uploadRemote(str, options);
    } else {
      return await uploadLocal(str, options);
    }
  };
}

module.exports = upload;
