"use strict";

if (typeof window === "undefined") {
    window = {};
}

var logMethods = [
    "trace",
    "debug",
    "info",
    "warn",
    "error"
];

define(function () {
    var self = {};

    // Jasmine matcher to check the log level of a log object
    self.toBeAtLevel = function toBeAtLevel() {
        return {
            compare: function(actual, expected){
                var log = actual;
                var expectedWorkingCalls = log.levels.SILENT - log.levels[expected.toUpperCase()];
                var realLogMethod = window.console.log;

                for (var ii = 0; ii < logMethods.length; ii++) {
                    var methodName = logMethods[ii];
                    log[methodName](methodName);
                }

                var passed = realLogMethod.calls.count() === expectedWorkingCalls;

                return {
                    pass: passed
                };
            }
        };
    };

    self.isCookieStorageAvailable = function isCookieStorageAvailable() {
        if (window && window.document && window.document.cookie) {
            // We need to check not just that the cookie objects are available, but that they work, because
            // if we run from file:// URLs they appear present but are non-functional
            window.document.cookie = "test=hi;";

            var result = window.document.cookie.indexOf('test=hi') !== -1;
            window.document.cookie = "test=; expires=Thu, 01 Jan 1970 00:00:01 GMT;";

            return result;
        } else {
            return false;
        }
    };

    self.isLocalStorageAvailable = function isLocalStorageAvailable() {
        try {
            return !!window.localStorage;
        } catch (e){
            return false;
        }
    };

    self.isAnyLevelStoragePossible = function isAnyLevelStoragePossible() {
        return self.isCookieStorageAvailable() || self.isLocalStorageAvailable();
    };


    function isLevelStoredByCookie(value){
        var level = value.toUpperCase();
        return window.document.cookie.indexOf("loglevel="+level) !== -1;
    }
    self.toBeTheLevelStoredByCookie = function toBeTheLevelStoredByCookie() {
        return {
            compare: function(actual, expected){
                return {
                    pass: isLevelStoredByCookie(actual)
                };
            }
        };
    };

    function isLevelStoredByLocalStorage(value){
        var level = value.toUpperCase();
        return window.localStorage['loglevel'] === level;
    }
    self.toBeTheLevelStoredByLocalStorage = function toBeTheLevelStoredByLocalStorage() {
        return {
            compare : function(actual, expected){
                return {
                    pass: isLevelStoredByLocalStorage(actual)
                };
            }
        };
    };

    // Jasmine matcher to check whether a given string was saved by loglevel
    self.toBeTheStoredLevel = function toBeTheStoredLevel() {
        return {
            compare: function(actual){
                return {
                    pass: isLevelStoredByCookie(actual) || isLevelStoredByLocalStorage(actual)
                };
            }
        };
    };

    self.setCookieStoredLevel = function setCookieStoredLevel(level) {
        window.document.cookie = "loglevel=" + level.toUpperCase();
    };

    self.setLocalStorageStoredLevel = function setLocalStorageStoredLevel(level) {
        window.localStorage['loglevel'] = level.toUpperCase();
    };

    self.setStoredLevel = function setStoredLevel(level) {
        if (self.isCookieStorageAvailable()) {
            self.setCookieStoredLevel(level);
        }
        if (self.isLocalStorageAvailable()) {
            self.setLocalStorageStoredLevel(level);
        }
    };

    self.clearStoredLevels = function clearStoredLevels() {
        if (self.isLocalStorageAvailable()) {
            window.localStorage.clear();
        }
        if (self.isCookieStorageAvailable()) {
            window.document.cookie = "loglevel=; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
        }
    };

    self.describeIf = function describeIf(condition, name, test) {
        if (condition) {
            jasmine.getEnv().describe(name, test);
        }
    };

    self.itIf = function itIf(condition, name, test) {
        if (condition) {
            jasmine.getEnv().it(name, test);
        }
    };

    // Forcibly reloads loglevel, and asynchronously hands the resulting log back to the given callback
    // via Jasmine async magic
    self.withFreshLog = function withFreshLog(callback) {
        require.undef("lib/loglevel");
        require(['lib/loglevel'], function(log) {
            callback(log);
        });
    };

    // Wraps Jasmine's it(name, test) call to reload the loglevel dependency for the given test
    self.itWithFreshLog = function itWithFreshLog(name, test) {
        jasmine.getEnv().it(name, function() {
            self.withFreshLog(test);
        });
    };

    return self;
});
