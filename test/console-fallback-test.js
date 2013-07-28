"use strict";

function consoleLogIsCalledBy(log, methodName) {
    it(methodName + " calls console.log", function() {
        log.setLevel(log.levels.TRACE);
        log[methodName]("Log message for call to " + methodName);
        expect(console.log.calls.length).toEqual(1);
    });
}

define(['../lib/loglevel'], function(log) {
    var originalConsole = window.console;

    describe("Fallback functionality:", function() {
        describe("with no console present", function() {
            beforeEach(function() {
                window.console = undefined;
            });

            afterEach(function() {
                window.console = originalConsole;
            });

            it("silent method calls are allowed", function() {
                log.setLevel(log.levels.SILENT);
                log.trace("hello");
            });

            it("setting an active level fails", function() {
                expect(function() {
                    log.setLevel(log.levels.TRACE);
                }).toThrow("No console available for logging");
            });

            it("setting to silent level is fine", function() {
                log.setLevel(log.levels.SILENT);
            });

            it("active method calls are allowed, once the active setLevel fails", function() {
                try {
                    log.setLevel(log.levels.TRACE);
                } catch (e) { }
                log.trace("hello");
            });
        });

        describe("with a console that only supports console.log", function() {
            beforeEach(function() {
                window.console = {"log" : jasmine.createSpy("console.log")};
            });

            afterEach(function() {
                window.console = originalConsole;
            });

            it("log can be set to silent", function() {
                log.setLevel(log.levels.SILENT);
            });

            it("log can be set to an active level", function() {
                log.setLevel(log.levels.ERROR);
            });

            consoleLogIsCalledBy(log, "trace");
            consoleLogIsCalledBy(log, "debug");
            consoleLogIsCalledBy(log, "info");
            consoleLogIsCalledBy(log, "warn");
            consoleLogIsCalledBy(log, "trace");
        });
    });
});

