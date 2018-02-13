/* eslint-disable no-console */

const noop = () => {};
const levels = ['trace', 'debug', 'info', 'warn', 'error', 'silent'];

const plugins = [];
const properties = [];
const loggers = {};

// Build the best logging method possible for this env
// Wherever possible we want to bind, not wrap, to preserve stack traces
function nativeRoller() {
  return (level) => {
    if (typeof console === 'undefined') return noop;

    let nativeMethod = console[levels[level]] ? levels[level] : 'log';
    if (nativeMethod === 'debug') nativeMethod = 'log';

    return console[nativeMethod] ? console[nativeMethod].bind(console) : noop;
  };
}

function pluginsRoller(logger) {
  const loggerName = logger.sign;
  let prevTimestamp = 0;

  const rollers = [];
  plugins.forEach((plugin, index) => {
    const loggerProps = properties[index][loggerName];
    if (loggerProps === null) return;

    const rootProps = properties[index][''];

    if (rootProps || loggerProps) {
      rollers.push(plugin(logger, Object.assign({}, rootProps, loggerProps)));
    }
  });

  return (level) => {
    const label = levels[level];
    const nativeMethod = nativeRoller()(level);

    return (...args) => {
      const timestamp = Date.now();
      const delta = timestamp - (prevTimestamp || timestamp);
      prevTimestamp = timestamp;

      const state = {
        args,
        logger: loggerName,
        level,
        label,
        timestamp,
        delta,
        roll: true,
      };

      for (let i = 0; i < rollers.length; i++) {
        rollers[i](state);
        if (!state.roll) return;
      }
      nativeMethod(...state.args);
    };
  };
}

let roller = nativeRoller;

function rebuildMethods(logger) {
  const factory = roller(logger);
  for (let i = 0; i < levels.length - 1; i++) {
    logger[levels[i]] = i < logger.level ? noop : factory(i);
  }
}

function checkPlugin(plugin) {
  if (typeof plugin !== 'function') {
    throw new Error(`Invalid plugin: ${plugin}`);
  }

  plugins.forEach((p, index) => {
    if (p === plugin) {
      plugin = index;
    }
  });

  return plugin;
}

function usePlugin(logger, plugin, props) {
  plugin = checkPlugin(plugin);

  if (typeof plugin !== 'number') {
    // lazy plugging
    plugin = plugins.push(plugin) - 1;
    properties[plugin] = {};
    roller = pluginsRoller;
  }

  properties[plugin][logger.sign] = Object.assign({}, properties[plugin][logger.sign], props);
  rebuildMethods(logger);
  return logger;
}

function unusePlugin(logger, plugin) {
  plugin = checkPlugin(plugin);

  if (typeof plugin === 'number') {
    properties[plugin][logger.sign] = null;
    rebuildMethods(logger);
  }

  return logger;
}

function newLogger(logName, logLevel) {
  const logger = (name, level) => {
    name = name || '';
    if (typeof name !== 'string') {
      throw new TypeError(`Invalid name: ${name}`);
    }

    return loggers[name] || newLogger(name, level || logger().level);
  };

  Object.defineProperties(logger, {
    sign: {
      get() {
        return logName;
      },
    },
    level: {
      get() {
        return logLevel;
      },
      set(newLevel) {
        let level = newLevel;

        if (typeof level === 'string') {
          level = levels.indexOf(level.toLowerCase());
        }

        if (typeof level === 'number' && level >= 0 && level < levels.length) {
          logLevel = level;
          rebuildMethods(logger);
        } else {
          throw new Error(`Invalid level: ${newLevel}`);
        }
      },
    },
    use: {
      value: usePlugin.bind(null, logger),
    },
    unuse: {
      value: unusePlugin.bind(null, logger),
    },
  });

  logger.level = logLevel;
  loggers[logName] = logger;
  return logger;
}

const log = newLogger('', 0);

Object.defineProperties(log, {
  prefixer: {
    value: (logger, props) => {
      props = Object.assign(
        {
          format(state) {
            const { timestamp } = state;
            const time = state.level === 1
              ? `${`        +${state.delta}ms`.slice(-12)}`
              : `${new Date(timestamp).toTimeString().slice(0, 8)}.${`${timestamp}`.slice(-3)}`;
            const name = `       ${(state.logger || 'default').slice(0, 7)}`.slice(-7);
            const label = `${` ${state.label}`.slice(-5)}`;
            return `${time} [${label}] ${name} :`;
          },
        },
        props,
      );

      return (state) => {
        const prefix = props.format(state);

        const { args } = state;
        if (args.length && typeof args[0] === 'string') {
          // concat prefix with first argument to support string substitutions
          args[0] = `${prefix} ${args[0]}`;
        } else {
          args.unshift(prefix);
        }
      };
    },
  },
  levels: {
    get() {
      return levels.splice();
    },
  },
});

export default log;
