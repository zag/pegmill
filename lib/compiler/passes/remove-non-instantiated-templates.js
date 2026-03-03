"use strict";

var arrays = require("../../utils/arrays");

/*
 * Removes template rules (rules with params) from the AST.
 *
 * After instantiate-templates has run, all parametric rule calls have been
 * expanded into concrete rules with mangled names. The original template
 * rule definitions are no longer needed and must be removed so that the
 * code generator does not emit them.
 */
function removeNonInstantiatedTemplates(ast, options) {
  var templateNames = [];
  var indices = [];

  arrays.each(ast.rules, function(rule, i) {
    if (rule.params) {
      templateNames.push(rule.name);
      indices.push(i);
    }
  });

  indices.reverse();
  arrays.each(indices, function(i) { ast.rules.splice(i, 1); });

  /*
   * Remove template names from allowedStartRules — template rules are abstract
   * and cannot be used as parser entry points. If the default allowedStartRules
   * pointed at a template (i.e. the grammar starts with a template definition),
   * reset it to the first remaining concrete rule.
   */
  if (options && options.allowedStartRules) {
    options.allowedStartRules = options.allowedStartRules.filter(function(name) {
      return templateNames.indexOf(name) === -1;
    });

    if (options.allowedStartRules.length === 0 && ast.rules.length > 0) {
      options.allowedStartRules = [ast.rules[0].name];
    }
  }
}

module.exports = removeNonInstantiatedTemplates;
