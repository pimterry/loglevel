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
        log.error
    ];
}

define(['../lib/loglevel'], function(log) {
    describe("initial log level", function() {
        it("disables all log methods", function() {
            var logMethods = allLogMethodsOn(log);
            for (var method in logMethods) {
                expect(isOriginalConsoleMethod(logMethods[method])).toBe(false);
            }
        });
    });

    describe("silent log level", function() {
        it("disables all log methods", function() {
            log.setLevel(log.levels.SILENT);

            var logMethods = allLogMethodsOn(log);
            for (var method in logMethods) {
                expect(isOriginalConsoleMethod(logMethods[method])).toBe(false);
            }
        });
    });

    describe("log level enabling", function() {
        describe("log.trace", function() {
            it("is enabled at trace level", function() {
                log.setLevel(log.levels.TRACE);
                expect(isOriginalConsoleMethod(log.trace)).toBe(true);
            });

            it("is disabled at debug level", function() {
                log.setLevel(log.levels.DEBUG);
                expect(isOriginalConsoleMethod(log.trace)).toBe(false);
            });

            it("is disabled at silent level", function() {
                log.setLevel(log.levels.SILENT);
                expect(isOriginalConsoleMethod(log.trace)).toBe(false);
            });
        });

        describe("log.debug", function() {
            it("is enabled at trace level", function() {
                log.setLevel(log.levels.TRACE);
                expect(isOriginalConsoleMethod(log.debug)).toBe(true);
            });

            it("is enabled at debug level", function() {
                log.setLevel(log.levels.DEBUG);
                expect(isOriginalConsoleMethod(log.debug)).toBe(true);
            });

            it("is disabled at info level", function() {
                log.setLevel(log.levels.INFO);
                expect(isOriginalConsoleMethod(log.debug)).toBe(false);
            });

            it("is disabled at silent level", function() {
                log.setLevel(log.levels.SILENT);
                expect(isOriginalConsoleMethod(log.debug)).toBe(false);
            });
        });

        describe("log.info", function() {
            it("is enabled at debug level", function() {
                log.setLevel(log.levels.DEBUG);
                expect(isOriginalConsoleMethod(log.info)).toBe(true);
            });

            it("is enabled at info level", function() {
                log.setLevel(log.levels.INFO);
                expect(isOriginalConsoleMethod(log.info)).toBe(true);
            });

            it("is disabled at warn level", function() {
                log.setLevel(log.levels.WARN);
                expect(isOriginalConsoleMethod(log.info)).toBe(false);
            });

            it("is disabled at silent level", function() {
                log.setLevel(log.levels.SILENT);
                expect(isOriginalConsoleMethod(log.info)).toBe(false);
            });
        });

        describe("log.warn", function() {
            it("is enabled at info level", function() {
                log.setLevel(log.levels.INFO);
                expect(isOriginalConsoleMethod(log.warn)).toBe(true);
            });

            it("is enabled at warn level", function() {
                log.setLevel(log.levels.WARN);
                expect(isOriginalConsoleMethod(log.warn)).toBe(true);
            });

            it("is disabled at error level", function() {
                log.setLevel(log.levels.ERROR);
                expect(isOriginalConsoleMethod(log.warn)).toBe(false);
            });

            it("is disabled at silent level", function() {
                log.setLevel(log.levels.SILENT);
                expect(isOriginalConsoleMethod(log.warn)).toBe(false);
            });
        });

        describe("log.error", function() {
            it("is enabled at warn level", function() {
                log.setLevel(log.levels.WARN);
                expect(isOriginalConsoleMethod(log.error)).toBe(true);
            });

            it("is enabled at error level", function() {
                log.setLevel(log.levels.ERROR);
                expect(isOriginalConsoleMethod(log.error)).toBe(true);
            });

            it("is disabled at silent level", function() {
                log.setLevel(log.levels.SILENT);
                expect(isOriginalConsoleMethod(log.error)).toBe(false);
            });
        });
    });
});

