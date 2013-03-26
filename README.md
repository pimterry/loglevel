# loglevel [![Build Status](https://travis-ci.org/pimterry/loglevel.png)](https://travis-ci.org/pimterry/loglevel)

=========================================================

Minimal lightweight simple logging for JavaScript. loglevel replaces console.log() and friends with level-based logging and filtering, with none of console's downsides.

This is a barebones reliable everyday logging library. It does not do fancy things, it does not let you reconfigure appenders or add complex log filtering rules or boil tea (more's the pity), but it does have the all core functionality that you actually use:

## Features
 
### Simple

* Log things at a given level (trace/debug/info/warn/error) to the console object (as seen in all modern browers & node.js)
* Filter logging by level (all the above or 'silent'), so you can disable all but error logging in production, and then run log.setLevel("trace") in your console to turn it all back on for a furious debugging session
 
### Effective

* Log methods gracefully fall back to simpler console logging methods if more specific ones aren't available: so calls to log.debug() go to console.debug() if possible, or console.log() if not
* Logging calls still succeed even if there's no console object at all, so your site doesn't break when people visit with old browsers that don't support the console object (here's looking at you IE) and similar
* This then comes together giving a consistent reliable API that works in every JavaScript environment with a console available, and doesn't break anything anywhere else (er, *not quite true yet*: see #5)
 
### Convenient

* Log output keeps line numbers: most JS logging frameworks call console.log methods through wrapper functions, clobbering your stacktrace and making the extra info many browsers provide useless. We'll have none of that thanks.
* It works with all the standard JavaScript loading systems out of the box (CommonJS, AMD, or just as a global)
* Logging is filtered to silent by default, to keep your live site clean (or you can trivially re-enable it with an initial log.enableAll() call)

## Downloading loglevel

If you're using node, you can run `npm install loglevel`. (n.b. not yet, see #6)

Alternatively if you want to grab the file directly, you can download either the [production version][min] or the [development version][max] directly.

[min]: https://raw.github.com/pimterry/loglevel/master/dist/loglevel.min.js
[max]: https://raw.github.com/pimterry/loglevel/master/dist/loglevel.js

## Setting it up

loglevel supports AMD (e.g. RequireJS), CommonJS (e.g. Node.js) and direct usage (e.g. loading globally with a &lt;script&gt; tag) loading methods. You should be able to do nearly anything, and then skip to the next section anyway and have it work. Just in case though, here's some specific examples that definitely do the right thing:

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
_(Coming soon, see #4)_

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Builds can be run with grunt, just run 'grunt' in the root directory of the project. 

_Also, please don't edit files in the "dist" subdirectory as they are generated via Grunt. You'll find source code in the "lib" subdirectory!_

## Release History
_No official release yet, this is en route extremely soon though (i.e. this week)_

## License
Copyright (c) 2013 Tim Perry  
Licensed under the MIT license.
