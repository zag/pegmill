"use strict";

/*
 * cloneExpression(expr, paramMap) → newExpr
 *
 * Pure function — immutably clones an expression tree,
 * substituting rule_ref names found in paramMap.
 *
 * paramMap: { "ParamName": "ArgName", ... }
 */
function cloneExpression(expr, paramMap) {
  switch (expr.type) {
    case "rule_ref": {
      var name = paramMap.hasOwnProperty(expr.name) ? paramMap[expr.name] : expr.name;
      var node = { type: "rule_ref", name: name };
      if (expr.location) { node.location = expr.location; }
      if (expr.args) {
        node.args = expr.args.map(function(arg) {
          var n = paramMap.hasOwnProperty(arg.name) ? paramMap[arg.name] : arg.name;
          return { name: n, value: n };
        });
      }
      return node;
    }

    case "choice":
      return {
        type:         "choice",
        alternatives: expr.alternatives.map(function(alt) {
          return cloneExpression(alt, paramMap);
        }),
        location: expr.location
      };

    case "sequence":
      return {
        type:     "sequence",
        elements: expr.elements.map(function(el) {
          return cloneExpression(el, paramMap);
        }),
        location: expr.location
      };

    case "action":
      return {
        type:       "action",
        expression: cloneExpression(expr.expression, paramMap),
        code:       expr.code,
        location:   expr.location
      };

    case "labeled":
      return {
        type:       "labeled",
        label:      expr.label,
        expression: cloneExpression(expr.expression, paramMap),
        location:   expr.location
      };

    case "named":
      return {
        type:       "named",
        name:       expr.name,
        expression: cloneExpression(expr.expression, paramMap),
        location:   expr.location
      };

    case "text":
    case "simple_and":
    case "simple_not":
    case "optional":
    case "zero_or_more":
    case "one_or_more":
    case "group":
      return {
        type:       expr.type,
        expression: cloneExpression(expr.expression, paramMap),
        location:   expr.location
      };

    case "semantic_and":
    case "semantic_not":
      return { type: expr.type, code: expr.code, location: expr.location };

    case "literal":
      return {
        type:       "literal",
        value:      expr.value,
        ignoreCase: expr.ignoreCase,
        location:   expr.location
      };

    case "class":
      return {
        type:       "class",
        parts:      expr.parts,
        rawText:    expr.rawText,
        inverted:   expr.inverted,
        ignoreCase: expr.ignoreCase,
        location:   expr.location
      };

    case "any":
      return { type: "any", location: expr.location };

    default:
      throw new Error("Unknown expression type: " + expr.type);
  }
}

module.exports = cloneExpression;
