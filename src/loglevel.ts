/* loglevel - https://github.com/pimterry/loglevel
 *
 * Copyright (c) 2013 Tim Perry
 * Licensed under the MIT license.
 */

// Keep runtime compatible with old browsers by avoiding modern built-ins like:
// - Object.values
// - Array.prototype.find
// - Array spread / object spread

type UndefinedType = "undefined";
const undefinedType: UndefinedType = "undefined";

const noop = function (): void {};

type LogMethodName = "trace" | "debug" | "info" | "warn" | "error";
type LoggerName = string | symbol;
type LoggingMethod = (...msg: any[]) => void;
type MethodFactory = (
  methodName: LogMethodName,
  level: number,
  loggerName: LoggerName
) => LoggingMethod;

const logMethods: LogMethodName[] = ["trace", "debug", "info", "warn", "error"];

function defaultMethodFactory(methodName: LogMethodName): LoggingMethod {
  if (typeof console !== undefinedType) {
    const anyConsole = console as any;
    const consoleMethod = anyConsole[methodName] || anyConsole.log;
    if (typeof consoleMethod === "function") {
      return consoleMethod.bind(console);
    }
  }
  return noop;
}

function replaceLoggingMethods(this: any): string | void {
  /*jshint validthis:true */
  const level = this.getLevel();

  for (let i = 0; i < logMethods.length; i++) {
    const methodName = logMethods[i];
    this[methodName] = i < level ? noop : this.methodFactory(methodName, level, this.name);
  }

  // Make `log.log` an alias to ensure compatibility with `console.*`.
  this.log = this.info;

  if (typeof console === undefinedType && level < this.levels.SILENT) {
    return "No console available for logging";
  }
}

