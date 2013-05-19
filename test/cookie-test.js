"use strict";

var originalConsole = window.console;
var originalDocument = window.document;
var originalCookie = window.document.cookie;

function deleteLoglevelCookie() {
    window.document.cookie = "loglevel=; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
}

define(['../lib/loglevel'], function(log) {
    var it = itWithFreshLog;

    describe("Cookie tests", function() {

        beforeEach(function() {
            window.console = {"log" : jasmine.createSpy("console.log")};
            this.addMatchers({ "toBeAtLevel" : toBeAtLevel });
        });

        afterEach(function() {
            window.console = originalConsole;
            window.document.cookie = originalCookie;
        });

        describe("If cookie not set", function() {
            beforeEach(function() {
                window.document.cookie = "loglevel=;";
            });

            it("log level is set to warn by default", function(log) {
                expect(log).toBeAtLevel("warn");
            });

            it("log can be set to info level", function(log) {
                log.setLevel("info");
                expect(log).toBeAtLevel("info");
            });

            it("log.setLevel sets a cookie with the given level", function(log) {
                log.setLevel("debug");
                expect(window.document.cookie).toContain("loglevel=DEBUG");
            });
        });

        describe("If cookie is set to info level", function() {
            beforeEach(function() {
                window.document.cookie = "loglevel=INFO";
            });

            it("info is the default log level", function(log) {
                expect(log).toBeAtLevel("info");
            });

            it("log can be changed to warn level", function(log) {
                log.setLevel("warn");
                expect(log).toBeAtLevel("warn");
            });

            it("changing the log level overwrites the cookie", function(log) {
                log.setLevel("error");
                expect(window.document.cookie).toContain("loglevel=ERROR");
                expect(window.document.cookie).not.toContain("loglevel=INFO");
            });
        });

        describe("If cookie is set to error level with other cookies", function() {
            beforeEach(function() {
                window.document.cookie = "qwe=asd";
                window.document.cookie = "loglevel=ERROR";
                window.document.cookie = "msg=hello world";
            });

            it("error is the default log level", function(log) {
                expect(log).toBeAtLevel("error");
            });

            it("log can be changed to silent level", function(log) {
                log.setLevel("silent");
                expect(log).toBeAtLevel("silent");
            });

            it("log.setLevel() overrides the loglevel cookie only with the new level", function(log) {
                log.setLevel("debug");
                expect(window.document.cookie).toContain("loglevel=DEBUG");
                expect(window.document.cookie).toContain("hello world");
            });
        });

        describe("If cookie is set incorrectly", function() {
            beforeEach(function() {
                window.document.cookie = "loglevel=GIBBERISH";
            });

            it("warn is the default log level", function(log) {
                expect(log).toBeAtLevel("warn");
            });

            it("log can be changed to info level", function(log) {
                log.setLevel("info");
                expect(log).toBeAtLevel("info");
            });

            it("log.setLevel() overrides the cookie with the new level", function(log) {
                log.setLevel("debug");
                expect(window.document.cookie).toContain("loglevel=DEBUG");
            });
        });

        describe("If document.cookie doesn't exist", function() {
            window.document.cookie = undefined;
            if (typeof window.document.cookie !== "undefined") {
                return;
            } else {
                window.document.cookie = originalCookie;
            }

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

        describe("If window.document doesn't exist", function() {
            try {
                window.document = undefined;
                if (window.document !== undefined) {
                    throw "Could not change window.document";
                }
            } catch (e) {
                return; // Can't change window.document in current env, so skip these tests
            }
            window.document = originalDocument;

            beforeEach(function() {
                window.document = undefined;
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