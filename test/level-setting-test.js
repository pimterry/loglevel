"use strict";

var logMethods = [
    "trace",
    "debug",
    "info",
    "warn",
    "error"
];

define(['../lib/loglevel'], function(log) {
    var originalConsole = window.console;

    describe("Log levels", function() {
        beforeEach(function() {
            window.console = {};

            for (var ii = 0; ii < logMethods.length; ii++) {
                window.console[logMethods[ii]] = jasmine.createSpy(logMethods[ii]);
            }
        });

        afterEach(function() {
            window.console = originalConsole;
        });

        describe("log.enableAll()", function() {
            it("enables all log methods", function() {
                log.enableAll();

                for (var ii = 0; ii < logMethods.length; ii++) {
                    var method = logMethods[ii];
                    log[method]("a log message");

                    expect(console[method]).toHaveBeenCalled();
                }
            });
        });

        describe("log.disableAll()", function() {
            it("disables all log methods", function() {
                log.disableAll();

                for (var ii = 0; ii < logMethods.length; ii++) {
                    var method = logMethods[ii];
                    log[method]("a log message");

                    expect(console[method]).not.toHaveBeenCalled();
                }
            });
        });

        describe("invalid setLevel inputs", function() {
            it("error thrown if no level is given", function() {
                expect(function() {
                    log.setLevel();
                }).toThrow();
            });

            it("error thrown if null level is given", function() {
                expect(function() {
                    log.setLevel(null);
                }).toThrow();
            });

            it("error thrown if undefined level is given", function() {
                expect(function() {
                    log.setLevel(undefined);
                }).toThrow();
            });

            it("error thrown if invalid level number is given", function() {
                expect(function() {
                    log.setLevel(-1);
                }).toThrow();
            });

            it("error thrown if invalid level name is given", function() {
                expect(function() {
                    log.setLevel("InvalidLevelName");
                }).toThrow();
            });
        });

        describe("setting log level by name", function() {
            function itCanSetLogLevelTo(level) {
                it("can set log level to " + level, function() {
                    log.disableAll();
                    log.setLevel(level);

                    log[level]("log message");
                    expect(console[level]).toHaveBeenCalled();
                });
            }

            itCanSetLogLevelTo("trace");
            itCanSetLogLevelTo("debug");
            itCanSetLogLevelTo("info");
            itCanSetLogLevelTo("warn");
            itCanSetLogLevelTo("error");
        });

        describe("log level settings", function() {
            describe("log.trace", function() {
                it("is enabled at trace level", function() {
                    log.setLevel(log.levels.TRACE);

                    log.trace("a log message");
                    expect(console.trace).toHaveBeenCalled();
                });

                it("is disabled at debug level", function() {
                    log.setLevel(log.levels.DEBUG);

                    log.trace("a log message");
                    expect(console.trace).not.toHaveBeenCalled();
                });

                it("is disabled at silent level", function() {
                    log.setLevel(log.levels.SILENT);

                    log.trace("a log message");
                    expect(console.trace).not.toHaveBeenCalled();
                });
            });

            describe("log.debug", function() {
                it("is enabled at trace level", function() {
                    log.setLevel(log.levels.TRACE);

                    log.debug("a log message");
                    expect(console.debug).toHaveBeenCalled();
                });

                it("is enabled at debug level", function() {
                    log.setLevel(log.levels.DEBUG);

                    log.debug("a log message");
                    expect(console.debug).toHaveBeenCalled();
                });

                it("is disabled at info level", function() {
                    log.setLevel(log.levels.INFO);

                    log.debug("a log message");
                    expect(console.debug).not.toHaveBeenCalled();
                });

                it("is disabled at silent level", function() {
                    log.setLevel(log.levels.SILENT);

                    log.debug("a log message");
                    expect(console.debug).not.toHaveBeenCalled();
                });
            });

            describe("log.info", function() {
                it("is enabled at debug level", function() {
                    log.setLevel(log.levels.DEBUG);

                    log.info("a log message");
                    expect(console.info).toHaveBeenCalled();
                });

                it("is enabled at info level", function() {
                    log.setLevel(log.levels.INFO);

                    log.info("a log message");
                    expect(console.info).toHaveBeenCalled();
                });

                it("is disabled at warn level", function() {
                    log.setLevel(log.levels.WARN);

                    log.info("a log message");
                    expect(console.info).not.toHaveBeenCalled();
                });

                it("is disabled at silent level", function() {
                    log.setLevel(log.levels.SILENT);

                    log.info("a log message");
                    expect(console.info).not.toHaveBeenCalled();
                });
            });

            describe("log.warn", function() {
                it("is enabled at info level", function() {
                    log.setLevel(log.levels.INFO);

                    log.warn("a log message");
                    expect(console.warn).toHaveBeenCalled();
                });

                it("is enabled at warn level", function() {
                    log.setLevel(log.levels.WARN);

                    log.warn("a log message");
                    expect(console.warn).toHaveBeenCalled();
                });

                it("is disabled at error level", function() {
                    log.setLevel(log.levels.ERROR);

                    log.warn("a log message");
                    expect(console.warn).not.toHaveBeenCalled();
                });

                it("is disabled at silent level", function() {
                    log.setLevel(log.levels.SILENT);

                    log.warn("a log message");
                    expect(console.warn).not.toHaveBeenCalled();
                });
            });

            describe("log.error", function() {
                it("is enabled at warn level", function() {
                    log.setLevel(log.levels.WARN);

                    log.error("a log message");
                    expect(console.error).toHaveBeenCalled();
                });

                it("is enabled at error level", function() {
                    log.setLevel(log.levels.ERROR);

                    log.error("a log message");
                    expect(console.error).toHaveBeenCalled();
                });

                it("is disabled at silent level", function() {
                    log.setLevel(log.levels.SILENT);

                    log.error("a log message");
                    expect(console.error).not.toHaveBeenCalled();
                });
            });
        });
    });
});

