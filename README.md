# Deep Value Alpha

A static personal research-portfolio site featuring stock pitches and macro analysis.

## Adding or Editing Articles

1. Open `data/articles.json`
2. Add a new entry following this schema:

```json
{
  "id": "unique-slug",
  "title": "Article Title",
  "category": "stock-pitch",
  "date": "2026-06-01",
  "image": "/images/slug.jpg",
  "ticker": "AAPL",
  "preview": "1-2 sentence teaser, ~140-200 chars.",
  "body": "<p>Full article as HTML paragraphs.</p><p>More text.</p>"
}
```

**Field notes:**
- `category`: must be exactly `"stock-pitch"` or `"macro"`
- `image`: path to image in `/images/` folder, or `null` if no image
- `ticker`: stock symbol or `null` for macro articles
- `body`: HTML-formatted content (paragraphs, bold, italic, links)

3. If using an image, add the file to the `/images/` folder
4. Commit and push — Vercel will auto-redeploy

## Replacing Placeholder Articles

The site ships with 3 demo articles. Simply edit or delete these entries in `data/articles.json` and replace with your real content.

## Telegram Notifications

To receive a Telegram message on each site visit:

1. **Create a bot:**
   - Message [@BotFather](https://t.me/BotFather) on Telegram
   - Send `/newbot` and follow the prompts
   - Copy the bot token (looks like `123456:ABC-DEF...`)

2. **Get your chat ID:**
   - Start a chat with your new bot (send any message)
   - Visit: `https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates`
   - Find `"chat":{"id":` in the response — that number is your chat ID

3. **Set environment variables in Vercel:**
   - Go to your Vercel project → Settings → Environment Variables
   - Add `TELEGRAM_BOT_TOKEN` with your bot token
   - Add `TELEGRAM_CHAT_ID` with your chat ID
   - Redeploy for changes to take effect

## Deployment

The site auto-deploys on every push to the connected branch. No build step required — Vercel serves the static files directly and runs the serverless function in `/api/`.
