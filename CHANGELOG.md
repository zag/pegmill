# Changelog

All notable changes to Pegmill are documented in this file.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Pegmill uses [semantic versioning](https://semver.org/).

Forked from [PEG.js 0.10.0](https://github.com/pegjs/pegjs/blob/master/CHANGELOG.md)
(© 2010–2016 David Majda, MIT License). PEG.js history is not reproduced here.

---

## [Unreleased]

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
- Package renamed to `pegmill` on npm; homepage: `https://pegmill.org`
- License changed from MIT to Apache 2.0 (NOTICE.md attributes upstream MIT code)

### Changed
- `lib/peg.js` VERSION: `0.10.0` → `0.1.0`
- `package.json` `engines.node`: `>=0.10` → `>=14`

[Unreleased]: https://github.com/zag/pegmill/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/zag/pegmill/releases/tag/v0.1.0
