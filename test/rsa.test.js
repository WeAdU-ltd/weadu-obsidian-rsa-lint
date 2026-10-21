"use strict";
const assert = require("node:assert/strict");
const test = require("node:test");
const rsa = require("./rsa");

function ad(h, d, p) {
  const out = ["Headlines:"].concat(h.map((x) => "- " + x), ["", "Descriptions:"], d.map((x) => "- " + x));
  if (p) out.push("", "Paths:", ...p.map((x) => "- " + x));
  return out.join("\n");
}
const H = ["Organic cotton shirts", "Free returns for 30 days", "Made in Portugal"];
const D = ["Soft shirts in organic cotton, cut and sewn in Portugal.", "Order today and get free returns for 30 days."];
function codes(report) {
  return report.assets.flatMap((a) => a.issues.map((i) => i.code)).concat(report.issues.map((i) => i.code)).sort();
}

test("a valid ad has no finding", function () {
  const r = rsa.checkAd(ad(H, D, ["shirts", "organic"]));
  assert.deepEqual(codes(r), []);
  assert.deepEqual(r.counts, { headline: 3, description: 2, path: 2 });
  assert.equal(rsa.summary(r), "3 headlines, 2 descriptions, 2 paths: 0 errors, 0 warnings.");
});

test("roles come from the section lines, never from the length", function () {
  // A short description stays a description; a long headline stays a headline and is too long.
  const r = rsa.checkAd(ad(H.concat(["A headline that is far too long for Google"]), D.concat(["Short one."])));
  const short = r.assets.find((a) => a.text === "Short one.");
  assert.equal(short.role, "description");
  const long = r.assets.find((a) => a.text.startsWith("A headline"));
  assert.equal(long.role, "headline");
  assert.deepEqual(long.issues.map((i) => i.code), ["over_limit"]);
  assert.match(long.issues[0].message, /42\/30/);
});

test("French section names and list markers are accepted", function () {
  const r = rsa.checkAd("## Titres\n1. Un\n2) Deux\n* Trois\nDescriptions :\n+ Une description.\nAutre description.\nChemins:\nchemises");
  assert.deepEqual(r.counts, { headline: 3, description: 2, path: 1 });
});

test("counts: 3 to 15 headlines, 2 to 4 descriptions, 2 paths", function () {
  assert.deepEqual(codes(rsa.checkAd(ad(H.slice(0, 2), D.slice(0, 1)))), ["too_few_description", "too_few_headline"]);
  const many = Array.from({ length: 16 }, (_, i) => "Headline number " + (i + 1));
  const descs = Array.from({ length: 5 }, (_, i) => "Description number " + (i + 1) + ".");
  assert.deepEqual(codes(rsa.checkAd(ad(many, descs, ["a", "b", "c"]))), ["too_many_description", "too_many_headline", "too_many_path"]);
  const max = rsa.checkAd(ad(many.slice(0, 15), descs.slice(0, 4)));
  assert.deepEqual(codes(max), []);
});

test("duplicates are errors, ignoring case and spaces", function () {
  const r = rsa.checkAd(ad(H.concat(["organic  cotton SHIRTS"]), D));
  const dup = r.assets.find((a) => a.text === "organic  cotton SHIRTS");
  assert.ok(dup.issues.some((i) => i.code === "duplicate" && /line 2/.test(i.message)));
});

test("lengths: 30, 90, 15, with wide characters counted twice", function () {
  assert.equal(rsa.googleAdsWidth("有机棉衬衫"), 10);
  const r = rsa.checkAd(ad(H.concat(["有机棉衬衫有机棉衬衫有机棉衬衫有"]), D.concat(["x".repeat(91)]), ["a-very-long-path-x", "two words"]));
  const byText = (t) => r.assets.find((a) => a.text === t).issues.map((i) => i.code);
  assert.deepEqual(byText("有机棉衬衫有机棉衬衫有机棉衬衫有"), ["over_limit"]);
  assert.deepEqual(byText("x".repeat(91)), ["over_limit"]);
  assert.deepEqual(byText("a-very-long-path-x"), ["over_limit"]);
  assert.deepEqual(byText("two words"), ["path_space"]);
});

