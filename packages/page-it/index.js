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

  const ct = contentType.parse(resp);
  const charset =
    ct.parameters && ct.parameters.charset ? ct.parameters.charset : 'utf8';
  const html = iconv.decode(buf, charset);

  // html4
  const m = html.match(
    /\<meta[\s]*http\-equiv=[\'\"]Content-Type[\'\"][\s]*content=[\'\"]text\/html;[\s]*charset=([a-zA-Z0-9\-\_]+)[\'\"][\s]*\/?>/im
  );
  if (m) {
    const encoding = m[1].toLowerCase();
    if (
      encoding !== 'utf-8' &&
      encoding !== 'utf8' &&
      iconv.encodingExists(encoding)
    ) {
      return iconv.decode(buf, encoding);
    }
  }

  // html5
  // no need to handle this, usually utf-8

  const page = {
    href: resp.request.uri.href,
    html
  };

  return page;
}

module.exports = pageIt;
