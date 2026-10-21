import { App, Editor, MarkdownPostProcessorContext, Modal, Plugin } from "obsidian";
import { AdReport, checkAd, summary } from "./rsa";

const ROLE_LABEL = { headline: "Headline", description: "Description", path: "Path" };

/** Draws a report into an element: used by the modal and by the rsa code block. */
function renderReport(el: HTMLElement, report: AdReport): void {
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
    text: "Lengths count a wide character as two. A local check, not an approval from Google.",
  });
}

class ReportModal extends Modal {
  private report: AdReport;

  constructor(app: App, report: AdReport) {
    super(app);
    this.report = report;
  }

  onOpen(): void {
    this.titleEl.setText("Responsive search ad check");
    renderReport(this.contentEl, this.report);
  }

  onClose(): void {
    this.contentEl.empty();
  }
}

/** The text to check: the selection, else the rsa code block around the cursor, else the whole note. */
export function pickSource(editor: Editor): { text: string; firstLine: number } {
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

export default class WeaduRsaLint extends Plugin {
  onload(): void {
    this.addCommand({
      id: "check-ad",
      name: "Check responsive search ad (selection, block, or note)",
      editorCallback: (editor: Editor) => {
        const source = pickSource(editor);
        new ReportModal(this.app, checkAd(source.text, source.firstLine)).open();
      },
    });

    this.registerMarkdownCodeBlockProcessor("rsa", (source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext) => {
      const info = ctx.getSectionInfo(el);
      const firstLine = info ? info.lineStart + 2 : 1;
      const pre = el.createEl("pre");
      pre.createEl("code", { text: source });
      renderReport(el.createDiv(), checkAd(source, firstLine));
    });
  }
}
