# loglevel [![Build Status](https://travis-ci.org/pimterry/concomitant.png)](https://travis-ci.org/pimterry/concomitant)
==========

Extremely minimal lightweight logging framework for JavaScript, adding log level controls to any available console.log methods

## Getting Started
### On the server
Install the module with: `npm install loglevel`

```javascript
var loglevel = require('loglevel');
loglevel.awesome(); // "awesome"
```

### In the browser
Download the [production version][min] or the [development version][max].

[min]: https://raw.github.com/pimterry/loglevel/master/dist/loglevel.min.js
[max]: https://raw.github.com/pimterry/loglevel/master/dist/loglevel.js

In your web page:

```html
<script src="dist/loglevel.min.js"></script>
<script>
awesome(); // "awesome"
</script>
```

In your code, you can attach loglevel's methods to any object.

```html
<script>
var exports = Bocoup.utils;
</script>
<script src="dist/loglevel.min.js"></script>
<script>
Bocoup.utils.awesome(); // "awesome"
</script>
```

## Documentation
_(Coming soon)_

## Examples
_(Coming soon)_

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

_Also, please don't edit files in the "dist" subdirectory as they are generated via Grunt. You'll find source code in the "lib" subdirectory!_

## Release History
_(Nothing yet)_

## License
Copyright (c) 2013 Tim Perry  
Licensed under the MIT license.
