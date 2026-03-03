"use strict";

/*
 * Computes a canonical identifier-safe name for an expression argument.
 * Used for mangling instantiated template rule names and propagating
 * expression args through nested template calls.
 */
function exprArgName(expr) {
  switch (expr.type) {
    case "rule_ref":
      return expr.name;
    case "literal":
      return expr.value.replace(/[^a-zA-Z0-9]/g, function(c) {
        return "_x" + c.charCodeAt(0).toString(16).toUpperCase() + "_";
      }) || "_empty_";
    case "class": {
      var inner = expr.parts.map(function(p) {
        function esc(c) {
          return /[a-zA-Z0-9]/.test(c) ? c
            : "_x" + c.charCodeAt(0).toString(16).toUpperCase() + "_";
        }
        return Array.isArray(p) ? esc(p[0]) + "_to_" + esc(p[1]) : esc(p);
      }).join("_");
      return (expr.inverted ? "_not_" : "_cls_") + inner;
    }
    case "one_or_more":
      return exprArgName(expr.expression) + "_plus";
    case "zero_or_more":
      return exprArgName(expr.expression) + "_star";
    case "optional":
      return exprArgName(expr.expression) + "_opt";
    case "any":
      return "_any_";
    default: {
      var s = JSON.stringify(expr);
      var h = 5381;
      for (var i = 0; i < s.length; i++) {
        h = ((h << 5) + h + s.charCodeAt(i)) & 0x7fffffff;
      }
      return "_h" + h.toString(36) + "_";
    }
  }
}

module.exports = exprArgName;
