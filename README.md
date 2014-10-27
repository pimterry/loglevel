# loglevel [![Build Status](https://travis-ci.org/pimterry/loglevel.png)](https://travis-ci.org/pimterry/loglevel) [![Coverage Status](https://coveralls.io/repos/pimterry/loglevel/badge.png?branch=master)](https://coveralls.io/r/pimterry/loglevel?branch=master) [![Dependency status](https://david-dm.org/pimterry/loglevel/dev-status.png)](https://david-dm.org/pimterry/loglevel#info=devDependencies&view=table)

Minimal lightweight simple logging for JavaScript. loglevel replaces console.log() and friends with level-based logging and filtering, with none of console's downsides.

This is a barebones reliable everyday logging library. It does not do fancy things, it does not let you reconfigure appenders or add complex log filtering rules or boil tea (more's the pity), but it does have the all core functionality that you actually use:

## Features
 
### Simple

* Log things at a given level (trace/debug/info/warn/error) to the console object (as seen in all modern browsers & node.js)
* Filter logging by level (all the above or 'silent'), so you can disable all but error logging in production, and then run log.setLevel("trace") in your console to turn it all back on for a furious debugging session
* Single file, no dependencies, weighs in at <1KB minified and gzipped
 
### Effective

* Log methods gracefully fall back to simpler console logging methods if more specific ones aren't available: so calls to log.debug() go to console.debug() if possible, or console.log() if not
* Logging calls still succeed even if there's no console object at all, so your site doesn't break when people visit with old browsers that don't support the console object (here's looking at you IE) and similar
* This then comes together giving a consistent reliable API that works in every JavaScript environment with a console available, and never breaks anything anywhere else

### Convenient

* Log output keeps line numbers: most JS logging frameworks call console.log methods through wrapper functions, clobbering your stacktrace and making the extra info many browsers provide useless. We'll have none of that thanks.
* It works with all the standard JavaScript loading systems out of the box (CommonJS, AMD, or just as a global)
* Logging is filtered to "warn" level by default, to keep your live site clean in normal usage (or you can trivially re-enable everything with an initial log.enableAll() call)
* Magically handles situations where console logging is not initially available (IE8/9), and automatically enables logging as soon as it does become available (when developer console is opened)
* Extensible, to add other log redirection, filtering, or formatting functionality, while keeping all the above (except you will clobber your stacktrace, see Plugins below)

## Downloading loglevel

If you're using NPM, you can just run `npm install loglevel`.

