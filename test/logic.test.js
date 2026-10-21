"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const rsa = require("../lib/rsa");

const fixtures = JSON.parse(fs.readFileSync(path.join(__dirname, "fixtures.json"), "utf8"));

function codes(findings) {
  return findings.map(function (row) { return row.code; }).sort();
}

test("rsa width, lint, and candidates", function () {
  assert.equal(rsa.googleAdsWidth("Shop"), 4);
  assert.equal(rsa.googleAdsWidth("広告"), 4);
  const bang = rsa.lintAdLine("Shop now!", "headline");
  assert.ok(bang.codes.includes("headline_exclamation"));
  const wide = rsa.lintAdLine("This headline is definitely too long for Google", "headline");
  assert.ok(wide.codes.includes("over_limit"));
  const candidates = rsa.buildRsaCandidates({
    product: "Cotton shirt",
    benefit: "Soft cotton you can wear every day without thinking about it",
    offer: "20% off",
    cta: "Shop",
  });
  assert.ok(candidates.length >= 3);
  for (const candidate of candidates) {
    assert.ok(candidate.width <= candidate.limit, candidate.text);
    assert.equal(candidate.text.includes("best"), false);
  }
  const onlyProduct = rsa.buildRsaCandidates({ product: "Cotton shirt" });
  assert.equal(onlyProduct.length, 1);
  assert.equal(onlyProduct[0].text, "Cotton shirt");
});
