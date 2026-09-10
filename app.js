/* ===========================================================
   JAIL BIBI — $JAIL   |   app.js
   Vanilla JS, no build step, no dependencies.
   =========================================================== */
(() => {
'use strict';

const CFG = window.JAIL || {};
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* ---------------------------------------------------------
   Toast
--------------------------------------------------------- */
const toastEl = $('#toast');
let toastTimer;
function toast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add('is-up');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('is-up'), 2200);
}

async function copyText(text, okMsg) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;opacity:0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch { /* give up quietly */ }
    ta.remove();
  }
  toast(okMsg);
}

/* ---------------------------------------------------------
   Wire config into the page
--------------------------------------------------------- */
const MINT = CFG.mint || '';
const SITE = CFG.siteURL || location.origin + location.pathname;
const TICK = '$' + (CFG.ticker || 'JAIL');

function short(a) { return a.length > 20 ? a.slice(0, 6) + '…' + a.slice(-6) : a; }

function wireConfig() {
  $('#yr').textContent = new Date().getFullYear();

  const caFull = MINT || 'CONTRACT ADDRESS NOT SET';
  $('#caValue').textContent = window.innerWidth < 620 ? short(caFull) : caFull;
  $('#caValue').title = caFull;
  $('#caValue2').textContent = caFull;

  $$('[data-link]').forEach(el => {
    const url = (CFG.links || {})[el.dataset.link];
    if (url) el.href = url; else el.remove();
  });

  const L = CFG.links || {};
  const social = [
    ['x', 'X / TWITTER'], ['telegram', 'TELEGRAM'], ['community', 'COMMUNITY'],
    ['dexscreener', 'DEXSCREENER'], ['solscan', 'SOLSCAN']
  ].filter(([k]) => L[k]);

  const heroSet = social.filter(([k]) => ['x', 'telegram', 'community'].includes(k));
  $('#socials').innerHTML = heroSet
    .map(([k, label]) => `<a href="${L[k]}" target="_blank" rel="noopener">${label}</a>`).join('');

  $('#footLinks').innerHTML = social
    .map(([k, label]) => `<a href="${L[k]}" target="_blank" rel="noopener">${label}</a>`).join('');
}

/* ---------------------------------------------------------
   Copy contract
--------------------------------------------------------- */
function wireCopy() {
  const go = () => MINT
    ? copyText(MINT, 'CONTRACT COPIED — VERIFY BEFORE YOU BUY')
    : toast('CONTRACT NOT CONFIGURED');
  $('#caCopy').addEventListener('click', go);
  $('#caCopy2')?.addEventListener('click', go);
}

/* ---------------------------------------------------------
   Live stats (DexScreener) + honest fallback
--------------------------------------------------------- */
const fmtUsd = n => {
  if (!isFinite(n) || n <= 0) return '—';
  if (n >= 1e9) return '$' + (n / 1e9).toFixed(2) + 'B';
  if (n >= 1e6) return '$' + (n / 1e6).toFixed(2) + 'M';
  if (n >= 1e3) return '$' + (n / 1e3).toFixed(1) + 'K';
  return '$' + n.toFixed(2);
};
const fmtNum = n => isFinite(n) && n > 0 ? n.toLocaleString('en-US') : '—';

function setStat(key, value) {
  const el = $(`.stat[data-k="${key}"] .stat__v`);
  if (el && el.textContent !== value) el.textContent = value;
}

let chartMounted = false;
function mountChart(pair) {
  if (chartMounted || !pair) return;
  chartMounted = true;
  const url = `https://dexscreener.com/${pair.chainId}/${pair.pairAddress}` +
              `?embed=1&theme=dark&trades=0&info=0`;
  $('#chartbox').innerHTML =
    `<iframe src="${url}" title="Live ${TICK} price chart" loading="lazy"></iframe>`;
}

