/* Built by build.js from src.main.js and lib/. Do not edit. */
"use strict";

const { Plugin, Modal, Setting, Notice } = require("obsidian");
const { lintAdLine, buildRsaCandidates } = (function(){var module={exports:{}};var exports=module.exports;
"use strict";

const LIMITS = { headline: 30, description: 90, path: 15 };

function charWidth(ch) {
  const cp = ch.codePointAt(0) || 0;
  if (
    (cp >= 0x1100 && cp <= 0x115f) ||
    (cp >= 0x2e80 && cp <= 0x9fff) ||
    (cp >= 0xac00 && cp <= 0xd7a3) ||
    (cp >= 0xf900 && cp <= 0xfaff) ||
    (cp >= 0xfe10 && cp <= 0xfe19) ||
    (cp >= 0xfe30 && cp <= 0xfe6f) ||
    (cp >= 0xff00 && cp <= 0xff60) ||
    (cp >= 0xffe0 && cp <= 0xffe6)
  ) {
    return 2;
  }
  return 1;
}

function googleAdsWidth(text) {
  const chars = Array.from(String(text || ""));
  let width = 0;
  for (let i = 0; i < chars.length; i++) width += charWidth(chars[i]);
  return width;
}

function resolveRole(line, role) {
  if (role === "headline" || role === "description" || role === "path") return role;
  const width = googleAdsWidth(line);
  if (width <= LIMITS.headline) return "headline";
  return "description";
}

function lintAdLine(line, role) {
  const text = String(line == null ? "" : line).trim();
  const resolved = resolveRole(text, role || "auto");
  const limit = LIMITS[resolved];
  const codes = [];
  if (!text) {
    codes.push("empty_line");
    return { role: resolved, text: "", width: 0, limit: limit, codes: codes };
  }
  const width = googleAdsWidth(text);
  if (width > limit) codes.push("over_limit");
  if (resolved === "headline" && text.indexOf("!") !== -1) codes.push("headline_exclamation");
  if (/!{2,}|\?{2,}|\.{3,}/.test(text)) codes.push("repeated_punctuation");
  if (/(?:\+?\d[\d\s().-]{7,}\d)/.test(text)) codes.push("phone_number");
  const words = text.split(/\s+/);
  for (let i = 0; i < words.length; i++) {
    const letters = words[i].replace(/[^A-Za-z]/g, "");
    if (letters.length >= 4 && letters === letters.toUpperCase()) {
      codes.push("all_caps_word");
      break;
    }
  }
  if (/\b(best|number one|no\. 1)\b/i.test(text) || /(^|[^\w#])(#1|n°1)(?![\w])/i.test(text)) codes.push("superlative");
  return { role: resolved, text: text, width: width, limit: limit, codes: codes };
}

function cleanPhrase(value) {
  return String(value == null ? "" : value).trim().replace(/\s+/g, " ");
}

function fit(text, limit) {
  const chars = Array.from(text);
  let width = 0;
  let end = 0;
  for (let i = 0; i < chars.length; i++) {
    const next = charWidth(chars[i]);
    if (width + next > limit) break;
    width += next;
    end = i + 1;
  }
  if (end === chars.length) {
    return { text: chars.join(""), width: width, trimmed: false, midWord: false };
  }
  const kept = chars.slice(0, end).join("");
  const space = kept.lastIndexOf(" ");
  if (space > 0) {
    const cut = kept.slice(0, space).trim();
    return { text: cut, width: googleAdsWidth(cut), trimmed: true, midWord: false };
  }
  const hard = kept.trim();
  return { text: hard, width: googleAdsWidth(hard), trimmed: true, midWord: true };
}

function pushCandidate(out, seen, role, raw) {
  const phrase = cleanPhrase(raw);
  if (!phrase) return;
  const limit = LIMITS[role];
  const fitted = fit(phrase, limit);
  if (!fitted.text) return;
  const key = role + "\n" + fitted.text;
  if (seen[key]) return;
  seen[key] = true;
  const lint = lintAdLine(fitted.text, role);
  const codes = [];
  for (let i = 0; i < lint.codes.length; i++) {
    if (lint.codes[i] !== "over_limit" && lint.codes[i] !== "empty_line") codes.push(lint.codes[i]);
  }
  if (fitted.trimmed) codes.push(fitted.midWord ? "cut_mid_word" : "trimmed");
  out.push({
    role: role,
    text: fitted.text,
    width: lint.width,
    limit: limit,
    codes: codes,
  });
}

function buildRsaCandidates(input) {
  const source = input || {};
  const product = cleanPhrase(source.product);
  const benefit = cleanPhrase(source.benefit);
  const offer = cleanPhrase(source.offer);
  const cta = cleanPhrase(source.cta);
  const out = [];
  const seen = {};
  pushCandidate(out, seen, "headline", product);
  if (benefit) {
    pushCandidate(out, seen, googleAdsWidth(benefit) <= LIMITS.headline ? "headline" : "description", benefit);
  }
  pushCandidate(out, seen, "headline", offer);
  pushCandidate(out, seen, "headline", cta);
  if (product && cta) pushCandidate(out, seen, "headline", cta + " " + product);
  if (product && offer) pushCandidate(out, seen, "headline", product + " " + offer);
  if (benefit && offer && googleAdsWidth(benefit) > LIMITS.headline) {
    pushCandidate(out, seen, "description", benefit + " " + offer);
  }
  return out;
}

module.exports = {
  LIMITS: LIMITS,
  googleAdsWidth: googleAdsWidth,
  lintAdLine: lintAdLine,
  buildRsaCandidates: buildRsaCandidates,
};

return module.exports;})();

class RsaModal extends Modal {
  constructor(app, onSubmit) {
    super(app);
    this.onSubmit = onSubmit;
    this.values = { product: "", benefit: "", offer: "", cta: "" };
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.addClass("weadu-rsa-modal");
    contentEl.createEl("h2", { text: "RSA candidates" });
    contentEl.createEl("p", {
      text: "Only the words you type are reused. Nothing is invented, and nothing is sent out of this vault.",
    });
    this.field("Product", "product");
    this.field("Benefit", "benefit");
    this.field("Offer, only if you want it in the ad", "offer");
    this.field("Call to action", "cta");
    const modal = this;
    new Setting(contentEl).addButton(function (button) {
      button.setButtonText("Insert candidates").setCta().onClick(function () {
        if (!modal.values.product.trim() && !modal.values.benefit.trim()) {
          new Notice("Type a product or a benefit.");
          return;
        }
        modal.onSubmit(modal.values);
        modal.close();
      });
    });
  }

  field(name, key) {
    const modal = this;
    new Setting(this.contentEl).setName(name).addText(function (text) {
      text.onChange(function (value) {
        modal.values[key] = value;
      });
    });
  }

  onClose() {
    this.contentEl.empty();
  }
}

function lintReport(text) {
  const lines = String(text || "").split(/\r?\n/);
  const out = ["## RSA lint", ""];
  let any = false;
  for (let i = 0; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    any = true;
    const lint = lintAdLine(lines[i], "auto");
    const mark = lint.codes.length ? lint.codes.join(", ") : "ok";
    out.push("- " + lint.role + " " + lint.width + "/" + lint.limit + " [" + mark + "] " + lint.text);
  }
  if (!any) out.push("No line to lint.");
  out.push("");
  out.push("Widths count a wide character (Chinese, Japanese, Korean) as two. This is a local approximation, not an approval from Google.");
  return out.join("\n");
}

function candidateReport(values) {
  const candidates = buildRsaCandidates(values);
  const lines = ["## RSA candidates", ""];
  if (!candidates.length) lines.push("Nothing to build.");
  candidates.forEach(function (candidate) {
    const mark = candidate.codes.length ? " [" + candidate.codes.join(", ") + "]" : "";
    lines.push("- " + candidate.role + " (" + candidate.width + "/" + candidate.limit + ")" + mark + " " + candidate.text);
  });
  return lines.join("\n");
}

class WeaduRsaLint extends Plugin {
  async onload() {
    this.addCommand({
      id: "lint-ad-lines",
      name: "Lint ad lines in the selection",
      editorCallback: function (editor) {
        const selected = editor.getSelection();
        if (selected) {
          editor.replaceSelection(selected + "\n" + lintReport(selected) + "\n");
          return;
        }
        const report = "\n" + lintReport(editor.getValue()) + "\n";
        editor.setValue(editor.getValue().replace(/\s*$/, "") + report);
      },
    });

    this.addCommand({
      id: "build-rsa-candidates",
      name: "Build RSA candidates from a brief",
      editorCallback: function (editor) {
        new RsaModal(this.app, function (values) {
          const cursor = editor.getCursor();
          editor.replaceRange("\n" + candidateReport(values) + "\n", {
            line: cursor.line,
            ch: editor.getLine(cursor.line).length,
          });
        }).open();
      }.bind(this),
    });
  }
}

module.exports = WeaduRsaLint;
module.exports.default = WeaduRsaLint;
