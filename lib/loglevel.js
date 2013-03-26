/*
 * loglevel - https://github.com/pimterry/loglevel
 *
 * Copyright (c) 2013 Tim Perry
 * Licensed under the MIT license.
 */

(function (name, definition) {
    if (typeof module !== 'undefined') {
        module.exports = definition();
    } else if (typeof define === 'function' && typeof define.amd === 'object') {
        define(definition);
    } else {
        this.name = definition();
    }
}('log', function () {
    var self = {},
        noop = function() { };

    self.levels = { "TRACE": 1, "DEBUG": 2, "INFO": 3, "WARN": 4,
        "ERROR": 5, "SILENT": 6};

    function realMethod(methodName) {
        if (typeof console === "undefined") {
            return noop;
        } else if (typeof console[methodName] === "undefined") {
            return console.log || noop;
        } else {
            return boundToConsole(console, methodName);
        }
    }

    function boundToConsole(console, methodName) {
        var method = console[methodName];
        if (typeof method.bind === "undefined") {
            return function() {
                method.apply(console, arguments);
            };
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

    self.setLevel = function (level) {
        if (typeof level === "number" && level >= 0 && level <= self.levels.SILENT) {
            if (level === self.levels.SILENT) {
                clearMethods();
                return;
            } else if (typeof console === "undefined") {
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
            throw "log.setLevel called with invalid level: " + level;
        }
    };

    self.enableAll = function() {
        self.setLevel(self.levels.TRACE);
    };

    self.disableAll = function() {
        self.setLevel(self.levels.SILENT);
    };

    self.disableAll();
    return self;
}));