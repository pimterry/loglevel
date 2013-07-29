/*! loglevel - v0.3.1 - https://github.com/pimterry/loglevel - (c) 2013 Tim Perry - licensed MIT */
;(function (undefined) {
    var undefinedType = "undefined";
    
    (function (name, definition) {
        if (typeof module !== 'undefined') {
            module.exports = definition();
        } else if (typeof define === 'function' && typeof define.amd === 'object') {
            define(definition);
        } else {
            this[name] = definition();
        }
    }('log', function () {
        var self = {};
        var noop = function() {};

        function realMethod(methodName) {
            if (typeof console === undefinedType) {
                return noop;
            } else if (console[methodName] === undefined) {
                return boundToConsole(console, 'log') || noop;
            } else {
                return boundToConsole(console, methodName);
            }
        }

        function boundToConsole(console, methodName) {
            var method = console[methodName];
            if (method.bind === undefined) {
                if (Function.prototype.bind === undefined) {
                    return function() {
                        method.apply(console, arguments);
                    };
                } else {
                    return Function.prototype.bind.call(console[methodName], console);
                }
            } else {
                return console[methodName].bind(console);
            }
        }

        var logMethods = [
            "trace",
            "debug",
            "info",
            "warn",
            "error"
        ];

        function clearMethods() {
            for (var ii = 0; ii < logMethods.length; ii++) {
                self[logMethods[ii]] = noop;
            }
        }

        function cookiesAvailable() {
            return (typeof window !== undefinedType &&
                    window.document !== undefined &&
                    window.document.cookie !== undefined);
        }

        function setLevelInCookie(levelNum) {
            if (!cookiesAvailable()) {
                return;
            }

            var levelName;

            for (var key in self.levels) {
                if (self.levels.hasOwnProperty(key) && self.levels[key] === levelNum) {
                    levelName = key;
                    break;
                }
            }

            if (levelName !== undefined) {
                window.document.cookie = "loglevel=" + levelName + ";";
            }
        }

        var cookieRegex = /loglevel=([^;]+)/;

        function loadLevelFromCookie() {
            var cookieLevel;

            if (cookiesAvailable()) {
                var cookieMatch = cookieRegex.exec(window.document.cookie) || [];
                cookieLevel = cookieMatch[1];
            }

            self.setLevel(self.levels[cookieLevel] || self.levels.WARN);
        }

        /*
         *
         * Public API
         *
         */

        self.levels = { "TRACE": 0, "DEBUG": 1, "INFO": 2, "WARN": 3,
            "ERROR": 4, "SILENT": 5};

        self.setLevel = function (level) {
            if (typeof level === "number" && level >= 0 && level <= self.levels.SILENT) {
                setLevelInCookie(level);

                if (level === self.levels.SILENT) {
                    clearMethods();
                    return;
                } else if (typeof console === undefinedType) {
                    clearMethods();
                    throw "No console available for logging";
                } else {
                    for (var ii = 0; ii < logMethods.length; ii++) {
                        var methodName = logMethods[ii];

                        if (level <= self.levels[methodName.toUpperCase()]) {
                            self[methodName] = realMethod(methodName);
                        } else {
                            self[methodName] = noop;
                        }
                    }
                }
            } else if (typeof level === "string") {
                self.setLevel(self.levels[level.toUpperCase()]);
            } else {
                throw "log.setLevel() called with invalid level: " + level;
            }
        };

        self.enableAll = function() {
            self.setLevel(self.levels.TRACE);
        };

        self.disableAll = function() {
            self.setLevel(self.levels.SILENT);
        };

        try {
            loadLevelFromCookie();
        } catch (e) {
            self.setLevel(self.levels.SILENT);
        }
        return self;
    }));
})();
