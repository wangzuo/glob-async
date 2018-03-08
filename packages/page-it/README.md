# download-it

url -> html

### Installation

```sh
npm install download-it
```

### Usage

```javascript
const download = require('download-it');
const page = await download('https://www.google.com');

download('https://www.google.com').then(page => console.log(page.html):
```

### License

MIT
