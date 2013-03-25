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

    var logMethods = (function() {
        var methods = [];
        for (var key in self.levels) {
            var methodName = key.toLowerCase();
            methods.push(methodName);
        }
        return methods;
    }());

    function clearMethods() {
        for (var ii = 0; ii < logMethods.length; ii++) {
            self[logMethods[ii]] = noop;
        }
    }

    self.setLevel = function (level) {
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
                    self[methodName] = noop();
                }
            }
        }
    };

    self.setLevel(self.levels.SILENT);

    return self;
}));