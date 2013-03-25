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
    var self = {};

    var noop = function() { };

    self.levels = { "TRACE": 1, "DEBUG": 2, "INFO": 3, "WARN": 4,
        "ERROR": 5, "SILENT": 6};

    function realMethod(methodName) {
        if (typeof console === "undefined" ||
            typeof console.log === "undefined") {
            return noop;
        }
        if (typeof console[methodName] === "undefined") {
            return console.log;
        } else {
            return console[methodName];
        }
    }

    self.setLevel = function (level) {
        if (level === self.levels.SILENT) {
            self.trace = function() { };
            return;
        }

        if (typeof console === "undefined") {
            throw "No console available for logging";
        }

        for (var levelName in self.levels) {
            var levelMethodName = levelName.toLowerCase();

            if (level <= self.levels[levelName]) {
                self[levelMethodName] = realMethod(levelMethodName);
            } else {
                self[levelMethodName] = noop();
            }
        }
    };

    self.setLevel(self.levels.INFO);

    return self;
}));