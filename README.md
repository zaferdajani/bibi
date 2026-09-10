# JAIL BIBI — $JAIL

Static site for the **$JAIL** political-satire meme token on Solana.
No build step, no framework, no dependencies. Open `index.html` and it runs.

```
index.html     markup
styles.css     design system (yard-black / mint terminal / prison stripe)
app.js         live stats, raid kit, meme generator, easter egg
config.js      ← THE ONLY FILE YOU NEED TO EDIT
assets/        sprite, favicon, Open Graph card
```

---

## 1. Configure

Everything token-specific lives in `config.js`.

| Key | What it does |
|---|---|
| `mint` | Contract address. Shown in the hero, the footer, the copy buttons and every raid post. |
| `launchISO` | Exact mint time (`"2026-09-10T09:06:00Z"`). Leave `null` and the **TIME SERVED** counter stays hidden. Set it and a fourth live tile appears. |
| `links.x` / `links.telegram` / `links.community` | Leave a link empty and its button is **removed from the page automatically** — no dead links, ever. |
| `siteURL` | Used in share text and Open Graph tags. |
| `raids` | The one-click post templates. `{ca}`, `{ticker}` and `{site}` are substituted at render time. |

## 2. Deploy

**GitHub Pages** — Settings → Pages → Source: `Deploy from a branch` → this branch, `/ (root)`.
`.nojekyll` is already committed so `assets/` is served untouched.

**Anything else** — Netlify, Vercel, Cloudflare Pages: drag the folder in. It is pure static files.

**Locally** — must be served over HTTP, not opened as `file://`, or the browser
taints the canvas and meme export breaks:

```bash
python3 -m http.server 8000   # → http://localhost:8000
```

## 3. Point a domain at it

Add a `CNAME` file containing your domain (e.g. `jailbibi.xyz`), then set the DNS
records your host asks for. Update `siteURL` in `config.js` to match.

---

## What's on the page and why

Built around the finding that **user-generated ticker mentions** and
**narrative-linked attention** are what actually move a meme coin — so every
section is designed to end in someone posting something.

| Section | Job it does |
|---|---|
| **Hero** | States the question in one screen. The contract is copyable in one tap — the single highest-friction moment in any meme coin funnel. |
| **01 THE COUNT** | The open loop. A public number that only goes up when one more person commits. Directly under it sits an honesty block — *wallets are not people, this is not a vote* — which is what stops the concept being trivially dunked on. |
| **02 THE CHARGE** | Three cards saying what this is **not**. Pre-empts the attack instead of waiting for it. |
| **03 THE TAPE** | DEX Screener chart, auto-mounted the moment a liquidity pair exists. Until then it honestly says *still on the bonding curve*. |
| **04 THE RAID KIT** | The engine. Rotating one-click X posts, plus a client-side meme generator with four hand-drawn scenes (cell / mugshot / wanted poster / courtroom) and image upload. Every export is watermarked `$JAIL`. |
| **05 THE SENTENCE** | Roadmap as a prison term. Four honest phases, no fake partnerships. |
| **06 BOOKING PROCEDURE** | Wallet → SOL → contract → swap, plus a loud impostor-token warning. |
| **07 RAP SHEET** | FAQ that answers the hard questions directly, including the antisemitism one. Refusing to answer it publicly is how a project like this dies. |

### Live data

`app.js` polls `api.dexscreener.com` every 45s (CORS-open, no API key).
Pre-graduation there is no indexed pair, so the page shows a truthful holding
state rather than fake numbers. Once the curve graduates, market cap, 24h volume,
24h trades and the embedded chart all appear on their own — no redeploy needed.

### Meme generator

Pure `<canvas>`. Backgrounds are drawn procedurally in code, so there is nothing
to license and nothing to host. Everything runs in the visitor's browser;
no image is ever uploaded anywhere.

---

## Launch-day playbook

1. **Fill in `config.js` and deploy before you promote anything.** A coin with no
   site reads as a rug at a glance.
2. **Pin one post** with the OG card image. Media posts travel measurably further
   than text-only ones.
3. **Ship the raid kit to holders first.** Its whole purpose is turning a holder
   into a poster with two clicks.
4. **Mid-tier accounts (10k–100k followers) outperform big ones** on engagement
   rate. Ten of them beat one of the giants.
5. **Never claim the holder count is a poll, a vote, or a verdict.** The honesty
   block on the page is load-bearing — it is the difference between satire that
   survives scrutiny and a claim that gets the project buried.
6. **Keep the artwork consistent.** The 8-bit inmate is the whole brand. Same
   sprite in the avatar, the OG card, the memes, the site.

---

## Disclaimer

$JAIL is political satire about a public figure's conduct in public office. It is
not a court, an election, a poll, or a legal finding, and nothing in this
repository is financial or legal advice. Meme tokens are extraordinarily volatile
and most go to zero. Criticism of a head of government is not criticism of a
people; hate speech has no place in this project or its community.
