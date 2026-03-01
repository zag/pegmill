[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

# Pegmill

> The only JavaScript PEG parser generator with parametric (generic) grammar rules

Compile grammars to WebAssembly · Constrain LLM output to valid structure

Pegmill is a drop-in replacement for PEG.js 0.10.0 — existing grammars work unchanged.

## Features

- Simple and expressive PEG grammar syntax
- Integrates lexical and syntactical analysis in one grammar
- Excellent error reporting out of the box
- **Parametric grammar rules** — define reusable rule templates with `Rule<Param>` syntax
- CLI and JavaScript API
- **WASM backend** — compile grammars to WebAssembly (coming in v0.2.0)
- **LLM constrained decoding** — restrict language model output to valid grammar (v0.3.0)

> **Why PEG for LLM output?** Language models produce text token by token. Constrained decoding
> steers that process so only tokens that continue a valid parse are sampled — making hallucinated
> structure impossible. A PEG grammar doubles as both parser and output constraint, with no
> separate schema language required.

## Installation

```console
$ npm install -g pegmill
```

To use only the JavaScript API:

```console
$ npm install pegmill
```

## Quick Start

**1. Write a grammar with parametric rules** (`parens.pegjs`):

```pegjs
// One template — two parsers for the price of one
Parens<Content>
  = "(" val:Content ")" { return val; }

NumberInParens = Parens<Integer>
WordInParens   = Parens<Word>

Integer = digits:$[0-9]+ { return parseInt(digits, 10); }
Word    = $[a-zA-Z]+
```

**2. Generate a parser:**

```console
$ pegmill parens.pegjs
```

**3. Use it:**

```javascript
const parser = require("./parens");
parser.parse("(42)",    { startRule: "NumberInParens" }); // → 42
parser.parse("(hello)", { startRule: "WordInParens" });   // → "hello"
```

## Parametric Rules

Parametric rules let you write reusable rule templates parameterized by other rules.

### Defining parametric rules

Define a parametric rule with `RuleName<Param>`:

```pegjs
// A rule that matches a comma-separated list of whatever Elem matches
List<Elem>
  = head:Elem tail:("," Elem)* { return [head].concat(tail.map(t => t[1])); }

// Instantiate with a concrete rule
NumberList = List<Integer>
WordList   = List<Word>

Integer = digits:$[0-9]+ { return parseInt(digits, 10); }
Word    = $[a-zA-Z]+
```

> v0.1.0 supports single-parameter rules. For compiler internals see [CONTRIBUTING.md](CONTRIBUTING.md).

## CLI Reference

```console
$ pegmill --version
pegmill 0.1.0

$ pegmill [options] [--] [<input_file>]
```

| Option | Description |
|--------|-------------|
| `--allowed-start-rules <rules>` | Comma-separated list of rules the parser may start from (default: first rule) |
| `--cache` | Cache intermediate results (avoids exponential time in pathological grammars) |
| `--format <fmt>` | Output format: `amd`, `commonjs`, `globals`, `umd` (default: `commonjs`) |
| `-o, --output <file>` | Output file (default: input filename with `.js` extension) |
| `--trace` | Enable parser tracing |
| `-v, --version` | Print version and exit |
| `-h, --help` | Print help and exit |

When no input file is given, standard input is used. Run `pegmill --help` for the full option list.

## JavaScript API

```javascript
const peg = require("pegmill");

// Generate a parser object directly
const parser = peg.generate('start = ("a" / "b")+');
parser.parse("aabb");  // → ["a", "a", "b", "b"]

// Generate parser source code as a string
const source = peg.generate('start = [0-9]+', { output: "source" });
```

### `peg.generate(grammar, options)`

| Option | Default | Description |
|--------|---------|-------------|
| `allowedStartRules` | `[first rule]` | Rules the parser may start from |
| `cache` | `false` | Cache intermediate results |
| `dependencies` | `{}` | Module dependencies (for `amd`/`commonjs`/`umd` formats) |
| `exportVar` | `null` | Global variable name (for `globals`/`umd` formats) |
| `format` | `"bare"` | Output format |
| `optimize` | `"speed"` | Optimize for `"speed"` or `"size"` |
| `output` | `"parser"` | `"parser"` returns an object; `"source"` returns a string |
| `plugins` | `[]` | Plugins to apply |
| `trace` | `false` | Enable tracing |

## Grammar Syntax

Pegmill uses PEG (Parsing Expression Grammar) syntax. Comments follow JavaScript
conventions (`//` and `/* */`). Whitespace between tokens is ignored.

```pegjs
ruleName "human-readable name"
  = parsingExpression
```

Common expressions: `"literal"`, `.` (any char), `[a-z]` (char class), `rule` (reference),
`e*` (zero or more), `e+` (one or more), `e?` (optional), `e1 / e2` (ordered choice),
`e1 e2` (sequence), `label:e` (label), `&e` / `!e` (lookahead), `$e` (return text),
`{ action }` (JavaScript action code).

Inside action blocks: labeled results as variables, `text()`, `location()`, `options`,
`expected(description)`, `error(message)`.

Full syntax reference: [`src/parser.pegjs`](src/parser.pegjs)

## Compatibility

- **Node.js**: 14 or later
- Generated parsers work in any environment where ES5 is available
- Generated parsers are plain JavaScript (no TypeScript declarations in v0.1.0)

## Vision

**v0.1.0** ✅ Parametric grammar rules — write reusable rule templates with `Rule<Param>` syntax

**v0.2.0** 🔜 WASM backend — compile grammars directly to WebAssembly

**v0.3.0** 🔬 LLM constrained decoding — define valid output structure for language models

## License & Attribution

Pegmill is licensed under the **Apache License 2.0**.

This project is a fork of [PEG.js 0.10.0](https://github.com/pegjs/pegjs) by
David Majda and contributors (MIT License). The original MIT-licensed code is
preserved in `NOTICE.md` as required by Apache 2.0 section 4(d).

### Why Apache 2.0?

Apache 2.0 includes an **explicit patent grant**: contributors grant users a
royalty-free license to any patents covering their contributions. This protects
corporate users deploying Pegmill in production — they receive a patent license
automatically, without needing a separate CLA or legal agreement.

The **patent termination clause** means that if you initiate patent litigation
against Pegmill or its users based on the project's code, your patent license
terminates. This is standard open-source protection and is consistent with
licenses used by the Apache Software Foundation, Google, and many others.

See [LICENSE](LICENSE) and [NOTICE.md](NOTICE.md) for full details.
