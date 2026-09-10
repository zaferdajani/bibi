/* ============================================================
   JAIL BIBI — site configuration
   Edit ONLY this file to point the site at your token/socials.
   ============================================================ */
window.JAIL = {
  // --- Token ---------------------------------------------------
  ticker: "JAIL",
  name: "JAIL BIBI",
  chain: "solana",
  mint: "9UBv9UkdL7aMmevPCAXoSRz8xXbHuiLXQuzNpCcTpump",

  // Exact mint time, ISO-8601 UTC, e.g. "2026-09-10T09:06:00Z".
  // Leave null and the "TIME SERVED" counter stays hidden.
  launchISO: null,

  // --- Links ---------------------------------------------------
  links: {
    pumpfun: "https://pump.fun/coin/9UBv9UkdL7aMmevPCAXoSRz8xXbHuiLXQuzNpCcTpump",
    dexscreener: "https://dexscreener.com/solana/9UBv9UkdL7aMmevPCAXoSRz8xXbHuiLXQuzNpCcTpump",
    solscan: "https://solscan.io/token/9UBv9UkdL7aMmevPCAXoSRz8xXbHuiLXQuzNpCcTpump",
    x: "",          // e.g. "https://x.com/jailbibi"
    telegram: "",   // e.g. "https://t.me/jailbibi"
    community: ""   // optional: Discord / Reddit
  },

  // Public site URL (used for share links + Open Graph).
  siteURL: "https://jailbibi.xyz",

  // --- Copy ----------------------------------------------------
  hashtags: ["JAILBIBI", "JAIL"],

  // Raid kit: posts holders can fire off in one click.
  // {ca} {ticker} {site} are substituted at render time.
  raids: [
    "The whole internet has an opinion. Almost nobody counts it.\n\n{ticker} is a counter.\n\nDo you think Netanyahu should face justice?\n\n{ca}",
    "Not a court. Not an election. Not a poll you scroll past.\n\nJust a number that goes up every time one more person says it out loud.\n\n{ticker} — {site}",
    "They keep asking \"who actually thinks that?\"\n\nFine. Let's count.\n\n{ticker} {ca}",
    "I'm not buying a chart. I'm signing my name to a sentence.\n\nJAIL BIBI. {ticker}\n\n{site}",
    "Every meme is a vote nobody tallies.\n\nThis one tallies. {ticker}\n\n{ca}",
    "Silence is free. Saying it costs you a click.\n\n{ticker} — how many of us are there? {site}",
    "8-bit. One question. No lawyers.\n\nShould Bibi go to jail? {ticker}\n\n{ca}",
    "The prosecution rests. The internet doesn't.\n\n{ticker} {site}"
  ],

  // Live-data polling interval (ms)
  pollMs: 45000
};
