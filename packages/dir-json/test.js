const path = require('path');
const dirJSON = require('./');

function fn(x) {
  if (x.match(/node_modules/)) return false;
  if (path.basename(x)[0] === '.') return false;
  if (x.match(/__snapshots__/)) return false;
  if (x.match(/coverage/)) return false;
}

test('directory', async () => {
  expect(await dirJSON(path.join(__dirname, '../../'), fn)).toMatchSnapshot();
});

test('file', async () => {
  expect(
    await dirJSON(path.join(__dirname, '../../README.md'), fn)
  ).toMatchSnapshot();
});

test('overwrite directory', async () => {
  expect(
    await dirJSON(path.join(__dirname, '../../'), function(x) {
      if (x === '/packages/dir-json') return { children: [] };
      return fn(x);
    })
  ).toMatchSnapshot();
});
