# CLAUDE.md

## Project Overview

Deep Value Alpha — a static personal research portfolio site for stock pitches and macro analysis.

**Tech stack (fixed, do not deviate):**
- Plain HTML + CSS + vanilla JavaScript
- No frontend frameworks, no bundlers, no npm dependencies for the site
- One Vercel serverless function (Node) for Telegram notifications
- Everything runs by opening `index.html` or deploying folder as-is

## File Structure

```
/
├── index.html          # Main page with loading screen, feed, modal
├── styles.css          # All styles, CSS custom properties for theming
├── script.js           # Loading animation, article rendering, modal, theme toggle
├── data/
│   └── articles.json   # All articles with full HTML body content
├── images/
│   ├── hero.jpeg       # Loading screen background
│   ├── minera/         # Charts for Minera Alamos article
│   └── obsidian/       # Charts for Obsidian Energy article
├── api/
│   └── notify.js       # Vercel serverless function for Telegram notifications
├── vercel.json
└── README.md
```

## Critical Rules

### Article Content — VERBATIM ONLY
When adding articles from Google Docs:
- **Copy text 100% exactly as written** — no cleanup, no grammar fixes
- Preserve ".." and "..." dots — they are intentional
- Preserve "!!!!" and "????" punctuation
- Preserve "looooves" and other intentional spellings
- Preserve "…" ellipsis characters
- Do NOT convert em-dashes or change punctuation
- Extract ALL images from the doc and embed them in the article body

### Styling
- **Black and white theme only** — no orange, gold, or colored accents
- Article cards have NO cover images — images only appear inside the article modal
- Preview text should not contain em-dashes (use commas or reword)

### Article JSON Schema
```json
{
  "id": "unique-slug",
  "title": "Article Title",
  "category": "stock-pitch",  // or "macro"
  "date": "2026-07-07",
  "image": null,              // ALWAYS null - no card images
  "ticker": "AAPL",           // or null for macro
  "preview": "Short teaser without em-dashes",
  "body": "<p>Full HTML content with embedded <img> tags</p>"
}
```

### Adding Articles from Google Docs
1. Use `mcp__claude_ai_Google_Drive__read_file_content` for text
2. Use `mcp__claude_ai_Google_Drive__download_file_content` with `exportMimeType: "text/html"` for images
3. Decode base64 HTML, extract embedded images, save to `/images/{article-slug}/`
4. Embed images in body HTML at appropriate locations
5. Use Python's `json.dump()` to write articles.json (handles escaping properly)

## Commands

**Local development:**
```bash
cd "/Users/maximpapazov/Downloads/article  website"
python3 -m http.server 8080
# Open http://localhost:8080
```

**Validate JSON:**
```bash
python3 -c "import json; json.load(open('data/articles.json')); print('Valid')"
```

## Deployment

1. `git init && git add . && git commit -m "Initial commit"`
2. Push to GitHub
3. Import to Vercel
4. Set environment variables:
   - `TELEGRAM_BOT_TOKEN`
   - `TELEGRAM_CHAT_ID`

## Features

- Loading screen with animated ring (24 segments, clockwise from 12 o'clock)
- Two-column feed: Stock Pitches (left) / Macro (right)
- Modal with fullscreen toggle, closes via X / outside click / Escape
- Light/dark theme toggle (persisted in localStorage)
- Loading screen keeps fixed dark styling regardless of theme
