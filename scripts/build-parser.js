"use strict";

/**
 * Regenerates lib/parser.js from src/parser.pegjs using pegmill itself.
 *
 * Bootstrap note: lib/parser.js is used by pegmill during compilation,
 * so we must write to a temp file first, then replace atomically.
 * The ESLint header is prepended to suppress warnings in generated code.
 */

var fs   = require("fs");
var path = require("path");
var cp   = require("child_process");

var ROOT       = path.join(__dirname, "..");
var PEGMILL    = path.join(ROOT, "bin", "pegmill");
var SRC        = path.join(ROOT, "src", "parser.pegjs");
var OUT        = path.join(ROOT, "lib", "parser.js");
var OUT_TMP    = OUT + ".new";

var ESLINT_HEADER = [
  "/* eslint-env node, amd */",
  "/* eslint no-unused-vars: 0 */",
  ""
].join("\n");

// Step 1: compile to temp file (uses current lib/parser.js internally)
var result = cp.spawnSync(process.execPath, [PEGMILL, "-o", OUT_TMP, SRC], {
  stdio: "inherit"
});

if (result.status !== 0) {
  process.exit(result.status);
}

// Step 2: prepend ESLint header + generated content → final file
var generated = fs.readFileSync(OUT_TMP, "utf8");
fs.writeFileSync(OUT, ESLINT_HEADER + generated);
fs.unlinkSync(OUT_TMP);

console.log("Built lib/parser.js");
