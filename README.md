# log-n-roll

> Tiny 1kb logger with slim api and ability of limitless extension.

[![NPM version](https://img.shields.io/npm/v/log-n-roll.svg?style=flat-square)](https://www.npmjs.com/package/log-n-roll)[![Build Status](https://img.shields.io/travis/kutuluk/log-n-roll/master.svg?style=flat-square)](https://travis-ci.org/kutuluk/log-n-roll)

- **Tiny:** weighs about one kilobyte gzipped
- **Pluggable:** one built-in plugin for pretty formatting and limitless possibilities for extension

## Note

**This packege is Proof-of-Concept and should be considered as an unstable. Nevertheless, the basic idea has already been proved. Release coming soon.**

## Install

This project uses [node](http://nodejs.org) and [npm](https://npmjs.com). Go check them out if you don't have them locally installed.

```sh
$ npm install log-n-roll
```

Then with a module bundler like [rollup](http://rollupjs.org/) or [webpack](https://webpack.js.org/), use as you would anything else:

```javascript
// using ES6 modules
import log from 'log-n-roll';

// using CommonJS modules
var log = require('log-n-roll');
```

The [UMD](https://github.com/umdjs/umd) build is also available on [unpkg](https://unpkg.com):

```html
<script src="https://unpkg.com/log-n-roll/dist/log-n-roll.umd.js"></script>
```

You can find the library on `window.log`.

## Usage

```javascript
const log = require('log-n-roll');

log.trace('Trace shows stacktrace');

// Using the built-in plugin
log.use(log.prefixer);
log.trace('Using any number of plugins adds to the stacktrace only one extra line');

log.info("By default, the level of the default logger is 'trace'. All messages are displayed");

// Loading the processor
let two = 2;
for (let i = 0; i < 1000000; i++) {
  two *= two;
  two = Math.sqrt(two);
}

log.debug('Debug shows the time difference from the last call of any logger method');
log.info('Placeholders are supported. Two = %s', two);
log.warn('Warn message');
log.error('Error message');

// Getting the named logger and setting its level to 'warn'
const child = log('child', 'warn');
child.info('Messages below the level of the logger are ignored');

child.level = 'info';
child.info('The level of the logger can be changed at any time');

child().info(
  'Default logger can be obtained from any logger: child() %s== log() %s== log',
  child() === log() ? '=' : '!',
  log() === log ? '=' : '!',
);

child('any').info(
  'Any logger can be obtained from any logger: child("any") %s== log("any")',
  child('any') === log('any') ? '=' : '!',
);

log('any').debug('Any logger has extended the level from the default logger');
child('any').info('Any logger has extended the plugins props from the default logger');
```

**Output:**
```
Trace: Trace shows stacktrace
    at Object.<anonymous> (C:\Users\u36\Dropbox\kutuluk\log-n-roll\examples\basic.js:3:5)
    ...
Trace: 17:42:21.579 [trace] default : Using any number of plugins adds to the stacktrace only one extra line
    at Function.trace (C:\Users\u36\Dropbox\kutuluk\log-n-roll\dist\log-n-roll.js:1:730)
    at Object.<anonymous> (C:\Users\u36\Dropbox\kutuluk\log-n-roll\examples\basic.js:7:5)
    ...
17:42:21.579 [ info] default : By default, the level of the default logger is 'trace'. All messages are displayed
       +54ms [debug] default : Debug shows the time difference from the last call of any logger method
17:42:21.634 [ info] default : Placeholders are supported. Two = 2
17:42:21.635 [ warn] default : Warn message
17:42:21.635 [error] default : Error message
17:42:21.636 [ info]   child : The level of the logger can be changed at any time
17:42:21.636 [ info] default : Default logger can be obtained from any logger: child() === log() === log
17:42:21.637 [ info]     any : Any logger can be obtained from any logger: child("any") === log("any")
        +0ms [debug]     any : Any logger has extended the level from the default logger
17:42:21.637 [ info]     any : Any logger has extended the plugins props from the default logger
```

## Plugins

The resulted examples of plugins are simplified. Despite the fact that they are workable, it is not recommended to use in production.

**log-stacktrace.js**
```javascript
function getStackTrace() {
  try {
    throw new Error();
  } catch (trace) {
    return trace.stack;
  }
}

module.exports = (logger, props) => {
  // Return noop plugin if stacktrace support is absent
  if (!getStackTrace()) {
    return () => {};
  }

  props = Object.assign(
    {
      levels: ['trace', 'warn', 'error'],
      depth: 3,
    },
    props,
  );

  return (state) => {
    if (!props.levels.some(level => level === state.label)) {
      return;
    }

    let stacktrace = getStackTrace();

    const lines = stacktrace.split('\n');
    lines.splice(0, 4);
    const { depth } = props;
    if (depth && lines.length !== depth + 1) {
      const shrink = lines.splice(0, depth);
      stacktrace = shrink.join('\n');
      if (lines.length) stacktrace += `\n    and ${lines.length} more`;
    } else {
      stacktrace = lines.join('\n');
    }

    state.stacktrace = stacktrace;
  };
};
```

**log-meta.js**
```javascript
module.exports = (logger, props) => (state) => {
  const meta = Object.assign({}, props);

  const { args } = state;

  if (args.length && typeof args[0] === 'object') {
    Object.assign(meta, args.shift());
  }

  state.meta = meta;
};
```

**log-message.js**
```javascript
const { format } = require('util');

module.exports = () => (state) => {
  state.message = format(...state.args);
};
```

**log-json.js**
```javascript
module.exports = (logger, props) => {
  const fields = Object.keys(props);

  return (state) => {
    const json = {};

    fields.forEach((name) => {
      json[name] = typeof props[name] === 'function'
        ? props[name](state)
        : state[props[name]] || state[name];
    });

    state.json = JSON.stringify(json, null, '\t');
  };
};
```

**to-file.js**
```javascript
const fs = require('fs');

module.exports = (logger, props) => {
  props = Object.assign(
    {
      file: 'app.log',
      fields: ['message', 'stacktrace'],
      separator: '\n',
      eol: '\n',
      roll: true,
    },
    props,
  );

  return (state) => {
    const fields = props.fields.map(field => state[field]).filter(field => field);

    fs.appendFileSync(props.file, fields.join(props.separator) + props.eol);

    state.roll = props.roll;
  };
};
```

### An example of using these plugins

**plugins.js**
```javascript
const log = require('../dist/log-n-roll');

const stacktrace = require('../examples/plugins/log-stacktrace');
const meta = require('../examples/plugins/log-meta');
const message = require('../examples/plugins/log-message');
const json = require('../examples/plugins/log-json');

const toFile = require('../examples/plugins/to-file');

log.use(stacktrace).use(meta, { source: 'plagins.js' }).use(log.prefixer).use(message)
  .use(json, {
    message: 'message',
    timestamp: state => new Date(state.timestamp).toISOString(),
    level: 'label',
    logger: 'logger',
    meta: 'meta',
    stacktrace: state => (state.stacktrace ? state.stacktrace.split('\n') : []),
  });

log.info({ tag: 'message1' }, 'Hello, %s', 'console!');

log.use(toFile, { file: 'my.log' });

log.info({ tag: 'message2' }, 'Hello, %s', 'file!');

const child = log('child')
  .use(toFile, {
    fields: ['json'],
    eol: ',\n',
    roll: false,
  })
  .use(meta, { format: 'json' })
  .unuse(log.prefixer);

child.trace({ tag: 'message3' }, 'Goodbye, %s', 'console!');
```

**Console output:**
```
17:45:35.926 [ info] default : Hello, console!
17:45:35.926 [ info] default : Hello, file!
```

**my.log:**
```
17:45:35.926 [ info] default : Hello, file!
{
	"message": "Goodbye, console!",
	"timestamp": "2018-02-13T13:45:35.941Z",
	"level": "trace",
	"logger": "child",
	"meta": {
		"source": "plugins.js",
		"format": "json",
		"tag": "message3"
	},
	"stacktrace": [
		"    at Object.<anonymous> (C:\\Users\\u36\\Dropbox\\kutuluk\\log-n-roll\\examples\\plugins.js:35:7)",
		"    at Module._compile (module.js:635:30)",
		"    at Object.Module._extensions..js (module.js:646:10)",
		"    and 4 more"
	]
},
```