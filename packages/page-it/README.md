# page-it

download html page with auto encoding

### Installation

```sh
npm install page-it
```

### Usage

```javascript
const pageIt = require('page-it');
const page = await pageIt('https://www.google.com');

pageIt('https://www.google.com').then(page => console.log(page.html):
```

### License

MIT