test("dates are not phone numbers; real phone numbers are", function () {
  for (const text of ["Sale 2026-10-20", "From 20/10/2026 to 30/11/2026", "Offer 2026-10-20 - 2026-11-30", "Since 1998", "Order 12345678"]) {
    assert.equal(rsa.hasPhoneNumber(text), false, text);
  }
  for (const text of ["Call 01 23 45 67 89", "Call +44 20 7946 0958", "Tel. (555) 123-4567", "0612345678"]) {
    assert.equal(rsa.hasPhoneNumber(text), true, text);
  }
});

test("policy warnings and errors on a line", function () {
  const r = rsa.checkAd(ad(["Buy now!", "Best shirts in town", "FREE delivery", "We are #1 here", "Item #12 in stock", "Le n°1 du bio"], ["Really??", "Call 01 23 45 67 89 today."]));
  const byText = (t) => r.assets.find((a) => a.text === t).issues.map((i) => i.code);
  assert.deepEqual(byText("Buy now!"), ["headline_exclamation"]);
  assert.deepEqual(byText("Best shirts in town"), ["superlative"]);
  assert.deepEqual(byText("FREE delivery"), ["all_caps_word"]);
  assert.deepEqual(byText("We are #1 here"), ["superlative"]);
  assert.deepEqual(byText("Item #12 in stock"), []);
  assert.deepEqual(byText("Le n°1 du bio"), ["superlative"]);
  assert.deepEqual(byText("Really??"), ["repeated_punctuation"]);
  assert.deepEqual(byText("Call 01 23 45 67 89 today."), ["phone_number"]);
});

test("lines without a role are reported, not guessed", function () {
  const r = rsa.checkAd("Some intro text\n\n" + ad(H, D), 10);
  assert.deepEqual(r.unassigned, [10]);
  assert.equal(r.assets[0].line, 13);
  assert.ok(r.issues.some((i) => i.code === "no_role" && /Lines: 10\./.test(i.message)));
});

test("no recombination feature is left", function () {
  assert.equal(rsa.buildRsaCandidates, undefined);
});

test("a decomposed accent counts as one character (NFC)", function () {
  const decomposed = "Cafe\u0301 bio"; // e + combining acute accent
  assert.equal(decomposed.length, 9);
  assert.equal(rsa.googleAdsWidth(decomposed), 8);
  assert.equal(rsa.googleAdsWidth("Café bio"), 8);
  // 30 visible characters with decomposed accents stay within the headline limit, and match their composed duplicate.
  const head = "e\u0301".repeat(30);
  const r = rsa.checkAd(["Headlines:", "- " + head, "- " + "é".repeat(30), "- Third one", "Descriptions:", "- One description.", "- Two description."].join("\n"));
  const first = r.assets[0];
  assert.equal(first.width, 30);
  assert.deepEqual(first.issues, []);
  assert.ok(r.assets[1].issues.some((i) => i.code === "duplicate"));
});

test("emoji are refused and counted as one wide character", function () {
  for (const text of ["Super offre 👍 ici", "Made in France 🇫🇷", "Family 👨‍👩‍👧 deals", "Thumbs 👍🏽"]) {
    assert.equal(rsa.hasEmoji(text), true, text);
  }
  assert.equal(rsa.hasEmoji("Free returns, 30 days. #1 © ® ™"), false, "©, ® and ™ are allowed");
  assert.equal(rsa.googleAdsWidth("👍"), 2);
  assert.equal(rsa.googleAdsWidth("👨‍👩‍👧"), 2, "ZWJ family is one emoji");
  assert.equal(rsa.googleAdsWidth("🇫🇷"), 2, "a flag is one emoji");
  assert.equal(rsa.googleAdsWidth("👍🏽"), 2, "skin tone is part of the emoji");
  const r = rsa.checkAd(["Headlines:", "- Super offre 👍 ici", "- Two", "- Three", "Descriptions:", "- Made in France 🇫🇷.", "- Plain text."].join("\n"));
  assert.deepEqual(r.assets[0].issues.map((i) => i.code), ["emoji"]);
  assert.deepEqual(r.assets[3].issues.map((i) => i.code), ["emoji"]);
});
