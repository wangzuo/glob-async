const glob = require('glob');

const globAsync = async pattern =>
  new Promise((resolve, reject) => {
    glob(pattern, (err, files) => {
      if (err) return reject(err);
      resolve(files);
    });
  });

module.exports = globAsync;
