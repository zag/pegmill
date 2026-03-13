/* global peg */

"use strict";

beforeEach(function() {
  function matchDetails(value, details) {
    function isArray(value) {
      return Object.prototype.toString.apply(value) === "[object Array]";
    }

    function isObject(value) {
      return value !== null && typeof value === "object";
    }

    var i, key;

    if (isArray(details)) {
      if (!isArray(value)) { return false; }
      if (value.length !== details.length) { return false; }
      for (i = 0; i < details.length; i++) {
        if (!matchDetails(value[i], details[i])) { return false; }
      }
      return true;
    } else if (isObject(details)) {
      if (!isObject(value)) { return false; }
      for (key in details) {
        if (details.hasOwnProperty(key)) {
          if (!(key in value)) { return false; }
          if (!matchDetails(value[key], details[key])) { return false; }
        }
      }
      return true;
    } else {
      return value === details;
    }
  }

  jasmine.addMatchers({
    toChangeAST: function() {
      return {
        compare: function(actual, grammar, details, options) {
          options = options !== undefined ? options : {};

          var ast = peg.parser.parse(grammar);
          actual(ast, options);
          var pass = matchDetails(ast, details);

          return {
            pass: pass,
            message: pass
              ? "Expected the pass with options " + jasmine.pp(options)
                + " not to change the AST " + jasmine.pp(ast)
                + " to match " + jasmine.pp(details) + ", but it did."
              : "Expected the pass with options " + jasmine.pp(options)
                + " to change the AST " + jasmine.pp(ast)
                + " to match " + jasmine.pp(details) + ", but it didn't."
          };
        }
      };
    },

    toReportError: function(matchersUtil) {
      return {
        compare: function(actual, grammar, details) {
          var ast = peg.parser.parse(grammar),
              key;

          try {
            actual(ast);
          } catch (e) {
            if (details) {
              for (key in details) {
                if (details.hasOwnProperty(key)) {
                  if (!matchersUtil.equals(e[key], details[key])) {
                    return {
                      pass: false,
                      message: "Expected the pass to report an error"
                        + " with details " + jasmine.pp(details)
                        + " for grammar " + jasmine.pp(grammar)
                        + ", but " + jasmine.pp(key)
                        + " is " + jasmine.pp(e[key]) + "."
                    };
                  }
                }
              }
            }
            return { pass: true };
          }

          return {
            pass: false,
            message: "Expected the pass to report an error"
              + (details ? " with details " + jasmine.pp(details) : "")
              + " for grammar " + jasmine.pp(grammar)
              + ", but it didn't."
          };
        }
      };
    }
  });
});
