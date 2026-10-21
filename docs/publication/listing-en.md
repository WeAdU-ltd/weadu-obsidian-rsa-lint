# Listing texts (English)

## Name

WeAdU RSA Lint

## Short description (manifest, 250 characters max)

Check Google Ads responsive search ads written in your notes: 3 to 15 headlines, 2 to 4 descriptions, lengths, duplicates, and common policy issues. Local only.

## Long description

WeAdU RSA Lint checks a responsive search ad drafted in Obsidian, before you paste it into Google Ads.

- Write the ad in an `rsa` code block, with explicit Headlines:, Descriptions:, and Paths: lines. Nothing is guessed from the length of a line.
- The report checks 3 to 15 headlines, 2 to 4 descriptions, at most 2 paths, the 30/90/15 limits, duplicates, an exclamation mark in a headline, and repeated punctuation, and warns about phone numbers (dates excluded), words in capitals, and superlatives.
- A command checks the selection, the block, or the note in a window. The plugin never edits your notes.

Wide characters count as two. A clean report is a local check, not an approval from Google.

No AI model, no network request, no telemetry. Free and open source (MIT), made by WeAdU.