async function pollStats() {
  const status = $('#statsStatus');
  if (!MINT) { status.textContent = 'Contract address not configured.'; return; }

  try {
    const res = await fetch(
      `https://api.dexscreener.com/latest/dex/tokens/${MINT}`, { cache: 'no-store' }
    );
    const data = await res.json();
    const pairs = data && Array.isArray(data.pairs) ? data.pairs : [];

    if (!pairs.length) {
      status.textContent =
        'Still on the bonding curve — no liquidity pair indexed yet. ' +
        'Live numbers appear here automatically once it graduates.';
      status.classList.remove('is-live');
      return;
    }

    // Deepest-liquidity pair wins.
    const p = pairs.sort(
      (a, b) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0)
    )[0];

    setStat('mcap', fmtUsd(p.marketCap || p.fdv));
    setStat('vol',  fmtUsd(p.volume?.h24));

    const buys  = p.txns?.h24?.buys  || 0;
    const sells = p.txns?.h24?.sells || 0;
    if (buys + sells) {
      setStat('holders', fmtNum(buys + sells));
      $('.stat[data-k="holders"] .stat__l').textContent = '24H TRADES';
    }

    status.textContent =
      `Live from DEX Screener · updated ${new Date().toLocaleTimeString()} · ` +
      `wallets are not people`;
    status.classList.add('is-live');
    mountChart(p);
  } catch {
    status.textContent = 'Live feed unreachable right now. Check pump.fun for the real numbers.';
    status.classList.remove('is-live');
  }
}

