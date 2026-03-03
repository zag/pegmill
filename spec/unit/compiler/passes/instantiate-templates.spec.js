"use strict";

var pass = require("../../../../lib/compiler/passes/instantiate-templates");

describe("compiler pass |instantiateTemplates|", function() {
  it("instantiates a simple parametric rule", function() {
    expect(pass).toChangeAST(
      [
        'List<Item> = Item+',
        'start = List<Word>',
        'Word = [a-z]+'
      ].join("\n"),
      {
        rules: [
          { name: "List" },
          { name: "start", expression: { type: "rule_ref", name: "List$Word" } },
          { name: "Word" },
          {
            name:       "List$Word",
            expression: { type: "one_or_more", expression: { type: "rule_ref", name: "Word" } }
          }
        ]
      }
    );
  });

  it("instantiates a rule with multiple parameters", function() {
    expect(pass).toChangeAST(
      [
        'Pair<A, B> = A B',
        'start = Pair<Word, Sep>',
        'Word = [a-z]+',
        'Sep = ","'
      ].join("\n"),
      {
        rules: [
          { name: "Pair" },
          { name: "start", expression: { type: "rule_ref", name: "Pair$Word$Sep" } },
          { name: "Word" },
          { name: "Sep" },
          {
            name:       "Pair$Word$Sep",
            expression: {
              type:     "sequence",
              elements: [
                { type: "rule_ref", name: "Word" },
                { type: "rule_ref", name: "Sep" }
              ]
            }
          }
        ]
      }
    );
  });

  it("does not duplicate already-instantiated rules", function() {
    expect(pass).toChangeAST(
      [
        'Item<X> = X',
        'a = Item<Word>',
        'b = Item<Word>',
        'Word = [a-z]+'
      ].join("\n"),
      {
        rules: [
          { name: "Item" },
          { name: "a", expression: { type: "rule_ref", name: "Item$Word" } },
          { name: "b", expression: { type: "rule_ref", name: "Item$Word" } },
          { name: "Word" },
          { name: "Item$Word", expression: { type: "rule_ref", name: "Word" } }
        ]
      }
    );
  });

  it("handles nested templates via repeated passes", function() {
    expect(pass).toChangeAST(
      [
        'Inner<X> = X+',
        'Outer<A, B> = Inner<A> B',
        'start = Outer<Word, Sep>',
        'Word = [a-z]+',
        'Sep = ","'
      ].join("\n"),
      {
        rules: [
          { name: "Inner" },
          { name: "Outer" },
          { name: "start", expression: { type: "rule_ref", name: "Outer$Word$Sep" } },
          { name: "Word" },
          { name: "Sep" },
          { name: "Outer$Word$Sep" },
          { name: "Inner$Word" }
        ]
      }
    );
  });

  it("reports error for undefined template", function() {
    expect(pass).toReportError(
      'start = Missing<Word>\nWord = [a-z]+',
      { message: 'Template rule "Missing" is not defined.' }
    );
  });

  it("reports error for arity mismatch", function() {
    expect(pass).toReportError(
      [
        'List<Item> = Item+',
        'start = List<Word, Extra>',
        'Word = [a-z]+',
        'Extra = [0-9]+'
      ].join("\n"),
      { message: 'Template rule "List" expects 1 argument(s), but 2 were given.' }
    );
  });
});
