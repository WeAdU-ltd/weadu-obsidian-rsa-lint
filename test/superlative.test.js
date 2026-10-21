"use strict";

const assert = require("node:assert/strict");
const test = require("node:test");
const rsa = require("../lib/rsa");

function flagged(text) {
  return rsa.lintAdLine(text, "headline").codes.includes("superlative");
}

test("#1 and n°1 are flagged as superlatives, #12 is not", function () {
  assert.equal(flagged("We are #1 in town"), true);
  assert.equal(flagged("#1 shop"), true);
  assert.equal(flagged("Le n°1 du bio"), true);
  assert.equal(flagged("Item #12 in stock"), false);
});
