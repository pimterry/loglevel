import typescript from "@rollup/plugin-typescript";
import terser from "@rollup/plugin-terser";

const banner = `/*! loglevel - https://github.com/pimterry/loglevel - licensed MIT */`;

/**
 * Two outputs from the same TS source:
 * - Legacy UMD (ES5): old browsers + script tag usage (window.log)
 * - Modern ESM (ES2024): module-based distribution
 */
export default [
  // Legacy UMD build (old browsers)
  {
    input: "src/loglevel.ts",
    output: [
      {
        file: "dist/loglevel.js",
        format: "umd",
        name: "log",
        exports: "default",
        sourcemap: true,
        banner,
      },
      {
        file: "dist/loglevel.min.js",
        format: "umd",
        name: "log",
        exports: "default",
        sourcemap: true,
        banner,
        plugins: [terser()],
      },
      // Keep `lib/loglevel.js` for existing tests & backwards-compat paths.
      {
        file: "lib/loglevel.js",
        format: "umd",
        name: "log",
        exports: "default",
        sourcemap: true,
        banner,
      },
    ],
    plugins: [
      typescript({
        tsconfig: "tsconfig.legacy.json",
      }),
    ],
  },

  // Modern ESM build (ES2024)
  {
    input: "src/loglevel.ts",
    output: [
      {
        file: "dist/loglevel.esm.js",
        format: "es",
        sourcemap: true,
        banner,
      },
    ],
    plugins: [
      typescript({
        tsconfig: "tsconfig.esm.json",
      }),
    ],
  },
];

