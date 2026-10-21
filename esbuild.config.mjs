import esbuild from "esbuild";
import { builtinModules } from "node:module";

// node esbuild.config.mjs        -> main.js (the plugin, committed and attached to releases)
// node esbuild.config.mjs test   -> test/.build/rsa.cjs (pure logic, for node --test)
const forTest = process.argv[2] === "test";
await esbuild.build({
  entryPoints: [forTest ? "src/rsa.ts" : "src/main.ts"],
  bundle: true,
  external: ["obsidian", "electron", "@codemirror/*", "@lezer/*", ...builtinModules, ...builtinModules.map((name) => `node:${name}`)],
  format: "cjs",
  target: "es2018",
  logLevel: "warning",
  sourcemap: false,
  treeShaking: true,
  legalComments: "none",
  banner: { js: "/* WeAdU RSA Lint. Built with esbuild from src/. Do not edit. */" },
  outfile: forTest ? "test/.build/rsa.cjs" : "main.js",
});
