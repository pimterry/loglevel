"use strict";

define(['../lib/loglevel'], function(log) {
    describe("with no console present", function() {
        var originalConsole = window.console;

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

        it("setting to silent is fine", function() {
            log.setLevel(log.levels.SILENT);
        });

        it("active method calls are allowed, once the active setLevel fails", function() {
            try {
                log.setLevel(log.levels.TRACE);
            } catch (e) { }
            log.trace("hello");
        });
    });
});

