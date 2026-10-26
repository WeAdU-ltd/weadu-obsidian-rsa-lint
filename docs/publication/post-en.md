# Obsidian Forum post (English)

Category: Share & showcase. Tag: plugin-release, if the tag picker offers it.

---

**Title:** WeAdU RSA Lint: check Google Ads headlines and descriptions in your notes

Hi all,

I'd like to share a small free plugin for people who draft Google Ads copy in Obsidian.

- Write the ad in an `rsa` code block, with explicit Headlines:, Descriptions:, and Paths: lines. The block shows a report under it.
- The report follows the Search specs: 1 to 15 headlines and 1 to 4 descriptions. Fewer than 3 headlines or 2 descriptions is a warning, because the editor asks for those counts before Save. It also checks the 30/90/15 length limits (wide characters count as two), duplicates, and repeated marks (`!!`, `??`). One exclamation mark and an ellipsis are allowed. It warns about phone numbers, words in capitals (an acronym is not called forbidden), and superlatives such as "best".
- A command checks the selection, the block, or the note, and opens the report without editing the note.

No AI model, no network request, no telemetry. MIT licensed. The widths are a local approximation, not an approval from Google.

Install: Settings → Community plugins → Browse → "WeAdU RSA Lint".
Source and issues: LINK

Disclosure: I work at WeAdU, the agency that made it. The plugin is free.

Feedback is welcome in this thread.
