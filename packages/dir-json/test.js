const path = require('path');
const dirJSON = require('./');

function fn(x) {
  if (x.match(/node_modules/)) return false;
  if (path.basename(x)[0] === '.') return false;
  return true;
}

test('directory', async function() {
  expect(await dirJSON(path.join(__dirname, '../../'), fn)).toMatchSnapshot();
});

test('file', async function() {
  expect(
    await dirJSON(path.join(__dirname, '../../README.md'), fn)
  ).toMatchSnapshot();
});
