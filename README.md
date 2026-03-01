[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

# Pegmill

> PEG parser generator with parametric grammar rules

Pegmill is a fork of [PEG.js 0.10.0](https://github.com/pegjs/pegjs)
(© 2010–2016 David Majda, MIT License) extended with parametric grammar rules
and targeting a future WebAssembly code generation backend.

## Features

- Simple and expressive PEG grammar syntax
- Integrates lexical and syntactical analysis in one grammar
- Excellent error reporting out of the box
- **Parametric grammar rules** — define reusable rule templates with `Rule<Param>` syntax
- CLI and JavaScript API
- Roadmap: WASM backend (Phase 2), LLM constrained decoding (Phase 3)

## Installation

```console
$ npm install -g pegmill
```

To use only the JavaScript API:

```console
$ npm install pegmill
```

## Quick Start

**1. Write a grammar** (`greet.pegjs`):

```pegjs
start
  = "Hello, " name:$[a-zA-Z]+ { return "Greeting: " + name; }
```

**2. Generate a parser:**

```console
$ pegmill greet.pegjs
```

This writes `greet.js` next to the grammar file.

**3. Use the parser in Node.js:**

```javascript
var parser = require("./greet");
parser.parse("Hello, World");  // → "Greeting: World"
```

## Parametric Rules

Parametric rules let you write reusable rule templates parameterized by other rules.

### Syntax

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

### How It Works

The compiler resolves parametric references at compile time via two passes:

1. **`clone-expression`** — deep-copies AST subtrees so each instantiation is independent
2. **`instantiate-templates`** — substitutes the parameter rule everywhere the parameter
   name appears inside the template body

Rule references carry an `args` array of `{name, value}` objects. For simple identifiers,
`name === value`.

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
| `-d, --dependency <dep>` | Declare a parser dependency (repeatable) |
| `-e, --export-var <var>` | Global variable name for `globals`/`umd` format |
| `--extra-options <json>` | Additional options as JSON passed to `peg.generate` |
| `--extra-options-file <file>` | Same as above but read from a file |
| `--format <fmt>` | Output format: `amd`, `commonjs`, `globals`, `umd` (default: `commonjs`) |
| `-O, --optimize <goal>` | Optimize for `speed` or `size` (default: `speed`) |
| `-o, --output <file>` | Output file (default: input filename with `.js` extension) |
| `--plugin <plugin>` | Load a plugin (repeatable) |
| `--trace` | Enable parser tracing |
| `-v, --version` | Print version and exit |
| `-h, --help` | Print help and exit |

When no input file is given, standard input is used.

## JavaScript API

```javascript
var peg = require("pegmill");

// Generate a parser object directly
var parser = peg.generate('start = ("a" / "b")+');
parser.parse("aabb");  // → ["a", "a", "b", "b"]

// Generate parser source code as a string
var source = peg.generate('start = [0-9]+', { output: "source" });
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

### Rule Structure

```pegjs
ruleName "human-readable name"
  = parsingExpression
```

### Parsing Expression Types

| Expression | Matches |
|------------|---------|
| `"literal"` / `'literal'` | Exact string (append `i` for case-insensitive) |
| `.` | Any single character |
| `[chars]` | One character from the set; `[^chars]` inverts; `[a-z]` ranges; append `i` for case-insensitive |
| `rule` | Recursively matches the named rule |
| `(expr)` | Subexpression |
| `expr *` | Zero or more (greedy, no backtracking) |
| `expr +` | One or more (greedy, no backtracking) |
| `expr ?` | Optional — returns `null` on no match |
| `& expr` | Positive lookahead — succeeds without consuming input |
| `! expr` | Negative lookahead — succeeds without consuming input |
| `& { pred }` | Semantic predicate (JS code returning truthy = match) |
| `! { pred }` | Negative semantic predicate |
| `$ expr` | Returns matched text instead of match result |
| `label:expr` | Labels the match result for use in actions |
| `e1 e2 … en` | Sequence — returns array of results |
| `expr { action }` | Action — JS code returning the match result |
| `e1 / e2 / … / en` | Ordered choice — tries each in order |

### Initializer

Code in `{ }` before the first rule runs once before parsing. Variables and functions
defined here are accessible in all rule actions and semantic predicates.

### Actions and Predicates

Inside `{ action }` and `{ predicate }` code blocks, the following are available:

- Labeled match results as local variables
- `text()` — returns the text matched by the expression (actions only)
- `location()` — returns `{ start, end }` with `offset`, `line`, `column`
- `options` — the options object passed to `parse()`
- `expected(description)` — throws a parse error
- `error(message)` — throws a parse error with a custom message

## Compatibility

- **Node.js**: 14 or later
- Generated parsers work in any environment where ES5 is available

## Roadmap

| Phase | Description | Status |
|-------|-------------|--------|
| 1 | Parametric grammar rules | ✅ Done (v0.1.0) |
| 2 | WASM backend (WebAssembly code generation) | Planned |
| 3 | LLM constrained decoding support | Research |

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
