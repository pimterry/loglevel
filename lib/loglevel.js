/*! loglevel - https://github.com/pimterry/loglevel - licensed MIT */
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global.log=factory());
})(this, (function () { 'use strict';

    /* loglevel - https://github.com/pimterry/loglevel
     *
     * Copyright (c) 2013 Tim Perry
     * Licensed under the MIT license.
     */
    var undefinedType = "undefined";
    var noop = function () { };
    var logMethods = ["trace", "debug", "info", "warn", "error"];
    function defaultMethodFactory(methodName) {
        if (typeof console !== undefinedType) {
            var anyConsole = console;
            var consoleMethod = anyConsole[methodName] || anyConsole.log;
            if (typeof consoleMethod === "function") {
                return consoleMethod.bind(console);
            }
        }
        return noop;
    }
    function replaceLoggingMethods() {
        /*jshint validthis:true */
        var level = this.getLevel();
        for (var i = 0; i < logMethods.length; i++) {
            var methodName = logMethods[i];
            this[methodName] = i < level ? noop : this.methodFactory(methodName, level, this.name);
        }
        // Make `log.log` an alias to ensure compatibility with `console.*`.
        this.log = this.info;
        if (typeof console === undefinedType && level < this.levels.SILENT) {
            return "No console available for logging";
        }
    }
    function Logger(name, factory, parent) {
        var self = this;
        // Private instance variables:
        var inheritedLevel = null;
        var defaultLevel = null;
        var userLevel = null;
        // Categories form an inherited hierarchy. Root logger has [].
        var parentCategories = parent && parent.categories ? parent.categories : [];
        self.categories = parent ? parentCategories.concat([name]) : [];
        // Build a storage key, unless any category is a Symbol (cannot be serialized safely).
        var hasSymbol = false;
        for (var i = 0; i < self.categories.length; i++) {
            if (typeof self.categories[i] === "symbol") {
                hasSymbol = true;
                break;
            }
        }
        var storageKey = hasSymbol
            ? null
            : parent
                ? "loglevel:" + self.categories.map(function (c) { return String(c); }).join(".")
                : "loglevel";
        var loggers = {};
        function persistLevelIfPossible(levelNum) {
            var levelName = (logMethods[levelNum] || "silent").toUpperCase();
            if (typeof window === undefinedType || !storageKey)
                return;
            try {
                window.localStorage[storageKey] = levelName;
                return;
            }
            catch (_ignore) { }
            try {
                window.document.cookie = encodeURIComponent(storageKey) + "=" + levelName + ";";
            }
            catch (_ignore) { }
        }
        function getPersistedLevel() {
            var storedLevel;
            if (typeof window === undefinedType || !storageKey)
                return;
            try {
                storedLevel = window.localStorage[storageKey];
            }
            catch (_ignore) { }
            if (typeof storedLevel === undefinedType) {
                try {
                    var cookie = window.document.cookie;
                    var cookieName = encodeURIComponent(storageKey);
                    var location_1 = cookie.indexOf(cookieName + "=");
                    if (location_1 !== -1) {
                        storedLevel = /^([^;]+)/.exec(cookie.slice(location_1 + cookieName.length + 1))[1];
                    }
                }
                catch (_ignore) { }
            }
            if (self.levels[storedLevel] === undefined) {
                storedLevel = undefined;
            }
            return storedLevel;
        }
        function clearPersistedLevel() {
            if (typeof window === undefinedType || !storageKey)
                return;
            try {
                window.localStorage.removeItem(storageKey);
            }
            catch (_ignore) { }
            try {
                window.document.cookie =
                    encodeURIComponent(storageKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC";
            }
            catch (_ignore) { }
        }
        function normalizeLevel(input) {
            var level = input;
            if (typeof level === "string" && self.levels[level.toUpperCase()] !== undefined) {
                level = self.levels[level.toUpperCase()];
            }
            if (typeof level === "number" && level >= 0 && level <= self.levels.SILENT) {
                return level;
            }
            throw new TypeError("log.setLevel() called with invalid level: " + input);
        }
        self.name = name;
        self.levels = { TRACE: 0, DEBUG: 1, INFO: 2, WARN: 3, ERROR: 4, SILENT: 5 };
        self.methodFactory = factory || defaultMethodFactory;
        self.getLevel = function () {
            if (userLevel !== null)
                return userLevel;
            if (defaultLevel !== null)
                return defaultLevel;
            if (inheritedLevel === null) {
                inheritedLevel = parent ? parent.getLevel() : self.levels.WARN;
            }
            return inheritedLevel;
        };
        self.getLogger = function () {
            var childCategories = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                childCategories[_i] = arguments[_i];
            }
            if (!childCategories.length)
                return self;
            var logger = self;
            for (var i = 0; i < childCategories.length; i++) {
                var category = childCategories[i];
                var existing = logger.getChildLoggers()[category];
                if (existing) {
                    logger = existing;
                    continue;
                }
                if (typeof category !== "symbol" && typeof category !== "string") {
                    throw new Error("Category names must be a symbol or string, but is a " + typeof category);
                }
                var childLogger = new Logger(category, self.methodFactory, logger);
                logger.getChildLoggers()[category] = childLogger;
                logger = childLogger;
            }
            return logger;
        };
        self.getChildLoggers = function () {
            return loggers;
        };
        // Back-compat: older typings mention `getLoggers()` on the root logger.
        self.getLoggers = self.getChildLoggers;
        self.setLevel = function (level, persist) {
            userLevel = normalizeLevel(level);
            if (persist !== false)
                persistLevelIfPossible(userLevel);
            return self.rebuild();
        };
        self.setDefaultLevel = function (level) {
            defaultLevel = normalizeLevel(level);
            if (getPersistedLevel() === undefined) {
                self.setLevel(level, false);
            }
            else {
                self.rebuild();
            }
        };
        self.resetLevel = function () {
            userLevel = null;
            clearPersistedLevel();
            return self.rebuild();
        };
        self.enableAll = function (persist) {
            self.setLevel(self.levels.TRACE, persist);
        };
        self.disableAll = function (persist) {
            self.setLevel(self.levels.SILENT, persist);
        };
        self.rebuild = function () {
            inheritedLevel = null;
            var result = replaceLoggingMethods.call(self);
            // If methodFactory was not customized, inherit from parent if it exists
            if (self.methodFactory && self.methodFactory === (factory || defaultMethodFactory)) {
                self.methodFactory = (parent && parent.methodFactory) || factory || defaultMethodFactory;
            }
            for (var k in loggers) {
                if (Object.prototype.hasOwnProperty.call(loggers, k)) {
                    loggers[k].rebuild();
                }
            }
            return result;
        };
        // Initialize internal levels & methods:
        inheritedLevel = null;
        var initialLevel = getPersistedLevel();
        if (initialLevel !== undefined) {
            userLevel = normalizeLevel(initialLevel);
        }
        replaceLoggingMethods.call(self);
    }
    // Root logger:
    var defaultLogger = new Logger();
    // noConflict support:
    var _log = typeof window !== undefinedType ? window.log : undefined;
    defaultLogger.noConflict = function () {
        if (typeof window !== undefinedType && window.log === defaultLogger) {
            window.log = _log;
        }
        return defaultLogger;
    };
    // ES default export compatibility:
    defaultLogger["default"] = defaultLogger;

    return defaultLogger;

}));
//# sourceMappingURL=loglevel.js.map
