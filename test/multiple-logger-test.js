"use strict";

define(['../lib/loglevel'], function(log) {
    var originalConsole = window.console;

    describe("Multiple logger instances tests:", function() {

        describe("log.getLogger()", function() {
            it("returns a new logger that is not the default one", function() {
                var newLogger = log.getLogger("newLogger");
                expect(newLogger).not.toEqual(log);
                expect(newLogger.trace).toBeDefined();
                expect(newLogger.debug).toBeDefined();
                expect(newLogger.info).toBeDefined();
                expect(newLogger.warn).toBeDefined();
                expect(newLogger.error).toBeDefined();
                expect(newLogger.setLevel).toBeDefined();
                expect(newLogger.setDefaultLevel).toBeDefined();
                expect(newLogger.enableAll).toBeDefined();
                expect(newLogger.disableAll).toBeDefined();
                expect(newLogger.methodFactory).toBeDefined();
            });

            it("returns loggers without `getLogger()` and `noConflict()`", function() {
                var newLogger = log.getLogger("newLogger");
                expect(newLogger.getLogger).toBeUndefined();
                expect(newLogger.noConflict).toBeUndefined();
            });
            
        });
    });
});