function wireTimeServed() {
  if (!CFG.launchISO) return;                  // stays hidden until configured
  const t0 = Date.parse(CFG.launchISO);
  if (!isFinite(t0)) return;

  const tile = $('.stat[data-k="served"]');
  tile.hidden = false;

  const tickServed = () => {
    let s = Math.max(0, Math.floor((Date.now() - t0) / 1000));
    const d = Math.floor(s / 86400); s -= d * 86400;
    const h = Math.floor(s / 3600);  s -= h * 3600;
    const m = Math.floor(s / 60);    s -= m * 60;
    setStat('served', `${d}d ${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
  };
  tickServed();
  setInterval(tickServed, 1000);
}

/* ---------------------------------------------------------
   Raid kit — one-click posts
--------------------------------------------------------- */
const RAIDS = (CFG.raids && CFG.raids.length ? CFG.raids : ['{ticker} {ca}']);
let raidIdx = Math.floor(Math.random() * RAIDS.length);

function renderRaid() {
  const tags = (CFG.hashtags || []).map(t => '#' + t).join(' ');
  const text = RAIDS[raidIdx % RAIDS.length]
    .replaceAll('{ca}', MINT)
    .replaceAll('{ticker}', TICK)
    .replaceAll('{site}', SITE)
    .trim() + (tags ? '\n\n' + tags : '');

  $('#postText').textContent = text;
  $('#postX').href = 'https://x.com/intent/post?text=' + encodeURIComponent(text);
  return text;
}

function wireRaid() {
  renderRaid();
  $('#shuffle').addEventListener('click', () => {
    raidIdx = (raidIdx + 1) % RAIDS.length;
    renderRaid();
    $('#post').animate(
      [{ opacity: .25 }, { opacity: 1 }], { duration: 260, easing: 'ease-out' }
    );
  });
  $('#postCopy').addEventListener('click', () => copyText($('#postText').textContent, 'POST COPIED — GO MAKE NOISE'));
}

/* ---------------------------------------------------------
   Meme generator (all client-side)
--------------------------------------------------------- */
const MEME = (() => {
  const cv = $('#memeCanvas');
  if (!cv) return {};
  const ctx = cv.getContext('2d');
  const W = cv.width, H = cv.height;

  const sprite = new Image();
  sprite.src = 'assets/bibi.png';

  let scene = 'cell';
  let userImg = null;
  let ready = false;

  // Per-scene layout hints: light paper needs dark text, and scenes with
  // their own headline reserve vertical space so captions don't collide.
  const META = {
    cell:   { light: false, safeTop: 46 },
    mug:    { light: true,  safeTop: 200 },
    wanted: { light: true,  safeTop: 232 },
    court:  { light: false, safeTop: 46 },
    upload: { light: false, safeTop: 46 }
  };

  /* --- scene painters --- */
  const scenes = {
    cell() {
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#1a222c'); g.addColorStop(1, '#080b0f');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

      // brick courses
      ctx.strokeStyle = 'rgba(255,255,255,.045)'; ctx.lineWidth = 3;
      for (let y = 0; y < H; y += 72) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
        for (let x = (y / 72 % 2) * 72; x < W; x += 144) {
          ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + 72); ctx.stroke();
        }
      }
      // floor
      ctx.fillStyle = '#05080b'; ctx.fillRect(0, H * 0.82, W, H * 0.18);
      ctx.fillStyle = 'rgba(124,246,160,.07)'; ctx.fillRect(0, H * 0.82, W, 5);

      // bars in front
      ctx.fillStyle = '#0b0f14';
      for (let x = 40; x < W; x += 150) ctx.fillRect(x, 0, 26, H * 0.86);
      ctx.fillStyle = 'rgba(255,255,255,.07)';
      for (let x = 40; x < W; x += 150) ctx.fillRect(x, 0, 6, H * 0.86);
      ctx.fillStyle = '#0b0f14'; ctx.fillRect(0, H * 0.30, W, 20);
    },

    mug() {
      ctx.fillStyle = '#c9cdc7'; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#b3b8b1';
      for (let y = 60; y < H; y += 90) ctx.fillRect(0, y, W, 4);
      ctx.fillStyle = '#5c625c';
      ctx.font = 'bold 34px monospace';
      ctx.textAlign = 'left';
      let ft = 7;
      for (let y = 60; y < H && ft >= 1; y += 90) { ctx.fillText(`${ft}'`, 22, y - 12); ft--; }
      // board
      ctx.fillStyle = '#111'; ctx.fillRect(W * 0.06, H * 0.06, W * 0.40, 110);
      ctx.fillStyle = '#f0f0f0';
      ctx.font = 'bold 40px monospace';
      ctx.fillText('BIBI  #1948', W * 0.09, H * 0.06 + 68);
    },

    wanted() {
      ctx.fillStyle = '#e8dcb8'; ctx.fillRect(0, 0, W, H);
      // paper grain
      for (let i = 0; i < 2600; i++) {
        ctx.fillStyle = `rgba(120,95,50,${Math.random() * .07})`;
        ctx.fillRect(Math.random() * W, Math.random() * H, 3, 3);
      }
      ctx.strokeStyle = '#5a4526'; ctx.lineWidth = 12;
      ctx.strokeRect(26, 26, W - 52, H - 52);
      ctx.fillStyle = '#3d2f18';
      ctx.textAlign = 'center';
      ctx.font = 'bold 104px Georgia, serif';
      ctx.fillText('WANTED', W / 2, 138);
      ctx.font = 'bold 29px Georgia, serif';
      ctx.fillText('FOR CRIMES AGAINST A CIVILIAN POPULATION', W / 2, 184);
    },

    court() {
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#4a3520');
      g.addColorStop(1, '#241a10');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = 'rgba(0,0,0,.22)';
      for (let x = 0; x < W; x += 96) ctx.fillRect(x, 0, 6, H);
      // bench
      ctx.fillStyle = '#2c2015'; ctx.fillRect(0, H * 0.72, W, H * 0.28);
      ctx.fillStyle = '#3a2b1c'; ctx.fillRect(0, H * 0.72, W, 14);
      // seal
      ctx.strokeStyle = 'rgba(226,205,150,.42)';
      ctx.lineWidth = 9;
      ctx.beginPath(); ctx.arc(W / 2, H * 0.34, 190, 0, Math.PI * 2); ctx.stroke();
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(W / 2, H * 0.34, 168, 0, Math.PI * 2); ctx.stroke();
    },

    upload() {
      ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
      if (!userImg) {
        ctx.fillStyle = '#7cf6a0'; ctx.textAlign = 'center';
        ctx.font = 'bold 40px monospace';
        ctx.fillText('CHOOSE AN IMAGE', W / 2, H / 2);
        return;
      }
      const r = Math.max(W / userImg.width, H / userImg.height);
      const w = userImg.width * r, h = userImg.height * r;
      ctx.drawImage(userImg, (W - w) / 2, (H - h) / 2, w, h);
    }
  };

  /* --- meme text --- */
  function memeText(str, yTop, align, light) {
    if (!str.trim()) return;
    const txt = str.toUpperCase();
    let size = 82;
    ctx.textAlign = 'center';
    const fit = () => {
      ctx.font = `bold ${size}px Impact, 'Arial Black', 'Haettenschweiler', sans-serif`;
      return ctx.measureText(txt).width;
    };
    while (fit() > W - 90 && size > 30) size -= 3;

    // wrap if still long
    const words = txt.split(' ');
    const lines = []; let cur = '';
    for (const w of words) {
      const t = cur ? cur + ' ' + w : w;
      if (ctx.measureText(t).width > W - 90 && cur) { lines.push(cur); cur = w; }
      else cur = t;
    }
    if (cur) lines.push(cur);

    ctx.lineWidth = Math.max(6, size / 9);
    ctx.strokeStyle = light ? '#f4efe0' : '#000';
    ctx.fillStyle   = light ? '#1a1208' : '#fff';
    ctx.lineJoin = 'round';
    lines.forEach((ln, i) => {
      const y = align === 'top'
        ? yTop + size + i * (size * 1.08)
        : yTop - (lines.length - 1 - i) * (size * 1.08);
      ctx.strokeText(ln, W / 2, y);
      ctx.fillText(ln, W / 2, y);
    });
  }

  // Soft top/bottom scrim so captions stay legible over any artwork.
  function scrim(light) {
    const c = light ? '244,239,224' : '0,0,0';
    const top = ctx.createLinearGradient(0, 0, 0, H * 0.30);
    top.addColorStop(0, `rgba(${c},.45)`); top.addColorStop(1, `rgba(${c},0)`);
    ctx.fillStyle = top; ctx.fillRect(0, 0, W, H * 0.30);

    const bot = ctx.createLinearGradient(0, H, 0, H * 0.72);
    bot.addColorStop(0, `rgba(${c},.5)`); bot.addColorStop(1, `rgba(${c},0)`);
    ctx.fillStyle = bot; ctx.fillRect(0, H * 0.72, W, H * 0.28);
  }

  function watermark() {
    ctx.save();
    ctx.font = "bold 28px 'JetBrains Mono', monospace";
    ctx.textAlign = 'left';
    const label = `${TICK}  ·  jailbibi`;
    const w = ctx.measureText(label).width;
    const x = W - w - 46, y = H - 52;
    ctx.fillStyle = 'rgba(5,7,10,.82)';
    ctx.fillRect(x - 16, y - 6, w + 32, 44);
    ctx.strokeStyle = 'rgba(124,246,160,.45)'; ctx.lineWidth = 2;
    ctx.strokeRect(x - 16, y - 6, w + 32, 44);
    ctx.fillStyle = '#7cf6a0';
    ctx.fillText(label, x, y + 26);
    ctx.restore();
  }

  function draw() {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, W, H);
    (scenes[scene] || scenes.cell)();

    if (ready) {
      const pct   = +$('#mScale').value / 100;
      const posPc = +$('#mPos').value / 100;
      const flip  = $('#mFlip').checked;

      const h = H * pct;
      const w = h * (sprite.width / sprite.height);
      const x = 40 + posPc * (W - 80 - w);
      const y = H * 0.86 - h;

      ctx.save();
      ctx.imageSmoothingEnabled = false;
      ctx.shadowColor = 'rgba(0,0,0,.55)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 14;
      if (flip) { ctx.translate(x + w, y); ctx.scale(-1, 1); ctx.drawImage(sprite, 0, 0, w, h); }
      else      { ctx.drawImage(sprite, x, y, w, h); }
      ctx.restore();
    }

    const meta = META[scene] || META.cell;
    scrim(meta.light);
    memeText($('#mTop').value,    meta.safeTop, 'top',    meta.light);
    memeText($('#mBottom').value, H - 108,      'bottom', meta.light);
    watermark();
  }

  sprite.onload = () => { ready = true; draw(); };
  sprite.onerror = () => { ready = false; draw(); };

  /* --- controls --- */
  $$('#scenes .chip').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.dataset.scene === 'upload') { $('#mFile').click(); }
      $$('#scenes .chip').forEach(b => b.classList.toggle('is-on', b === btn));
      scene = btn.dataset.scene;
      draw();
    });
  });

  $('#mFile').addEventListener('change', e => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const img = new Image();
    img.onload = () => { userImg = img; scene = 'upload'; draw(); URL.revokeObjectURL(img.src); };
    img.src = URL.createObjectURL(f);
  });

  ['#mTop', '#mBottom', '#mScale', '#mPos', '#mFlip'].forEach(sel =>
    $(sel).addEventListener('input', draw));

  function filename() {
    return 'jailbibi-meme-' + Date.now() + '.png';
  }

  $('#mDownload').addEventListener('click', () => {
    try {
      const a = document.createElement('a');
      a.download = filename();
      a.href = cv.toDataURL('image/png');
      a.click();
      toast('SAVED — NOW POST IT');
    } catch {
      toast('SERVE THE SITE OVER HTTP TO EXPORT');
    }
  });

  $('#mCopyImg').addEventListener('click', async () => {
    try {
      const blob = await new Promise(r => cv.toBlob(r, 'image/png'));
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      toast('IMAGE COPIED — PASTE IT INTO YOUR POST');
    } catch {
      toast('BROWSER BLOCKED COPY — USE DOWNLOAD');
    }
  });

  draw();
  return { draw };
})();

