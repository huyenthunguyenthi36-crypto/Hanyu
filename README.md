# 墨学 Mòxué — Chinese Learning Platform

A responsive Vietnamese/Chinese learning web app with a red-ink / black / rice-paper design.

## Included
- Responsive PWA UI for phone and desktop.
- HSK 2.0 (6 levels) and HSK 3.0 (9-level roadmap).
- Vocabulary search, speech playback, flashcards.
- Dictation practice and answer comparison.
- Browser speech recognition practice for Mandarin.
- Handwriting canvas, score surface and stroke-order animation surface.
- HSK mock exam engine and score history.
- China social-language study area for pasted transcripts/links.
- Word-matching game and flashcards.
- Daily check-in, XP, titles, streak, notes.
- JSON backup/restore.
- Optional server sync by email.
- Server-side AI proxy endpoint (`/api/ai`) so an AI key is not exposed in the browser.
- PWA service worker.

## Run locally
Requires Node.js 18+.

```bash
node server.js
```
Then open `http://localhost:8787`.

No npm packages are required by the current server.

## AI
Copy `.env.example` to `.env` and run the server with the variables in your hosting provider. The server supports:
- `AI_API_KEY`
- `AI_API_URL`
- `AI_MODEL`

Do **not** put a secret AI key into `public/app.js`.

## Public deployment
The app is a normal Node HTTP application, so it can be deployed to any Node-compatible host (Render, Railway, Fly.io, VPS, etc.). After deployment you receive a public `https://...` URL that can be opened directly in Google Chrome on phone or computer.

For a custom domain, point DNS to the hosting provider. Search-engine indexing is separate from simply having a public URL.

## Data
Local learning data is stored in browser localStorage. Optional cloud sync stores the user's state on the server. For production use, replace the simple JSON storage in `data/data.json` with a real database (PostgreSQL/SQLite/D1/Supabase) and add proper authentication/session tokens.

## Important integrations
Some requested features depend on external services and cannot be truthfully implemented as a browser-only static file:
- AI pronunciation scoring / phoneme and tone scoring requires a speech scoring model/API.
- Advanced AI exam generation requires an AI provider key.
- Automatic Douyin/Xiaohongshu extraction depends on permitted APIs/connectors and platform access rules; the app intentionally does not bypass login, anti-bot, DRM or access controls.
- True PDF embedding of Kai/Xing/Cao script fonts requires font files with appropriate licensing. The app supports browser printing; licensed fonts can be added with `@font-face`.
- The official HSK datasets should be imported from licensed/official resources rather than silently copied from an unknown source.
