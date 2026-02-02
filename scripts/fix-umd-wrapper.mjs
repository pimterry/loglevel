import { readFileSync, writeFileSync } from "node:fs";

const files = ["dist/loglevel.js", "dist/loglevel.min.js", "lib/loglevel.js"];

function fix(contents) {
  // Rollup UMD wrapper (Rollup v4+) uses:
  //   (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.log = factory());
  // This breaks our "custom context" integration test which expects `global` to remain `this`.
  //
  // Replace with:
  //   (global.log = factory());
  //
  // Works in minified/unminified outputs.
  const re = /\(\s*([A-Za-z_$][\w$]*)\s*=\s*typeof globalThis[\s\S]*?\?\s*globalThis\s*:\s*\1\s*\|\|\s*self\s*,\s*\1\.log\s*=\s*factory\(\)\s*\)/g;
  return contents.replace(re, "($1.log=factory())");
}

let changed = 0;
for (const f of files) {
  const original = readFileSync(f, "utf8");
  const updated = fix(original);
  if (updated !== original) {
    writeFileSync(f, updated, "utf8");
    changed++;
  }
}

if (changed === 0) {
  // Non-fatal, but signals Rollup wrapper changed.
  process.stderr.write("fix-umd-wrapper: no changes applied\n");
}

