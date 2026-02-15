# Hume legal pages (GitHub Pages)

These files are ready to publish as public legal URLs for Google Play:

- `privacy.html`
- `terms.html`
- `data-deletion.html`

## Quick publish using GitHub Pages

1. Push this repo to GitHub.
2. Open repo settings -> `Pages`.
3. In `Build and deployment`, select:
   - `Source`: `Deploy from a branch`
   - `Branch`: `main` (or your default branch)
   - `Folder`: `/legal`
4. Save and wait for deployment.

GitHub will generate a URL like:

`https://bolsitadp.github.io/hume/`

Your legal URLs will be:

- `https://bolsitadp.github.io/hume/privacy.html`
- `https://bolsitadp.github.io/hume/terms.html`
- `https://bolsitadp.github.io/hume/data-deletion.html`

## Before going live

Replace placeholder contact email in:

- `privacy.html`
- `terms.html`
- `data-deletion.html`

And update app links in:

- `src/screens/SettingsScreen.tsx` (`LEGAL_LINKS`)