function Logger(this: any, name?: LoggerName, factory?: MethodFactory, parent?: any) {
  const self = this;

  // Private instance variables:
  let inheritedLevel: number | null = null;
  let defaultLevel: number | null = null;
  let userLevel: number | null = null;

  // Categories form an inherited hierarchy. Root logger has [].
  const parentCategories: any[] = parent && parent.categories ? parent.categories : [];
  self.categories = parent ? parentCategories.concat([name]) : [];

  // Build a storage key, unless any category is a Symbol (cannot be serialized safely).
  let hasSymbol = false;
  for (let i = 0; i < self.categories.length; i++) {
    if (typeof self.categories[i] === "symbol") {
      hasSymbol = true;
      break;
    }
  }

  const storageKey: string | null = hasSymbol
    ? null
    : parent
      ? "loglevel:" + self.categories.map((c: any) => String(c)).join(".")
      : "loglevel";

  const loggers: any = {};

  function persistLevelIfPossible(levelNum: number): void {
    const levelName = (logMethods[levelNum] || "silent").toUpperCase();
    if (typeof window === undefinedType || !storageKey) return;

    try {
      (window as any).localStorage[storageKey] = levelName;
      return;
    } catch (_ignore) {}

    try {
      window.document.cookie = encodeURIComponent(storageKey) + "=" + levelName + ";";
    } catch (_ignore) {}
  }

  function getPersistedLevel(): string | void {
    let storedLevel: any;
    if (typeof window === undefinedType || !storageKey) return;

    try {
      storedLevel = (window as any).localStorage[storageKey];
    } catch (_ignore) {}

    if (typeof storedLevel === undefinedType) {
      try {
        const cookie = window.document.cookie;
        const cookieName = encodeURIComponent(storageKey);
        const location = cookie.indexOf(cookieName + "=");
        if (location !== -1) {
          storedLevel = /^([^;]+)/.exec(cookie.slice(location + cookieName.length + 1))![1];
        }
      } catch (_ignore) {}
    }

    if (self.levels[storedLevel] === undefined) {
      storedLevel = undefined;
    }

    return storedLevel;
  }

  function clearPersistedLevel(): void {
    if (typeof window === undefinedType || !storageKey) return;

    try {
      (window as any).localStorage.removeItem(storageKey);
    } catch (_ignore) {}

    try {
      window.document.cookie =
        encodeURIComponent(storageKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC";
    } catch (_ignore) {}
  }

  function normalizeLevel(input: any): number {
    let level = input;
    if (typeof level === "string" && self.levels[level.toUpperCase()] !== undefined) {
      level = self.levels[level.toUpperCase()];
    }
    if (typeof level === "number" && level >= 0 && level <= self.levels.SILENT) {
      return level;
    }
    throw new TypeError("log.setLevel() called with invalid level: " + input);
  }

  self.name = name as any;
  self.levels = { TRACE: 0, DEBUG: 1, INFO: 2, WARN: 3, ERROR: 4, SILENT: 5 } as const;
  self.methodFactory = factory || defaultMethodFactory;

  self.getLevel = function (): number {
    if (userLevel !== null) return userLevel;
    if (defaultLevel !== null) return defaultLevel;
    if (inheritedLevel === null) {
      inheritedLevel = parent ? parent.getLevel() : self.levels.WARN;
    }
    return inheritedLevel as number;
  };

  self.getLogger = function (...childCategories: LoggerName[]): any {
    if (!childCategories.length) return self;

    let logger = self;
    for (let i = 0; i < childCategories.length; i++) {
      const category = childCategories[i];
      const existing = logger.getChildLoggers()[category as any];
      if (existing) {
        logger = existing;
        continue;
      }

      if (typeof category !== "symbol" && typeof category !== "string") {
        throw new Error(
          "Category names must be a symbol or string, but is a " + typeof category
        );
      }

      const childLogger = new (Logger as any)(category, self.methodFactory, logger);
      logger.getChildLoggers()[category as any] = childLogger;
      logger = childLogger;
    }

    return logger;
  };

  self.getChildLoggers = function (): any {
    return loggers;
  };

  // Back-compat: older typings mention `getLoggers()` on the root logger.
  self.getLoggers = self.getChildLoggers;

  self.setLevel = function (level: any, persist?: boolean): string | void {
    userLevel = normalizeLevel(level);
    if (persist !== false) persistLevelIfPossible(userLevel);
    return self.rebuild();
  };

  self.setDefaultLevel = function (level: any): void {
    defaultLevel = normalizeLevel(level);
    if (getPersistedLevel() === undefined) {
      self.setLevel(level, false);
    } else {
      self.rebuild();
    }
  };

  self.resetLevel = function (): string | void {
    userLevel = null;
    clearPersistedLevel();
    return self.rebuild();
  };

  self.enableAll = function (persist?: boolean): void {
    self.setLevel(self.levels.TRACE, persist);
  };

  self.disableAll = function (persist?: boolean): void {
    self.setLevel(self.levels.SILENT, persist);
  };

  self.rebuild = function (): string | void {
    inheritedLevel = null;
    const result = replaceLoggingMethods.call(self);

    // If methodFactory was not customized, inherit from parent if it exists
    if (self.methodFactory && self.methodFactory === (factory || defaultMethodFactory)) {
      self.methodFactory = (parent && parent.methodFactory) || factory || defaultMethodFactory;
    }

    for (const k in loggers) {
      if (Object.prototype.hasOwnProperty.call(loggers, k)) {
        loggers[k].rebuild();
      }
    }

    return result;
  };

  // Initialize internal levels & methods:
  inheritedLevel = null;
  const initialLevel = getPersistedLevel();
  if (initialLevel !== undefined) {
    userLevel = normalizeLevel(initialLevel);
  }
  replaceLoggingMethods.call(self);
}

// Root logger:
const defaultLogger = new (Logger as any)();

// noConflict support:
const _log = typeof window !== undefinedType ? (window as any).log : undefined;
(defaultLogger as any).noConflict = function () {
  if (typeof window !== undefinedType && (window as any).log === defaultLogger) {
    (window as any).log = _log;
  }
  return defaultLogger;
};

// ES default export compatibility:
(defaultLogger as any)["default"] = defaultLogger;

export default defaultLogger as any;

