# Before publication

Nothing in this folder may be posted before every box below is ticked.

- [ ] Pull requests #1 and #2 reviewed independently and merged.
- [ ] `sh test.sh` green on `main` (and the GitHub Actions workflow enabled: copy `ci/github-actions-test.yml` to `.github/workflows/test.yml` with a token that has the `workflow` scope).
- [ ] Manual test in a real Obsidian vault (desktop): both commands, with and without a selection.
- [ ] Known issue fixed or accepted: "#1" is not flagged as a superlative, because the `\b` before `#` never matches after a space (see the `todo` test in `test/plugin.test.js`). The README and listings do not mention "#1" until it is fixed.
- [ ] The plugin has no settings tab, so the WeAdU link is only in the README and the manifest `authorUrl`. Decide whether that is enough.
- [ ] GitHub release `1.0.0` created with `main.js`, `manifest.json`, and `styles.css` attached (the tag must match `manifest.json`).
- [ ] Plugin submitted to the Obsidian community directory (https://community.obsidian.md) and accepted.
- [ ] Public link sent to the person who posts, so `LINK` can be replaced.
