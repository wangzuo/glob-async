const glob = require('glob');

const globAsync = (pattern, options) =>
  new Promise((resolve, reject) => {
    glob(pattern, options, (err, files) => {
      if (err) return reject(err);
      resolve(files);
    });
  });

module.exports = globAsync;
