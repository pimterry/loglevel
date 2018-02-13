const log = require('../dist/log-n-roll');

const stacktrace = require('../examples/plugins/log-stacktrace');
const meta = require('../examples/plugins/log-meta');
const message = require('../examples/plugins/log-message');
const json = require('../examples/plugins/log-json');

const toFile = require('../examples/plugins/to-file');

log.use(stacktrace).use(meta, { source: 'plugins.js' }).use(log.prefixer).use(message)
  .use(json, {
    message: '',
    timestamp: state => new Date(state.timestamp).toISOString(),
    level: 'label',
    logger: '',
    meta: '',
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
