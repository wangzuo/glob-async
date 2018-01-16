const fs = require('fs');

function head(file, options = {}) {
  const { count, bytes } = Object.assign({ count: 10 }, options);

  return new Promise(function(resolve, reject) {
    const options = bytes ? { start: 0, end: bytes - 1 } : {};

    const stream = fs.createReadStream(
      file,
      Object.assign(
        {
          encoding: 'utf-8',
          highWaterMark: 1
        },
        options
      )
    );
    let data = '';
    let lines = [];

    stream.on('data', function(chunk) {
      data += chunk;

      if (!bytes) {
        lines = data.split('\n');

        if (lines.length > count + 1) {
          lines = lines.slice(0, count);
          stream.close();
        }
      }
    });

    stream.on('close', function() {
      if (bytes) resolve(data);
      else resolve(lines);
    });

    stream.on('error', function(err) {
      reject(err);
    });
  });
}

module.exports = head;
