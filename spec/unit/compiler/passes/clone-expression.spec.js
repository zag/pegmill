"use strict";

var cloneExpression = require("../../../../lib/compiler/passes/clone-expression");

describe("cloneExpression", function() {
  describe("rule_ref substitution", function() {
    it("substitutes name when found in paramMap", function() {
      var expr = { type: "rule_ref", name: "Item" };
      var result = cloneExpression(expr, { "Item": "Word" });
      expect(result.type).toBe("rule_ref");
      expect(result.name).toBe("Word");
    });

    it("keeps name unchanged when not in paramMap", function() {
      var expr = { type: "rule_ref", name: "Other" };
      var result = cloneExpression(expr, { "Item": "Word" });
      expect(result.type).toBe("rule_ref");
      expect(result.name).toBe("Other");
    });
  });

  describe("immutability", function() {
    it("returns a new object, not the original", function() {
      var expr = { type: "rule_ref", name: "Item" };
      var result = cloneExpression(expr, { "Item": "Word" });
      expect(result).not.toBe(expr);
    });

    it("does not mutate the original expression", function() {
      var expr = { type: "rule_ref", name: "Item" };
      cloneExpression(expr, { "Item": "Word" });
      expect(expr.name).toBe("Item");
    });
  });

  describe("recursion into nested expressions", function() {
    it("substitutes in sequence elements", function() {
      var expr = {
        type: "sequence",
        elements: [
          { type: "rule_ref", name: "Item" },
          { type: "rule_ref", name: "Sep" }
        ]
      };
      var result = cloneExpression(expr, { "Item": "Word", "Sep": "Comma" });
      expect(result.type).toBe("sequence");
      expect(result.elements[0].name).toBe("Word");
      expect(result.elements[1].name).toBe("Comma");
    });

    it("substitutes in choice alternatives", function() {
      var expr = {
        type: "choice",
        alternatives: [
          { type: "rule_ref", name: "Item" },
          { type: "literal", value: "x", ignoreCase: false }
        ]
      };
      var result = cloneExpression(expr, { "Item": "Word" });
      expect(result.alternatives[0].name).toBe("Word");
      expect(result.alternatives[1].value).toBe("x");
    });

    it("substitutes inside action expression", function() {
      var expr = {
        type: "action",
        expression: { type: "rule_ref", name: "Item" },
        code: "return $1;"
      };
      var result = cloneExpression(expr, { "Item": "Word" });
      expect(result.type).toBe("action");
      expect(result.expression.name).toBe("Word");
      expect(result.code).toBe("return $1;");
    });

    it("substitutes inside labeled expression", function() {
      var expr = {
        type: "labeled",
        label: "head",
        expression: { type: "rule_ref", name: "Item" }
      };
      var result = cloneExpression(expr, { "Item": "Word" });
      expect(result.label).toBe("head");
      expect(result.expression.name).toBe("Word");
    });

    it("substitutes inside one_or_more", function() {
      var expr = {
        type: "one_or_more",
        expression: { type: "rule_ref", name: "Item" }
      };
      var result = cloneExpression(expr, { "Item": "Word" });
      expect(result.type).toBe("one_or_more");
      expect(result.expression.name).toBe("Word");
    });
  });

  describe("args substitution in parametric rule_ref", function() {
    it("substitutes param names inside args", function() {
      // rule_ref{name:"Inner", args:[{name:"A", value:"A"}]} with {A:"Word"}
      // → rule_ref{name:"Inner", args:[{name:"Word", value:"Word"}]}
      var expr = { type: "rule_ref", name: "Inner", args: [{ name: "A", value: "A" }] };
      var result = cloneExpression(expr, { "A": "Word" });
      expect(result.name).toBe("Inner");
      expect(result.args[0].name).toBe("Word");
      expect(result.args[0].value).toBe("Word");
    });

    it("keeps args unchanged when param not in paramMap", function() {
      var expr = { type: "rule_ref", name: "Inner", args: [{ name: "X", value: "X" }] };
      var result = cloneExpression(expr, { "A": "Word" });
      expect(result.args[0].name).toBe("X");
    });
  });

  describe("leaf nodes", function() {
    it("clones literal unchanged", function() {
      var expr = { type: "literal", value: "hello", ignoreCase: false };
      var result = cloneExpression(expr, { "Item": "Word" });
      expect(result.type).toBe("literal");
      expect(result.value).toBe("hello");
      expect(result).not.toBe(expr);
    });

    it("clones any unchanged", function() {
      var expr = { type: "any" };
      var result = cloneExpression(expr, {});
      expect(result.type).toBe("any");
      expect(result).not.toBe(expr);
    });
  });
});
