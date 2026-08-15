# CLAUDE.md

## Project Overview

Deep Value Alpha — a static personal research portfolio site for stock pitches and macro analysis.

**Tech stack (fixed, do not deviate):**
- Plain HTML + CSS + vanilla JavaScript
- No frontend frameworks, no bundlers, no npm dependencies for the site
- One Vercel serverless function (Node) for Telegram notifications
- Everything runs by opening `index.html` or deploying folder as-is

## Content Model — LINK-OUT

Articles are **not** embedded in the site. Each entry in `data/articles.json` is a
card that links out to the full write-up in Google Docs via a `link` field. Clicking
a card opens that Google Doc in a new tab (`window.open(article.link, '_blank')` in
`script.js`). There is no modal, no embedded HTML body, and no per-article image
extraction. The full text and all charts live in the Google Doc.

## File Structure

```
/
├── index.html          # Main page: loading screen + two-column feed of link-out cards
├── styles.css          # All styles, CSS custom properties for theming
├── script.js           # Loading animation, card rendering, theme toggle, visit notify
├── data/
│   └── articles.json   # Array of article cards (metadata + Google Doc link)
├── images/
│   ├── loading.jpg     # Loading screen background AND social share thumbnail (og/twitter)
│   ├── hero.jpeg       # Legacy loading background (no longer referenced)
│   ├── minera/         # Legacy chart images (embedded-body era, no longer used)
│   └── obsidian/       # Legacy chart images (embedded-body era, no longer used)
├── api/
│   └── notify.js       # Vercel serverless function for Telegram notifications
├── vercel.json
└── README.md
```

## Critical Rules

### Adding an article
Adding an article means adding one JSON object to `data/articles.json`. There is **no**
text copying and **no** image extraction — the Google Doc is the source of truth.

1. Get the Google Doc share link (the `link` field).
2. Write a short `preview` teaser (see styling rules below).
3. Insert the object into `data/articles.json` using Python's `json.dump()` (handles
   escaping properly). Ordering in the file does not matter — cards are sorted by
   `date` descending at render time.
4. Validate the JSON (see Commands).

### Styling
- **Black and white theme only** — no orange, gold, or colored accents
- Cards have NO cover images (`image` is always `null`)
- Preview text should not contain em-dashes (use commas or reword)

### Article JSON Schema
```json
{
  "id": "unique-slug",
  "title": "Article Title",
  "category": "stock-pitch",  // or "macro"
  "date": "2026-07-07",       // ISO date; cards sort newest-first
  "image": null,              // ALWAYS null - no card images
  "ticker": "AAPL",           // or null for macro
  "preview": "Short teaser without em-dashes",
  "link": "https://docs.google.com/document/d/.../edit?usp=sharing",
  "featured": true            // OPTIONAL - pins card to top "PINNED" featured section
}
```

- `stock-pitch` cards render in the left column, `macro` cards in the right column.
- `featured: true` (or truthy) pulls the card into the pinned featured section instead
  of its normal column. Omit the field for normal cards.

### Loading screen + social share image
`images/loading.jpg` serves double duty: it is the loading-screen background
(`styles.css` `.loading-screen` `background-image`) and the link-preview thumbnail
(`og:image` and `twitter:image` in `index.html`). To change either, replace/point at
this file. Use a NEW filename when swapping the share image so social scrapers don't
serve a stale cached thumbnail, then update all three references.

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
- Optional pinned "featured" section for `featured` articles
- Cards link out to the full Google Doc write-up in a new tab
- Light/dark theme toggle (persisted in localStorage)
- Loading screen keeps fixed dark styling regardless of theme
- Telegram visit notification via `/api/notify` (fired on load in `script.js`)
