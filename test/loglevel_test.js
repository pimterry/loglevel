"use strict";

function isOriginalConsoleMethod(method) {
    for (var key in console) {
        if (console[key] === method) {
            return true;
        }
    }
    return false;
}

function allLogMethodsOn(log) {
    return [
        log.trace,
        log.debug,
        log.info,
        log.warn,
        log.error,
        log.fatal
    ];
}

define(['../lib/loglevel'], function (log) {
    describe("initial log level", function () {
        it("disables all log methods", function () {
            for (var logMethod in allLogMethodsOn(log)) {
                expect(isOriginalConsoleMethod(logMethod)).toBe(false);
            }
        });
    });

    describe("log.trace", function () {
        it("is enabled at trace level", function () {
            log.setLevel(log.levels.TRACE);
            expect(isOriginalConsoleMethod(log.trace)).toBe(true);
        });
    });
});

