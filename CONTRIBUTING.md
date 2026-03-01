# Contributing to Pegmill

## Ways to Contribute

**Reporting bugs** — open an [issue](https://github.com/zag/pegmill/issues) on GitHub.
Before submitting, search existing issues to avoid duplicates. Include steps to reproduce,
expected result, and actual result. A minimal grammar + input example is most helpful.

**Requesting features** — open an [issue](https://github.com/zag/pegmill/issues) and
describe the use case. Check existing requests first.

## Contributing Code

Fork the repository, create a branch, make your changes, and open a pull request.

### Commit Messages

Use the conventional commits format:

```text
<type>(<scope>): <short summary>
```

Supported scopes:

| Scope     | What it covers                                              |
|-----------|-------------------------------------------------------------|
| `grammar` | Language syntax, `src/parser.pegjs`, `lib/parser.js`       |
| `pass`    | Compiler passes in `lib/compiler/passes/`                   |
| `build`   | Makefile, npm scripts, browserify                           |
| `chore`   | Dependencies, CI, housekeeping                              |

Examples:

```text
feat(grammar): add parametric rule syntax Rule<Param>
fix(pass): correct clone-expression handling of sequence nodes
chore: upgrade eslint to 8.x
```

### Before Submitting

Run the test suite and linter:

```console
$ make spec
$ make lint
```

All tests must pass and linter must report no errors.

## Contribution License

Pegmill uses the **Developer Certificate of Origin (DCO)** — no CLA required.

Sign off each commit with:

```console
$ git commit -s -m "feat(grammar): your change"
```

This adds a `Signed-off-by:` trailer confirming you have the right to submit
the contribution under the Apache 2.0 license. See https://developercertificate.org/
for the full text.

Apache 2.0 already includes a patent grant, so no separate CLA is needed.
