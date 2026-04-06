# Prudhvi Sirikonda — Portfolio

Personal portfolio website for Prudhvi Sirikonda, Technical Trainer with 5+ years experience and 11,000+ students trained.

**Live site:** https://prudhvisirikonda.com

---

## Tech Stack

Plain HTML + CSS + JavaScript — no frameworks, no build step required.

- `index.html` — main portfolio
- `neo-styles.css` — all styles
- `terminal.html` — interactive terminal resume
- `styles.css` — terminal styles
- `script.js` — terminal logic
- `image/` — all assets

---

## Deploy to Netlify (Recommended)

### Option A — Netlify Drop (Fastest, no account needed for testing)

1. Go to **https://app.netlify.com/drop**
2. Drag and drop the entire `Portfolio` folder onto the page
3. Netlify gives you a live URL instantly (e.g. `random-name.netlify.app`)
4. Done — live in under 60 seconds

### Option B — Netlify + GitHub (Recommended for ongoing updates)

This gives you auto-deploy on every push.

**Step 1 — Push to GitHub (do this manually)**
```
git init
git add .
git commit -m "initial deploy"
git remote add origin https://github.com/Prudhvi-69/portfolio.git
git push -u origin main
```

**Step 2 — Connect to Netlify**
1. Go to **https://app.netlify.com** → Sign up / Log in with GitHub
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose **GitHub** → select your `portfolio` repository
4. Build settings:
   - Build command: *(leave empty)*
   - Publish directory: `.`
5. Click **"Deploy site"**

**Step 3 — Custom Domain (optional)**
1. In Netlify dashboard → **Domain settings** → **Add custom domain**
2. Enter `prudhvisirikonda.com`
3. Update your domain DNS — add these records at your domain registrar:
   ```
   Type: A      Name: @    Value: 75.2.60.5
   Type: CNAME  Name: www  Value: your-site-name.netlify.app
   ```
4. Enable **HTTPS** (free SSL) — Netlify does this automatically

---

## Deploy to Vercel (Alternative)

1. Go to **https://vercel.com** → Sign up with GitHub
2. Click **"New Project"** → Import your GitHub repo
3. Framework preset: **Other**
4. Root directory: `.`
5. Click **Deploy**

Vercel also supports drag-and-drop at **https://vercel.com/new**

---

## What I Cannot Do For You (Manual Steps)

| Step | What to do |
|------|-----------|
| Create GitHub account | Go to https://github.com/join |
| Create GitHub repo | https://github.com/new → name it `portfolio` → Public |
| Run git commands | Open terminal in the Portfolio folder and run the git commands above |
| Create Netlify account | Go to https://app.netlify.com → Sign up with GitHub |
| Buy/own a domain | Use Namecheap, GoDaddy, or Google Domains to buy `prudhvisirikonda.com` |
| Update DNS records | Log into your domain registrar and add the A + CNAME records from Netlify |
| Wait for DNS propagation | Takes 5 min to 48 hours after DNS changes |

---

## Do You Need React?

**No.** This site is pure HTML/CSS/JS and deploys perfectly as-is to both Netlify and Vercel.

Converting to React would:
- Add unnecessary complexity (build step, npm, node_modules)
- Make no visual difference to the end user
- Slow down the site (React bundle overhead)

The current setup is actually better for a portfolio — faster load, simpler maintenance, no dependencies.

---

## Local Development

No build tools needed. Just open with any static server:

```bash
# Python
python -m http.server 8000

# Node (if installed)
npx serve .
```

Then open `http://localhost:8000`

---

## File Structure

```
Portfolio/
├── index.html          ← Main portfolio (edit this)
├── neo-styles.css      ← All portfolio styles
├── terminal.html       ← Terminal resume page
├── styles.css          ← Terminal styles
├── script.js           ← Terminal JS logic
├── favicon.svg         ← Site icon
├── netlify.toml        ← Netlify config (headers, redirects)
├── robots.txt          ← SEO
├── sitemap.xml         ← SEO sitemap
└── image/
    ├── avatar-gpt.png
    ├── arrow.png
    ├── pirat.png
    └── social-cover.png
```

---

© 2025 Prudhvi Sirikonda
