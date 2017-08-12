const glob = require('./');

test('glob', async () => {
  expect(await glob('*.js')).toEqual(['index.js', 'test.js']);
  expect(await glob('*.json')).toEqual(['package.json']);
});
