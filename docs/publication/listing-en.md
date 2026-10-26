# Listing texts (English)

## Name

WeAdU RSA Lint

## Short description (manifest, 250 characters max)

Check a responsive search ad in a note. Specs allow 1 to 15 headlines and 1 to 4 descriptions; the editor asks for 3 and 2 before Save. Lengths and punctuation. Local only.

## Long description

WeAdU RSA Lint checks a responsive search ad drafted in Obsidian, before you paste it into Google Ads.

- Write the ad in an `rsa` code block, with explicit Headlines:, Descriptions:, and Paths: lines. Nothing is guessed from the length of a line.
- The report treats 1 to 15 headlines and 1 to 4 descriptions as the Search specs. Fewer than 3 headlines or 2 descriptions is a warning, because the editor asks for those counts before Save. It also checks the 30/90/15 limits, duplicates, and repeated marks (`!!`, `??`). One exclamation mark and an ellipsis are allowed. It warns about phone numbers (dates excluded), words in capitals (an acronym is not called forbidden), and superlatives.
- A command checks the selection, the block, or the note in a window. The plugin never edits your notes.

Wide characters count as two. A clean report is a local check, not an approval from Google.

No AI model, no network request, no telemetry. Free and open source (MIT), made by WeAdU.
