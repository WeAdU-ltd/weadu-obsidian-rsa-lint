"use strict";

const { Plugin, Modal, Setting, Notice } = require("obsidian");
const { lintAdLine, buildRsaCandidates } = require("./lib/rsa");

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
