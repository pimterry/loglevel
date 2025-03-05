/*
 * loglevel - https://github.com/pimterry/loglevel
 *
 * Copyright (c) 2013 Tim Perry
 * Licensed under the MIT license.
*/
(function (root, definition) {
    "use strict";
    if (typeof define === 'function' && define.amd) {
        define(definition);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = definition();
    } else {
        root.log = definition();
    }
}(this, function () {
    "use strict";

    // Slightly dubious tricks to cut down minimized file size
    var noop = function() {};
    var undefinedType = "undefined";

    var logMethods = [
        "trace",
        "debug",
        "info",
        "warn",
        "error"
    ];

    var _loggersByName = {};
    var defaultLogger = null;

    // Build the best logging method possible for this env
    // Wherever possible we want to bind, not wrap, to preserve stack traces
    function defaultMethodFactory(methodName, _level, _loggerName) {
        if (typeof console !== undefinedType) {
            var consoleMethod = console[methodName] || console.log;
            if (typeof consoleMethod === "function") {
                return consoleMethod.bind(console);
            }
        }

        return noop;
    }

    // These private functions always need `this` to be set properly

    function replaceLoggingMethods() {
        /*jshint validthis:true */
        var level = this.getLevel();

        // Replace the actual methods.
        for (var i = 0; i < logMethods.length; i++) {
            var methodName = logMethods[i];
            this[methodName] = (i < level) ?
                noop :
                this.methodFactory(methodName, level, this.name);
        }

        // Make `log.log` an alias to ensure compatibility with `console.*`.
        this.log = this.info;

        // Return any important warnings.
        if (typeof console === undefinedType && level < this.levels.SILENT) {
            return "No console available for logging";
        }
    }

    function Logger(name, factory, categoriesParam) {
      // Private instance variables.
      var self = this;
      /**
       * The level inherited from a parent logger (or a global default). We
       * cache this here rather than delegating to the parent so that it stays
       * in sync with the actual logging methods that we have installed (the
       * parent could change levels but we might not have rebuilt the loggers
       * in this child yet).
       * @type {number}
       */
      var inheritedLevel = null;
      /**
       * The default level for this logger, if any. If set, this overrides
       * `inheritedLevel`.
       * @type {number|null}
       */
      var defaultLevel = null;
      /**
       * A user-specific level for this logger. If set, this overrides
       * `defaultLevel`.
       * @type {number|null}
       */
      var userLevel = null;

      var storageKey = "loglevel";
      if (typeof name === "string") {
        storageKey += ":" + name;
      } else if (typeof name === "symbol") {
        storageKey = undefined;
      }

      /** 
       * The categories is the inherited hierarchy of this logger, used
       * to get parent categories/definitions.
       */
      this.categories = categoriesParam && categoriesParam.slice();
      
      function persistLevelIfPossible(levelNum) {
          var levelName = (logMethods[levelNum] || 'silent').toUpperCase();

          if (typeof window === undefinedType || !storageKey) return;

          // Use localStorage if available
          try {
                window.localStorage[storageKey] = levelName;
                return;
            } catch (ignore) {}

            // Use session cookie as fallback
            try {
                window.document.cookie =
                    encodeURIComponent(storageKey) + "=" + levelName + ";";
            } catch (ignore) {}
        }

        function getPersistedLevel() {
            var storedLevel;

            if (typeof window === undefinedType || !storageKey) return;

            try {
                storedLevel = window.localStorage[storageKey];
            } catch (ignore) {}

            // Fallback to cookies if local storage gives us nothing
            if (typeof storedLevel === undefinedType) {
                try {
                    var cookie = window.document.cookie;
                    var cookieName = encodeURIComponent(storageKey);
                    var location = cookie.indexOf(cookieName + "=");
                    if (location !== -1) {
                        storedLevel = /^([^;]+)/.exec(
                            cookie.slice(location + cookieName.length + 1)
                        )[1];
                    }
                } catch (ignore) {}
            }

            // If the stored level is not valid, treat it as if nothing was stored.
            if (self.levels[storedLevel] === undefined) {
                storedLevel = undefined;
            }

            return storedLevel;
        }

        function clearPersistedLevel() {
            if (typeof window === undefinedType || !storageKey) return;

          // Use localStorage if available
          try {
              window.localStorage.removeItem(storageKey);
          } catch (ignore) {}

          // Use session cookie as fallback
          try {
              window.document.cookie =
                encodeURIComponent(storageKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC";
          } catch (ignore) {}
      }

      function normalizeLevel(input) {
          var level = input;
          if (typeof level === "string" && self.levels[level.toUpperCase()] !== undefined) {
              level = self.levels[level.toUpperCase()];
          }
          if (typeof level === "number" && level >= 0 && level <= self.levels.SILENT) {
              return level;
          } else {
              throw new TypeError("log.setLevel() called with invalid level: " + input);
          }
      }

        /*
         *
         * Public logger API - see https://github.com/pimterry/loglevel for details
         *
       */

      self.name = name;

      self.levels = { "TRACE": 0, "DEBUG": 1, "INFO": 2, "WARN": 3,
          "ERROR": 4, "SILENT": 5};

      self.methodFactory = factory || defaultMethodFactory;

      self.getLevel = function () {
          if (userLevel !== null) {
              return userLevel;
          }
          if (defaultLevel !== null) {
              return defaultLevel;
          }
          if (inheritedLevel === null) {
              inheritedLevel = self.getInheritedLevel();
          }
          return inheritedLevel;
      };

      self.getInheritedLevel = function() {
          if( defaultLogger && self.parentKey ) {
              return defaultLogger.getLogger(self.parentKey).getLevel();
          }
          if( !defaultLogger || defaultLogger===self ) {
              return normalizeLevel("WARN");
          }
          return normalizeLevel(
              defaultLogger ? defaultLogger.getLevel() : "WARN" );
      };

      /** The parentKey is the name of the parent this inherits from */
      self.parentKey = undefined;

      self._clearInheritedLevel = function () {
          inheritedLevel = null;
          var loggerNames = Object.keys(_loggersByName);
          for(var i=0; i<loggerNames.length; i++) {
              var loggerName = loggerNames[i];
              var childLogger = _loggersByName[loggerName];
              if( childLogger.parentKey===name ) {
                  _loggersByName[loggerName]._clearInheritedLevel();
              }
          }
      };

      self.getLogger = function(name) {
          var childCategories = Array.from(arguments);
          var newCategories = this.categories ? this.categories.concat(childCategories) : childCategories.slice();
          var childLogger = defaultLogger.getLogger.apply(defaultLogger,newCategories);
          childLogger.childCategories = childCategories;
          childLogger.newCategories =newCategories;
          return childLogger;
      };

      self.setLevel = function (level, persist) {
          userLevel = normalizeLevel(level);
          if (persist !== false) {  // defaults to true
              persistLevelIfPossible(userLevel);
          }

          self._clearInheritedLevel();
          // NOTE: in v2, this should call rebuild(), which updates children.
          return replaceLoggingMethods.call(self);
      };

        self.setDefaultLevel = function (level) {
            defaultLevel = normalizeLevel(level);
            if (!getPersistedLevel()) {
                self.setLevel(level, false);
            } else {
                self._clearInheritedLevel();
            }
        };

        self.resetLevel = function () {
            userLevel = null;
            clearPersistedLevel();
            replaceLoggingMethods.call(self);
            this._clearInheritedLevel();
        };

        self.enableAll = function (persist) {
            self.setLevel(self.levels.TRACE, persist);
        };

        self.disableAll = function (persist) {
            self.setLevel(self.levels.SILENT, persist);
        };

        self.rebuild = function () {
            if (defaultLogger !== self) {
                inheritedLevel = null;
            }
            replaceLoggingMethods.call(self);

            if (defaultLogger === self) {
                for (var childName in _loggersByName) {
                    _loggersByName[childName].rebuild();
                }
            }
        };

        // Initialize all the internal levels.
        inheritedLevel = self===defaultLogger ? normalizeLevel("WARN") : null;
        var initialLevel = getPersistedLevel();
        if (initialLevel != null) {
            userLevel = normalizeLevel(initialLevel);
        }
        replaceLoggingMethods.call(self);
    }

    /*
     *
     * Top-level API
     *
     */

    defaultLogger = new Logger();

    defaultLogger.getLogger = function getLogger(_singleName) {
        if( !arguments.length ) {
            throw new TypeError('No arguments provided to getLogger');
        }
        var categories = Array.from(arguments);
        var lastCategory = categories[categories.length-1];
        var isSymbolName = typeof lastCategory === 'symbol';
        var name = categories.length===1 ? lastCategory : categories.join('.');
        if( isSymbolName ) {
            name = lastCategory;
        }
        if ((!isSymbolName && typeof name !== 'string') || !name) {
            throw new TypeError('You must supply a name when creating a logger but you supplied '+name);
        }

        var logger = _loggersByName[name];
        if (!logger) {
            logger = _loggersByName[name] = new Logger(
                name,
                defaultLogger.methodFactory,
                categories
            );
        }
        if( !logger.parentKey && categories.length>1 ) {
            var parentCategories = categories.slice(0, categories.length - 1);
            logger.parentKey = defaultLogger.getLogger.apply(defaultLogger, parentCategories).name;
        }
        return logger;
    };

    // Grab the current global log variable in case of overwrite
    var _log = (typeof window !== undefinedType) ? window.log : undefined;
    defaultLogger.noConflict = function() {
        if (typeof window !== undefinedType &&
               window.log === defaultLogger) {
            window.log = _log;
        }

        return defaultLogger;
    };

    defaultLogger.getLoggers = function getLoggers() {
        return _loggersByName;
    };

    // ES6 default export, for compatibility
    defaultLogger['default'] = defaultLogger;

    return defaultLogger;
}));
