"use strict";

define(['../lib/loglevel'], function(log) {
    describe("Integration smoke tests", function() {
        var describeIfConsoleAvailable =
            typeof console !== "undefined" ? describe : xdescribe;

        describeIfConsoleAvailable("log methods", function() {
            it("can all be called", function() {
                if (typeof console !== "undefined") {
                    log.setLevel(log.levels.TRACE);
                }

                log.trace("trace");
                log.debug("debug");
                log.info("info");
                log.warn("warn");
                log.error("error");
            });
        });

        describe("log methods", function() {
            it("can all be disabled", function() {
                log.setLevel(log.levels.SILENT);
                log.trace("trace");
                log.debug("debug");
                log.info("info");
                log.warn("warn");
                log.error("error");
            });
        });

        describeIfConsoleAvailable("log levels", function() {
            it("are all settable", function() {
                log.setLevel(log.levels.TRACE);
                log.setLevel(log.levels.DEBUG);
                log.setLevel(log.levels.INFO);
                log.setLevel(log.levels.WARN);
                log.setLevel(log.levels.ERROR);
            });
        });
    });
});
