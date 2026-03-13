/*
 * Parametric Rules Examples
 * =========================
 *
 * Demonstrates Pegmill's parametric (generic) grammar rules.
 * These examples show the three argument types:
 *
 *   1. Rule references    — SepList<Integer, Comma>
 *   2. Inline expressions — SepList<$[a-z]+, ",">
 *   3. String literals    — Tag<"b">
 *
 * Usage:
 *   pegmill examples/parametric.pegjs -o /tmp/parametric.js
 *
 * Then in Node.js:
 *   const p = require("/tmp/parametric");
 *   p.parse("1,2,3",         { startRule: "IntList" })   // → [1, 2, 3]
 *   p.parse("foo,bar",       { startRule: "WordList" })  // → ["foo", "bar"]
 *   p.parse("<b>hello</b>",  { startRule: "BoldTag" })   // → { tag: "b", content: "hello" }
 *   p.parse("ff:a0:1b",      { startRule: "HexBytes" })  // → ["ff", "a0", "1b"]
 */

// ── Entry points ──────────────────────────────────────────────────────────────

IntList  = SepList<Integer, Comma>
WordList = SepList<Word,    Comma>
BoldTag  = Tag<"b">
ItalicTag= Tag<"i">
HexBytes = SepList<HexByte, ":">

// ── Generic templates ─────────────────────────────────────────────────────────

// SepList<Item, Sep> — separated list, returns array of Item values
SepList<Item, Sep>
  = head:Item tail:(Sep Item)* {
      return [head].concat(tail.map(function(t) { return t[1]; }));
    }

// Tag<T> — simple HTML/XML tag with string-literal argument
Tag<T>
  = "<" open:T ">" content:$[^<]+ "</" T ">"
    { return { tag: open, content: content }; }

// ── Terminals ─────────────────────────────────────────────────────────────────

Integer "integer"
  = digits:$[0-9]+ { return parseInt(digits, 10); }

Word "word"
  = $[a-zA-Z]+

Comma = ","

HexByte "hex byte"
  = $[0-9a-f]+

_ "whitespace"
  = [ \t\n\r]*
