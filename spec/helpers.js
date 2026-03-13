
"use strict";

global.peg = require("../lib/peg.js");

// jasmine.pp was removed in Jasmine 4.x — polyfill for legacy spec files
if (typeof jasmine !== "undefined" && typeof jasmine.pp !== "function") {
  jasmine.pp = function(value) {
    try {
      return JSON.stringify(value, null, 2);
    } catch (e) {
      return String(value);
    }
  };
}
