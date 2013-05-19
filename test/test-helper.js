"use strict";

if (typeof window === "undefined") {
    window = {};
}

var logMethods = [
    "trace",
    "debug",
    "info",
    "warn",
    "error"
];

// Jasmine matcher to check the log level of a log object
function toBeAtLevel(level) {
    /*jshint validthis: true */

    var log = this.actual;
    var expectedWorkingCalls = log.levels.SILENT - log.levels[level.toUpperCase()];
    var realLogMethod = window.console.log;

    for (var ii = 0; ii < logMethods.length; ii++) {
        var methodName = logMethods[ii];
        log[methodName](methodName);
    }

    expect(realLogMethod.calls.length).toEqual(expectedWorkingCalls);
    return true;
}

// Wraps the Jasmine it(name, test) call with some require magic to reload the loglevel
// dependency for the given test
function itWithFreshLog(name, test) {
    jasmine.getEnv().it(name, function() {
        require.undef("lib/loglevel");

        var freshLog;

        waitsFor(function() {
            require(['lib/loglevel'], function(log) {
                freshLog = log;
            });
            return typeof freshLog !== "undefined";
        });

        runs(function() {
            test(freshLog);
        });
    });
}