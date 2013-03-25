"use strict";

define(['../lib/loglevel'], function(log) {
    xdescribe("log methods", function() {
        it("are all callable", function() {
            log.setLevel(log.levels.TRACE);
            log.trace("trace");
            log.debug("debug");
            log.info("info");
            log.warn("warn");
            log.error("error");
        });
    });

    describe("log levels", function() {
        it("are all settable", function() {
            log.setLevel(log.levels.TRACE);
            log.setLevel(log.levels.DEBUG);
            log.setLevel(log.levels.INFO);
            log.setLevel(log.levels.WARN);
            log.setLevel(log.levels.ERROR);
        });
    });
});