/* ---------------------------------------------------------
   Easter egg: 10 clicks on the inmate = escape attempt
--------------------------------------------------------- */
function wireEasterEgg() {
  const walker = $('#walker');
  const cap = $('#escapeCap');
  if (!walker) return;
  let n = 0, cooling = false;

  walker.addEventListener('click', () => {
    if (cooling) return;
    n++;
    if (n < 10) {
      cap.textContent = `INMATE #1948 · ${10 - n} MORE TO TRY THE FENCE`;
      walker.animate([{ filter: 'brightness(2.2)' }, { filter: 'brightness(1)' }], 180);
      return;
    }
    n = 0; cooling = true;
    walker.classList.add('is-escaping');
    cap.textContent = 'ESCAPE ATTEMPT · IN PROGRESS…';
    toast('🚨 ESCAPE ATTEMPT DETECTED');
    setTimeout(() => {
      walker.classList.remove('is-escaping');
      cap.textContent = 'ESCAPE ATTEMPT FAILED · SENTENCE EXTENDED';
      cooling = false;
      setTimeout(() => { cap.textContent = 'INMATE #1948 · YARD TIME'; }, 4000);
    }, 1500);
  });
}

/* ---------------------------------------------------------
   Misc chrome
--------------------------------------------------------- */
function wireChrome() {
  const nav = $('#nav');
  $('#burger').addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    $('#burger').setAttribute('aria-expanded', String(open));
  });
  $$('.nav__links a').forEach(a =>
    a.addEventListener('click', () => nav.classList.remove('is-open')));

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
  }, { threshold: .12 });
  $$('.section .wrap > *, .hero__copy > *').forEach((el, i) => {
    el.classList.add('reveal');
    el.style.transitionDelay = Math.min(i * 40, 240) + 'ms';
    io.observe(el);
  });
}

/* ---------------------------------------------------------
   Boot
--------------------------------------------------------- */
wireConfig();
wireCopy();
wireRaid();
wireEasterEgg();
wireChrome();
wireTimeServed();
pollStats();
setInterval(pollStats, CFG.pollMs || 45000);

})();
