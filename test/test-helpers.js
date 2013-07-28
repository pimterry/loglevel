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
    self.toBeAtLevel = function toBeAtLevel(level) {
        var log = this.actual;
        var expectedWorkingCalls = log.levels.SILENT - log.levels[level.toUpperCase()];
        var realLogMethod = window.console.log;

        for (var ii = 0; ii < logMethods.length; ii++) {
            var methodName = logMethods[ii];
            log[methodName](methodName);
        }

        expect(realLogMethod.calls.length).toEqual(expectedWorkingCalls);
        return true;
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

    self.toBeTheLevelStoredByCookie = function toBeTheLevelStoredByCookie() {
        var level = this.actual.toUpperCase();

        if (window.document.cookie.indexOf("loglevel="+level) !== -1) {
            return true;
        } else {
            return false;
        }
    };

    self.toBeTheLevelStoredByLocalStorage = function toBeTheLevelStoredByLocalStorage() {
        var level = this.actual.toUpperCase();

        if (window.localStorage['loglevel'] === level) {
            return true;
        }

        return false;
    };

    // Jasmine matcher to check whether a given string was saved by loglevel
    self.toBeTheStoredLevel = function toBeTheStoredLevel() {
        return self.toBeTheLevelStoredByLocalStorage.call(this) ||
               self.toBeTheLevelStoredByCookie.call(this);
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
    self.withFreshLog = function withFreshLog(toRun) {
        require.undef("lib/loglevel");

        var freshLog;

        waitsFor(function() {
            require(['lib/loglevel'], function(log) {
                freshLog = log;
            });
            return typeof freshLog !== "undefined";
        });

        runs(function() {
            toRun(freshLog);
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
