"use strict";

define(['test/test-helpers'], function(testHelpers) {
    var describeIf = testHelpers.describeIf;
    var it = testHelpers.itWithFreshLog;

    var originalConsole = window.console;

    describe("Multiple logger instances tests:", function() {

        describe("log.getLogger()", function() {
            it("returns a new logger that is not the default one", function(log) {
                var newLogger = log.getLogger("newLogger");
                expect(newLogger).not.toEqual(log);
                expect(newLogger.trace).toBeDefined();
                expect(newLogger.debug).toBeDefined();
                expect(newLogger.info).toBeDefined();
                expect(newLogger.warn).toBeDefined();
                expect(newLogger.error).toBeDefined();
                expect(newLogger.setLevel).toBeDefined();
                expect(newLogger.setDefaultLevel).toBeDefined();
                expect(newLogger.enableAll).toBeDefined();
                expect(newLogger.disableAll).toBeDefined();
                expect(newLogger.methodFactory).toBeDefined();
            });

            it("returns loggers without `getLogger()` and `noConflict()`", function(log) {
                var newLogger = log.getLogger("newLogger");
                expect(newLogger.getLogger).toBeUndefined();
                expect(newLogger.noConflict).toBeUndefined();
            });

            it("returns the same instance when called repeatedly with the same name", function(log) {
                var logger1 = log.getLogger("newLogger");
                var logger2 = log.getLogger("newLogger");

                console.log("Logger: ", logger1);

                expect(logger1).toEqual(logger2);
            });

            it("should throw if called with no name", function(log) {
                expect(function() {
                  log.getLogger();
                }).toThrow();
            });

            it("should throw if called with a non-string name", function(log) {
                expect(function() {
                  log.getLogger(true);
                }).toThrow();
            });
        });

        describe("inheritance", function() {
            beforeEach(function() {
                window.console = {"log" : jasmine.createSpy("console.log")};
                this.addMatchers({
                    "toBeAtLevel" : testHelpers.toBeAtLevel
                });
                testHelpers.clearStoredLevels();
            });

            afterEach(function() {
                window.console = originalConsole;
            });

            it("loggers are created with the same level as the default logger", function(log) {
              log.setLevel("ERROR", false);
              var newLogger = log.getLogger("newLogger");
              expect(newLogger).toBeAtLevel("error");
            });

            it("loggers are created with the same methodFactory as the default logger", function(log) {
                log.methodFactory = function(methodName, level) {
                  return function() {};
                };

                var newLogger = log.getLogger("newLogger");
                expect(newLogger.methodFactory).toEqual(log.methodFactory);
            });
        });
    });
});
