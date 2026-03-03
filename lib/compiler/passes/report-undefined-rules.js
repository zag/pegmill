"use strict";

var GrammarError = require("../../grammar-error"),
    asts         = require("../asts"),
    visitor      = require("../visitor");

/* Checks that all referenced rules exist. */
function reportUndefinedRules(ast) {
  var check = visitor.build({
    rule: function(node) {
      /*
       * Skip template rule bodies — their rule_refs reference parameters
       * (e.g. "Item" in List<Item>), not real rules in the grammar.
       * instantiate-templates will resolve these before code generation.
       */
      if (node.params) { return; }
      check(node.expression);
    },
    rule_ref: function(node) {
      /*
       * Skip parametric rule calls — they carry args and will be resolved
       * by instantiate-templates into concrete mangled rule names.
       */
      if (node.args) { return; }
      if (!asts.findRule(ast, node.name)) {
        throw new GrammarError(
          "Rule \"" + node.name + "\" is not defined.",
          node.location
        );
      }
    }
  });

  check(ast);
}

module.exports = reportUndefinedRules;
