/*
* loglevel - https://github.com/pimterry/loglevel
*
* Copyright (c) 2013 Tim Perry
* Licensed under the MIT license.
*/
(function (root, definition) {
    "use strict";

    if (typeof module === 'object' && module.exports && typeof require === 'function') {
        module.exports = definition();
    } else if (typeof define === 'function' && typeof define.amd === 'object') {
        define(definition);
    } else {
        root.log = definition();
    }
}(this, function () {
    var noop = function() {};
    var undefinedType = "undefined";

    function realMethod(methodName) {
        if (typeof console === undefinedType) {
            return false; // We can't build a real method without a console to log to
        } else if (console[methodName] !== undefined) {
            return bindMethod(console, methodName);
        } else if (console.log !== undefined) {
            return bindMethod(console, 'log');
        } else {
            return noop;
        }
    }

    function bindMethod(obj, methodName) {
        var method = obj[methodName];
        if (typeof method.bind === 'function') {
            return method.bind(obj);
        } else {
            try {
                return Function.prototype.bind.call(method, obj);
            } catch (e) {
                // Missing bind shim or IE8 + Modernizr, fallback to wrapping
                return function() {
                    return Function.prototype.apply.apply(method, [obj, arguments]);
                };
            }
        }
    }

    var logMethods = [
        "trace",
        "debug",
        "info",
        "warn",
        "error"
    ];

    function Logger(customWrappers, loggerName, defaultLevel) {
        var self = this;
        var currentLevel;

        var storageKey = "loglevel";
        if (loggerName) {
            storageKey += ":" + loggerName;
        }

        function persistLevelIfPossible(levelNum) {
            var levelName = (logMethods[levelNum] || 'silent').toUpperCase();

            // Use localStorage if available
            try {
                window.localStorage[storageKey] = levelName;
                return;
            } catch (ignore) {}

            // Use session cookie as fallback
            try {
                window.document.cookie = encodeURIComponent(storageKey) + "=" + levelName + ";";
            } catch (ignore) {}
        }

        function getPersistedLevel() {
            var storedLevel;

            try {
                storedLevel = window.localStorage[storageKey];
            } catch (ignore) {}

            if (typeof storedLevel === undefinedType) {
                try {
                    var cookie = window.document.cookie;
                    var location = cookie.indexOf(encodeURIComponent(storageKey) + "=");
                    if (location) {
                        storedLevel = /^([^;]+)/.exec(cookie.slice(location))[1];
                    }
                } catch (ignore) {}
            }

            // If the stored level is not valid, treat it as if nothing was stored.
            if (self.levels[storedLevel] === undefined) {
                storedLevel = undefined;
            }

            return storedLevel;
        }

        function replaceLoggingMethods(currentLevel) {
            for (var i = 0; i < logMethods.length; i++) {
                var methodName = logMethods[i];
                self[methodName] = (i < currentLevel) ? noop : buildLogMethod(methodName, currentLevel);
            }
        }

        function buildLogMethod(methodName, currentLevel) {
            var method = defaultMethodFactory(methodName, currentLevel);
            for (var i = 0; i < customWrappers.length; i++) {
                method = customWrappers[i](method, methodName, loggerName);
            }
            return method;
        }

        function defaultMethodFactory(methodName, currentLevel) {
            return realMethod(methodName) ||
                   enableLoggingWhenConsoleArrives(methodName, currentLevel);
        }

        function enableLoggingWhenConsoleArrives(methodName, currentLevel) {
            return function () {
                if (typeof console !== undefinedType) {
                    // Rebuild the log methods, now that that's possible
                    replaceLoggingMethods(currentLevel);
                    // Log the message we just got using our newly rebuilt log methods
                    self[methodName].apply(this, arguments);
                }
            };
        }

        /*
         *
         * Public API
         *
         */

        self.levels = { "TRACE": 0, "DEBUG": 1, "INFO": 2, "WARN": 3, "ERROR": 4, "SILENT": 5};

        self.getLevel = function () {
            return currentLevel;
        };

        self.setLevel = function (level, persist) {
            if (typeof level === "string" && self.levels[level.toUpperCase()] !== undefined) {
                level = self.levels[level.toUpperCase()];
            }
            if (typeof level === "number" && level >= 0 && level <= self.levels.SILENT) {
                currentLevel = level;
                if (persist !== false) {  // defaults to true
                    persistLevelIfPossible(level);
                }
                replaceLoggingMethods(level);
                if (typeof console === undefinedType && level < self.levels.SILENT) {
                    return "No console available for logging";
                }
            } else {
                throw "log.setLevel() called with invalid level: " + level;
            }
        };

        self.setDefaultLevel = function setDefaultLevel(level) {
            if (!getPersistedLevel()) {
                self.setLevel(level, false);
            }
        };

        self.enableAll = function enableAll(persist) {
            self.setLevel(self.levels.TRACE, persist);
        };

        self.disableAll = function disableAll(persist) {
            self.setLevel(self.levels.SILENT, persist);
        };

        self.wrapLogMethods = function wrapLogMethods(newCustomWrapper) {
            customWrappers.unshift(newCustomWrapper);
            replaceLoggingMethods(currentLevel);
        };

        // Initialize with the right level
        var initialLevel = getPersistedLevel();
        if (initialLevel == null) {
            initialLevel = defaultLevel == null ? "WARN" : defaultLevel;
        }
        self.setLevel(initialLevel, false);
    }

    /*
     *
     * Package-level API
     *
     */

    var defaultCustomWrappers = [];
    var defaultLogger = new Logger(defaultCustomWrappers);

    var _loggersByName = {};
    defaultLogger.getLogger = function getLogger(name) {
        if (typeof name !== "string" || name === "") {
          throw new TypeError("You must supply a name when creating a logger.");
        }

        if (!_loggersByName[name]) {
            var customWrappersClone = defaultCustomWrappers.slice();
            _loggersByName[name] = new Logger(customWrappersClone, name, defaultLogger.getLevel());
        }
        return _loggersByName[name];
    };

    // Grab the current global log variable in case of overwrite
    var _log = (typeof window !== undefinedType) ? window.log : undefined;
    defaultLogger.noConflict = function() {
        if (typeof window !== undefinedType && window.log === defaultLogger) {
            window.log = _log;
        }

        return defaultLogger;
    };

    return defaultLogger;
}));
