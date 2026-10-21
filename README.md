# WeAdU RSA Lint

An Obsidian plugin that checks Google Ads responsive search ad (RSA) lines while you draft them: it counts each line against the headline or description limit and flags common issues. It can also recombine the words of a short brief into headline and description candidates.

It uses no AI model and makes no network request. Nothing leaves your vault.

## Features

- **Lint ad lines in the selection**: each non-empty line of 30 characters or fewer is treated as a headline (limit 30), and a longer line as a description (limit 90). The report gives the width, the limit, and these flags:
  - `over_limit`: a description is longer than 90;
  - `headline_exclamation`: a headline contains `!`;
  - `repeated_punctuation`: `!!`, `??`, or `...`;
  - `phone_number`: the line looks like it contains a phone number;
  - `all_caps_word`: a word of four or more letters is in capitals;
  - `superlative`: "best", "number one", "n°1", or "no. 1".

  With text selected, the report is inserted below the selection. With nothing selected, the whole note is checked and the report is added at the end.
- **Build RSA candidates from a brief**: type a product, a benefit, an optional offer, and a call to action. The plugin recombines only those words into headline and description candidates, trims them to the limit at a word boundary, and marks trimmed lines. Nothing is invented. The candidates are inserted below the cursor line.

Wide characters (Chinese, Japanese, Korean) count as two, as in Google Ads. The widths are a local approximation: a clean report is not an approval from Google.

## Installation

### From the Obsidian community plugins

Once the plugin is listed: open **Settings → Community plugins → Browse**, search for "WeAdU RSA Lint", then install and enable it. If Restricted mode is on, turn it off first.

### Manual installation

1. Download `main.js`, `manifest.json`, and `styles.css` from the latest release of this repository.
2. Create the folder `<your vault>/.obsidian/plugins/weadu-rsa-lint/` and copy the three files into it.
3. Restart Obsidian, then enable **WeAdU RSA Lint** in **Settings → Community plugins**.

Requires Obsidian 1.5.0 or later.

## Usage

Write one ad line per line, select them, and run **WeAdU RSA Lint: Lint ad lines in the selection** from the command palette. Example result:

```
## RSA lint

- headline 9/30 [headline_exclamation] Shop now!
- description 77/90 [ok] Soft cotton shirts for every day, made to last and easy to wash at home today
```

To get candidates, run **WeAdU RSA Lint: Build RSA candidates from a brief**, fill in the form, and choose **Insert candidates**. A product or a benefit is required.

## Settings

The plugin has no settings.

## Privacy

The plugin makes no network request, uses no AI model, and has no telemetry. It reads and edits only the note you run a command on, and it stores nothing.

## Development

```sh
node build.js   # rebuild main.js from src.main.js and lib/
sh test.sh      # run the tests (Node.js 20 or later)
```

`main.js` is generated: edit `src.main.js` or `lib/rsa.js`, then run `node build.js`. The tests fail if `main.js` is out of date.

## License

[MIT](LICENSE)

## About

Made by [WeAdU](https://weadu.com). WeAdU is not affiliated with Obsidian or Google.
