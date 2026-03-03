# Changelog

All notable changes to Pegmill are documented in this file.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Pegmill uses [semantic versioning](https://semver.org/).

Forked from [PEG.js 0.10.0](https://github.com/pegjs/pegjs/blob/master/CHANGELOG.md)
(© 2010–2016 David Majda, MIT License). PEG.js history is not reproduced here.

---

## [Unreleased]

### Added
- Inline expressions as template arguments (R3): character classes (`[a-z]+`), quantified
  expressions, and any `SuffixedExpression` can now be passed directly as args —
  `List<[a-z]+, ",">` — without a named wrapper rule; addresses
  [peggyjs/peggy#337](https://github.com/peggyjs/peggy/pull/337) reviewer request
- String literal template arguments (R4): string literals can be passed as args —
  `Tag<"b">`, `Delimited<"{", "}">` — covering the use case from
  [pegjs/pegjs#36](https://github.com/pegjs/pegjs/issues/36)
- Multi-parameter template rules: `Rule<A, B>` syntax fully supported —
  `SepList<Item, Sep>` with both rule refs and inline expressions
- Compiler pass `remove-non-instantiated-templates`: strips template rule definitions
  from the AST after instantiation so the code generator does not emit them
- `allowedStartRules` cleanup in `remove-non-instantiated-templates`: resets start rule
  to first concrete rule when the grammar begins with a template definition
- Guard in `report-undefined-rules`: skips template rule bodies and parametric `rule_ref`
  calls resolved later by `instantiate-templates`
- Guard in `report-infinite-recursion`: skips template rule bodies and parametric calls
  to prevent false positives before instantiation
- Safe fallback in `asts.alwaysConsumesOnSuccess`: template calls and unresolved param
  refs are conservatively treated as input-consuming (avoids crashes in check passes)
- GitHub Actions CI workflow: matrix test on Node.js 18, 20, 22 (replaces `.travis.yml`)
- `lib/compiler/passes/expr-arg-name.js`: shared utility for canonical arg name computation

### Changed
- `compiler/index.js`: `instantiateTemplates` and `removeNonInstantiatedTemplates` wired
  into the transform stage between parsing and code generation
- `clone-expression.js`: substitution now handles expression nodes (not just rule name
  strings); backward compatible with existing string-valued `paramMap`
- `instantiate-templates.js`: `paramMap` values are now expression AST nodes, enabling
  direct substitution of inline expressions and string literals

### Planned
- Phase 2: WASM backend (WebAssembly code generation target)

---

## [0.1.0] — 2026-02-26

### Added
- Parametric grammar rules: `Rule<Param>` syntax for reusable rule templates
- Compiler pass `clone-expression`: deep-copies AST expressions for template instantiation
- Compiler pass `instantiate-templates`: expands parametric rule references at compile time
- `rule_ref.args` structure: array of `{name, value}` objects supporting named parameters
- Parser lookahead fix: `RuleReferenceExpression` updated to prevent template definitions
  from being parsed as expression elements in preceding rules
- Renamed project from PEG.js fork to **Pegmill**; binary renamed `pegjs` → `pegmill`
- Package renamed to `pegmill` on npm; homepage: `https://github.com/zag/pegmill`
- License changed from MIT to Apache 2.0 (NOTICE.md attributes upstream MIT code)

### Changed
- `lib/peg.js` VERSION: `0.10.0` → `0.1.0`
- `package.json` `engines.node`: `>=0.10` → `>=14`

### References
- Parametric rules approach inspired by [peggyjs/peggy#337](https://github.com/peggyjs/peggy/pull/337)
  (quadristan, MIT) — reference implementation of template instantiation
- Related upstream discussion: [peggyjs/peggy#634](https://github.com/peggyjs/peggy/issues/634)

[Unreleased]: https://github.com/zag/pegmill/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/zag/pegmill/releases/tag/v0.1.0
