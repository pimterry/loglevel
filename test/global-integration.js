/* global log */
"use strict";

describe("loglevel from a global <script> tag", function () {

    beforeEach(function () {
        jasmine.addMatchers({
            // Polyfill for expect().nothing() in Jasmine 2.8+.
            nothing: function nothing() {
                return {
                    compare: function() {
                        return { pass: true };
                    }
                };
            }
        });
    });

    it("is available globally", function () {
        expect(log).not.toBeUndefined();
    });

    it("allows setting the logging level", function () {
        log.setLevel(log.levels.TRACE);
        log.setLevel(log.levels.DEBUG);
        log.setLevel(log.levels.INFO);
        log.setLevel(log.levels.WARN);
        log.setLevel(log.levels.ERROR);
        expect().nothing();
    });

    it("successfully logs", function () {
        window.console = { "log": jasmine.createSpy("log") };

        log.setLevel(log.levels.INFO);
        log.info("test message");

        expect(console.log).toHaveBeenCalledWith("test message");
    });
});
