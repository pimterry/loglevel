"use strict";

define(['test/test-helpers'], function(testHelpers) {
    var describeIf = testHelpers.describeIf;
    var it = testHelpers.itWithFreshLog;

    var originalConsole = window.console;
    var originalDocument = window.document;

    describeIf(testHelpers.isCookieStorageAvailable(), "Cookie persistence tests:", function() {

        beforeEach(function() {
            window.console = {"log" : jasmine.createSpy("console.log")};
            this.addMatchers({
                "toBeAtLevel" : testHelpers.toBeAtLevel,
                "toBeTheStoredLevel" : testHelpers.toBeTheLevelStoredByCookie
            });
        });

        afterEach(function() {
            window.console = originalConsole;
        });

        describe("If no level is saved", function() {
            beforeEach(function() {
                testHelpers.clearStoredLevels();
            });

            it("log level is set to warn by default", function(log) {
                expect(log).toBeAtLevel("warn");
            });

            it("warn is persisted as the current level", function(log) {
                expect("warn").toBeTheStoredLevel();
            });

            it("log can be set to info level", function(log) {
                log.setLevel("info");
                expect(log).toBeAtLevel("info");
            });

            it("log.setLevel() sets a cookie with the given level", function(log) {
                log.setLevel("debug");
                expect("debug").toBeTheStoredLevel();
            });
        });

        describe("If info level is saved", function() {
            beforeEach(function() {
                testHelpers.setStoredLevel("info");
            });

            it("info is the default log level", function(log) {
                expect(log).toBeAtLevel("info");
            });

            it("log can be changed to warn level", function(log) {
                log.setLevel("warn");
                expect(log).toBeAtLevel("warn");
            });

            it("log.setLevel() overwrites the saved level", function(log) {
                log.setLevel("error");

                expect("error").toBeTheStoredLevel();
                expect("info").not.toBeTheStoredLevel();
            });
        });

        describe("If the level is saved with other data", function() {
            beforeEach(function() {
                if (window) {
                    if (window.document && window.document.cookie) {
                        window.document.cookie = "qwe=asd";
                        window.document.cookie = "loglevel=ERROR";
                        window.document.cookie = "msg=hello world";
                    }
                }
            });

            it("error is the default log level", function(log) {
                expect(log).toBeAtLevel("error");
            });

            it("log can be changed to silent level", function(log) {
                log.setLevel("silent");
                expect(log).toBeAtLevel("silent");
            });

            it("log.setLevel() overrides the saved level only", function(log) {
                log.setLevel("debug");

                expect('debug').toBeTheStoredLevel();
                expect(window.document.cookie).toContain("msg=hello world");
            });
        });

        describe("If the level cookie is set incorrectly", function() {
            beforeEach(function() {
                testHelpers.setCookieStoredLevel('gibberish');
            });

            it("warn is the default log level", function(log) {
                expect(log).toBeAtLevel("warn");
            });

            it("warn is persisted as the current level, overriding the invalid cookie", function(log) {
                expect("warn").toBeTheStoredLevel();
            });

            it("log can be changed to info level", function(log) {
                log.setLevel("info");
                expect(log).toBeAtLevel("info");
            });

            it("log.setLevel() overrides the saved level with the new level", function(log) {
                expect('debug').not.toBeTheStoredLevel();

                log.setLevel("debug");

                expect('debug').toBeTheStoredLevel();
            });
        });

        var originalCookie = window.document.cookie;

        function isCookieUndefinable() {
            window.document.cookie = undefined;
            if (typeof window.document.cookie !== "undefined") {
                return false;
            } else {
                window.document.cookie = originalCookie;
                return true;
            }
        }

        describeIf(isCookieUndefinable(), "If document.cookie doesn't exist", function() {
            beforeEach(function() {
                window.document.cookie = undefined;
            });

            it("warn is the default log level", function(log) {
                expect(log).toBeAtLevel("warn");
            });

            it("log can be changed to info level", function(log) {
                log.setLevel("info");
                expect(log).toBeAtLevel("info");
            });

            it("log.setLevel() does nothing with cookies when the level is changed", function(log) {
                log.setLevel("trace");
                expect(window.document.cookie).not.toBeDefined();
            });
        });

        function isWindowUndefinable() {
            try {
                window.document = undefined;
                if (window.document !== undefined) {
                    throw "Could not change window.document";
                }
            } catch (e) {
                return; // Can't change window.document in current env, so skip these tests
            }
            window.document = originalDocument;
        }

        describeIf(isWindowUndefinable(), "If window.document doesn't exist", function() {
            beforeEach(function() {
                window.document = undefined;
            });

            afterEach(function () {
                window.document = originalDocument;
            });

            it("warn is the default log level", function(log) {
                expect(log).toBeAtLevel("warn");
            });

            it("log can be changed to info level", function(log) {
                log.setLevel("info");
                expect(log).toBeAtLevel("info");
            });

            it("log.setLevel() does nothing with cookies or the document when the level is changed", function(log) {
                log.setLevel("silent");
                expect(window.document).not.toBeDefined();
            });
        });
    });
});
