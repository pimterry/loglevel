# loglevel [![Build Status](https://travis-ci.org/pimterry/loglevel.png)](https://travis-ci.org/pimterry/loglevel)

Minimal lightweight simple logging for JavaScript. loglevel replaces console.log() and friends with level-based logging and filtering, with none of console's downsides.

This is a barebones reliable everyday logging library. It does not do fancy things, it does not let you reconfigure appenders or add complex log filtering rules or boil tea (more's the pity), but it does have the all core functionality that you actually use:

## Features
 
### Simple

* Log things at a given level (trace/debug/info/warn/error) to the console object (as seen in all modern browsers & node.js)
* Filter logging by level (all the above or 'silent'), so you can disable all but error logging in production, and then run log.setLevel("trace") in your console to turn it all back on for a furious debugging session
 
### Effective

* Log methods gracefully fall back to simpler console logging methods if more specific ones aren't available: so calls to log.debug() go to console.debug() if possible, or console.log() if not
* Logging calls still succeed even if there's no console object at all, so your site doesn't break when people visit with old browsers that don't support the console object (here's looking at you IE) and similar
* This then comes together giving a consistent reliable API that works in every JavaScript environment with a console available, and doesn't break anything anywhere else
 
### Convenient

* Log output keeps line numbers: most JS logging frameworks call console.log methods through wrapper functions, clobbering your stacktrace and making the extra info many browsers provide useless. We'll have none of that thanks.
* It works with all the standard JavaScript loading systems out of the box (CommonJS, AMD, or just as a global)
* Logging is filtered to "warn" level by default, to keep your live site clean in normal usage (or you can trivially re-enable everything with an initial log.enableAll() call)

## Downloading loglevel

If you're using node, you can run `npm install loglevel`.

loglevel is also available via [Bower](https://github.com/bower/bower) (`bower install loglevel`) or [JamJS](http://jamjs.org/packages/#/details/loglevel) (`jam install loglevel`)

Alternatively if you just want to grab the file yourself, you can download either the current stable [production version][min] or the [development version][max] directly.

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

The loglevel API is extremely minimal. All methods are available on the root loglevel object, which it's suggested you name 'log' (this is the default if you import it in globally, and is what's set up in the above examples). The API consists of:

* 5 actual logging methods, ordered and available as:
  * `log.trace(msg)`
  * `log.debug(msg)`
  * `log.info(msg)`
  * `log.warn(msg)`
  * `log.error(msg)`

  Exact output formatting of these will depend on the console available in the current context of your application. Notably, many environments will include a full stack trace with all trace() calls, and icons or similar to highlight other calls.

  These methods should never fail in any environment, even if no console object is currently available, and should always fall back to an available log method even if the specific method called (e.g. warn) isn't available.

* A `log.setLevel(level)` method.

  This disables all logging below the given level, so that after a log.setLevel("warn) call log.warn("something") or log.error("something") will output messages, but log.info("something") will not.

  This can take either a log level name or 'silent' (which disables everything) in one of a few forms:
  * As a log level from the internal levels list, e.g. log.levels.SILENT <- for type safety
  * As a string, like 'error' (case-insensitive) <- for a reasonable practical balance
  * As a numeric index from 0 (trace) to 5 (silent) <- deliciously terse, and more easily programmable (...although, why?)

  Where possible the loglevel will be persisted as a session cookie on the current domain. If cookies are not available in the current environment (i.e. in Node) this step will be skipped.
   
  It is expected that log.setLevel() will be manually called during debugging and similar, and as such you should note that **log.setLevel() will throw an error if you attempt to set the level to a non-silent level and there is no console available.** If you do want to explicitly change the default log level from warn in your codebase you should do so in a try/catch. Failing setLevel calls due to a missing console are equivalent to log.setLevel("silent"), which never fails.

* `log.enableAll()` and `log.disableAll()` methods.

  These enable or disable all log messages, and are equivalent to log.setLevel("trace") and log.setLevel("silent") respectively.

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Builds can be run with grunt, just run 'grunt' in the root directory of the project. 

_Also, please don't edit files in the "dist" subdirectory as they are generated via Grunt. You'll find source code in the "lib" subdirectory!_

## Release History
v0.1.0 - First working release with apparent compatibility with everything tested

v0.2.0 - Updated release with various tweaks and polish and real proper documentation attached

v0.3.0 - Some bugfixes (#12, #14), cookie-based log level persistence, doc tweaks, support for Bower and JamJS

v0.3.1 - Fixed incorrect text in release build banner, various other minor tweaks

## License
Copyright (c) 2013 Tim Perry  
Licensed under the MIT license.

[![githalytics.com alpha](https://cruel-carlota.pagodabox.com/3393271900ddc6808ae1901f3760a59e)](http://githalytics.com/pimterry/loglevel)
