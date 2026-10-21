/* WeAdU RSA Lint. Built with esbuild from src/. Do not edit. */
"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/main.ts
var main_exports = {};
__export(main_exports, {
  default: () => WeaduRsaLint,
  pickSource: () => pickSource
});
module.exports = __toCommonJS(main_exports);
var import_obsidian = require("obsidian");

// src/rsa.ts
var LIMITS = { headline: 30, description: 90, path: 15 };
var COUNTS = {
  headline: { min: 3, max: 15 },
  description: { min: 2, max: 4 },
  path: { min: 0, max: 2 }
};
var MESSAGES = {
  over_limit: "Too long for this field.",
  empty_asset: "Empty item.",
  headline_exclamation: "Google Ads does not allow an exclamation mark in a headline.",
  repeated_punctuation: "Repeated punctuation (!!, ??, ...) is not allowed.",
  phone_number: "Looks like a phone number: Google Ads asks for a call asset instead.",
  all_caps_word: "A word in capitals: Google Ads allows capitals only for acronyms and codes.",
  superlative: "Superlative (best, number one, #1): Google Ads asks for third-party proof.",
  duplicate: "Same text as another item of this type: Google Ads rejects duplicates.",
  path_space: "A display path cannot contain spaces.",
  too_few_headline: "At least 3 headlines are required.",
  too_many_headline: "At most 15 headlines are allowed.",
  too_few_description: "At least 2 descriptions are required.",
  too_many_description: "At most 4 descriptions are allowed.",
  too_many_path: "At most 2 display paths are allowed.",
  no_role: "Line without a role: put it under a Headlines:, Descriptions:, or Paths: line."
};
function issue(code, severity, detail = "") {
  var _a;
  return { code, severity, message: ((_a = MESSAGES[code]) != null ? _a : code) + detail };
}
function charWidth(ch) {
  var _a;
  const cp = (_a = ch.codePointAt(0)) != null ? _a : 0;
  const wide = cp >= 4352 && cp <= 4447 || cp >= 11904 && cp <= 40959 || cp >= 44032 && cp <= 55203 || cp >= 63744 && cp <= 64255 || cp >= 65040 && cp <= 65049 || cp >= 65072 && cp <= 65135 || cp >= 65280 && cp <= 65376 || cp >= 65504 && cp <= 65510;
  return wide ? 2 : 1;
}
function googleAdsWidth(text) {
  let width = 0;
  for (const ch of Array.from(text)) width += charWidth(ch);
  return width;
}
var DATE_RE = /^\d{1,4}([-/.])\d{1,2}\1\d{1,4}$/;
function hasPhoneNumber(text) {
  const re = /\+?\d[\d\s().-]{7,}\d/g;
  let match;
  while ((match = re.exec(text)) !== null) {
    const run = match[0].trim();
    const digits = run.replace(/\D/g, "").length;
    if (digits < 9) continue;
    if (DATE_RE.test(run)) continue;
    if (run.split(/\s+[-–]\s+|\s+/).every((part) => DATE_RE.test(part) || part === "-")) continue;
    return true;
  }
  return false;
}
function lineIssues(role, text, width) {
  const out = [];
  if (!text) return [issue("empty_asset", "error")];
  if (width > LIMITS[role]) out.push(issue("over_limit", "error", ` ${width}/${LIMITS[role]}.`));
  if (role === "path") {
    if (/\s/.test(text)) out.push(issue("path_space", "error"));
    return out;
  }
  if (role === "headline" && text.includes("!")) out.push(issue("headline_exclamation", "error"));
  if (/!{2,}|\?{2,}|\.{3,}|…/.test(text)) out.push(issue("repeated_punctuation", "error"));
  if (hasPhoneNumber(text)) out.push(issue("phone_number", "warning"));
  for (const word of text.split(/\s+/)) {
    const letters = word.replace(/[^\p{L}]/gu, "");
    if (letters.length >= 4 && letters === letters.toUpperCase() && letters !== letters.toLowerCase()) {
      out.push(issue("all_caps_word", "warning", ` (${word})`));
      break;
    }
  }
  if (/\b(best|number one|no\. 1|meilleur|meilleure)\b/i.test(text) || /(^|[^\w#])(#1|n°1)(?!\w)/i.test(text)) {
    out.push(issue("superlative", "warning"));
  }
  return out;
}
var HEADER_RE = /^\s*(?:#{1,6}\s*)?(headlines?|titres?|descriptions?|paths?|chemins?|display paths?)\s*:?\s*$/i;
function roleOf(word) {
  const w = word.toLowerCase();
  if (w.startsWith("headline") || w.startsWith("titre")) return "headline";
  if (w.startsWith("description")) return "description";
  return "path";
}
function normalize(text) {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}
function checkAd(text, firstLine = 1) {
  const assets = [];
  const unassigned = [];
  let role = null;
  text.split(/\r?\n/).forEach((raw, index) => {
    const header = HEADER_RE.exec(raw);
    if (header) {
      role = roleOf(header[1]);
      return;
    }
    if (!raw.trim() || /^\s*```/.test(raw)) return;
    const value = raw.replace(/^\s*(?:[-*+]|\d+[.)])\s+/, "").trim();
    const line = firstLine + index;
    if (!role) {
      unassigned.push(line);
      return;
    }
    const width = googleAdsWidth(value);
    assets.push({ role, text: value, line, width, limit: LIMITS[role], issues: lineIssues(role, value, width) });
  });
  const counts = { headline: 0, description: 0, path: 0 };
  for (const asset of assets) counts[asset.role]++;
  const issues = [];
  for (const r of ["headline", "description"]) {
    if (counts[r] < COUNTS[r].min) issues.push(issue("too_few_" + r, "error", ` (${counts[r]} found)`));
    if (counts[r] > COUNTS[r].max) issues.push(issue("too_many_" + r, "error", ` (${counts[r]} found)`));
  }
  if (counts.path > COUNTS.path.max) issues.push(issue("too_many_path", "error", ` (${counts.path} found)`));
  if (unassigned.length) issues.push(issue("no_role", "warning", ` Lines: ${unassigned.join(", ")}.`));
  const seen = /* @__PURE__ */ new Map();
  for (const asset of assets) {
    if (asset.role === "path" || !asset.text) continue;
    const key = asset.role + "\n" + normalize(asset.text);
    const first = seen.get(key);
    if (first) asset.issues.push(issue("duplicate", "error", ` (line ${first.line})`));
    else seen.set(key, asset);
  }
  let errors = issues.filter((i) => i.severity === "error").length;
  let warnings = issues.length - errors;
  for (const asset of assets) {
    for (const i of asset.issues) {
      if (i.severity === "error") errors++;
      else warnings++;
    }
  }
  return { assets, issues, unassigned, counts, errors, warnings };
}
function summary(report) {
  const n = (count, word) => `${count} ${word}${count === 1 ? "" : "s"}`;
  const { counts } = report;
  return `${n(counts.headline, "headline")}, ${n(counts.description, "description")}, ${n(counts.path, "path")}: ${n(report.errors, "error")}, ${n(report.warnings, "warning")}.`;
}

// src/main.ts
var ROLE_LABEL = { headline: "Headline", description: "Description", path: "Path" };
function renderReport(el, report) {
  el.addClass("weadu-rsa-report");
  el.createEl("p", { cls: "weadu-rsa-summary", text: summary(report) });
  if (report.issues.length) {
    const list = el.createEl("ul");
    for (const row of report.issues) list.createEl("li", { cls: `weadu-rsa-${row.severity}`, text: `${row.severity}: ${row.message}` });
  }
  if (!report.assets.length) return;
  const table = el.createEl("table");
  const head = table.createEl("thead").createEl("tr");
  for (const label of ["Line", "Type", "Text", "Length", "Findings"]) head.createEl("th", { text: label });
  const body = table.createEl("tbody");
  for (const asset of report.assets) {
    const tr = body.createEl("tr");
    tr.createEl("td", { text: String(asset.line) });
    tr.createEl("td", { text: ROLE_LABEL[asset.role] });
    tr.createEl("td", { text: asset.text });
    tr.createEl("td", { text: `${asset.width}/${asset.limit}` });
    const cell = tr.createEl("td");
    if (!asset.issues.length) cell.setText("OK");
    for (const row of asset.issues) cell.createDiv({ cls: `weadu-rsa-${row.severity}`, text: `${row.severity}: ${row.message}` });
  }
  el.createEl("p", {
    cls: "setting-item-description",
    text: "Lengths count a wide character as two. A local check, not an approval from Google."
  });
}
var ReportModal = class extends import_obsidian.Modal {
  constructor(app, report) {
    super(app);
    this.report = report;
  }
  onOpen() {
    this.titleEl.setText("Responsive search ad check");
    renderReport(this.contentEl, this.report);
  }
  onClose() {
    this.contentEl.empty();
  }
};
function pickSource(editor) {
  const selection = editor.getSelection();
  if (selection) {
    const from = editor.getCursor("from");
    return { text: selection, firstLine: from.line + 1 };
  }
  const lines = editor.getValue().split("\n");
  const cursor = editor.getCursor().line;
  let open = -1;
  for (let i = cursor; i >= 0; i--) {
    if (/^\s*```rsa\s*$/.test(lines[i])) {
      open = i;
      break;
    }
    if (i !== cursor && /^\s*```/.test(lines[i])) break;
  }
  if (open !== -1) {
    let close = open + 1;
    while (close < lines.length && !/^\s*```\s*$/.test(lines[close])) close++;
    if (cursor <= close) return { text: lines.slice(open + 1, close).join("\n"), firstLine: open + 2 };
  }
  return { text: lines.join("\n"), firstLine: 1 };
}
var WeaduRsaLint = class extends import_obsidian.Plugin {
  onload() {
    this.addCommand({
      id: "check-ad",
      name: "Check responsive search ad (selection, block, or note)",
      editorCallback: (editor) => {
        const source = pickSource(editor);
        new ReportModal(this.app, checkAd(source.text, source.firstLine)).open();
      }
    });
    this.registerMarkdownCodeBlockProcessor("rsa", (source, el, ctx) => {
      const info = ctx.getSectionInfo(el);
      const firstLine = info ? info.lineStart + 2 : 1;
      const pre = el.createEl("pre");
      pre.createEl("code", { text: source });
      renderReport(el.createDiv(), checkAd(source, firstLine));
    });
  }
};
