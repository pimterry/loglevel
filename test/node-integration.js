"use strict";

describe("loglevel included via node", function () {
    it("is included successfully", function () {
        expect(require('../lib/loglevel')).not.toBeUndefined();
    });

    it("allows setting the logging level", function () {
        var log = require('../lib/loglevel');

        log.setLevel(log.levels.TRACE);
        log.setLevel(log.levels.DEBUG);
        log.setLevel(log.levels.INFO);
        log.setLevel(log.levels.WARN);
        log.setLevel(log.levels.ERROR);
    });

    it("successfully logs", function () {
        var log = require('../lib/loglevel');
        console.info = jasmine.createSpy("info");

        log.setLevel(log.levels.INFO);
        log.info("test message");

        expect(console.info).toHaveBeenCalledWith("test message");
    });

    // NOTE: this test is the same as the similarly-named test in
    // `multiple-logger-test.js` (which only runs in browsers). If making
    // changes here, be sure to adjust that test as well.
    it("supports using symbols as names", function() {
        var log = require('../lib/loglevel');

        var s1 = Symbol("a-symbol");
        var s2 = Symbol("a-symbol");

        var logger1 = log.getLogger(s1);
        var defaultLevel = logger1.getLevel();
        logger1.setLevel(log.levels.TRACE);

        var logger2 = log.getLogger(s2);

        // Should be unequal: same name, but different symbol instances
        expect(logger1).not.toEqual(logger2);
        expect(logger2.getLevel()).toEqual(defaultLevel);
    });
    // Supports getting child nodes
    it("supports child logger inheritance", function() {
        var log = require('../lib/loglevel');
        var logger1 = log.getLogger('one');
        log.setLevel("info");
        expect(logger1.getLevel()).toBe(log.levels.INFO);
        var logger12 = logger1.getLogger('two');
        expect(logger12.getLevel()).toBe(log.levels.INFO);
        log.setLevel("warn");

        expect(log.getLevel()).toBe(log.levels.WARN);
        expect(logger12.getLevel()).toBe(log.levels.WARN);
    });

    it("same logger is returned for different retrieves", function() {
        var log = require('../lib/loglevel');
        var parent = log.getLogger("parent");
        var child = parent.getLogger("child");
        var parentChild = log.getLogger("parent", "child");
        expect(child).toBe(parentChild);
    });
});
