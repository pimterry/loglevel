"use strict";

define(['test/test-helpers'], function(testHelpers) {
    var describeIf = testHelpers.describeIf;
    var it = testHelpers.itWithFreshLog;

    var originalConsole = window.console;

    describe("Setting default log level tests:", function() {

        beforeEach(function() {
            window.console = {"log" : jasmine.createSpy("console.log")};
            jasmine.addMatchers({
                "toBeAtLevel" : testHelpers.toBeAtLevel,
                "toBeTheStoredLevel" : testHelpers.toBeTheLevelStoredByLocalStorage
            });

            testHelpers.clearStoredLevels();
        });

        afterEach(function() {
            window.console = originalConsole;
        });

        describe("If no level is saved", function() {
            beforeEach(function () {
                testHelpers.clearStoredLevels();
            });

            it("new level is always set", function(log) {
                log.setDefaultLevel("trace");
                expect(log).toBeAtLevel("trace");
            });

            it("level is not persisted", function(log) {
                log.setDefaultLevel("debug");
                expect("debug").not.toBeTheStoredLevel();
            });
        });

        describe("If a level is saved", function () {
            beforeEach(function () {
                testHelpers.setStoredLevel("trace");
            });

            it("saved level is not modified", function (log) {
                log.setDefaultLevel("debug");
                expect(log).toBeAtLevel("trace");
            });
        });

        describe("If the level is stored incorrectly", function() {
            beforeEach(function() {
                testHelpers.setLocalStorageStoredLevel("gibberish");
            });

            it("new level is set", function(log) {
                log.setDefaultLevel("debug");
                expect(log).toBeAtLevel("debug");
                expect("debug").not.toBeTheStoredLevel();
            });
        });

        describe("If the level is invalid or empty", function() {
            it("an invalid level keeps the default level and warns", function(log) {
                log.setDefaultLevel("info");
                log.setDefaultLevel("verbose");
                // check the console first: toBeAtLevel calls the log methods
                expect(window.console.log).toHaveBeenCalledWith(
                    jasmine.stringMatching(/invalid level: verbose/));
                expect(log).toBeAtLevel("info");
            });

            it("an empty level keeps the default level and does not warn", function(log) {
                log.setDefaultLevel("info");
                log.setDefaultLevel(undefined);
                log.setDefaultLevel(null);
                log.setDefaultLevel("");
                expect(window.console.log).not.toHaveBeenCalled();
                expect(log).toBeAtLevel("info");
            });

            it("setLevel still throws for an invalid level", function(log) {
                expect(function() { log.setLevel("verbose"); }).toThrow();
            });
        });

        describe("log.parseLevel()", function() {
            it("returns the number of a valid level", function(log) {
                expect(log.parseLevel("DEBUG")).toBe(1);
                expect(log.parseLevel("warn")).toBe(3);
                expect(log.parseLevel(4)).toBe(4);
            });

            it("returns undefined for an invalid level", function(log) {
                expect(log.parseLevel("verbose")).toBeUndefined();
                expect(log.parseLevel(9)).toBeUndefined();
                expect(log.parseLevel(undefined)).toBeUndefined();
            });
        });

        describe("log.resetLevel() resets the log", function() {
            it("to warn if no explicit default is set", function(log) {
                log.setLevel("debug");
                log.resetLevel();

                expect(log).toBeAtLevel("warn");
            });

            it("to info if default is set to info", function(log) {
                log.setDefaultLevel("info");
                log.setLevel("debug");
                log.resetLevel();

                expect(log).toBeAtLevel("info");
            });
        });
    });
});
