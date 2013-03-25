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

    self.levels = { "TRACE": 1, "DEBUG": 2, "INFO": 3, "WARN": 4,
        "ERROR": 5, "FATAL": 6, "NONE": 7};

    self.setLevel = function (level) {
        if (level === self.levels.TRACE) {
            self.trace = console.trace;
        }
    };

    self.setLevel(self.levels.INFO);

    return self;
}));