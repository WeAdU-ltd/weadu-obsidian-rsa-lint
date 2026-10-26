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
| Fewer than 1 headline or 1 description, more than 15 headlines, 4 descriptions, or 2 paths | error |
| 1 or 2 headlines, or 1 description: the Search specs allow it, and the responsive search ad editor asks for 3 headlines and 2 descriptions before Save | warning |
| Headline over 30, description over 90, path over 15 (text normalized to NFC, so a decomposed accent counts once; wide characters and emoji count as two) | error |
| Same headline or description twice (case and spaces ignored) | error |
| `!!` or `??`, or four dots in a row; a space in a path | error |
| An emoji (Google Ads Symbols policy; ©, ® and ™ are allowed) | error |
| A phone number (9 digits or more; dates are not phone numbers) | warning |
| A word of 4 or more letters in capitals. An acronym or a code can stay; the warning does not call it forbidden | warning |
| A superlative: best, number one, #1, n°1, meilleur | warning |
| A line before any role line | warning |

One exclamation mark is allowed. An ellipsis (`...` or `…`) is allowed: the punctuation policy bans marks repeated in a row, such as `!!`, and Google itself shortens some ads with an ellipsis.

Counts: [Search campaign specs](https://support.google.com/google-ads/answer/17092074?hl=en) list 1 to 15 headlines and 1 to 4 descriptions for a responsive search ad. The [create-an-RSA steps](https://support.google.com/google-ads/answer/7684791?hl=en) say the editor asks for at least 3 headlines and 2 descriptions before Save. Fewer than the editor minimum is a warning, not an error. Confirm the ad in the Google Ads interface before you treat a warning as a block.

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