Alternatively, loglevel is also available via [Bower](https://github.com/bower/bower) (`bower install loglevel`), [JamJS](http://jamjs.org/packages/#/details/loglevel) (`jam install loglevel`), as a [Webjar](http://www.webjars.org/), or an [Atmosphere package](https://atmospherejs.com/spacejamio/loglevel) (for Meteor)

Alternatively if you just want to grab the file yourself, you can download either the current stable [production version][min] or the [development version][max] directly, or reference it remotely on CDNJS at `//cdnjs.cloudflare.com/ajax/libs/loglevel/0.6.0/loglevel.min.js`

Finally, if you want to tweak loglevel to your own needs or you immediately need the cutting-edge version, clone this repo and see [Developing & Contributing](#developing--contributing) below for build instructions.

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

### With noConflict():

If you're using another JavaScript library that exposes a 'log' global, you can run into conflicts with loglevel.  Similarly to jQuery, you can solve this by putting loglevel into no-conflict mode immediately after it is loaded onto the page. This resets to 'log' global to its value before loglevel was loaded (typically `undefined`), and returns the loglevel object, which you can then bind to another name yourself.

For example:

```html
<script src="loglevel.min.js"></script>
<script>
var logging = log.noConflict();

logging.error("still pretty easy");
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

  This disables all logging below the given level, so that after a log.setLevel("warn") call log.warn("something") or log.error("something") will output messages, but log.info("something") will not.

  This can take either a log level name or 'silent' (which disables everything) in one of a few forms:
  * As a log level from the internal levels list, e.g. log.levels.SILENT ← _for type safety_
  * As a string, like 'error' (case-insensitive) ← _for a reasonable practical balance_
  * As a numeric index from 0 (trace) to 5 (silent) ← _deliciously terse, and more easily programmable (...although, why?)_

  Where possible the log level will be persisted. LocalStorage will be used if available, falling back to cookies if not. If neither is available in the current environment (i.e. in Node) persistence will be skipped.
  
  If log.setLevel() is called when a console object is not available (in IE 8 or 9 before the developer tools have been opened, for example) logging will remain silent until the console becomes available, and then begin logging at the requested level.
  
* `log.enableAll()` and `log.disableAll()` methods.

  These enable or disable all log messages, and are equivalent to log.setLevel("trace") and log.setLevel("silent") respectively.

## Plugins

Loglevel provides a simple reliable minimal base for console logging that works everywhere. This means it doesn't include lots of fancy functionality that might be useful in some cases, such as log formatting and redirection (e.g. also sending log messages to a server over AJAX)

Including that would increase the size and complexity of the library, but more importantly would remove stacktrace information. Currently log methods are either disabled, or enabled with directly bound versions of the console.log methods (where possible). This means your browser shows the log message as coming from your code at the call to `log.info("message!")` not from within loglevel, since it's really calls the bound console method directly, without indirection. The indirection required to dynamically format, further filter, or redirect log messages would stop this.

There's clearly enough enthusiasm for this even at that cost though that loglevel now includes a plugin API. To use it, redefine log.methodFactory(methodName, logLevel) with a function of your own. This will be called for each enabled method each time the level is set (including initially), and should return a function to be used for the given log method, at the given level. If you'd like to retain all the reliability and features of loglevel, it's recommended that this wraps the initially provided value of `log.methodFactory`

For example, a plugin to prefix all log messages with "Newsflash: " would look like:

```javascript
var originalFactory = log.methodFactory;
log.methodFactory = function (methodName, logLevel) {
    var rawMethod = originalFactory(methodName, logLevel);

    return function (message) {
        rawMethod("Newsflash: " + message);
    };
};
```

If you develop and release a plugin, please get in contact! I'd be happy to reference it here for future users. Some consistency is helpful; naming your plugin 'loglevel-PLUGINNAME' (e.g. loglevel-newsflash) is preferred, as is giving it the 'loglevel-plugin' keyword in your package.json

## Developing & Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality.

Builds can be run with grunt: run `grunt dist` to build a distributable version of the project (in /dist), or `grunt test` to just run the tests and linting. During development you can run `grunt watch` and it will monitor source files, and rerun the tests and linting as appropriate when they're changed.

_Also, please don't manually edit files in the "dist" subdirectory as they are generated via Grunt. You'll find source code in the "lib" subdirectory!_

#### Release process

To do a release of loglevel:

* Update the version number in package.json and bower.json
* Run `grunt dist` to build a distributable version in dist/
* Update the release history in this file (below)
* Commit the built code, tagging it with the version number and a brief message about the release
* Push to Github
* Run `npm publish .` to publish to NPM
* Run `jam publish` to publish to JamJS
* Autoupdate gh-pages docs
* Open a pull request to https://github.com/cdnjs/cdnjs to put the new release on the CDN

## Release History
v0.1.0 - First working release with apparent compatibility with everything tested

v0.2.0 - Updated release with various tweaks and polish and real proper documentation attached

v0.3.0 - Some bugfixes (#12, #14), cookie-based log level persistence, doc tweaks, support for Bower and JamJS

v0.3.1 - Fixed incorrect text in release build banner, various other minor tweaks

v0.4.0 - Use LocalStorage for level persistence if available, compatibility improvements for IE, improved error messages, multi-environment tests

v0.5.0 - Fix for Modernizr+IE8 issues, improved setLevel error handling, support for auto-activation of desired logging when console eventually turns up in IE8

v0.6.0 - Handle logging in Safari private browsing mode (#33), fix TRACE level persistence bug (#35), plus various minor tweaks

v1.0.0 - Official stable release! Fixed a bug with localStorage in Android webviews, improved CommonJS detection, and added noConflict().

v1.1.0 - Added support for including loglevel with preprocessing and .apply() (#50), and fixed QUnit dep version which made tests potentially unstable.

v1.2.0 - New plugin API! Plus various bits of refactoring and tidy up, nicely simplifying things and trimming the size down.

## License
Copyright (c) 2013 Tim Perry  
Licensed under the MIT license.

[![githalytics.com alpha](https://cruel-carlota.pagodabox.com/3393271900ddc6808ae1901f3760a59e)](http://githalytics.com/pimterry/loglevel)
