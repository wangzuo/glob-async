const head = require('./');

test('count', async () => {
  expect(await head('./file.txt')).toMatchSnapshot();
  expect(await head('./file.txt', { count: 3 })).toMatchSnapshot();
  expect(await head('./file.txt', { count: 100 })).toMatchSnapshot();
});

test('bytes', async () => {
  expect(await head('./file.txt', { bytes: 18 })).toMatchSnapshot();
});
