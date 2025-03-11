/*! loglevel - v2.0.0-alpha1 - https://github.com/pimterry/loglevel - (c) 2025 Tim Perry - licensed MIT */
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
    const noop = function() {};
    const undefinedType = "undefined";

    var logMethods = [
        "trace",
        "debug",
        "info",
        "warn",
        "error"
    ];

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

    function Logger(name, factory, parent) {
        // Private instance variables.
        const self = this;
        /**
         * The level inherited from a parent logger (or a global default). We
         * cache this here rather than delegating to the parent so that it stays
         * in sync with the actual logging methods that we have installed (the
         * parent could change levels but we might not have rebuilt the loggers
         * in this child yet).
         * @type {number}
         */
        let inheritedLevel = null;
        /**
         * The default level for this logger, if any. If set, this overrides
         * `inheritedLevel`.
         * @type {number|null}
         */
        let defaultLevel = null;
        /**
         * A user-specific level for this logger. If set, this overrides
         * `defaultLevel`.
         * @type {number|null}
         */
        let userLevel = null;

        /**
         * The categories is the inherited hierarchy of this logger, used
         * to get parent categories/definitions.
         */
        this.categories = parent ? [...parent.categories, name] : [];

        /**
         * The storage key is used for storing persisted levels in the
         * browser storage.
         */
        const hasSymbol = this.categories.find(it => typeof it === 'symbol');
        const storageKey =
            hasSymbol ? null : (parent ?
                'loglevel:' + this.categories
                    .map((category) => category.toString())
                    .join(".") :
                    "loglevel");

        /**
         * The loggers that are contained within this logger.
         */
        const loggers = [];

        function persistLevelIfPossible(levelNum) {
            var levelName = (logMethods[levelNum] || "silent").toUpperCase();

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
                    encodeURIComponent(storageKey) +
                    "=; expires=Thu, 01 Jan 1970 00:00:00 UTC";
            } catch (ignore) {}
        }

        function normalizeLevel(input) {
            var level = input;
            if (
                typeof level === "string" &&
                self.levels[level.toUpperCase()] !== undefined
            ) {
                level = self.levels[level.toUpperCase()];
            }
            if (
                typeof level === "number" &&
                level >= 0 &&
                level <= self.levels.SILENT
            ) {
                return level;
            } else {
                throw new TypeError(
                    "log.setLevel() called with invalid level: " + input
                );
            }
        }

        /*
         *
         * Public logger API - see https://github.com/pimterry/loglevel for details
         *
         */

        self.name = name;

        self.levels = {
            TRACE: 0,
            DEBUG: 1,
            INFO: 2,
            WARN: 3,
            ERROR: 4,
            SILENT: 5,
        };

        self.methodFactory = factory || defaultMethodFactory;

        self.getLevel = function () {
            if (userLevel !== null) {
                return userLevel;
            }
            if (defaultLevel !== null) {
                return defaultLevel;
            }
            if (inheritedLevel === null) {
                inheritedLevel = parent ? parent.getLevel() : this.levels.WARN;
            }
            return inheritedLevel;
        };

        self.getLogger = function (...childCategories) {
            if (!childCategories.length) {
                return self;
            }
            let newCategories = this.categories ? [...this.categories] : [];
            return childCategories.reduce((logger, category) => {
                let childLogger = logger
                    .getLoggers()
                    .find((logger) => logger.name === category);
                newCategories.push(category);
                if (!childLogger) {
                    if( typeof category !== 'symbol' && typeof category !== 'string' ) {
                        throw new Error('Category names must be a symbol or string, but is a '+typeof category);
                    }
                    childLogger = new Logger(category, self.methodFactory, logger);
                    loggers.push(childLogger);
                }
                return childLogger;
            }, self);
        };

        self.getLoggers = function () {
            return loggers;
        };

        self.setLevel = function (level, persist) {
            userLevel = normalizeLevel(level);
            if (persist !== false) {
                // defaults to true
                persistLevelIfPossible(userLevel);
            }
            return self.rebuild();
        };

        self.setDefaultLevel = function (level) {
            defaultLevel = normalizeLevel(level);
            if (getPersistedLevel()===undefined) {
                self.setLevel(level, false);
            } else {
                self.rebuild();
            }
        };

        self.resetLevel = function () {
            userLevel = null;
            clearPersistedLevel();
            return self.rebuild();
        };

        self.enableAll = function (persist) {
            self.setLevel(self.levels.TRACE, persist);
        };

        self.disableAll = function (persist) {
            self.setLevel(self.levels.SILENT, persist);
        };

        self.rebuild = function () {
            inheritedLevel = null;
            const result = replaceLoggingMethods.call(self);
            if( self.methodFactory && self.methodFactory===(factory || defaultMethodFactory)) {
                self.methodFactory = parent && parent.methodFactory || factory || defaultMethodFactory;
            }

            for (const child of loggers) {
                child.rebuild();
            }
            return result;
        };

        // Initialize all the internal levels.
        inheritedLevel = null;
        const initialLevel = getPersistedLevel();
        if (initialLevel !== undefined) {
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

    // Grab the current global log variable in case of overwrite
    var _log = (typeof window !== undefinedType) ? window.log : undefined;
    defaultLogger.noConflict = function() {
        if (typeof window !== undefinedType &&
               window.log === defaultLogger) {
            window.log = _log;
        }

        return defaultLogger;
    };

    // ES6 default export, for compatibility
    defaultLogger['default'] = defaultLogger;

    return defaultLogger;
}));
