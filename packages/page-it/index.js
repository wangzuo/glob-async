const normalizeUrl = require('normalize-url');
const request = require('request');
const iconv = require('iconv-lite');
const contentType = require('content-type');

function download(options) {
  return new Promise(function(resolve, reject) {
    request.get(options, function(err, resp, buf) {
      if (err) reject(err);
      return resolve([resp, buf]);
    });
  });
}

async function pageIt(pageUrl, options = {}) {
  const url = normalizeUrl(pageUrl);
  const [resp, buf] = await download({
    url,
    headers: options.headers,
    encoding: null,
    gzip: true
  });

  if (resp.statusCode !== 200) {
    throw new Error(`statusCode ${resp.statusCode}: ${pageUrl}`);
  }

  const type = contentType.parse(resp);
  const charset =
    type.parameters && type.parameters.charset
      ? type.parameters.charset
      : 'utf-8';
  const html = iconv.decode(buf, charset);
  const page = {
    href: resp.request.uri.href,
    html
  };

  return page;
}

module.exports = pageIt;
