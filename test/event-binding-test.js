"use strict";

var logMethods = [
    "trace",
    "debug",
    "info",
    "warn",
    "error"
];

define(['../lib/loglevel'], function(log) {
    describe("Even Binding", function () {
      it("binds log methods", function () {

        function expectMethod(method) {
          return function () {
            expect(arguments[0]).toBe(method + '1');
            expect(arguments[1]).toBe(method + '2');
          };
        }

        for (var i = 0; i < logMethods.length; i++) {
          var method = logMethods[i];
          var expector = expectMethod(method);
          log.on(method, expector);
          log[method](method + '1', method + '2');
          log.off(method, expector);
        }

      });
    });
  });
