# loglevel [![Build Status](https://travis-ci.org/pimterry/loglevel.png)](https://travis-ci.org/pimterry/loglevel)
==========

Minimal lightweight simple logging for JavaScript. loglevel replaces console.log() and friends with level-based logging and filtering, with none of console's downsides.

This is a barebones reliable everyday logging library. It does not do fancy things, it does not let you reconfigure appenders or add complex log filtering rules or boil tea (more's the pity), but it does have the all core functionality that you actually use: 
 
 * It lets you log things, at a given level (trace/debug/info/warn/error), to the console object (as seen in all modern browers & node.js)
 * It lets you filter logging by level (all the above or 'silent'), so you can disable all except error logging on your production site, and then run log.setLevel("trace") in your console and turn it all back on for a furious debugging session
 * It leaves logging filtered to silent by default, to keep your live site clean (alternatively you can trivially re-enable it with an initial log.enableAll() call)
 * It doesn't break when people use your site with old browsers that don't support the console object (here's looking at you IE)
 * It gracefully falls back to simpler logging methods if more specific ones aren't available: so calls to log.debug() go to console.debug() if possible, or console.log() if not
 * It keeps line numbers: most logging frameworks call console.log methods through wrapper functions, clobbering your stacktrace and making the log message info that many browsers provide useless. loglevel is better than that
 * It works with all the standard JavaScript loading system out of the box (CommonJS, AMD, or just as a global)
 * It works reliably in every JavaScript environment with a console we could find, and doesn't break anything anywhere else (er, both of those not quite true yet: see #4 & #5)

## Downloading loglevel

If you're using node, you can run `npm install loglevel`.

Alternatively if you want to grab the file directly, you can download either the [production version][min] or the [development version][max] directly.

[min]: https://raw.github.com/pimterry/loglevel/master/dist/loglevel.min.js
[max]: https://raw.github.com/pimterry/loglevel/master/dist/loglevel.js

## Setting it up

loglevel supports AMD (e.g. RequireJS), CommonJS (e.g. Node.js) and direct usage (e.g. loading globally with a <script> tag) loading methods. You should be able to do nearly anything, and then skip to the next section anyway and have it work. Just in case though, here's some specific examples that definitely do the right thing:

### CommonsJS (e.g. Node)
```javascript
var log = require('loglevel');
log.info("unreasonably simple");
```

### AMD (e.g. RequireJS)
```javascript
define(['loglevel'], function(log) {
   log.warn("dangerously convenient");
});
```

### Directly in your web page:

```html
<script src="loglevel.min.js"></script>
<script>
log.error("too easy");
</script>
```

## Documentation
_(Coming soon, see #6)_

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Builds can be run with grunt, just run 'grunt' in the root directory of the project. 

_Also, please don't edit files in the "dist" subdirectory as they are generated via Grunt. You'll find source code in the "lib" subdirectory!_

## Release History
_(No official release yet, this is en route extremely soon though (i.e. this week))_

## License
Copyright (c) 2013 Tim Perry  
Licensed under the MIT license.
