"use strict";
// Tests for the shipped files: the built main.js (loaded with a stubbed "obsidian" module), manifest.json, versions.json.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const stub = require("./obsidian-stub");

const root = path.join(__dirname, "..");
const AD = ["Headlines:", "- Organic cotton shirts", "- Free returns for 30 days", "- Made in Portugal", "Descriptions:", "- Soft shirts in organic cotton.", "- Order today!!"].join("\n");

async function loadPlugin() {
  const PluginClass = stub.loadPlugin(path.join(root, "main.js"));
  const plugin = new PluginClass({}, {});
  await plugin.onload();
  return plugin;
}

test("manifest follows Obsidian community plugin rules", function () {
  const manifest = JSON.parse(fs.readFileSync(path.join(root, "manifest.json"), "utf8"));
  const versions = JSON.parse(fs.readFileSync(path.join(root, "versions.json"), "utf8"));
  for (const key of ["id", "name", "version", "minAppVersion", "description", "author", "authorUrl"]) assert.ok(manifest[key], key);
  assert.match(manifest.id, /^[a-z0-9-]+$/);
  assert.equal(/obsidian/i.test(manifest.id + manifest.name), false);
  assert.ok(manifest.description.length <= 250);
  assert.match(manifest.description, /\.$/);
  assert.equal(/recombine|candidate/i.test(manifest.description), false);
  assert.equal(versions[manifest.version], manifest.minAppVersion);
});

test("shipped code makes no network call", function () {
  const bundle = fs.readFileSync(path.join(root, "main.js"), "utf8");
  for (const word of ["fetch(", "requestUrl", "XMLHttpRequest", "WebSocket", "sendBeacon"]) assert.equal(bundle.includes(word), false, word);
});

test("plugin registers one command and an rsa code block", async function () {
  const plugin = await loadPlugin();
  assert.deepEqual(Object.keys(plugin.commands), ["check-ad"]);
  assert.deepEqual(Object.keys(plugin.processors), ["rsa"]);
});

test("command checks the selection and opens a report without editing the note", async function () {
  const plugin = await loadPlugin();
  const note = "Intro\n" + AD;
  const editor = new stub.FakeEditor(note, { line: 1, ch: 0 }, AD);
  editor.selectionFrom = { line: 1, ch: 0 };
  plugin.commands["check-ad"].editorCallback(editor);
  assert.equal(editor.text, note);
  assert.equal(editor.setValueCalls, 0);
  const modal = stub.Modal.last;
  assert.equal(modal.titleEl.text, "Responsive search ad check");
  const text = modal.contentEl.allText();
  assert.match(text, /3 headlines, 2 descriptions, 0 paths: 1 error, 0 warnings\./);
  assert.match(text, /\n8\nDescription\nOrder today!!\n13\/90\nerror: Repeated punctuation/);
});

test("command checks the rsa block under the cursor", async function () {
  const plugin = await loadPlugin();
  const note = "# Brief\nNot part of the ad\n```rsa\n" + AD + "\n```\nAfter";
  const editor = new stub.FakeEditor(note, { line: 4, ch: 0 });
  plugin.commands["check-ad"].editorCallback(editor);
  const text = stub.Modal.last.contentEl.allText();
  assert.match(text, /3 headlines, 2 descriptions/);
  assert.equal(/Lines without a role|Not part/.test(text), false);
  assert.match(text, /^5\nHeadline\nOrganic cotton shirts/m);
});

test("rsa code block renders the ad and its report", async function () {
  const plugin = await loadPlugin();
  const el = stub.makeEl("div");
  plugin.processors.rsa(AD, el, { getSectionInfo: function () { return { lineStart: 9 }; } });
  const text = el.allText();
  assert.match(text, /Organic cotton shirts/);
  assert.match(text, /3 headlines, 2 descriptions, 0 paths: 1 error/);
  assert.match(text, /^12\nHeadline\nOrganic/m, "line numbers follow the note");
});
