# WeAdU RSA Lint

An Obsidian plugin that checks a Google Ads responsive search ad (RSA) drafted in a note before you paste it into Google Ads: the number of headlines and descriptions, their lengths, duplicates, and common editorial issues.

It uses no AI model and makes no network request. Nothing leaves your vault, and the plugin never edits your notes.

## Writing an ad

Put each item under an explicit role line. Nothing is guessed from the length of a line.

````markdown
```rsa
Headlines:
- Organic cotton shirts
- Free returns for 30 days
- Made in Portugal

Descriptions:
- Soft shirts in organic cotton, cut and sewn in Portugal.
- Order today and get free returns for 30 days.

Paths:
- shirts
- organic
```
````

Role lines: `Headlines:`, `Descriptions:`, `Paths:` (also `Titres:`, `Chemins:`, with or without `:` or a Markdown heading mark). List markers (`-`, `*`, `+`, `1.`) are optional.

## Features

- **`rsa` code block**: in reading view and live preview, the block shows the ad and its report under it.
- **Check responsive search ad (selection, block, or note)**: checks the selected text, or the `rsa` block around the cursor, or else the whole note, and opens the report in a window.

### What is checked

| Check | Severity |
| --- | --- |
| 3 to 15 headlines, 2 to 4 descriptions, at most 2 paths | error |
| Headline over 30, description over 90, path over 15 (text normalized to NFC, so a decomposed accent counts once; wide characters and emoji count as two) | error |
| Same headline or description twice (case and spaces ignored) | error |
| `!` in a headline; `!!`, `??`, `...` anywhere; a space in a path | error |
| An emoji (Google Ads Symbols policy; ©, ® and ™ are allowed) | error |
| A phone number (9 digits or more; dates are not phone numbers) | warning |
| A word of 4 or more letters in capitals | warning |
| A superlative: best, number one, #1, n°1, meilleur | warning |
| A line before any role line | warning |

A clean report is a local check, not an approval from Google.

## Installation

### From the Obsidian community plugins

Once the plugin is listed: open **Settings → Community plugins → Browse**, search for "WeAdU RSA Lint", then install and enable it. If Restricted mode is on, turn it off first.

### Manual installation

1. Download `main.js`, `manifest.json`, and `styles.css` from the latest release of this repository.
2. Create the folder `<your vault>/.obsidian/plugins/weadu-rsa-lint/` and copy the three files into it.
3. Restart Obsidian, then enable **WeAdU RSA Lint** in **Settings → Community plugins**.

Requires Obsidian 1.5.0 or later.

## Settings

The plugin has no settings.

## Privacy

The plugin makes no network request, uses no AI model, and has no telemetry. It only reads the note you check, and it stores nothing.

## Development

```sh
npm ci
npm run build   # type-check src/ and bundle main.js with esbuild
sh test.sh      # type-check, eslint-plugin-obsidianmd, build, tests (Node.js 20 or later)
```

`main.js` is generated from `src/main.ts` and `src/rsa.ts`. The tests fail if `main.js` is out of date or if the Obsidian lint reports any error or warning.

## License

[MIT](LICENSE)

## About

Made by [WeAdU](https://weadu.com). WeAdU is not affiliated with Obsidian or Google.
