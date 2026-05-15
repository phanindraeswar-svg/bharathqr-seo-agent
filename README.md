# BharathQR SEO Agent

This repo contains an automation agent that:
- Crawls competitor site (bharatupi.com).
- Detects SEO/content gaps.
- Generates new SEO-rich content using OpenAI.
- Publishes updates to WordPress and Next.js.
- Generates weekly SEO reports.

## Setup

1. Add credentials:
   - `config/openai_key.txt` → Your OpenAI API key.
   - `config/wp_credentials.json` → WordPress site URL + app password.
   - `config/gsc_credentials.json` → Google Search Console API credentials.

2. Push to GitHub:
   ```bash
   git add .
   git commit -m "Initial setup"
   git push origin main
   ```

Enable GitHub Actions → Agent runs daily and auto-publishes.

## ✅ Final Step
- Go to your repo → **Actions tab** → you'll see "BharathQR SEO Agent".
- It will run daily at 2 AM IST, or you can trigger manually.