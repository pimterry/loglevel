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

define(['../lib/loglevel'], function(log) {
    describe("initial log level", function() {
        it("disables all log methods", function() {
            for (var logMethod in allLogMethodsOn(log)) {
                expect(isOriginalConsoleMethod(logMethod)).toBe(false);
            }
        });
    });

    describe("silent log level", function() {
        it("disables all log methods", function() {
            log.setLevel(log.levels.SILENT);

            for (var logMethod in allLogMethodsOn(log)) {
                expect(isOriginalConsoleMethod(logMethod)).toBe(false);
            }
        });
    });

    describe("log usage with no console present", function() {
        var originalConsole = window.console;

        beforeEach(function() {
            window.console = undefined;
        });

        afterEach(function() {
            window.console = originalConsole;
        });

        it("should allow silent method calls", function() {
            log.setLevel(log.levels.SILENT);
            log.trace("hello");
        });

        it("should allow active method calls once the setLevel fails", function() {
            try {
                log.setLevel(log.levels.TRACE);
            } catch (e) { }
            log.trace("hello");
        });

        it("should fail when setting an active level", function() {
            expect(function() {
                log.setLevel(log.levels.TRACE);
            }).toThrow("No console available for logging");
        });

        it("should allow setting to SILENT level", function() {
            log.setLevel(log.levels.SILENT);
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
        });
    });
});

