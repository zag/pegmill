"use strict";

var pass = require("../../../../lib/compiler/passes/remove-non-instantiated-templates");

describe("compiler pass |removeNonInstantiatedTemplates|", function() {
  it("removes template rules (rules with params)", function() {
    expect(pass).toChangeAST(
      [
        'List<Item> = Item+',
        'start = List$Word',
        'Word = [a-z]+'
      ].join("\n"),
      {
        rules: [
          { name: "start" },
          { name: "Word" }
        ]
      }
    );
  });

  it("keeps non-template rules unchanged", function() {
    expect(pass).toChangeAST(
      [
        'start = Word+',
        'Word = [a-z]+'
      ].join("\n"),
      {
        rules: [
          { name: "start" },
          { name: "Word" }
        ]
      }
    );
  });

  it("removes multiple template rules", function() {
    expect(pass).toChangeAST(
      [
        'List<Item> = Item+',
        'Pair<A, B> = A B',
        'start = "x"',
        'Word = [a-z]+'
      ].join("\n"),
      {
        rules: [
          { name: "start" },
          { name: "Word" }
        ]
      }
    );
  });
});
