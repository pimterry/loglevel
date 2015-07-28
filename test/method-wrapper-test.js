"use strict";

define(['test/test-helpers'], function(testHelpers) {
    var it = testHelpers.itWithFreshLog;
    var originalConsole = window.console;

    describe("With a method wrapper set", function() {
        beforeEach(function() {
            window.console = {
                "trace" : jasmine.createSpy("console.trace"),
                "info" : jasmine.createSpy("console.info"),
                "debug" : jasmine.createSpy("console.debug"),
                "warn" : jasmine.createSpy("console.warn"),
                "error" : jasmine.createSpy("console.error")
            };
        });

        afterEach(function() {
            window.console = originalConsole;
        });

        it("should call the wrapper once for each active loggable level", function(log) {
            var wrapper = jasmine.createSpy("methodWrapper");

            log.wrapLogMethods(wrapper);

            wrapper.reset();
            log.setLevel("trace");
            expect(wrapper.calls.length).toEqual(5);

            wrapper.reset();
            log.setLevel("error");
            expect(wrapper.calls.length).toEqual(1);
        });

        it("should call the wrapper with the name of the logger itself", function(log) {
            var logger = log.getLogger("log-wrapper-name-test");
            var wrapper = jasmine.createSpy("methodWrapper");

            logger.wrapLogMethods(wrapper);

            logger.setLevel("trace");

            for (var i = 0; i < 5; i++) {
                expect(wrapper.argsForCall[i][2]).toEqual("log-wrapper-name-test");
            }
        });

        it("should call the wrapper with 'undefined' for the root logger's name", function(log) {
            var wrapper = jasmine.createSpy("methodWrapper");

            log.wrapLogMethods(wrapper);

            log.setLevel("trace");

            for (var i = 0; i < 5; i++) {
                expect(wrapper.argsForCall[i][2]).toEqual(undefined);
            }
        });

        it("should immediately use the functions returned by the wrapper", function(log) {
            var logFunction = jasmine.createSpy("logFunction");

            log.wrapLogMethods(function () { return logFunction; });

            expect(log.error).toEqual(logFunction);
        });

        it("should call the wrapper with the correct generated log methods", function (log) {
            log.wrapLogMethods(function (underlyingLogMethod, levelName) {
                // Call each method with it's own name, to confirm they match
                return function () {
                    underlyingLogMethod(levelName);
                };
            });

            log.setLevel("trace");

            log.trace("ignored-message");
            log.debug("ignored-message");
            log.info("ignored-message");
            log.warn("ignored-message");
            log.error("ignored-message");

            expect(console.error).toHaveBeenCalledWith('error');
            expect(console.warn).toHaveBeenCalledWith('warn');
            expect(console.info).toHaveBeenCalledWith('info');
            expect(console.debug).toHaveBeenCalledWith('debug');
            expect(console.trace).toHaveBeenCalledWith('trace');
        });

        it("should allow a second layer of wrapping to be applied, and compose both together appropriately", function(log) {
            log.wrapLogMethods(function (underlyingMethod) {
                return function (message) {
                    underlyingMethod("1st wrapper: " + message);
                };
            });
            log.wrapLogMethods(function (underlyingMethod) {
                return function (message) {
                    underlyingMethod("2nd wrapper: " + message);
                };
            });

            log.error("error-message");

            expect(console.error).toHaveBeenCalledWith("2nd wrapper: 1st wrapper: error-message");
        });
    });
});
