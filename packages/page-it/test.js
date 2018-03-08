const pageIt = require('./');

test('charset', done => {
  pageIt('http://news.qq.com/a/20170529/020833.htm').then(page => {
    expect(page).toMatchSnapshot();
    done();
  });
});
