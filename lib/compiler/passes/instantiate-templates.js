"use strict";

var GrammarError     = require("../../grammar-error"),
    arrays           = require("../../utils/arrays"),
    asts             = require("../asts"),
    visitor          = require("../visitor"),
    cloneExpression  = require("./clone-expression");

/*
 * Instantiates parametric rules (templates).
 *
 * For each rule_ref with args that references a template rule (one with params),
 * this pass:
 *   1. Computes a mangled name: TemplateName$Arg1$Arg2
 *   2. Clones the template expression, substituting params with args
 *   3. Adds the new concrete rule to ast.rules
 *   4. Replaces the rule_ref with the mangled name (removes args)
 *
 * Repeated until no template calls remain (handles nested templates).
 */
function instantiateTemplates(ast) {
  var changed;

  do {
    changed = false;

    /* Collect current template rules by name. */
    var templates = {};
    arrays.each(ast.rules, function(rule) {
      if (rule.params) {
        templates[rule.name] = rule;
      }
    });

    /* Snapshot non-template rules to visit this round. */
    var rulesToVisit = ast.rules.filter(function(rule) {
      return !rule.params;
    });

    var walk = visitor.build({
      rule_ref: function(node) {
        if (!node.args) { return; }

        var tmpl = templates[node.name];
        if (!tmpl) {
          throw new GrammarError(
            'Template rule "' + node.name + '" is not defined.',
            node.location
          );
        }
        if (node.args.length !== tmpl.params.length) {
          throw new GrammarError(
            'Template rule "' + node.name + '" expects ' +
              tmpl.params.length + ' argument(s), but ' +
              node.args.length + ' were given.',
            node.location
          );
        }

        /* Mangled name: TemplateName$Arg1$Arg2 */
        var mangled = node.name + "$" + node.args.map(function(a) {
          return a.name;
        }).join("$");

        if (!asts.findRule(ast, mangled)) {
          /* Build paramMap: { ParamName: ArgName, ... } */
          var paramMap = {};
          arrays.each(tmpl.params, function(param, i) {
            paramMap[param] = node.args[i].name;
          });

          ast.rules.push({
            type:       "rule",
            name:       mangled,
            expression: cloneExpression(tmpl.expression, paramMap),
            location:   tmpl.location
          });

          changed = true;
        }

        /* Mutate rule_ref in place: replace with mangled name, drop args. */
        node.name = mangled;
        delete node.args;
      }
    });

    arrays.each(rulesToVisit, function(rule) {
      walk(rule);
    });

  } while (changed);
}

module.exports = instantiateTemplates;
