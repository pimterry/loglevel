import * as log from '..';

log.setLevel('warn');
log.warn('Test warning');

// A level from the environment can be empty or invalid.
const fromEnvironment: string | undefined = undefined;
log.setDefaultLevel(fromEnvironment);
const parsed: number | undefined = log.parseLevel('debug');
log.setLevel(parsed ?? 'warn');

// CoreJS defines a global `log` variable. We need to make sure that
// that doesn't conflict with the loglevel typings:
import * as _coreJS from 'core-js';
