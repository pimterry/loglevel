"use strict";

/*global document*/
var fixture = document.getElementById("qunit-fixture");

/*global QUnit*/
QUnit.module('loglevel', {
    setup: function() {
    },
    teardown: function() {
    }
});

/*global test*/
test('basic test', function() {
    /*global ok*/
    /*global log*/
    ok(typeof log !== "undefined", "log is defined");
    ok(typeof log === "object", "log is an object");
    ok(typeof log.trace === "function", "trace is a function");
    ok(typeof log.debug === "function", "debug is a function");
    ok(typeof log.info === "function", "info is a function");
    ok(typeof log.warn === "function", "warn is a function");
    ok(typeof log.error === "function", "error is a function");
    ok(typeof log.setLevel === "function", "setLevel is a function");
    ok(typeof log.enableAll === "function", "enableAll is a function");
    ok(typeof log.disableAll === "function", "disableAll is a function");
   
    // Use the API to make sure it doesn't blantantly fail with exceptions
    log.trace("a trace message");
    log.debug("a debug message");
    log.info("an info message");
    log.warn("a warn message");
    log.error("an error message");
});
