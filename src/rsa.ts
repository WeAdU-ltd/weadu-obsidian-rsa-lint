// Pure responsive search ad (RSA) checks: no Obsidian import, so it can be tested with Node.

export type Role = "headline" | "description" | "path";
export type Severity = "error" | "warning";

export interface Issue {
  code: string;
  severity: Severity;
  message: string;
}

export interface Asset {
  role: Role;
  text: string;
  line: number;
  width: number;
  limit: number;
  issues: Issue[];
}

export interface AdReport {
  assets: Asset[];
  issues: Issue[];
  unassigned: number[];
  counts: { headline: number; description: number; path: number };
  errors: number;
  warnings: number;
}

export const LIMITS: Record<Role, number> = { headline: 30, description: 90, path: 15 };
export const COUNTS: Record<Role, { min: number; max: number }> = {
  headline: { min: 3, max: 15 },
  description: { min: 2, max: 4 },
  path: { min: 0, max: 2 },
};

const MESSAGES: Record<string, string> = {
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
  no_role: "Line without a role: put it under a Headlines:, Descriptions:, or Paths: line.",
};

function issue(code: string, severity: Severity, detail = ""): Issue {
  return { code, severity, message: (MESSAGES[code] ?? code) + detail };
}

function charWidth(ch: string): number {
  const cp = ch.codePointAt(0) ?? 0;
  const wide =
    (cp >= 0x1100 && cp <= 0x115f) ||
    (cp >= 0x2e80 && cp <= 0x9fff) ||
    (cp >= 0xac00 && cp <= 0xd7a3) ||
    (cp >= 0xf900 && cp <= 0xfaff) ||
    (cp >= 0xfe10 && cp <= 0xfe19) ||
    (cp >= 0xfe30 && cp <= 0xfe6f) ||
    (cp >= 0xff00 && cp <= 0xff60) ||
    (cp >= 0xffe0 && cp <= 0xffe6);
  return wide ? 2 : 1;
}

/** Google Ads counts a wide character (Chinese, Japanese, Korean) as two. */
export function googleAdsWidth(text: string): number {
  let width = 0;
  for (const ch of Array.from(text)) width += charWidth(ch);
  return width;
}

const DATE_RE = /^\d{1,4}([-/.])\d{1,2}\1\d{1,4}$/;

/** A run of at least 9 digits, with phone separators, that is not a date. */
export function hasPhoneNumber(text: string): boolean {
  const re = /\+?\d[\d\s().-]{7,}\d/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(text)) !== null) {
    const run = match[0].trim();
    const digits = run.replace(/\D/g, "").length;
    if (digits < 9) continue;
    if (DATE_RE.test(run)) continue;
    // Two dates or a date range ("2026-10-20 - 2026-11-30") are not a phone number either.
    if (run.split(/\s+[-–]\s+|\s+/).every((part) => DATE_RE.test(part) || part === "-")) continue;
    return true;
  }
  return false;
}

function lineIssues(role: Role, text: string, width: number): Issue[] {
  const out: Issue[] = [];
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

const HEADER_RE = /^\s*(?:#{1,6}\s*)?(headlines?|titres?|descriptions?|paths?|chemins?|display paths?)\s*:?\s*$/i;

function roleOf(word: string): Role {
  const w = word.toLowerCase();
  if (w.startsWith("headline") || w.startsWith("titre")) return "headline";
  if (w.startsWith("description")) return "description";
  return "path";
}

function normalize(text: string): string {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

/**
 * Reads one ad. Each item sits under an explicit role line ("Headlines:", "Descriptions:", "Paths:",
 * or the French "Titres:", "Chemins:"), with or without a list marker. Nothing is guessed from length.
 * firstLine is the 1-based line number of the first line of text in the note.
 */
export function checkAd(text: string, firstLine = 1): AdReport {
  const assets: Asset[] = [];
  const unassigned: number[] = [];
  let role: Role | null = null;
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
  const issues: Issue[] = [];
  for (const r of ["headline", "description"] as Role[]) {
    if (counts[r] < COUNTS[r].min) issues.push(issue("too_few_" + r, "error", ` (${counts[r]} found)`));
    if (counts[r] > COUNTS[r].max) issues.push(issue("too_many_" + r, "error", ` (${counts[r]} found)`));
  }
  if (counts.path > COUNTS.path.max) issues.push(issue("too_many_path", "error", ` (${counts.path} found)`));
  if (unassigned.length) issues.push(issue("no_role", "warning", ` Lines: ${unassigned.join(", ")}.`));

  const seen = new Map<string, Asset>();
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

/** Plain-text report, used by the modal title line and by tests. */
export function summary(report: AdReport): string {
  const n = (count: number, word: string) => `${count} ${word}${count === 1 ? "" : "s"}`;
  const { counts } = report;
  return `${n(counts.headline, "headline")}, ${n(counts.description, "description")}, ${n(counts.path, "path")}: ${n(report.errors, "error")}, ${n(report.warnings, "warning")}.`;
}
