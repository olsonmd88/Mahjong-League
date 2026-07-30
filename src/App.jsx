/*
  MAHJONG LEAGUE TRACKER — 2026 Season
  ======================================
  SETUP: Replace YOUR_SUPABASE_URL and YOUR_SUPABASE_ANON_KEY below,
  then: npm run build → drag dist/ to app.netlify.com/drop
*/

import { useState, useEffect, useCallback } from "react";

// ─── SUPABASE KEYS — fill these in ───────────────────────────────────────────
const SUPABASE_URL = "https://oorjauvqfiwjglpmgeqp.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vcmphdXZxZml3amdscG1nZXFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxODQwMDgsImV4cCI6MjA5MTc2MDAwOH0.07HYprBj6COR73vs3JexBlCnj4eOOX_W1L93Q54oBpE";
const _url = (SUPABASE_URL || "").trim();
const _key = (SUPABASE_KEY || "").trim();
const USE_SUPABASE = (
  _url.length > 10 && _key.length > 10 &&
  !_url.includes("YOUR_") && !_key.includes("YOUR_") &&
  _url.startsWith("https://")
);

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const ACCESS_CODE   = "birdbam";
const ADMIN_NAME    = "Michelle";
const TOTAL_WEEKS   = 12;
const TOP_GAMES     = 20;
const STORY_CHAR_LIMIT = 1000;
const STORAGE_BUCKET   = "story-notes"; // Supabase Storage bucket — must be created manually
const DEFAULT_PLAYERS = ["Abbey","Alexa","Alyssa","Anna","Dixie","Ellen","Erica","Michelle","Zoe"];
const WEEK_DATES = [
  "2026-04-22","2026-05-06","2026-05-20","2026-06-03","2026-06-17","2026-07-01",
  "2026-07-15","2026-07-29","2026-08-12","2026-08-26","2026-09-09","2026-09-23",
];
const CARD_2026 = {
  "2026":            ["Line 1","Line 2","Line 3","Line 4"],
  "2468":            ["Line 1","Line 2","Line 3","Line 4","Line 5","Line 6","Line 7","Line 8"],
  "Any Like Numbers":["Line 1","Line 2","Line 3"],
  "Consecutive Run": ["Line 1","Line 2","Line 3","Line 4","Line 5","Line 6","Line 7","Line 8"],
  "13579":           ["Line 1","Line 2","Line 3","Line 4","Line 5","Line 6","Line 7","Line 8","Line 9"],
  "Winds & Dragons": ["Line 1","Line 2","Line 3","Line 4","Line 5","Line 6","Line 7","Line 8"],
  "369":             ["Line 1","Line 2","Line 3","Line 4","Line 5","Line 6"],
  "Singles & Pairs": ["Line 1","Line 2","Line 3","Line 4","Line 5","Line 6"],
  "Quints":          ["Line 1","Line 2","Line 3"],
};
const CHALLENGES = [
  {week:1,  desc:"First Mahjong of the night",                        tileWall:false},
  {week:2,  desc:"Mahjong with Dragons",                              tileWall:false},
  {week:3,  desc:"Mahjong with Winds",                                tileWall:false},
  {week:4,  desc:"Mahjong with Flowers",                              tileWall:false},
  {week:5,  desc:"Mahjong from Evens section (2468)",                 tileWall:false},
  {week:6,  desc:"Mahjong from Odds section (13579)",                 tileWall:false},
  {week:7,  desc:"Mahjong with less than 10 tiles on the wall",       tileWall:true },
  {week:8,  desc:"Mahjong with at least 2 pairs",                     tileWall:false},
  {week:9,  desc:"Mahjong with 3 different tile families",            tileWall:false},
  {week:10, desc:"Mahjong from the top row of any section",           tileWall:false},
  {week:11, desc:"Closest to Mahjong without winning (2-game total)", tileWall:false},
  {week:12, desc:"Mahjong from 2026 section",                         tileWall:false},
];

// ─── PALETTE ──────────────────────────────────────────────────────────────────
const C = {
  rose:"#E8799A", roseDark:"#C45575", petal:"#FFF0F5", sakura:"#FFD6E5",
  goldLight:"#FFF3DC", mint:"#B8E4D8", mintDark:"#3D9E84",
  lavender:"#D4C5F0", lavDark:"#7B5EA7",
  text:"#3D1F2E", textMid:"#7A4A5E", textSoft:"#B07A90",
  border:"#F0C8D8", white:"#FFFBFD",
};
const PCOLS = ["#E8799A","#7B5EA7","#3D9E84","#E8B86D","#C45575","#5B8ED6","#D4845A","#8AAB5B","#B07A90","#6B9ED4"];
const pcol  = (n, pl) => PCOLS[Math.max(0,(pl||DEFAULT_PLAYERS).indexOf(n)) % PCOLS.length];
const ini   = n => (n||"??").slice(0,2).toUpperCase();
const fmt   = d => {
  if (!d) return "";
  try { const [,m,dy]=d.split("-"); return ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][+m-1]+" "+Number(dy); }
  catch { return d; }
};

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&family=Playfair+Display:ital,wght@1,500&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
body{background:#FDF0F5;font-family:Nunito,sans-serif;color:#3D1F2E;}
input,select,textarea,button{font-family:Nunito,sans-serif;}
input,select,textarea{background:#FFFBFD;color:#3D1F2E;border:1.5px solid #F0C8D8;border-radius:10px;padding:8px 12px;font-size:14px;width:100%;outline:none;transition:border-color .2s;}
input:focus,select:focus,textarea:focus{border-color:#E8799A;}
button{cursor:pointer;}
.pill{display:inline-flex;align-items:center;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;}
.fa{animation:fi .3s ease;}
@keyframes fi{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
::-webkit-scrollbar{width:5px;}::-webkit-scrollbar-thumb{background:#F5C4D0;border-radius:3px;}
nav-row::-webkit-scrollbar{display:none;}
`;

// ─── CURRENT WEEK HELPER ──────────────────────────────────────────────────────
// Returns the 1-based week number that is "current" based on today's date.
// Logic: use the first week whose date is today or in the future.
// If all weeks are in the past, return the last week.
// Weeks use their stored dates if available, falling back to WEEK_DATES.
function getCurrentWeek(weeks) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dates = (weeks || []).map((w, i) => w.date || WEEK_DATES[i] || "");
  for (let i = 0; i < dates.length; i++) {
    if (!dates[i]) continue;
    const d = new Date(dates[i] + "T00:00:00");
    if (d >= today) return i + 1;
  }
  return dates.length || 1; // all in the past → last week
}


// Always returns a fully-formed, guaranteed-safe state object.
// Called whenever localStorage is empty OR returns corrupted/old data.
function mkDefault() {
  return {
    players: [...DEFAULT_PLAYERS],
    weeks: Array.from({length:TOTAL_WEEKS}, (_,i) => ({
      week: i+1,
      location: "",
      date: WEEK_DATES[i] || "",
      rsvps: Object.fromEntries(DEFAULT_PLAYERS.map(p => [p,"pending"])),
      tables: [],
      games: [],
      challengeWinners: [],
      challengePot: 5,
      stories: {},
      recap: { draftText: "", publishedText: null, status: "none" },
    })),
    seasonSettings: { topGames: TOP_GAMES },
    seasonPayouts: { first: 400, second: 150, third: 75, fourth: 0 },
    challengeAwardPrize: 10,
    seasonAwards: [
      {id:"concealed", label:"First concealed hand Mahjong",    prize:10, winner:null},
      {id:"sections",  label:"Most sections/lines covered",     prize:10, winner:null, auto:true},
      {id:"risk",      label:"Risk Taker – highest hand value", prize:10, winner:null, auto:true},
    ],
    currentUser: null,
    loggedIn: false,
  };
}

// Validate that a loaded state object has all required top-level keys.
// If anything looks wrong, return a fresh default instead of crashing.
function validateState(raw) {
  try {
    if (!raw || typeof raw !== "object") return mkDefault();
    if (!Array.isArray(raw.weeks) || raw.weeks.length === 0) return mkDefault();
    if (!Array.isArray(raw.players) || raw.players.length === 0) return mkDefault();
    if (!raw.seasonSettings || typeof raw.seasonSettings !== "object") raw.seasonSettings = {topGames:TOP_GAMES};
    if (!raw.seasonPayouts || typeof raw.seasonPayouts !== "object") raw.seasonPayouts = {first:400, second:150, third:75, fourth:0};
    if (typeof raw.challengeAwardPrize !== "number") raw.challengeAwardPrize = 10;
    if (!Array.isArray(raw.seasonAwards)) raw.seasonAwards = mkDefault().seasonAwards;
    // Ensure risk award has auto:true
    raw.seasonAwards = raw.seasonAwards.map(a => a.id === "risk" ? {...a, auto:true} : a);
    // Ensure every week has required fields
    raw.weeks = raw.weeks.map((w,i) => ({
      week: w.week || i+1,
      location: w.location || "",
      date: w.date || WEEK_DATES[i] || "",
      rsvps: w.rsvps && typeof w.rsvps === "object" ? w.rsvps : Object.fromEntries((raw.players||DEFAULT_PLAYERS).map(p=>[p,"pending"])),
      tables: Array.isArray(w.tables) ? w.tables : [],
      games: Array.isArray(w.games) ? w.games : [],
      challengeWinners: Array.isArray(w.challengeWinners) ? w.challengeWinners : [],
      challengePot: typeof w.challengePot === "number" ? w.challengePot : 5,
      stories: migrateStories(w.stories),
      recap: w.recap && typeof w.recap === "object" ? w.recap : { draftText:"", publishedText:null, status:"none" },
    }));
    return raw;
  } catch {
    return mkDefault();
  }
}

// Upgrades a week's stories object so every entry has a `media: [{url,type}]` array.
// Older entries only had a single `noteImageUrl` string — those get folded into
// `media` as a one-item image entry so old data keeps displaying correctly.
function migrateStories(stories) {
  if (!stories || typeof stories !== "object") return {};
  const out = {};
  Object.entries(stories).forEach(([player, s]) => {
    if (!s || typeof s !== "object") return;
    let media = Array.isArray(s.media) ? s.media : [];
    if (media.length === 0 && s.noteImageUrl) {
      media = [{ url: s.noteImageUrl, type: "image" }];
    }
    out[player] = { text: s.text || "", media, submittedAt: s.submittedAt || null };
  });
  return out;
}

// ─── STORAGE ──────────────────────────────────────────────────────────────────
function loadLocal() {
  try {
    // Try current version first
    let raw = JSON.parse(localStorage.getItem("mj26_v8") || "null");
    if (raw) return validateState({...raw});
    // Also try migrating from v7
    let v7 = JSON.parse(localStorage.getItem("mj26_v7") || "null");
    if (v7) return validateState({...v7});
    // Ignore any older versions — start fresh to avoid stale schema crashes
    return null;
  } catch { return null; }
}
function saveLocal(d) {
  try { localStorage.setItem("mj26_v8", JSON.stringify(d)); } catch {}
}

async function sbFetch() {
  if (!USE_SUPABASE) return null;
  try {
    const r = await fetch(`${_url}/rest/v1/league_state?id=eq.singleton&select=data`, {
      headers: {"apikey":_key, "Authorization":`Bearer ${_key}`, "Content-Type":"application/json"}
    });
    if (!r.ok) { console.error("sbFetch HTTP", r.status); return null; }
    const rows = await r.json();
    const data = rows?.[0]?.data;
    if (!data || Object.keys(data).length === 0) return null;
    return validateState(data);
  } catch(e) { console.error("sbFetch", e); return null; }
}

async function sbSave(state) {
  if (!USE_SUPABASE) return false;
  try {
    const payload = {...state, currentUser:null, loggedIn:false};
    const r = await fetch(`${_url}/rest/v1/league_state`, {
      method: "POST",
      headers: {"apikey":_key,"Authorization":`Bearer ${_key}`,"Content-Type":"application/json","Prefer":"resolution=merge-duplicates"},
      body: JSON.stringify({id:"singleton", data:payload, updated_at:new Date().toISOString()}),
    });
    if (!r.ok) { console.error("sbSave HTTP", r.status, await r.text()); return false; }
    return true;
  } catch(e) { console.error("sbSave", e); return false; }
}

// Uploads an image OR video file to Supabase Storage and returns its public URL, or null
// on failure. Requires a PUBLIC bucket named STORAGE_BUCKET to exist already, with an
// INSERT policy allowing writes (see Admin > Supabase tab notes). No x-upsert — filenames
// are unique via timestamp, and upsert would additionally require an UPDATE policy to
// satisfy Postgres RLS. A distinct random suffix is added so multiple files uploaded in
// the same millisecond (e.g. a multi-select batch) never collide on path.
async function sbUploadMedia(file, weekNum, playerName) {
  if (!USE_SUPABASE || !file) return null;
  try {
    const ext  = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g,"") || "jpg";
    const safe = (playerName || "player").replace(/[^a-zA-Z0-9]/g,"_");
    const rand = Math.random().toString(36).slice(2, 8);
    const path = `week${weekNum}/${safe}_${Date.now()}_${rand}.${ext}`;
    const r = await fetch(`${_url}/storage/v1/object/${STORAGE_BUCKET}/${path}`, {
      method: "POST",
      headers: {
        "apikey": _key,
        "Authorization": `Bearer ${_key}`,
        "Content-Type": file.type || "image/jpeg",
      },
      body: file,
    });
    if (!r.ok) { console.error("sbUploadMedia HTTP", r.status, await r.text()); return null; }
    const url = `${_url}/storage/v1/object/public/${STORAGE_BUCKET}/${path}`;
    const type = (file.type || "").startsWith("video/") ? "video" : "image";
    return { url, type };
  } catch(e) { console.error("sbUploadMedia", e); return null; }
}

// Deletes a previously uploaded file from Supabase Storage, given its public URL
// (as returned by sbUploadMedia). Used by the admin to permanently remove a
// photo/video someone attached to their story. Returns true on success — if the
// DELETE request fails (or Supabase isn't configured), the caller should still
// be able to remove the item from the story's data, since a dangling file in
// storage is harmless but a broken reference in the UI is not.
async function sbDeleteMedia(url) {
  if (!USE_SUPABASE || !url) return false;
  try {
    const marker = `/storage/v1/object/public/${STORAGE_BUCKET}/`;
    const idx = url.indexOf(marker);
    if (idx === -1) return false; // not a URL from our bucket — nothing to delete
    const path = url.slice(idx + marker.length);
    const r = await fetch(`${_url}/storage/v1/object/${STORAGE_BUCKET}/${path}`, {
      method: "DELETE",
      headers: {"apikey":_key, "Authorization":`Bearer ${_key}`},
    });
    if (!r.ok) { console.error("sbDeleteMedia HTTP", r.status, await r.text()); return false; }
    return true;
  } catch(e) { console.error("sbDeleteMedia", e); return false; }
}

// ─── STATS ────────────────────────────────────────────────────────────────────
// Fully defensive — handles empty/null inputs gracefully, returns zeroed stats
// for every player even if no games have been played yet.
function computeStats(weeks, players, settings) {
  const safeWeeks   = Array.isArray(weeks)   ? weeks   : [];
  const safePlayers = Array.isArray(players) ? players : [];
  const topN        = settings?.topGames || TOP_GAMES;

  const s = {};
  safePlayers.forEach(p => {
    s[p] = {
      totalGames:0, threePersonGames:0, allGames:[],
      topScore:0, highestHand:0, highestHandBonus:0,
      countingGames:[], droppedGames:[], sections:new Set(), sectionsArr:[],
      sectionsCount:0,
    };
  });

  safeWeeks.forEach(w => {
    if (!w) return;
    (w.games || []).forEach(g => {
      if (!g) return;
      const ps = Array.isArray(g.players) ? g.players : [];
      ps.forEach(p => {
        if (!s[p]) return;
        const r = (g.results && g.results[p]) ? g.results[p] : {};
        const pts = typeof r.points === "number" ? r.points : 0;
        s[p].allGames.push({
          points: pts, week: w.week, id: g.id || "",
          section: r.section || "", line: r.line || "",
          handValue: r.handValue || 0, jokersUsed: !!r.jokersUsed,
        });
        s[p].totalGames++;
        if (ps.length === 3) s[p].threePersonGames++;
        if (r.section && r.line) {
          const key = r.section + "§" + r.line;
          if (!s[p].sections.has(key)) {
            s[p].sections.add(key);
            s[p].sectionsArr.push({section:r.section, line:r.line});
          }
        }
        const eff = (r.handValue||0) + (!r.jokersUsed && r.handValue ? 10 : 0);
        if (eff > s[p].highestHandBonus) {
          s[p].highestHandBonus = eff;
          s[p].highestHand = r.handValue || 0;
        }
      });
    });
  });

  safePlayers.forEach(p => {
    const sorted = [...s[p].allGames].sort((a,b) => b.points - a.points);
    s[p].countingGames = sorted.slice(0, topN);
    s[p].droppedGames  = sorted.slice(topN);
    s[p].topScore      = s[p].countingGames.reduce((t,g) => t + g.points, 0);
    s[p].totalPoints   = s[p].allGames.reduce((t,g) => t + g.points, 0);
    s[p].ppg           = s[p].totalGames > 0 ? s[p].totalPoints / s[p].totalGames : 0;
    s[p].sectionsCount = s[p].sections.size;
  });

  return s;
}

// Builds a compact, single-week summary (not season-cumulative) to send to the
// recap-generation function — keeps the payload small and scoped to just this week.
function buildWeekStatsSummary(week) {
  const games = week.games || [];
  return {
    week: week.week,
    date: week.date,
    location: week.location,
    challenge: CHALLENGES[week.week-1]?.desc || "",
    challengeWinners: (week.challengeWinners||[]).filter(x=>x!=="__rollover__"),
    challengePot: week.challengePot || 5,
    games: games.map(g => ({
      type: g.type,
      winner: g.winner,
      players: g.players,
      results: Object.fromEntries(Object.entries(g.results||{}).map(([p,r]) => [p, {
        points: r.points, section: r.section, line: r.line, handValue: r.handValue, jokersUsed: r.jokersUsed,
      }])),
    })),
  };
}

// ─── TABLE ASSIGNMENT ─────────────────────────────────────────────────────────
// Priority 1: 3-person balance — players with LESS 3P experience go to 3-person
//             tables; those with MORE go to 4-person tables.
// Priority 2: pair-frequency balance — within each table, prefer groupings of
//             players who have played together the fewest times.
// Guarantees: all tables are 3 or 4 players (never 2 or less).
function assignTables(attending, stats, shuffleSeed, weeks) {

  // ── helpers ──────────────────────────────────────────────────────────────────
  const seed = shuffleSeed || 1;
  function seededShuffle(arr) {
    const a = [...arr];
    let s = seed;
    for (let i = a.length - 1; i > 0; i--) {
      s = (s * 1664525 + 1013904223) & 0xffffffff;
      const j = Math.abs(s) % (i + 1);
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  if (!Array.isArray(attending) || attending.length < 3) return [];
  const n = attending.length;

  // ── step 1: solve 4a + 3b = n with no tables < 3 ─────────────────────────
  // We want to MINIMISE 3-person tables (they're the exception, not the rule)
  // so we iterate a downward from floor(n/4) to find the first valid split.
  let num4P = 0, num3P = 0;
  let solved = false;
  for (let a = Math.floor(n / 4); a >= 0; a--) {
    const rem = n - 4 * a;
    if (rem >= 0 && rem % 3 === 0) {
      num4P = a;
      num3P = rem / 3;
      solved = true;
      break;
    }
  }
  // n=5 (and any other unsolvable): fall back to one table of the whole group
  if (!solved) return [seededShuffle(attending)];

  // ── step 2: build pair-play-count matrix from game history ───────────────
  const pairCount = {};  // "A|B" → number of games played together
  const pairKey = (a, b) => [a, b].sort().join("|");
  (weeks || []).forEach(w => {
    (w.games || []).forEach(g => {
      const ps = Array.isArray(g.players) ? g.players : [];
      for (let i = 0; i < ps.length; i++)
        for (let j = i + 1; j < ps.length; j++) {
          const k = pairKey(ps[i], ps[j]);
          pairCount[k] = (pairCount[k] || 0) + 1;
        }
    });
  });
  const getPairCount = (a, b) => pairCount[pairKey(a, b)] || 0;

  // ── step 3: sort pool by 3P% ascending so LEAST experienced go to 3P tables
  // (the tail of this sorted list fills the 3-person slots)
  const sorted = [...attending].sort((a, b) => {
    const ra = stats[a]?.totalGames > 0 ? stats[a].threePersonGames / stats[a].totalGames : 0;
    const rb = stats[b]?.totalGames > 0 ? stats[b].threePersonGames / stats[b].totalGames : 0;
    return ra - rb; // ascending: least 3P experience first
  });

  // Players with the LEAST 3P experience → 3-person tables
  // Players with the MOST 3P experience  → 4-person tables
  const for3P = sorted.slice(0, num3P * 3);
  const for4P = sorted.slice(num3P * 3);

  // ── step 4: within each pool, heavily prioritise pair-frequency ───────────
  // Pair-plays are SQUARED so repeat pairings (especially 2nd/3rd meetings)
  // are penalised much more than a single prior meeting — this is the "fewest
  // games played together" priority, weighted more strongly than before.
  function pairPenalty(a, b) {
    const c = getPairCount(a, b);
    return c * c;
  }
  function tablePairScore(members) {
    let score = 0;
    for (let i = 0; i < members.length; i++)
      for (let j = i + 1; j < members.length; j++)
        score += pairPenalty(members[i], members[j]);
    return score;
  }

  // Greedy: pick the first player, then repeatedly pick the next player who
  // minimises total pair-penalty with already-chosen members.
  function greedyAssignOnce(pool, tableSize, runSeed) {
    let s = runSeed;
    function localShuffle(arr) {
      const a = [...arr];
      for (let i = a.length - 1; i > 0; i--) {
        s = (s * 1664525 + 1013904223) & 0xffffffff;
        const j = Math.abs(s) % (i + 1);
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    }
    const tables = [];
    let remaining = localShuffle(pool); // shuffle first for variety
    while (remaining.length >= tableSize) {
      const table = [remaining[0]];
      remaining = remaining.slice(1);
      while (table.length < tableSize) {
        // Score each candidate by pair-penalty with current table members
        let bestIdx = 0;
        let bestScore = Infinity;
        for (let i = 0; i < remaining.length; i++) {
          let score = 0;
          for (const m of table) score += pairPenalty(m, remaining[i]);
          if (score < bestScore) { bestScore = score; bestIdx = i; }
        }
        table.push(remaining[bestIdx]);
        remaining = remaining.filter((_, i) => i !== bestIdx);
      }
      tables.push(table);
    }
    // If any leftover (shouldn't happen with correct math, but be safe), distribute
    remaining.forEach((p, i) => { if (tables[i % tables.length]) tables[i % tables.length].push(p); });
    return tables;
  }

  // Run several shuffled trials per pool and keep the arrangement with the
  // LOWEST total pair-penalty — a single greedy pass can get stuck with a
  // mediocre starting player, so this searches harder for the best grouping
  // by fewest-games-played-together, while "Try another" still varies seeds.
  const TRIALS = 20;
  function bestAssign(pool, tableSize) {
    if (!pool.length) return [];
    let best = null, bestScore = Infinity;
    for (let t = 0; t < TRIALS; t++) {
      const trialSeed = (seed + t * 97 + tableSize * 131) & 0xffffffff;
      const tables = greedyAssignOnce(pool, tableSize, trialSeed || 1);
      const score = tables.reduce((tot, tab) => tot + tablePairScore(tab), 0);
      if (score < bestScore) { bestScore = score; best = tables; }
    }
    return best;
  }

  const tables3P = num3P > 0 ? bestAssign(for3P, 3) : [];
  const tables4P = num4P > 0 ? bestAssign(for4P, 4) : [];

  return [...tables4P, ...tables3P];
}

// ─── SHARED UI COMPONENTS ─────────────────────────────────────────────────────
function Card({children, style={}, pad="1.25rem"}) {
  return (
    <div className="fa" style={{background:C.white,borderRadius:16,border:`1.5px solid ${C.border}`,padding:pad,boxShadow:"0 2px 12px rgba(196,85,117,.08)",...style}}>
      {children}
    </div>
  );
}
function STitle({children, mb=14}) {
  return <div style={{fontFamily:"Playfair Display,serif",fontSize:18,color:C.roseDark,marginBottom:mb,fontStyle:"italic"}}>{children}</div>;
}
function Av({name, players, size=30}) {
  const bg = pcol(name || "", players);
  return (
    <div style={{width:size,height:size,borderRadius:"50%",background:bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*.36,fontWeight:700,color:"#fff",flexShrink:0,border:"2px solid rgba(255,255,255,.7)"}}>
      {ini(name)}
    </div>
  );
}
function WkPicker({active, set}) {
  return (
    <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:16}}>
      {Array.from({length:TOTAL_WEEKS},(_,i)=>i+1).map(w => (
        <button key={w} onClick={()=>set(w)} style={{width:30,height:30,borderRadius:8,border:w===active?`2px solid ${C.rose}`:`1.5px solid ${C.border}`,background:w===active?C.sakura:C.white,color:w===active?C.roseDark:C.textMid,fontSize:12,fontWeight:w===active?700:500}}>
          {w}
        </button>
      ))}
    </div>
  );
}

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
export default function App() {
  const [st, setSt]             = useState(() => loadLocal() || mkDefault());
  const [view, setView]         = useState("login");
  const [activeWeek, setAW]     = useState(() => getCurrentWeek((loadLocal() || mkDefault()).weeks));
  const [syncStatus, setSync]   = useState("idle");

  // Safe updater: validates result before storing
  const upd = useCallback(fn => {
    setSt(prev => {
      try {
        const next = validateState(typeof fn === "function" ? fn(prev) : fn);
        saveLocal(next);
        if (USE_SUPABASE) {
          setSync("saving");
          sbSave(next).then(ok => {
            setSync(ok ? "saved" : "error");
            setTimeout(() => setSync("idle"), 2500);
          });
        }
        return next;
      } catch(e) {
        console.error("upd error:", e);
        return prev;
      }
    });
  }, []);

  // Load from Supabase on mount
  useEffect(() => {
    if (!USE_SUPABASE) return;
    setSync("saving");
    sbFetch().then(remote => {
      if (remote) {
        const local = loadLocal();
        setSt({...remote, currentUser: local?.currentUser || null, loggedIn: local?.loggedIn || false});
        saveLocal({...remote, currentUser: local?.currentUser || null, loggedIn: local?.loggedIn || false});
      }
      setSync("idle");
    });
  }, []);

  // Poll every 20s for other players' changes
  useEffect(() => {
    if (!USE_SUPABASE) return;
    const id = setInterval(() => {
      sbFetch().then(remote => {
        if (!remote) return;
        setSt(prev => {
          const merged = {...remote, currentUser:prev.currentUser, loggedIn:prev.loggedIn};
          saveLocal(merged);
          return merged;
        });
      });
    }, 20000);
    return () => clearInterval(id);
  }, []);

  // Route to login if not logged in
  useEffect(() => {
    if (!st.loggedIn) setView("login");
    else if (view === "login") setView("dashboard");
  }, [st.loggedIn]);

  // Always safe — validated on the way in
  const players = [...(st.players || DEFAULT_PLAYERS)].sort((a,b) => a.localeCompare(b));
  const weeks   = st.weeks || [];
  const stats   = computeStats(weeks, players, st.seasonSettings);
  const isAdmin = st.currentUser === ADMIN_NAME;

  if (!st.loggedIn) {
    return (
      <>
        <style>{CSS}</style>
        <Login onLogin={(code,name) => {
          if (code !== ACCESS_CODE) return false;
          upd(s => ({...s, loggedIn:true, currentUser:name}));
          return true;
        }} players={players}/>
      </>
    );
  }

  const nav = [
    {id:"dashboard", label:"✦ Home"},
    {id:"standings",  label:"🏆 Standings"},
    {id:"weekly",     label:"📅 Weekly"},
    {id:"log",        label:"🀄 Log Game"},
    {id:"challenges", label:"⭐ Challenges"},
    {id:"gallery",    label:"📷 Photos"},
    {id:"rules",      label:"📖 Rules"},
    ...(isAdmin ? [{id:"admin", label:"⚙ Admin"}] : []),
  ];

  return (
    <>
      <style>{CSS}</style>
      <div style={{minHeight:"100vh",background:"linear-gradient(160deg,#FDF0F5 0%,#FFF8F0 100%)"}}>
        <header style={{background:`linear-gradient(90deg,${C.roseDark},${C.lavDark})`,position:"sticky",top:0,zIndex:100,boxShadow:"0 2px 16px rgba(196,85,117,.25)"}}>
          {/* Row 1: title + sync chip + user */}
          <div style={{display:"flex",alignItems:"center",padding:"0 1rem",height:46,gap:10}}>
            <span style={{fontFamily:"Playfair Display,serif",color:"#fff",fontSize:18,fontStyle:"italic",flexShrink:0}}>Mahjong League '26</span>
            {syncStatus==="saving" && <span style={{fontSize:10,color:"rgba(255,255,255,.85)",background:"rgba(255,255,255,.15)",padding:"2px 8px",borderRadius:10,flexShrink:0}}>saving…</span>}
            {syncStatus==="saved"  && <span style={{fontSize:10,color:"#fff",background:"rgba(80,200,130,.4)",padding:"2px 8px",borderRadius:10,flexShrink:0}}>✓ saved</span>}
            {syncStatus==="error"  && <span style={{fontSize:10,color:"#FFD6E5",background:"rgba(220,80,80,.35)",padding:"2px 8px",borderRadius:10,flexShrink:0}}>⚠ sync error</span>}
            {!USE_SUPABASE && <span style={{fontSize:10,color:"rgba(255,220,100,.95)",background:"rgba(255,200,80,.2)",padding:"2px 8px",borderRadius:10,flexShrink:0}}>local only</span>}
            <div style={{display:"flex",alignItems:"center",gap:6,marginLeft:"auto",flexShrink:0}}>
              <Av name={st.currentUser} players={players} size={26}/>
              <span style={{color:"rgba(255,255,255,.85)",fontSize:12,fontWeight:600}}>{st.currentUser}</span>
              <button onClick={()=>upd(s=>({...s,loggedIn:false,currentUser:null}))} style={{background:"rgba(255,255,255,.15)",border:"none",color:"#fff",fontSize:11,padding:"3px 10px",borderRadius:8,fontWeight:600}}>Sign out</button>
            </div>
          </div>
          {/* Row 2: nav tabs */}
          <div style={{display:"flex",overflowX:"auto",borderTop:"1px solid rgba(255,255,255,.15)"}}>
            {nav.map(n => (
              <button key={n.id} onClick={()=>{
                setView(n.id);
                if (["weekly","log","challenges"].includes(n.id)) setAW(getCurrentWeek(weeks));
              }} style={{background:view===n.id?"rgba(255,255,255,.2)":"transparent",color:"#fff",border:"none",borderBottom:view===n.id?"3px solid #fff":"3px solid transparent",padding:"10px 14px",fontSize:12,fontWeight:view===n.id?700:500,whiteSpace:"nowrap",flexShrink:0,transition:"all .15s"}}>
                {n.label}
              </button>
            ))}
          </div>
        </header>
        <main style={{maxWidth:980,margin:"0 auto",padding:"1.5rem 1rem"}}>
          {view==="dashboard"  && <Dashboard stats={stats} weeks={weeks} settings={st.seasonSettings} awards={st.seasonAwards||[]} players={players} payouts={st.seasonPayouts||{first:400,second:150,third:75}} setView={setView} setAW={setAW}/>}
          {view==="standings"  && <Standings stats={stats} settings={st.seasonSettings} players={players}/>}
          {view==="weekly"     && <Weekly weeks={weeks} activeWeek={activeWeek} setAW={setAW} upd={upd} stats={stats} currentUser={st.currentUser} isAdmin={isAdmin} players={players}/>}
          {view==="log"        && <LogGame weeks={weeks} activeWeek={activeWeek} setAW={setAW} upd={upd} currentUser={st.currentUser} players={players}/>}
          {view==="challenges" && <Challenges weeks={weeks} upd={upd} isAdmin={isAdmin} currentUser={st.currentUser} players={players}/>}
          {view==="gallery"    && <Gallery weeks={weeks} players={players} isAdmin={isAdmin} upd={upd}/>}
          {view==="rules"      && <Rules/>}
          {view==="admin"      && isAdmin && <Admin st={st} upd={upd} stats={stats} players={players}/>}
        </main>
      </div>
    </>
  );
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────
function Login({onLogin, players}) {
  const [code,setCode] = useState("");
  const [name,setName] = useState("");
  const [err,setErr]   = useState("");
  const sorted = [...(players||DEFAULT_PLAYERS)].sort((a,b)=>a.localeCompare(b));
  function go() {
    if (!name) { setErr("Please select your name"); return; }
    if (!onLogin(code, name)) setErr("Incorrect access code");
  }
  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(145deg,#F5C4D0,#D4C5F0,#FFD6E5)",display:"flex",alignItems:"center",justifyContent:"center",padding:"1rem"}}>
      <div style={{background:"rgba(255,251,253,.95)",backdropFilter:"blur(12px)",borderRadius:24,padding:"2.5rem 2rem",width:"100%",maxWidth:380,boxShadow:"0 8px 40px rgba(196,85,117,.2)",border:`1.5px solid ${C.border}`}}>
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{fontSize:52,marginBottom:8}}>🀄</div>
          <div style={{fontFamily:"Playfair Display,serif",fontSize:26,color:C.roseDark,fontStyle:"italic"}}>Mahjong League</div>
          <div style={{fontSize:12,color:C.textSoft,marginTop:4,fontWeight:700,letterSpacing:"1px",textTransform:"uppercase"}}>2026 Season</div>
        </div>
        <div style={{marginBottom:14}}>
          <label style={{fontSize:11,fontWeight:700,color:C.textMid,display:"block",marginBottom:6,letterSpacing:".5px",textTransform:"uppercase"}}>Who are you?</label>
          <select value={name} onChange={e=>setName(e.target.value)}>
            <option value="">Select your name…</option>
            {sorted.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div style={{marginBottom:20}}>
          <label style={{fontSize:11,fontWeight:700,color:C.textMid,display:"block",marginBottom:6,letterSpacing:".5px",textTransform:"uppercase"}}>Access code</label>
          <input type="password" value={code} onChange={e=>setCode(e.target.value)} onKeyDown={e=>e.key==="Enter"&&go()} placeholder="Enter code…"/>
        </div>
        {err && <div style={{color:C.roseDark,fontSize:12,marginBottom:12,fontWeight:700}}>{err}</div>}
        <button onClick={go} style={{width:"100%",background:`linear-gradient(90deg,${C.roseDark},${C.lavDark})`,color:"#fff",border:"none",borderRadius:12,padding:"12px",fontSize:15,fontWeight:700,boxShadow:"0 4px 16px rgba(196,85,117,.3)"}}>
          Enter the League ✦
        </button>
      </div>
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({stats, weeks, settings, awards, players, payouts, setView, setAW}) {
  const safePlayers = players || [];
  const safeWeeks   = weeks   || [];
  const safeAwards  = awards  || [];
  const safePayouts = payouts || {first:400, second:150, third:75, fourth:0};

  const sorted      = [...safePlayers].sort((a,b) => (stats[b]?.ppg||0) - (stats[a]?.ppg||0));
  const gamesLogged = safeWeeks.reduce((t,w) => t + (w.games?.length||0), 0);
  const nextWeek    = safeWeeks.find(w => !(w.games?.length)) || safeWeeks[safeWeeks.length-1] || {};
  const avg3P       = safePlayers.length > 0
    ? safePlayers.reduce((s,p) => s + (stats[p]?.totalGames>0 ? (stats[p].threePersonGames/stats[p].totalGames) : 0), 0) / safePlayers.length
    : 0;
  const secLeader   = [...safePlayers].sort((a,b) => (stats[b]?.sectionsCount||0) - (stats[a]?.sectionsCount||0))[0];
  const riskLeader  = [...safePlayers].sort((a,b) => (stats[b]?.highestHandBonus||0) - (stats[a]?.highestHandBonus||0))[0];

  return (
    <div className="fa">
      <div style={{marginBottom:20}}>
        <h1 style={{fontFamily:"Playfair Display,serif",fontSize:28,color:C.roseDark,fontStyle:"italic"}}>Welcome back 🌸</h1>
        <p style={{color:C.textSoft,fontSize:13,marginTop:4}}>Ranked by average points per game • {TOTAL_WEEKS}-week season</p>
      </div>

      {/* Metric tiles */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:12,marginBottom:20}}>
        {[
          {icon:"🏆", label:"Season leader",  val:sorted[0]||"–",          sub:sorted[0] ? `${(stats[sorted[0]]?.ppg||0).toFixed(1)} pts/game` : "No games yet"},
          {icon:"🀄", label:"Games logged",   val:gamesLogged,              sub:"total this season"},
          {icon:"📅", label:"Next up",        val:`Week ${nextWeek.week||"?"}`, sub:fmt(nextWeek.date)||"Date TBD", extra:nextWeek.location||""},
          {icon:"🌸", label:"Weeks played",   val:safeWeeks.filter(w=>w.games?.length).length, sub:`of ${TOTAL_WEEKS}`},
        ].map(tile => (
          <Card key={tile.label} pad="1rem" style={{textAlign:"center",background:`linear-gradient(145deg,${C.petal},${C.white})`}}>
            <div style={{fontSize:22,marginBottom:4}}>{tile.icon}</div>
            <div style={{fontSize:10,color:C.textSoft,fontWeight:700,letterSpacing:".5px",textTransform:"uppercase",marginBottom:4}}>{tile.label}</div>
            <div style={{fontSize:16,fontWeight:700,color:C.roseDark}}>{tile.val}</div>
            <div style={{fontSize:11,color:C.textSoft,marginTop:2}}>{tile.sub}</div>
            {tile.extra && <div style={{fontSize:11,color:C.textMid,marginTop:2,fontWeight:600}}>{tile.extra}</div>}
          </Card>
        ))}
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1.1fr .9fr",gap:16,marginBottom:16}}>
        {/* Standings */}
        <Card>
          <STitle>Current standings</STitle>
          {sorted.length === 0
            ? <p style={{color:C.textSoft,fontSize:13,fontStyle:"italic"}}>No games played yet.</p>
            : sorted.map((p,i) => (
              <div key={p} style={{display:"flex",alignItems:"center",gap:10,padding:"7px 0",borderBottom:i<sorted.length-1?`1px dashed ${C.border}`:"none"}}>
                <span style={{fontSize:12,color:C.textSoft,minWidth:20,fontWeight:700}}>{i===0?"🥇":i===1?"🥈":i===2?"🥉":i===3?"🎖️":i+1}</span>
                <Av name={p} players={safePlayers}/>
                <span style={{flex:1,fontSize:13,fontWeight:600}}>{p}</span>
                <div style={{textAlign:"right",lineHeight:1.1}}>
                  <div style={{fontSize:15,fontWeight:700,color:C.roseDark}}>{(stats[p]?.ppg||0).toFixed(1)}</div>
                  <div style={{fontSize:9,color:C.textSoft}}>pts/game</div>
                </div>
                <span style={{fontSize:11,color:C.textSoft,minWidth:62,textAlign:"right"}}>{stats[p]?.totalPoints||0} pts · {stats[p]?.totalGames||0}g</span>
              </div>
            ))
          }
        </Card>

        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {/* 3P balance */}
          <Card>
            <STitle>3-person balance</STitle>
            {safePlayers.map(p => {
              const pct = stats[p]?.totalGames > 0 ? (stats[p].threePersonGames / stats[p].totalGames) : 0;
              const over = pct > avg3P + .05, under = pct < avg3P - .05;
              return (
                <div key={p} style={{marginBottom:7}}>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:2}}>
                    <span style={{fontWeight:600,color:C.textMid}}>{p}</span>
                    <span style={{color:over?C.roseDark:under?C.mintDark:C.textSoft,fontWeight:600}}>{Math.round(pct*100)}%</span>
                  </div>
                  <div style={{height:6,background:C.sakura,borderRadius:4,overflow:"hidden"}}>
                    <div style={{height:"100%",width:`${pct*100}%`,background:over?C.roseDark:under?C.mintDark:C.rose,borderRadius:4,transition:"width .4s"}}/>
                  </div>
                </div>
              );
            })}
          </Card>

          {/* Live award leaders */}
          <Card>
            <STitle>Live award leaders</STitle>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              <div style={{background:C.petal,borderRadius:10,padding:"10px 12px",border:`1px solid ${C.border}`}}>
                <div style={{fontSize:10,fontWeight:700,color:C.textSoft,textTransform:"uppercase",letterSpacing:".5px",marginBottom:4}}>Most card sections covered</div>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <Av name={secLeader||""} players={safePlayers} size={24}/>
                  <span style={{fontWeight:700,fontSize:14}}>{secLeader||"–"}</span>
                  <span style={{fontSize:13,color:C.textSoft,marginLeft:"auto"}}>{stats[secLeader]?.sectionsCount||0} sections</span>
                </div>
                {(stats[secLeader]?.sectionsArr||[]).length > 0 && (
                  <div style={{marginTop:6,display:"flex",flexWrap:"wrap",gap:3}}>
                    {stats[secLeader].sectionsArr.map((s,i) => (
                      <span key={i} className="pill" style={{background:C.lavender,color:C.lavDark,padding:"1px 6px",fontSize:10}}>{s.section} {s.line}</span>
                    ))}
                  </div>
                )}
              </div>
              <div style={{background:C.petal,borderRadius:10,padding:"10px 12px",border:`1px solid ${C.border}`}}>
                <div style={{fontSize:10,fontWeight:700,color:C.textSoft,textTransform:"uppercase",letterSpacing:".5px",marginBottom:4}}>Highest hand (incl. jokerless bonus)</div>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <Av name={riskLeader||""} players={safePlayers} size={24}/>
                  <span style={{fontWeight:700,fontSize:14}}>{riskLeader||"–"}</span>
                  <span style={{fontSize:13,color:C.textSoft,marginLeft:"auto"}}>{stats[riskLeader]?.highestHandBonus||0} pts</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Season awards */}
      <Card>
        <STitle>Season awards</STitle>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:10}}>
          {safeAwards.map(a => (
            <div key={a.id} style={{background:C.petal,borderRadius:10,padding:"10px 12px",border:`1.5px solid ${C.border}`}}>
              <div style={{fontSize:12,fontWeight:700,color:C.textMid,marginBottom:4}}>{a.label}</div>
              <div style={{fontSize:14,fontWeight:700,color:C.mintDark}}>
                {a.id==="sections" ? (secLeader||"–") : a.id==="risk" ? (riskLeader||"–") : (a.winner||"–")}
              </div>
              <div style={{fontSize:11,color:C.textSoft,marginTop:2}}>${a.prize} prize</div>
            </div>
          ))}
          <div style={{background:C.petal,borderRadius:10,padding:"10px 12px",border:`1.5px solid ${C.border}`}}>
            <div style={{fontSize:12,fontWeight:700,color:C.textMid,marginBottom:4}}>Season-end payouts</div>
            <div style={{fontSize:12,color:C.text,marginTop:2}}>🥇 1st: <strong>${safePayouts.first||0}</strong></div>
            <div style={{fontSize:12,color:C.text,marginTop:2}}>🥈 2nd: <strong>${safePayouts.second||0}</strong></div>
            <div style={{fontSize:12,color:C.text,marginTop:2}}>🥉 3rd: <strong>${safePayouts.third||0}</strong></div>
            <div style={{fontSize:12,color:C.text,marginTop:2}}>🎖️ 4th: <strong>${safePayouts.fourth||0}</strong></div>
          </div>
        </div>
      </Card>
    </div>
  );
}

// ─── STANDINGS ────────────────────────────────────────────────────────────────
function Standings({stats, settings, players}) {
  const [sortBy, setSort] = useState("ppg");
  const safe = players || [];
  const sorted = [...safe].sort((a,b) => {
    if (sortBy === "name") return a.localeCompare(b);
    return (stats[b]?.[sortBy]||0) - (stats[a]?.[sortBy]||0);
  });
  return (
    <div className="fa">
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:8}}>
        <h2 style={{fontFamily:"Playfair Display,serif",fontSize:22,color:C.roseDark,fontStyle:"italic"}}>Season standings</h2>
        <select value={sortBy} onChange={e=>setSort(e.target.value)} style={{width:"auto",fontSize:12}}>
          <option value="ppg">By points/game</option>
          <option value="totalPoints">By total score</option>
          <option value="totalGames">By games played</option>
          <option value="highestHandBonus">By highest hand</option>
          <option value="sectionsCount">By sections covered</option>
          <option value="name">Alphabetical</option>
        </select>
      </div>
      <Card pad="0" style={{overflow:"hidden",marginBottom:20}}>
        <div style={{display:"grid",gridTemplateColumns:"24px 1fr 50px 50px 46px 44px 38px 44px",padding:"10px 16px",background:C.sakura,fontSize:11,color:C.textMid,fontWeight:700,gap:6}}>
          <span>#</span><span>Player</span>
          <span style={{textAlign:"center"}}>PPG</span>
          <span style={{textAlign:"center"}}>Total</span>
          <span style={{textAlign:"center"}}>Games</span>
          <span style={{textAlign:"center"}}>3P%</span>
          <span style={{textAlign:"center"}}>Sec.</span>
          <span style={{textAlign:"center"}}>Best</span>
        </div>
        {sorted.map((p,i) => {
          const s = stats[p] || {};
          const pct3 = s.totalGames > 0 ? Math.round(s.threePersonGames/s.totalGames*100) : 0;
          return (
            <div key={p} style={{display:"grid",gridTemplateColumns:"24px 1fr 50px 50px 46px 44px 38px 44px",padding:"11px 16px",borderTop:`1px solid ${C.border}`,gap:6,alignItems:"center",background:i%2===0?"transparent":C.petal}}>
              <span style={{fontSize:12,color:C.textSoft,fontWeight:700}}>{i===0?"🥇":i===1?"🥈":i===2?"🥉":i===3?"🎖️":i+1}</span>
              <div style={{display:"flex",alignItems:"center",gap:7}}>
                <Av name={p} players={safe} size={24}/>
                <div>
                  <div style={{fontSize:13,fontWeight:700}}>{p}</div>
                  <div style={{fontSize:10,color:C.textSoft}}>{s.totalGames||0} games played</div>
                </div>
              </div>
              <span style={{fontSize:15,fontWeight:700,textAlign:"center",color:i===0?"#B8860B":i===1?C.textSoft:i===2?"#CD7F32":C.roseDark}}>{(s.ppg||0).toFixed(1)}</span>
              <span style={{fontSize:13,textAlign:"center",fontWeight:600}}>{s.totalPoints||0}</span>
              <span style={{fontSize:12,textAlign:"center",fontWeight:600}}>{s.totalGames||0}</span>
              <span style={{fontSize:12,textAlign:"center",fontWeight:600}}>{pct3}%</span>
              <span style={{fontSize:12,textAlign:"center",fontWeight:600}}>{s.sectionsCount||0}</span>
              <span style={{fontSize:12,textAlign:"center",fontWeight:600}}>{s.highestHandBonus||0}</span>
            </div>
          );
        })}
      </Card>

      <STitle>Individual game history</STitle>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(190px,1fr))",gap:12}}>
        {sorted.map(p => {
          const s = stats[p] || {};
          const all = [...(s.allGames||[])].sort((a,b) => b.points - a.points);
          return (
            <Card key={p} pad="1rem">
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                <Av name={p} players={safe} size={24}/>
                <span style={{fontWeight:700,fontSize:13}}>{p}</span>
              </div>
              <div style={{display:"flex",flexWrap:"wrap",gap:3,marginBottom:6}}>
                {all.length === 0
                  ? <span style={{fontSize:12,color:C.textSoft,fontStyle:"italic"}}>No games yet</span>
                  : all.map((g,i) => (
                    <span key={i} className="pill" style={{background:C.mint,color:C.mintDark,padding:"2px 7px"}}>{g.points}pt</span>
                  ))
                }
              </div>
              {all.length > 0 && (
                <div style={{fontSize:12,color:C.textMid}}>
                  <strong style={{color:C.roseDark}}>{(s.ppg||0).toFixed(1)}</strong> pts/game · {s.totalPoints||0} pts total · {s.totalGames||0} games
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ─── WEEKLY ───────────────────────────────────────────────────────────────────
function Weekly({weeks, activeWeek, setAW, upd, stats, currentUser, isAdmin, players}) {
  const [suggested, setSuggested] = useState(null);
  const [shuffleSeed, setShuffleSeed] = useState(Date.now());
  const weekIdx   = Math.min(Math.max(activeWeek-1, 0), (weeks||[]).length-1);
  const week      = (weeks||[])[weekIdx] || {};
  const challenge = CHALLENGES[weekIdx];
  const safe      = players || [];
  const rsvps     = week.rsvps || {};
  const attending = safe.filter(p => rsvps[p]==="yes");
  const myRsvp    = rsvps[currentUser] || "pending";
  const sorted    = [...safe].sort((a,b)=>a.localeCompare(b));

  function setRsvp(player, status) {
    // Clicking the current status again removes the RSVP (resets to pending)
    const current = (week.rsvps || {})[player] || "pending";
    const newStatus = current === status ? "pending" : status;
    upd(s => ({...s, weeks: s.weeks.map((w,i) => i===weekIdx ? {...w, rsvps:{...w.rsvps,[player]:newStatus}} : w)}));
  }
  function setField(f, v) {
    upd(s => ({...s, weeks: s.weeks.map((w,i) => i===weekIdx ? {...w,[f]:v} : w)}));
  }
  function tryAnother() {
    const newSeed = Date.now();
    setShuffleSeed(newSeed);
    setSuggested(assignTables(attending, stats, newSeed, weeks));
  }
  function clearTables() {
    upd(s => ({...s, weeks: s.weeks.map((w,i) => i===weekIdx ? {...w, tables:[]} : w)}));
    setSuggested(null);
  }

  return (
    <div className="fa">
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12,flexWrap:"wrap"}}>
        <h2 style={{fontFamily:"Playfair Display,serif",fontSize:22,color:C.roseDark,fontStyle:"italic"}}>Week {activeWeek} — {fmt(week.date)}</h2>
        {challenge && <span className="pill" style={{background:C.goldLight,color:"#9A6820",padding:"4px 12px"}}>⭐ {challenge.desc}</span>}
      </div>
      <WkPicker active={activeWeek} set={setAW}/>
      <PublishedRecap week={week}/>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
        <Card>
          <STitle>Location & date</STitle>
          {isAdmin ? (
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              <input placeholder="Location for this week…" value={week.location||""} onChange={e=>setField("location",e.target.value)}/>
              <input type="date" value={week.date||""} onChange={e=>setField("date",e.target.value)}/>
            </div>
          ) : (
            <div>
              <div style={{fontSize:16,fontWeight:700}}>{week.location||"TBD"}</div>
              <div style={{fontSize:13,color:C.textSoft,marginTop:4}}>{fmt(week.date)||"Date TBD"}</div>
            </div>
          )}
        </Card>
        <Card>
          <STitle>Your RSVP</STitle>
          <div style={{display:"flex",gap:8}}>
            {[["yes","✓ Yes",C.mint,C.mintDark],["no","✗ No",C.sakura,C.roseDark],["maybe","? Maybe",C.goldLight,"#9A6820"]].map(([v,l,bg,tc]) => (
              <button key={v} onClick={()=>setRsvp(currentUser,v)} style={{flex:1,padding:"9px 4px",borderRadius:10,border:myRsvp===v?`2px solid ${tc}`:`1.5px solid ${C.border}`,background:myRsvp===v?bg:C.white,color:myRsvp===v?tc:C.textMid,fontSize:12,fontWeight:myRsvp===v?700:500}}>
                {l}
              </button>
            ))}
          </div>
          <div style={{fontSize:12,color:C.textSoft,marginTop:8}}>
            {attending.length} attending • {safe.filter(p=>rsvps[p]==="maybe").length} maybe
          </div>
          {myRsvp !== "pending" && (
            <div style={{fontSize:11,color:C.textSoft,marginTop:6,fontStyle:"italic"}}>
              Tap your current response again to remove it.
            </div>
          )}
        </Card>
      </div>

      <Card style={{marginBottom:14}}>
        <STitle>RSVPs</STitle>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))",gap:8}}>
          {sorted.map(p => {
            const r = rsvps[p] || "pending";
            const map = {yes:[C.mint,C.mintDark,"✓ Yes"],no:[C.sakura,C.roseDark,"✗ No"],maybe:[C.goldLight,"#9A6820","? Maybe"],pending:["#F5F0F2",C.textSoft,"— Pending"]};
            const [bg,tc,label] = map[r] || map.pending;
            return (
              <div key={p} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 10px",background:bg,borderRadius:10,border:`1.5px solid ${C.border}`}}>
                <Av name={p} players={safe} size={22}/>
                <div style={{flex:1}}>
                  <div style={{fontSize:12,fontWeight:700,color:tc}}>{p}</div>
                  <div style={{fontSize:11,color:tc,opacity:.8}}>{label}</div>
                </div>
                {(p === currentUser || isAdmin) && r !== "pending" && (
                  <button onClick={()=>setRsvp(p,r)} title="Remove RSVP" style={{background:"transparent",border:"none",color:tc,opacity:.6,fontSize:14,padding:"0 2px",cursor:"pointer",lineHeight:1}}>✕</button>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      <Card style={{marginBottom:14}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,flexWrap:"wrap",gap:8}}>
          <STitle mb={0}>Table assignments</STitle>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            <button onClick={()=>{const s=Date.now();setShuffleSeed(s);setSuggested(assignTables(attending,stats,s,weeks));}} style={{fontSize:12,padding:"7px 14px",borderRadius:10,border:`1.5px solid ${C.border}`,background:C.white,color:C.textMid,fontWeight:700}}>
              Suggest tables
            </button>
            {suggested && <>
              <button onClick={tryAnother} style={{fontSize:12,padding:"7px 14px",borderRadius:10,border:`1.5px solid ${C.border}`,background:C.goldLight,color:"#9A6820",fontWeight:700}}>
                Try another ↺
              </button>
              <button onClick={()=>{upd(s=>({...s,weeks:s.weeks.map((w,i)=>i===weekIdx?{...w,tables:suggested}:w)}));setSuggested(null);}} style={{fontSize:12,padding:"7px 14px",borderRadius:10,border:"none",background:C.rose,color:"#fff",fontWeight:700}}>
                Confirm ✓
              </button>
            </>}
            {!suggested && (week.tables||[]).length > 0 && isAdmin && (
              <button onClick={clearTables} style={{fontSize:12,padding:"7px 14px",borderRadius:10,border:"1.5px solid #E24B4A",background:C.white,color:"#A32D2D",fontWeight:700}}>
                Clear tables ✕
              </button>
            )}
          </div>
        </div>
        {(suggested || week.tables || []).length > 0 ? (
          <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
            {(suggested||week.tables).map((t,i) => (
              <div key={i} style={{background:C.sakura,borderRadius:12,padding:"12px 16px",minWidth:140,border:`1.5px solid ${C.border}`}}>
                <div style={{fontSize:11,color:C.textMid,fontWeight:700,marginBottom:8}}>TABLE {i+1} • {t.length}-PLAYER</div>
                {t.map(p => (
                  <div key={p} style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}>
                    <Av name={p} players={safe} size={18}/>
                    <span style={{fontSize:13,fontWeight:600}}>{p}</span>
                    <span style={{fontSize:10,color:C.textSoft,marginLeft:"auto"}}>{stats[p]?.totalGames>0?Math.round(stats[p].threePersonGames/stats[p].totalGames*100):0}%</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        ) : <div style={{fontSize:13,color:C.textSoft,fontStyle:"italic"}}>Mark RSVPs first, then suggest tables.</div>}
        {suggested && <div style={{fontSize:12,color:C.textSoft,marginTop:10,fontStyle:"italic"}}>Players with less 3-person experience fill 3-person tables first. Within each pool, people who have played together the least are grouped together.</div>}
      </Card>

      <Card>
        <STitle>Week {activeWeek} games ({(week.games||[]).length})</STitle>
        {(week.games||[]).length === 0
          ? <div style={{fontSize:13,color:C.textSoft,fontStyle:"italic"}}>No games logged yet.</div>
          : (week.games||[]).map((g,gi) => (
            <div key={gi} style={{background:C.petal,borderRadius:12,padding:"12px 14px",border:`1.5px solid ${C.border}`,marginBottom:8}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                <span style={{fontSize:12,fontWeight:700,color:C.textMid}}>GAME {gi+1}</span>
                <span className="pill" style={{background:C.goldLight,color:"#9A6820"}}>{g.type==="wall"?"Wall 🃏":g.type==="false_declare"?"False ❌":"Completed 🀄"}</span>
              </div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                {[...(g.players||[])].sort((a,b)=>a.localeCompare(b)).map(p => {
                  const r = g.results?.[p] || {};
                  const isW = g.winner === p;
                  return (
                    <div key={p} style={{display:"flex",alignItems:"center",gap:5,background:isW?C.mint:C.white,borderRadius:8,padding:"5px 10px",border:`1.5px solid ${isW?C.mintDark:C.border}`}}>
                      <Av name={p} players={safe} size={16}/>
                      <span style={{fontSize:12,fontWeight:isW?700:500}}>{p}</span>
                      <span style={{fontSize:13,fontWeight:700,color:isW?C.mintDark:C.textSoft}}>{r.points||0}pt</span>
                      {isW && r.section && <span className="pill" style={{background:C.lavender,color:C.lavDark,padding:"1px 6px"}}>{r.section}</span>}
                      {isW && !r.jokersUsed && <span className="pill" style={{background:C.goldLight,color:"#9A6820",padding:"1px 6px"}}>+10 no jokers</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        }
      </Card>

      <StoryPanel week={week} weekIdx={weekIdx} upd={upd} currentUser={currentUser} isAdmin={isAdmin} players={safe}/>
      {isAdmin && <AdminStoryPreview week={week} weekIdx={weekIdx} upd={upd} players={safe}/>}
    </div>
  );
}

// ─── STORY SUBMISSION (recap material) ────────────────────────────────────────
const MAX_STORY_MEDIA = 6;

function StoryPanel({week, weekIdx, upd, currentUser, isAdmin, players}) {
  const safe    = players || [];
  const stories = week.stories || {};
  const mine    = stories[currentUser] || null;
  const [text,     setText]     = useState(mine?.text || "");
  const [media,    setMedia]    = useState(mine?.media || (mine?.noteImageUrl ? [{url:mine.noteImageUrl,type:"image"}] : []));
  const [uploading,setUploading]= useState(false);
  const [uploadMsg, setUploadMsg] = useState("");
  const [saved,    setSaved]    = useState(false);

  async function handleFiles(e) {
    const files = Array.from(e.target.files || []);
    e.target.value = ""; // allow re-selecting the same file(s) later
    if (!files.length) return;
    const room = MAX_STORY_MEDIA - media.length;
    if (room <= 0) { alert(`You can attach up to ${MAX_STORY_MEDIA} photos/videos per story.`); return; }
    const toUpload = files.slice(0, room);
    if (files.length > toUpload.length) alert(`Only the first ${room} file(s) were added — max ${MAX_STORY_MEDIA} per story.`);

    setUploading(true);
    let successCount = 0;
    for (let i = 0; i < toUpload.length; i++) {
      setUploadMsg(`Uploading ${i+1} of ${toUpload.length}…`);
      const result = await sbUploadMedia(toUpload[i], week.week, currentUser);
      if (result) { setMedia(prev => [...prev, result]); successCount++; }
    }
    setUploading(false);
    setUploadMsg("");
    if (successCount < toUpload.length) alert("Some uploads failed — check your connection and try again.");
  }

  function removeMediaAt(idx) {
    setMedia(prev => prev.filter((_,i) => i !== idx));
  }

  function submit() {
    if (!text.trim() && media.length === 0) return;
    upd(s => ({
      ...s,
      weeks: s.weeks.map((w,i) => i===weekIdx ? {
        ...w,
        stories: { ...(w.stories||{}), [currentUser]: {
          text: text.trim().slice(0, STORY_CHAR_LIMIT),
          media,
          submittedAt: new Date().toISOString(),
        }},
      } : w),
    }));
    setSaved(true);
    setTimeout(()=>setSaved(false), 2000);
  }

  const sortedPlayers    = [...safe].sort((a,b)=>a.localeCompare(b));
  const submittedCount   = safe.filter(p => stories[p]).length;

  return (
    <Card style={{marginBottom:14}}>
      <STitle>Your story from the night</STitle>
      <p style={{fontSize:12,color:C.textSoft,marginBottom:10}}>
        Anyone can submit — even if you skipped this week (what you were up to instead is fair game). Only {ADMIN_NAME} sees the content; everyone else just sees who's submitted so far.
      </p>
      <textarea
        value={text}
        onChange={e=>setText(e.target.value.slice(0,STORY_CHAR_LIMIT))}
        placeholder="What happened at your table (or wherever you were instead)…"
        style={{minHeight:80,resize:"vertical"}}
      />
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:6,marginBottom:12,flexWrap:"wrap",gap:8}}>
        <span style={{fontSize:11,color:C.textSoft}}>{text.length}/{STORY_CHAR_LIMIT}</span>
        <label style={{fontSize:12,color:C.roseDark,fontWeight:700,cursor:(uploading||media.length>=MAX_STORY_MEDIA)?"default":"pointer"}}>
          {uploading ? uploadMsg : media.length>0 ? `📎 Add more (${media.length}/${MAX_STORY_MEDIA})` : "📎 Attach photos or videos"}
          <input type="file" accept="image/*,video/*" multiple onChange={handleFiles} style={{display:"none"}} disabled={uploading||media.length>=MAX_STORY_MEDIA}/>
        </label>
      </div>
      {media.length > 0 && (
        <div style={{marginBottom:12,display:"flex",flexWrap:"wrap",gap:10}}>
          {media.map((m,i) => (
            <div key={i} style={{position:"relative"}}>
              {m.type === "video" ? (
                <video src={m.url} style={{width:72,height:72,objectFit:"cover",borderRadius:8,border:`1.5px solid ${C.border}`}} muted/>
              ) : (
                <img src={m.url} alt={`Your upload ${i+1}`} style={{width:72,height:72,objectFit:"cover",borderRadius:8,border:`1.5px solid ${C.border}`}}/>
              )}
              {m.type === "video" && <span style={{position:"absolute",bottom:3,right:3,background:"rgba(0,0,0,.55)",color:"#fff",fontSize:9,padding:"1px 5px",borderRadius:6}}>▶ video</span>}
              <button onClick={()=>removeMediaAt(i)} title="Remove" style={{position:"absolute",top:-6,right:-6,width:20,height:20,borderRadius:"50%",background:C.roseDark,color:"#fff",border:"2px solid #fff",fontSize:11,lineHeight:1,fontWeight:700,cursor:"pointer"}}>✕</button>
            </div>
          ))}
        </div>
      )}
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <button onClick={submit} style={{background:`linear-gradient(90deg,${C.roseDark},${C.lavDark})`,color:"#fff",border:"none",borderRadius:10,padding:"9px 20px",fontSize:13,fontWeight:700}}>
          {mine ? "Update story" : "Submit story"}
        </button>
        {saved && <span style={{fontSize:12,color:C.mintDark,fontWeight:700}}>✓ Saved</span>}
      </div>

      <div style={{marginTop:16,paddingTop:14,borderTop:`1px dashed ${C.border}`}}>
        <div style={{fontSize:11,fontWeight:700,color:C.textMid,textTransform:"uppercase",letterSpacing:".5px",marginBottom:8}}>
          Who's submitted ({submittedCount}/{safe.length})
        </div>
        <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
          {sortedPlayers.map(p => {
            const has = !!stories[p];
            return (
              <span key={p} className="pill" style={{background:has?C.mint:"#F5F0F2",color:has?C.mintDark:C.textSoft,padding:"3px 10px"}}>
                {has ? "✓ " : ""}{p}
              </span>
            );
          })}
        </div>
      </div>
    </Card>
  );
}

function AdminStoryPreview({week, weekIdx, upd, players}) {
  const safe      = players || [];
  const stories   = week.stories || {};
  const submitted = safe.filter(p => stories[p]).sort((a,b)=>a.localeCompare(b));
  const recap     = week.recap || { draftText:"", publishedText:null, status:"none", editsUsed:0 };

  const [generating, setGenerating] = useState(false);
  const [revising,   setRevising]   = useState(false);
  const [error,      setError]      = useState(null);
  const [feedback,   setFeedback]   = useState("");
  const [deletingKey,setDeletingKey]= useState(null); // `${player}|${index}` while a delete is in flight

  function saveRecap(patch) {
    upd(s => ({...s, weeks: s.weeks.map((w,i) => i===weekIdx ? {...w, recap:{...(w.recap||recap), ...patch}} : w)}));
  }

  // Removes one photo/video from a player's story. Attempts to delete the underlying
  // file from Supabase Storage first (best-effort — requires a DELETE policy on the
  // bucket), then always removes it from the saved story data regardless of whether
  // the storage delete succeeded, so the UI never gets stuck showing a broken link.
  async function deleteMediaItem(player, index) {
    const item = (stories[player]?.media || [])[index];
    if (!item) return;
    if (!window.confirm(`Delete this ${item.type||"photo"} from ${player}'s story? This cannot be undone.`)) return;
    const key = `${player}|${index}`;
    setDeletingKey(key);
    const storageOk = await sbDeleteMedia(item.url);
    upd(s => ({
      ...s,
      weeks: s.weeks.map((w,i) => i===weekIdx ? {
        ...w,
        stories: {
          ...(w.stories||{}),
          [player]: {
            ...(w.stories?.[player]||{}),
            media: (w.stories?.[player]?.media||[]).filter((_,mi) => mi !== index),
          },
        },
      } : w),
    }));
    setDeletingKey(null);
    if (!storageOk && USE_SUPABASE) console.warn(`Removed ${player}'s media from the story, but the file may still exist in Supabase Storage (check bucket DELETE policy).`);
  }

  // Calls the Netlify function, which holds the Anthropic API key server-side.
  // See netlify/functions/generate-recap.js — must be deployed via Git or the
  // Netlify CLI, not a plain drag-and-drop of the dist/ folder.
  async function callGenerateRecap(mode, instruction) {
    const storiesPayload = submitted.map(p => ({
      player: p, text: stories[p]?.text || "",
      noteImageUrl: (stories[p]?.media||[]).find(m=>m.type==="image")?.url || null,
    }));
    const res = await fetch("/.netlify/functions/generate-recap", {
      method: "POST",
      headers: {"content-type":"application/json"},
      body: JSON.stringify({
        mode, instruction,
        weekStats: buildWeekStatsSummary(week),
        stories: storiesPayload,
        currentDraft: recap.draftText,
      }),
    });
    if (!res.ok) throw new Error(`Server responded ${res.status}`);
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return data.text;
  }

  async function handleGenerate() {
    setError(null); setGenerating(true);
    try {
      const text = await callGenerateRecap("initial", null);
      saveRecap({ draftText: text, status: "draft", editsUsed: 0 });
    } catch(e) { setError(e.message || "Something went wrong generating the recap."); }
    setGenerating(false);
  }

  async function handleRevise() {
    if (!feedback.trim()) return;
    if ((recap.editsUsed||0) >= 1) {
      setError("This week's free AI edit is already used — paid edit packages aren't wired up to purchase yet.");
      return;
    }
    setError(null); setRevising(true);
    try {
      const text = await callGenerateRecap("revise", feedback.trim());
      saveRecap({ draftText: text, editsUsed: (recap.editsUsed||0) + 1 });
      setFeedback("");
    } catch(e) { setError(e.message || "Something went wrong revising the recap."); }
    setRevising(false);
  }

  function handlePublish() {
    saveRecap({ publishedText: recap.draftText, status: "published" });
  }

  return (
    <Card style={{marginBottom:14,background:C.lavender,border:`1.5px solid ${C.lavDark}`}}>
      <STitle>Admin — story preview</STitle>
      {submitted.length === 0 ? (
        <p style={{fontSize:13,color:C.lavDark,fontStyle:"italic",marginBottom:12}}>No stories submitted yet.</p>
      ) : submitted.map(p => {
        const s = stories[p];
        return (
          <div key={p} style={{background:C.white,borderRadius:10,padding:"10px 12px",marginBottom:8,border:`1.5px solid ${C.border}`}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
              <Av name={p} players={safe} size={22}/>
              <span style={{fontWeight:700,fontSize:13}}>{p}</span>
              <span style={{fontSize:10,color:C.textSoft,marginLeft:"auto"}}>{s.text?.length||0} chars</span>
            </div>
            {s.text && <p style={{fontSize:13,color:C.text,marginBottom:(s.media||[]).length?8:0,whiteSpace:"pre-wrap"}}>{s.text}</p>}
            {(s.media||[]).length > 0 && (
              <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                {s.media.map((m,mi) => {
                  const key = `${p}|${mi}`;
                  const isDeleting = deletingKey === key;
                  return (
                    <div key={mi} style={{position:"relative",opacity:isDeleting?0.5:1}}>
                      {m.type === "video" ? (
                        <video src={m.url} controls style={{maxWidth:180,maxHeight:180,borderRadius:8,border:`1.5px solid ${C.border}`}}/>
                      ) : (
                        <img src={m.url} alt={`${p}'s photo ${mi+1}`} style={{maxWidth:180,maxHeight:180,objectFit:"cover",borderRadius:8,border:`1.5px solid ${C.border}`}}/>
                      )}
                      <button
                        onClick={()=>deleteMediaItem(p,mi)}
                        disabled={isDeleting}
                        title="Delete this photo/video"
                        style={{position:"absolute",top:-8,right:-8,width:24,height:24,borderRadius:"50%",background:"#A32D2D",color:"#fff",border:"2px solid #fff",fontSize:13,lineHeight:1,fontWeight:700,cursor:isDeleting?"default":"pointer",boxShadow:"0 1px 4px rgba(0,0,0,.3)"}}
                      >
                        {isDeleting ? "…" : "✕"}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {submitted.length > 0 && (
        <div style={{marginTop:14,paddingTop:14,borderTop:`1.5px solid ${C.lavDark}`}}>
          <div style={{fontSize:11,fontWeight:700,color:C.lavDark,textTransform:"uppercase",letterSpacing:".5px",marginBottom:8}}>
            Draft recap {recap.status==="published" ? "· published ✓" : ""}
          </div>

          {/* Generate is always offered here — if it's down, the box below still
              works for a fully manual/pasted-in recap, so publishing never has
              to wait on the AI function. */}
          <button onClick={handleGenerate} disabled={generating} style={{marginBottom:10,background:`linear-gradient(90deg,${C.roseDark},${C.lavDark})`,color:"#fff",border:"none",borderRadius:10,padding:"10px 20px",fontSize:13,fontWeight:700,opacity:generating?0.6:1}}>
            {generating ? "Generating…" : recap.status==="none" ? "Generate recap ✦" : "Regenerate recap ✦"}
          </button>

          <textarea value={recap.draftText} onChange={e=>saveRecap({draftText:e.target.value, status: recap.status==="none" ? "draft" : recap.status})} placeholder="Paste or write the recap here…" style={{minHeight:220,resize:"vertical",fontFamily:"Nunito,sans-serif"}}/>

          <div style={{display:"flex",gap:8,marginTop:10,flexWrap:"wrap",alignItems:"center"}}>
            <input value={feedback} onChange={e=>setFeedback(e.target.value)} placeholder="e.g. make the Charlie bit harsher…" style={{flex:1,minWidth:180}}/>
            <button onClick={handleRevise} disabled={revising || (recap.editsUsed||0)>=1} style={{padding:"9px 16px",borderRadius:10,border:`1.5px solid ${C.lavDark}`,background:C.white,color:C.lavDark,fontWeight:700,fontSize:13,opacity:(revising||(recap.editsUsed||0)>=1)?0.5:1,whiteSpace:"nowrap"}}>
              {revising ? "Revising…" : (recap.editsUsed||0)>=1 ? "Free edit used" : "Ask AI to revise (1 free)"}
            </button>
          </div>
          <div style={{fontSize:11,color:C.lavDark,marginTop:4,fontStyle:"italic"}}>You can also just type or paste directly in the box above — manual edits are always free.</div>

          <button onClick={handlePublish} disabled={!recap.draftText?.trim()} style={{marginTop:10,background:`linear-gradient(90deg,${C.roseDark},${C.lavDark})`,color:"#fff",border:"none",borderRadius:10,padding:"9px 20px",fontSize:13,fontWeight:700,opacity:recap.draftText?.trim()?1:0.5}}>
            {recap.status==="published" ? "Re-publish (overwrite)" : "Publish to group ✓"}
          </button>
        </div>
      )}

      {error && <div style={{marginTop:10,background:C.sakura,color:C.roseDark,borderRadius:8,padding:"8px 12px",fontSize:12,fontWeight:600}}>{error}</div>}
    </Card>
  );
}

// Shown to every player once the admin publishes — the "reveal" moment.
function PublishedRecap({week}) {
  const recap = week.recap;
  if (!recap || recap.status !== "published" || !recap.publishedText) return null;
  return (
    <Card style={{marginBottom:14,background:`linear-gradient(145deg,${C.petal},${C.white})`,border:`1.5px solid ${C.rose}`}}>
      <STitle>This week's recap ✦</STitle>
      <div style={{fontSize:14,color:C.text,whiteSpace:"pre-wrap",lineHeight:1.7,fontFamily:"Playfair Display,serif"}}>{recap.publishedText}</div>
    </Card>
  );
}

// ─── PHOTO GALLERY ────────────────────────────────────────────────────────────
// Shows every uploaded photo immediately, season-wide, regardless of whether that
// week's recap has been published — matches "everyone has access to them" as asked.
// If you'd rather gate a week's photos until that week's recap goes out (same
// reveal treatment as the story text), add `&& w.recap?.status === "published"`
// to the filter condition below.
function Gallery({weeks, players, isAdmin, upd}) {
  const safe = players || [];
  const [deletingKey, setDeletingKey] = useState(null); // `${weekIdx}|${player}|${index}`
  const photos = [];
  (weeks || []).forEach((w, weekIdx) => {
    const stories = w.stories || {};
    Object.entries(stories).forEach(([player, s]) => {
      (s?.media||[]).forEach((m, mediaIdx) => {
        photos.push({ weekIdx, player, mediaIdx, week: w.week, date: w.date, url: m.url, type: m.type||"image", submittedAt: s.submittedAt });
      });
    });
  });
  photos.sort((a,b) => new Date(b.submittedAt||0) - new Date(a.submittedAt||0));

  // Admin-only: permanently removes a photo/video from the gallery (and the
  // player's underlying story). Best-effort deletes the file from Supabase
  // Storage too — requires a DELETE policy on the bucket to fully succeed.
  async function deletePhoto(item) {
    if (!window.confirm(`Delete this ${item.type} from ${item.player}'s week ${item.week} story? This cannot be undone.`)) return;
    const key = `${item.weekIdx}|${item.player}|${item.mediaIdx}`;
    setDeletingKey(key);
    const storageOk = await sbDeleteMedia(item.url);
    upd(s => ({
      ...s,
      weeks: s.weeks.map((w,i) => i===item.weekIdx ? {
        ...w,
        stories: {
          ...(w.stories||{}),
          [item.player]: {
            ...(w.stories?.[item.player]||{}),
            media: (w.stories?.[item.player]?.media||[]).filter((_,mi) => mi !== item.mediaIdx),
          },
        },
      } : w),
    }));
    setDeletingKey(null);
    if (!storageOk && USE_SUPABASE) console.warn(`Removed ${item.player}'s media from the gallery, but the file may still exist in Supabase Storage (check bucket DELETE policy).`);
  }

  return (
    <div className="fa">
      <h2 style={{fontFamily:"Playfair Display,serif",fontSize:22,color:C.roseDark,fontStyle:"italic",marginBottom:4}}>Season photos 📷</h2>
      <p style={{color:C.textSoft,fontSize:13,marginBottom:20}}>Every photo and video shared with a weekly story, all in one place.</p>
      {photos.length === 0 ? (
        <Card><p style={{fontSize:13,color:C.textSoft,fontStyle:"italic"}}>Nothing uploaded yet — photos and videos will show up here as people attach them to their weekly stories.</p></Card>
      ) : (
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:14}}>
          {photos.map((p,i) => {
            const key = `${p.weekIdx}|${p.player}|${p.mediaIdx}`;
            const isDeleting = deletingKey === key;
            return (
              <Card key={i} pad="0" style={{overflow:"hidden",position:"relative",opacity:isDeleting?0.5:1}}>
                {isAdmin && (
                  <button
                    onClick={()=>deletePhoto(p)}
                    disabled={isDeleting}
                    title="Delete this photo/video"
                    style={{position:"absolute",top:6,right:6,zIndex:2,width:24,height:24,borderRadius:"50%",background:"#A32D2D",color:"#fff",border:"2px solid #fff",fontSize:13,lineHeight:1,fontWeight:700,cursor:isDeleting?"default":"pointer",boxShadow:"0 1px 4px rgba(0,0,0,.4)"}}
                  >
                    {isDeleting ? "…" : "✕"}
                  </button>
                )}
                {p.type === "video" ? (
                  <video src={p.url} controls style={{width:"100%",height:140,objectFit:"cover",display:"block",background:"#000"}}/>
                ) : (
                  <img src={p.url} alt={`${p.player}'s photo from week ${p.week}`} style={{width:"100%",height:140,objectFit:"cover",display:"block"}}/>
                )}
                <div style={{padding:"8px 10px",display:"flex",alignItems:"center",gap:6}}>
                  <Av name={p.player} players={safe} size={18}/>
                  <div style={{minWidth:0}}>
                    <div style={{fontSize:12,fontWeight:700,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.player}{p.type==="video"?" 🎬":""}</div>
                    <div style={{fontSize:10,color:C.textSoft}}>Week {p.week}{p.date?` · ${fmt(p.date)}`:""}</div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── LOG GAME ─────────────────────────────────────────────────────────────────
function LogGame({weeks, activeWeek, setAW, upd, currentUser, players}) {
  const weekIdx   = Math.min(Math.max(activeWeek-1,0),(weeks||[]).length-1);
  const challenge = CHALLENGES[weekIdx];
  const safe      = [...(players||[])].sort((a,b)=>a.localeCompare(b));

  const [type,      setType]      = useState("completed");
  const [gps,       setGps]       = useState([]);
  const [winner,    setWinner]    = useState("");
  const [falsePer,  setFalsePer]  = useState("");
  const [jokers,    setJokers]    = useState(false);
  const [section,   setSection]   = useState("");
  const [line,      setLine]      = useState("");
  const [handVal,   setHandVal]   = useState("");
  const [tiles,     setTiles]     = useState("");
  const [ok,        setOk]        = useState(false);

  function toggleP(p) { setGps(prev => prev.includes(p) ? prev.filter(x=>x!==p) : [...prev,p]); }
  function reset() { setType("completed");setGps([]);setWinner("");setFalsePer("");setJokers(false);setSection("");setLine("");setHandVal("");setTiles(""); }

  function submit() {
    if (gps.length < 3) { alert("Select at least 3 players"); return; }
    if (type==="completed" && !winner) { alert("Select a winner"); return; }
    if (type==="false_declare" && !falsePer) { alert("Select who false declared"); return; }
    const results = {};
    if (type==="wall") {
      gps.forEach(p => { results[p] = {points:10}; });
    } else if (type==="false_declare") {
      gps.forEach(p => { results[p] = {points: p===falsePer ? 0 : 10}; });
    } else {
      const hv = parseInt(handVal)||0;
      gps.forEach(p => {
        if (p===winner) results[p] = {points:hv+(!jokers?10:0),section,line,handValue:hv,jokersUsed:jokers,tilesLeft:challenge?.tileWall?(parseInt(tiles)||null):null};
        else results[p] = {points:0};
      });
    }
    const game = {id:Date.now()+"",type,players:[...gps],winner:type==="completed"?winner:null,falseDeclarant:type==="false_declare"?falsePer:null,results,week:activeWeek,loggedBy:currentUser,timestamp:new Date().toISOString()};
    upd(s => ({...s, weeks:s.weeks.map((w,i)=>i===weekIdx?{...w,games:[...(w.games||[]),game]}:w)}));
    setOk(true); reset();
    setTimeout(()=>setOk(false),2500);
  }

  return (
    <div className="fa" style={{maxWidth:560}}>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16,flexWrap:"wrap"}}>
        <h2 style={{fontFamily:"Playfair Display,serif",fontSize:22,color:C.roseDark,fontStyle:"italic"}}>Log a game</h2>
        <select value={activeWeek} onChange={e=>setAW(Number(e.target.value))} style={{width:"auto",fontSize:13,padding:"6px 10px"}}>
          {(weeks||[]).map(w=><option key={w.week} value={w.week}>Week {w.week} — {fmt(w.date)}</option>)}
        </select>
      </div>
      {challenge && <div style={{background:C.goldLight,border:`1.5px solid #E8C87A`,borderRadius:12,padding:"10px 14px",marginBottom:14,fontSize:13,color:"#9A6820",fontWeight:700}}>⭐ Week {activeWeek} challenge: {challenge.desc}</div>}
      {ok && <div style={{background:C.mint,color:C.mintDark,borderRadius:12,padding:"10px 14px",marginBottom:14,fontSize:14,fontWeight:700}}>✓ Game logged!</div>}

      <Card style={{display:"flex",flexDirection:"column",gap:16}}>
        {/* Game type */}
        <div>
          <label style={{fontSize:11,fontWeight:700,color:C.textMid,display:"block",marginBottom:8,letterSpacing:".5px",textTransform:"uppercase"}}>Game type</label>
          <div style={{display:"flex",gap:8}}>
            {[["completed","Completed 🀄"],["wall","Wall game 🃏"],["false_declare","False declare ❌"]].map(([v,l])=>(
              <button key={v} onClick={()=>setType(v)} style={{flex:1,padding:"9px 4px",borderRadius:10,border:type===v?`2px solid ${C.rose}`:`1.5px solid ${C.border}`,background:type===v?C.sakura:C.white,color:type===v?C.roseDark:C.textMid,fontSize:11,fontWeight:type===v?700:500,lineHeight:1.3}}>
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Player selection */}
        <div>
          <label style={{fontSize:11,fontWeight:700,color:C.textMid,display:"block",marginBottom:8,letterSpacing:".5px",textTransform:"uppercase"}}>Players at this table</label>
          <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
            {safe.map(p=>(
              <button key={p} onClick={()=>toggleP(p)} style={{padding:"6px 13px",borderRadius:20,border:gps.includes(p)?`2px solid ${pcol(p,players)}`:`1.5px solid ${C.border}`,background:gps.includes(p)?C.sakura:C.white,color:gps.includes(p)?pcol(p,players):C.textMid,fontSize:13,fontWeight:gps.includes(p)?700:500}}>
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Completed hand fields */}
        {type==="completed" && gps.length>=3 && (<>
          <div>
            <label style={{fontSize:11,fontWeight:700,color:C.textMid,display:"block",marginBottom:8,letterSpacing:".5px",textTransform:"uppercase"}}>Winner</label>
            <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
              {[...gps].sort((a,b)=>a.localeCompare(b)).map(p=>(
                <button key={p} onClick={()=>setWinner(p)} style={{padding:"6px 13px",borderRadius:20,border:winner===p?`2px solid ${C.mintDark}`:`1.5px solid ${C.border}`,background:winner===p?C.mint:C.white,color:winner===p?C.mintDark:C.textMid,fontSize:13,fontWeight:winner===p?700:500}}>
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <div>
              <label style={{fontSize:11,fontWeight:700,color:C.textMid,display:"block",marginBottom:6,letterSpacing:".5px",textTransform:"uppercase"}}>Card section</label>
              <select value={section} onChange={e=>{setSection(e.target.value);setLine("");}}>
                <option value="">Select section…</option>
                {Object.keys(CARD_2026).map(s=><option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={{fontSize:11,fontWeight:700,color:C.textMid,display:"block",marginBottom:6,letterSpacing:".5px",textTransform:"uppercase"}}>Line</label>
              <select value={line} onChange={e=>setLine(e.target.value)} disabled={!section}>
                <option value="">Select line…</option>
                {section && (CARD_2026[section]||[]).map(l=><option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label style={{fontSize:11,fontWeight:700,color:C.textMid,display:"block",marginBottom:6,letterSpacing:".5px",textTransform:"uppercase"}}>Hand point value</label>
              <input type="number" value={handVal} onChange={e=>setHandVal(e.target.value)} placeholder="e.g. 25"/>
            </div>
            {challenge?.tileWall && (
              <div>
                <label style={{fontSize:11,fontWeight:700,color:"#9A6820",display:"block",marginBottom:6,letterSpacing:".5px",textTransform:"uppercase"}}>⭐ Tiles left on wall</label>
                <input type="number" value={tiles} onChange={e=>setTiles(e.target.value)} placeholder="e.g. 8" style={{borderColor:"#E8C87A"}}/>
              </div>
            )}
          </div>
          <div>
            <label style={{fontSize:11,fontWeight:700,color:C.textMid,display:"block",marginBottom:8,letterSpacing:".5px",textTransform:"uppercase"}}>Jokers used?</label>
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>setJokers(false)} style={{flex:1,padding:"9px",borderRadius:10,border:!jokers?`2px solid ${C.mintDark}`:`1.5px solid ${C.border}`,background:!jokers?C.mint:C.white,color:!jokers?C.mintDark:C.textMid,fontSize:12,fontWeight:!jokers?700:500}}>No jokers 🌟 (+10 pts)</button>
              <button onClick={()=>setJokers(true)}  style={{flex:1,padding:"9px",borderRadius:10,border:jokers?`2px solid ${C.rose}`:`1.5px solid ${C.border}`,background:jokers?C.sakura:C.white,color:jokers?C.roseDark:C.textMid,fontSize:12,fontWeight:jokers?700:500}}>Jokers used 🃏</button>
            </div>
          </div>
          {winner && (
            <div style={{background:C.mint,borderRadius:12,padding:"12px 14px",border:`1.5px solid ${C.mintDark}`}}>
              <span style={{fontWeight:700,color:C.mintDark}}>{winner}</span>
              <span style={{color:C.mintDark}}> wins </span>
              <span style={{fontSize:20,fontWeight:700,color:C.mintDark}}>{(parseInt(handVal)||0)+(!jokers?10:0)} pts</span>
              {!jokers && <span style={{fontSize:11,color:C.mintDark}}> (incl. +10 no-joker bonus)</span>}
            </div>
          )}
        </>)}

        {type==="false_declare" && gps.length>=3 && (
          <div>
            <label style={{fontSize:11,fontWeight:700,color:C.textMid,display:"block",marginBottom:8,letterSpacing:".5px",textTransform:"uppercase"}}>Who false declared?</label>
            <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
              {[...gps].sort((a,b)=>a.localeCompare(b)).map(p=>(
                <button key={p} onClick={()=>setFalsePer(p)} style={{padding:"6px 13px",borderRadius:20,border:falsePer===p?`2px solid ${C.roseDark}`:`1.5px solid ${C.border}`,background:falsePer===p?C.sakura:C.white,color:falsePer===p?C.roseDark:C.textMid,fontSize:13,fontWeight:falsePer===p?700:500}}>
                  {p}
                </button>
              ))}
            </div>
            {falsePer && <div style={{marginTop:8,background:C.sakura,borderRadius:10,padding:"10px",fontSize:13,color:C.roseDark,fontWeight:700}}>{falsePer} gets 0 pts. Everyone else gets 10 pts each.</div>}
          </div>
        )}

        {type==="wall" && gps.length>=3 && (
          <div style={{background:C.mint,borderRadius:10,padding:"10px 14px",fontSize:13,color:C.mintDark,fontWeight:700}}>Wall game — all {gps.length} players receive 10 pts each.</div>
        )}

        <button onClick={submit} style={{background:`linear-gradient(90deg,${C.roseDark},${C.lavDark})`,color:"#fff",border:"none",borderRadius:12,padding:"13px",fontSize:15,fontWeight:700,boxShadow:"0 4px 14px rgba(196,85,117,.25)"}}>
          Log Game 🀄
        </button>
      </Card>
    </div>
  );
}

// ─── CHALLENGES ───────────────────────────────────────────────────────────────
function Challenges({weeks, upd, isAdmin, currentUser, players}) {
  const [sel, setSel] = useState(0);
  const safe   = players || [];
  const sorted = [...safe].sort((a,b)=>a.localeCompare(b));
  const week   = (weeks||[])[sel] || {};
  const ch     = CHALLENGES[sel] || {};
  const pot    = typeof week.challengePot==="number" ? week.challengePot : 5;
  const winners    = (week.challengeWinners||[]).filter(x=>x!=="__rollover__");
  const rolledOver = (week.challengeWinners||[]).includes("__rollover__");
  const splitPrize = winners.length>=2 ? Math.floor(pot/winners.length) : pot;

  function claim(name) {
    if (rolledOver || winners.includes(name)) return;
    upd(s=>({...s,weeks:s.weeks.map((w,i)=>i===sel?{...w,challengeWinners:[...(w.challengeWinners||[]).filter(x=>x!=="__rollover__"),name]}:w)}));
  }
  function removeWinner(name) {
    upd(s=>({...s,weeks:s.weeks.map((w,i)=>i===sel?{...w,challengeWinners:(w.challengeWinners||[]).filter(x=>x!==name)}:w)}));
  }
  function rollover() {
    if (sel>=TOTAL_WEEKS-1) return;
    upd(s=>({...s,weeks:s.weeks.map((w,i)=>{
      if(i===sel)   return{...w,challengeWinners:[...(w.challengeWinners||[]).filter(x=>x!=="__rollover__"),"__rollover__"]};
      if(i===sel+1) return{...w,challengePot:(w.challengePot||5)+pot};
      return w;
    })}));
  }
  function undoRollover() {
    upd(s=>({...s,weeks:s.weeks.map((w,i)=>{
      if(i===sel)   return{...w,challengeWinners:(w.challengeWinners||[]).filter(x=>x!=="__rollover__")};
      if(i===sel+1) return{...w,challengePot:Math.max(5,(w.challengePot||5)-pot)};
      return w;
    })}));
  }

  return (
    <div className="fa">
      <h2 style={{fontFamily:"Playfair Display,serif",fontSize:22,color:C.roseDark,fontStyle:"italic",marginBottom:16}}>Weekly challenges ⭐</h2>
      <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:20}}>
        {(weeks||[]).map((w,i)=>{
          const rw=(w.challengeWinners||[]).filter(x=>x!=="__rollover__");
          const ro=(w.challengeWinners||[]).includes("__rollover__");
          return (
            <button key={i} onClick={()=>setSel(i)} style={{padding:"6px 10px",borderRadius:8,border:i===sel?`2px solid ${C.rose}`:`1.5px solid ${C.border}`,background:i===sel?C.sakura:rw.length>0?C.mint:ro?C.goldLight:C.white,color:i===sel?C.roseDark:rw.length>0?C.mintDark:ro?"#9A6820":C.textMid,fontSize:12,fontWeight:i===sel?700:500}}>
              W{i+1}{rw.length>0?" ✓":ro?" →":""}
            </button>
          );
        })}
      </div>

      <Card style={{marginBottom:14}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16,flexWrap:"wrap",gap:8}}>
          <div style={{flex:1}}>
            <div style={{fontSize:10,fontWeight:700,color:C.textSoft,letterSpacing:".5px",textTransform:"uppercase",marginBottom:4}}>Week {sel+1} — {fmt((weeks||[])[sel]?.date)}</div>
            <div style={{fontSize:18,fontWeight:700,color:C.text}}>{ch.desc||""}</div>
          </div>
          <div style={{background:C.goldLight,borderRadius:12,padding:"10px 16px",textAlign:"center",border:"1.5px solid #E8C87A",flexShrink:0}}>
            <div style={{fontSize:10,fontWeight:700,color:"#9A6820",letterSpacing:".5px"}}>PRIZE POT</div>
            <div style={{fontSize:26,fontWeight:700,color:"#B8860B"}}>${pot}</div>
            {winners.length>=2 && <div style={{fontSize:10,color:"#9A6820"}}>${splitPrize} each</div>}
          </div>
        </div>

        {rolledOver && !winners.length && (
          <div style={{background:C.goldLight,borderRadius:10,padding:"10px 14px",fontSize:13,color:"#9A6820",fontWeight:700,marginBottom:12,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span>No winner in week {sel+1} — ${pot} rolled to week {sel+2}</span>
            {isAdmin && <button onClick={undoRollover} style={{fontSize:11,padding:"5px 10px",borderRadius:8,border:"1px solid #9A6820",background:"transparent",color:"#9A6820",fontWeight:700,marginLeft:10}}>Undo rollover</button>}
          </div>
        )}

        {winners.length>0 && (
          <div style={{background:C.mint,borderRadius:12,padding:"12px 14px",marginBottom:12,border:`1.5px solid ${C.mintDark}`}}>
            <div style={{fontSize:11,fontWeight:700,color:C.mintDark,marginBottom:8,textTransform:"uppercase",letterSpacing:".5px"}}>Winner{winners.length>1?"s — pot split 🏆":"🏆"}</div>
            {winners.map(w=>(
              <div key={w} style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                <Av name={w} players={safe} size={22}/>
                <span style={{fontSize:15,fontWeight:700,color:C.mintDark}}>{w}</span>
                <span style={{fontSize:13,color:C.mintDark}}>+${splitPrize}</span>
                {isAdmin && <button onClick={()=>removeWinner(w)} style={{marginLeft:"auto",fontSize:10,background:"transparent",border:`1px solid ${C.mintDark}`,borderRadius:6,padding:"2px 7px",color:C.mintDark}}>remove</button>}
              </div>
            ))}
          </div>
        )}

        {!rolledOver && (
          <div>
            <div style={{fontSize:13,fontWeight:700,color:C.textMid,marginBottom:8}}>
              {winners.length===0 ? "First to complete it wins the pot:" : "Anyone else who also completed it (splits the pot):"}
            </div>
            <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:8}}>
              {sorted.filter(p=>!winners.includes(p)).map(p=>(
                <button key={p} onClick={()=>claim(p)} style={{padding:"7px 14px",borderRadius:20,border:`1.5px solid ${C.border}`,background:currentUser===p?C.sakura:C.white,color:currentUser===p?C.roseDark:C.textMid,fontSize:13,fontWeight:currentUser===p?700:500}}>
                  {p}{currentUser===p?" (me)":""}
                </button>
              ))}
            </div>
            <div style={{fontSize:12,color:C.textSoft,fontStyle:"italic",marginBottom:10}}>
              Multiple people can claim the same week — pot splits equally. Each week starts fresh at $5 regardless.
            </div>
            {isAdmin && sel<TOTAL_WEEKS-1 && winners.length===0 && !rolledOver && (
              <button onClick={rollover} style={{fontSize:12,padding:"7px 14px",borderRadius:10,border:`1.5px solid ${C.border}`,background:C.goldLight,color:"#9A6820",fontWeight:700}}>
                🔄 No winner — roll ${pot} to week {sel+2}
              </button>
            )}
          </div>
        )}
      </Card>

      <Card>
        <STitle>All 12 weekly challenges</STitle>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:8}}>
          {(weeks||[]).map((w,i)=>{
            const rw=(w.challengeWinners||[]).filter(x=>x!=="__rollover__");
            const ro=(w.challengeWinners||[]).includes("__rollover__");
            return (
              <div key={i} onClick={()=>setSel(i)} style={{background:rw.length>0?C.mint:ro?C.goldLight:C.petal,borderRadius:10,padding:"10px 12px",border:`1.5px solid ${rw.length>0?C.mintDark:ro?"#E8C87A":C.border}`,cursor:"pointer"}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                  <span style={{fontSize:10,fontWeight:700,color:C.textSoft}}>WEEK {i+1} • {fmt(w.date)}</span>
                  <span style={{fontSize:10,fontWeight:700,color:"#9A6820"}}>${w.challengePot||5}</span>
                </div>
                <div style={{fontSize:12,fontWeight:600,color:C.text,marginBottom:4,lineHeight:1.3}}>{CHALLENGES[i]?.desc||""}</div>
                <div style={{fontSize:11,color:rw.length>0?C.mintDark:ro?"#9A6820":C.textSoft,fontWeight:600}}>
                  {rw.length>0 ? rw.join(", ")+" 🏆" : ro ? "→ rolled over" : "no winner yet"}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

// ─── RULES ────────────────────────────────────────────────────────────────────
function Rules() {
  const sections = [
    {title:"Jokers — when you CAN use them", icon:"✅", bg:C.mint, tc:C.mintDark, bd:C.mintDark, items:[
      "Jokers can represent any tile in a Pung, Kong, Quint, or Sextet (groups of 3 or more identical tiles).",
      "If another player has a Joker in an exposed group, you may swap it out with the exact tile it represents on your turn.",
    ]},
    {title:"Jokers — when you CANNOT use them", icon:"🚫", bg:C.sakura, tc:C.roseDark, bd:C.roseDark, items:[
      "Jokers can NEVER represent a Single tile — any tile that appears alone in a hand cannot be a Joker.",
      "Jokers can NEVER represent a Pair — neither tile of any required pair can be a Joker.",
      "Jokers cannot be used in any Singles & Pairs section hand.",
    ]},
    {title:"Calling for an Exposure", icon:"📢", bg:C.lavender, tc:C.lavDark, bd:C.lavDark, items:[
      "You CAN call a discarded tile to complete an exposed group (Pung, Kong, etc.) as long as it is NOT a Single or Pair tile in your hand.",
      "You CANNOT call a discarded tile for a Single or Pair — you must draw it yourself, with ONE exception:",
      "EXCEPTION: You CAN call for a Single or Pair tile if it is the LAST tile you need to declare Mahjong.",
      "The 'C' (Concealed) designation means you cannot call ANY tile for that hand unless it is to Mahjong.",
    ]},
    {title:"Calling a tile to declare Mahjong", icon:"🀄", bg:C.goldLight, tc:"#9A6820", bd:"#E8C87A", items:[
      "You CAN call any discarded tile to declare Mahjong, even a Single or Pair — this overrides the normal calling rule.",
      "Even when declaring Mahjong, Jokers still CANNOT represent Singles or Pairs.",
      "False Declaration: if your hand is invalid, you get 0 pts and all others at your table get 10 pts each.",
    ]},
    {title:"Other important rules", icon:"📋", bg:"#F5F0F2", tc:C.textMid, bd:C.border, items:[
      "Red Dragon = Cracks | Green Dragon = Bams | White Dragon (Soap) = Dots.",
      "Winds and Flowers are suitless.",
      "A wall game results in 10 points for every player at the table.",
      "3-person tables: no Charleston is performed.",
      "Pay attention to parentheses on the card — they reveal additional hand options.",
    ]},
  ];
  const faqs = [
    {q:"How do I earn points?", a:"You earn the point value on the card for the line you win with. If you won without any Jokers, you get an additional 10-point bonus. This bonus does not apply to Singles & Pairs hands."},
    {q:"How is my season ranking determined?", a:"Standings are ranked by your average points per game (PPG) — your total points divided by how many games you've played. Every game counts toward your average. The Home and Standings tabs also show your total points and games played for reference."},
    {q:"How do weekly challenges work?", a:"Each week has a challenge worth $5. The first person to complete it wins. Multiple people can claim it and split the pot. If no one wins, the $5 rolls to the next week. Each week always starts fresh at $5 base."},
    {q:"What are the season prizes?", a:"Season-end prize amounts are set by the admin (check the Home tab for current amounts). Plus $10 side awards for: first concealed hand, most card sections covered, and highest single hand value."},
    {q:"Can I place side bets?", a:"Yes! Side bets are optional and separate from league scoring. If a non-betting player wins the game, the $5 is returned to each bettor."},
  ];
  return (
    <div className="fa">
      <h2 style={{fontFamily:"Playfair Display,serif",fontSize:24,color:C.roseDark,fontStyle:"italic",marginBottom:4}}>Rules & Scoring Guide 📖</h2>
      <p style={{color:C.textSoft,fontSize:13,marginBottom:20}}>Quick reference for league rules. When in doubt, check here!</p>
      <div style={{display:"flex",flexDirection:"column",gap:14,marginBottom:24}}>
        {sections.map(sec=>(
          <div key={sec.title} style={{background:sec.bg,borderRadius:14,padding:"1.25rem",border:`1.5px solid ${sec.bd}`}}>
            <div style={{fontSize:16,fontWeight:700,color:sec.tc,marginBottom:10}}>{sec.icon} {sec.title}</div>
            <ul style={{paddingLeft:18,display:"flex",flexDirection:"column",gap:6}}>
              {sec.items.map((item,i)=><li key={i} style={{fontSize:13,color:C.text,lineHeight:1.6}}>{item}</li>)}
            </ul>
          </div>
        ))}
      </div>
      <h2 style={{fontFamily:"Playfair Display,serif",fontSize:20,color:C.roseDark,fontStyle:"italic",marginBottom:14}}>Scoring & Payout FAQ</h2>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {faqs.map((f,i)=>(
          <Card key={i} pad="1rem">
            <div style={{fontSize:14,fontWeight:700,color:C.roseDark,marginBottom:6}}>{f.q}</div>
            <div style={{fontSize:13,color:C.textMid,lineHeight:1.7}}>{f.a}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─── SUPABASE DIAGNOSTIC ──────────────────────────────────────────────────────
function SbDiagnostic() {
  const [result,  setResult]  = useState(null);
  const [testing, setTesting] = useState(false);

  async function runTest() {
    setTesting(true); setResult(null);
    const lines = [];
    const urlVal = (SUPABASE_URL||"").trim();
    const keyVal = (SUPABASE_KEY||"").trim();

    if (!USE_SUPABASE) {
      let hint = "Open App.jsx, replace YOUR_SUPABASE_URL and YOUR_SUPABASE_ANON_KEY, rebuild and redeploy.";
      if (urlVal.includes("YOUR_") || keyVal.includes("YOUR_")) hint = "Placeholder text is still in the file — make sure you replaced both values.";
      else if (!urlVal.startsWith("https://")) hint = `Your URL should start with https:// but starts with: "${urlVal.slice(0,30)}"`;
      lines.push({ok:false, msg:"Supabase keys not configured. "+hint});
      setResult(lines); setTesting(false); return;
    }
    lines.push({ok:true, msg:"✓ Keys present (URL: "+urlVal.slice(0,35)+"…)"});

    // ── Check 2: read test ────────────────────────────────────────────────────
    try {
      const r = await fetch(`${_url}/rest/v1/league_state?id=eq.singleton&select=id`, {
        headers:{"apikey":_key,"Authorization":`Bearer ${_key}`,"Accept":"application/json"}
      });
      const bodyText = await r.text();
      if (r.ok) {
        lines.push({ok:true, msg:`✓ Connected to Supabase (HTTP ${r.status})`});
        let rows = [];
        try { rows = JSON.parse(bodyText); } catch {}
        if (Array.isArray(rows) && rows.length > 0) {
          lines.push({ok:true, msg:"✓ Database row exists — table is set up correctly"});
        } else {
          // Row not found — try to create it automatically
          lines.push({ok:false, msg:`⚠ Table exists but the data row is missing. Run this SQL in Supabase → SQL Editor: INSERT INTO league_state (id, data) VALUES ('singleton', '{}') ON CONFLICT (id) DO NOTHING;`});
        }
      } else {
        // Show the exact error body so we can diagnose
        let errDetail = bodyText;
        try { const j = JSON.parse(bodyText); errDetail = j.message || j.hint || j.code || bodyText; } catch {}
        if (r.status === 404) {
          lines.push({ok:false, msg:`✗ Table not found (404). The league_state table does not exist yet. Go to Supabase → SQL Editor and run the full setup schema shown below. Detail: ${errDetail}`});
        } else if (r.status === 401 || r.status === 403) {
          lines.push({ok:false, msg:`✗ Permission denied (${r.status}). Your anon key may be wrong, or Row Level Security is blocking reads. Go to Supabase → Authentication → Policies and make sure league_state has no blocking policies, or run: ALTER TABLE league_state DISABLE ROW LEVEL SECURITY; Detail: ${errDetail}`});
        } else {
          lines.push({ok:false, msg:`✗ Read failed (HTTP ${r.status}): ${errDetail}`});
        }
        // Still attempt write test even if read failed
      }
    } catch(e) {
      lines.push({ok:false, msg:`✗ Cannot reach Supabase at all: ${e.message}. Check your Project URL is correct.`});
    }

    // ── Check 3: write test (uses _connection_test row — never touches real data) ──
    try {
      const r = await fetch(`${_url}/rest/v1/league_state`, {
        method:"POST",
        headers:{
          "apikey":_key,
          "Authorization":`Bearer ${_key}`,
          "Content-Type":"application/json",
          "Prefer":"resolution=merge-duplicates",
        },
        body:JSON.stringify({id:"_connection_test", data:{_test:true,_ts:Date.now()}, updated_at:new Date().toISOString()}),
      });
      const bodyText = await r.text();
      if (r.ok) {
        lines.push({ok:true, msg:"✓ Write test passed — saves are working correctly"});
      } else {
        let errDetail = bodyText;
        try { const j = JSON.parse(bodyText); errDetail = j.message || j.hint || j.code || bodyText; } catch {}
        if (r.status === 401 || r.status === 403) {
          lines.push({ok:false, msg:`✗ Write blocked (${r.status}): Row Level Security is preventing writes. Go to Supabase → SQL Editor and run: ALTER TABLE league_state DISABLE ROW LEVEL SECURITY; Detail: ${errDetail}`});
        } else if (r.status === 404) {
          lines.push({ok:false, msg:`✗ Write failed (404): Table not found. Run the setup SQL schema below. Detail: ${errDetail}`});
        } else {
          lines.push({ok:false, msg:`✗ Write failed (HTTP ${r.status}): ${errDetail}`});
        }
      }
    } catch(e) {
      lines.push({ok:false, msg:`✗ Write error: ${e.message}`});
    }

    setResult(lines); setTesting(false);
  }

  return (
    <Card style={{border:`1.5px solid ${C.rose}`}}>
      <STitle>Connection diagnostic</STitle>
      <p style={{fontSize:13,color:C.textMid,marginBottom:14}}>Test whether Supabase is connected and saving correctly.</p>
      <button onClick={runTest} disabled={testing} style={{background:`linear-gradient(90deg,${C.roseDark},${C.lavDark})`,color:"#fff",border:"none",borderRadius:10,padding:"9px 20px",fontSize:13,fontWeight:700,marginBottom:14,opacity:testing?0.6:1}}>
        {testing ? "Running tests…" : "Run connection test"}
      </button>
      {result && (
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {result.map((r,i)=>(
            <div key={i} style={{background:r.ok?C.mint:C.sakura,borderRadius:10,padding:"10px 14px",fontSize:13,color:r.ok?C.mintDark:C.roseDark,fontWeight:600,border:`1px solid ${r.ok?C.mintDark:C.roseDark}`}}>
              {r.msg}
            </div>
          ))}
          {result.every(r=>r.ok) && <div style={{background:C.mint,borderRadius:10,padding:"10px 14px",fontSize:13,color:C.mintDark,fontWeight:700,border:`1px solid ${C.mintDark}`}}>🎉 Everything is working! All devices will sync within 20 seconds.</div>}
        </div>
      )}
      {!USE_SUPABASE && <div style={{background:C.goldLight,borderRadius:10,padding:"10px 14px",fontSize:13,color:"#9A6820",fontWeight:700,marginTop:8}}>⚠ Local-only mode. Fill in your keys, rebuild, and redeploy to enable sync.</div>}
    </Card>
  );
}

// ─── CHALLENGE POT EDITOR ─────────────────────────────────────────────────────
function ChallengePotEditor({st, upd}) {
  const weeks = st.weeks || [];
  const [fromWeek, setFromWeek] = useState(1);
  const [amount,   setAmount]   = useState("");
  const [applied,  setApplied]  = useState(false);

  // Find the first week that has no challenge winners yet (i.e. hasn't been "completed")
  const firstOpenWeek = weeks.findIndex(w => !(w.challengeWinners||[]).length && !((w.challengeWinners||[]).includes("__rollover__")));
  // default fromWeek to next open week on mount
  const defaultFrom = firstOpenWeek >= 0 ? firstOpenWeek + 1 : 1;

  function applyPots() {
    const n = parseInt(amount);
    if (!n || n < 1) return;
    const startIdx = fromWeek - 1;
    upd(s => ({
      ...s,
      weeks: s.weeks.map((w, i) => i >= startIdx ? {...w, challengePot: n} : w),
    }));
    setApplied(true);
    setTimeout(() => setApplied(false), 2500);
  }

  // Build a summary of distinct pot amounts per week for the preview
  const potGroups = [];
  weeks.forEach((w, i) => {
    const pot = w.challengePot || 5;
    const last = potGroups[potGroups.length - 1];
    if (last && last.pot === pot) {
      last.end = i + 1;
    } else {
      potGroups.push({pot, start: i + 1, end: i + 1});
    }
  });

  return (
    <Card>
      <STitle>Weekly challenge pot amounts</STitle>
      <p style={{fontSize:13,color:C.textSoft,marginBottom:14}}>
        Set a new pot amount for a range of upcoming weeks. Weeks that have already been completed won't be changed.
      </p>

      {/* Current schedule preview */}
      <div style={{marginBottom:16}}>
        <div style={{fontSize:11,fontWeight:700,color:C.textMid,textTransform:"uppercase",letterSpacing:".5px",marginBottom:8}}>Current pot schedule</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
          {weeks.map((w, i) => {
            const pot = w.challengePot || 5;
            const hasWinner = (w.challengeWinners||[]).some(x => x !== "__rollover__");
            const rolledOver = (w.challengeWinners||[]).includes("__rollover__");
            const done = hasWinner || rolledOver;
            return (
              <div key={i} style={{
                background: done ? C.mint : C.goldLight,
                border: `1.5px solid ${done ? C.mintDark : "#E8C87A"}`,
                borderRadius: 8, padding: "5px 10px", textAlign: "center", minWidth: 52,
              }}>
                <div style={{fontSize:10,fontWeight:700,color:done?C.mintDark:"#9A6820"}}>Wk {i+1}</div>
                <div style={{fontSize:13,fontWeight:700,color:done?C.mintDark:"#9A6820"}}>${pot}</div>
                {done && <div style={{fontSize:9,color:C.mintDark}}>done</div>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Editor */}
      <div style={{display:"flex",flexDirection:"column",gap:10,background:C.petal,borderRadius:12,padding:"14px",border:`1.5px solid ${C.border}`}}>
        <div style={{fontSize:12,fontWeight:700,color:C.textMid}}>Apply a new pot amount starting from a specific week:</div>
        <div style={{display:"flex",gap:10,flexWrap:"wrap",alignItems:"flex-end"}}>
          <div>
            <label style={{fontSize:11,fontWeight:700,color:C.textMid,display:"block",marginBottom:5,textTransform:"uppercase",letterSpacing:".5px"}}>From week</label>
            <select value={fromWeek} onChange={e=>setFromWeek(Number(e.target.value))} style={{width:"auto",fontSize:13,padding:"7px 10px"}}>
              {weeks.map((w,i) => (
                <option key={i} value={i+1}>Week {i+1}{(w.challengeWinners||[]).some(x=>x!=="__rollover__") || (w.challengeWinners||[]).includes("__rollover__") ? " (done)" : ""}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{fontSize:11,fontWeight:700,color:C.textMid,display:"block",marginBottom:5,textTransform:"uppercase",letterSpacing:".5px"}}>New pot amount</label>
            <div style={{display:"flex",alignItems:"center",gap:4}}>
              <span style={{fontSize:14,color:C.textMid,fontWeight:700}}>$</span>
              <input
                type="number" min="1" value={amount}
                onChange={e=>setAmount(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&applyPots()}
                placeholder="e.g. 6"
                style={{width:90}}
              />
            </div>
          </div>
          <button onClick={applyPots} style={{padding:"9px 20px",borderRadius:10,background:C.rose,color:"#fff",border:"none",fontWeight:700,fontSize:13,alignSelf:"flex-end"}}>
            Apply ✓
          </button>
        </div>
        {fromWeek > 1 && amount && (
          <div style={{fontSize:12,color:C.textMid,fontStyle:"italic"}}>
            This will set weeks {fromWeek}–{TOTAL_WEEKS} to ${amount}, leaving weeks 1–{fromWeek-1} unchanged.
          </div>
        )}
        {fromWeek === 1 && amount && (
          <div style={{fontSize:12,color:C.textMid,fontStyle:"italic"}}>
            This will set all {TOTAL_WEEKS} weeks to ${amount}.
          </div>
        )}
        {applied && <div style={{background:C.mint,color:C.mintDark,borderRadius:8,padding:"8px 12px",fontSize:13,fontWeight:700}}>✓ Pot amounts updated!</div>}
      </div>
    </Card>
  );
}

// ─── ADMIN ────────────────────────────────────────────────────────────────────
function Admin({st, upd, stats, players}) {
  const [tab,          setTab]         = useState("settings");
  const [newPlayer,    setNewPlayer]   = useState("");
  const [removeTarget, setRemoveTarget] = useState(null);
  const [confirmRemove,setConfirmRemove] = useState(false);
  const safe   = players || [];
  const sorted = [...safe].sort((a,b) => (stats[b]?.ppg||0)-(stats[a]?.ppg||0));
  const payouts = st.seasonPayouts || {first:400, second:150, third:75, fourth:0};

  function addPlayer() {
    const name = newPlayer.trim();
    if (!name || safe.includes(name)) return;
    upd(s => ({
      ...s,
      players: [...s.players, name],
      weeks: s.weeks.map(w => ({...w, rsvps:{...w.rsvps, [name]:"pending"}})),
    }));
    setNewPlayer("");
  }

  function removePlayer(name) {
    // Remove from players list and RSVPs, but preserve all game history intact
    upd(s => ({
      ...s,
      players: s.players.filter(p => p !== name),
      weeks: s.weeks.map(w => ({
        ...w,
        rsvps: Object.fromEntries(Object.entries(w.rsvps||{}).filter(([k])=>k!==name)),
        tables: (w.tables||[]).map(t => t.filter(p=>p!==name)).filter(t=>t.length>0),
        // games are intentionally preserved as-is to protect other players' scores
      })),
      seasonAwards: (s.seasonAwards||[]).map(a => a.winner===name ? {...a,winner:null} : a),
    }));
    setRemoveTarget(null);
    setConfirmRemove(false);
  }

  function setPayoutField(field, val) {
    const n = parseInt(val) || 0;
    upd(s => ({...s, seasonPayouts:{...(s.seasonPayouts||{}), [field]:n}}));
  }

  const SCHEMA = `create table if not exists league_state (
  id text primary key default 'singleton',
  data jsonb not null,
  updated_at timestamptz default now()
);
insert into league_state (id,data)
  values ('singleton','{}')
  on conflict (id) do nothing;`;

  return (
    <div className="fa">
      <h2 style={{fontFamily:"Playfair Display,serif",fontSize:22,color:C.roseDark,fontStyle:"italic",marginBottom:16}}>Admin panel ⚙</h2>
      <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:20}}>
        {["settings","players","awards","games","supabase","export"].map(t=>(
          <button key={t} onClick={()=>setTab(t)} style={{padding:"7px 14px",borderRadius:10,border:tab===t?`2px solid ${C.rose}`:`1.5px solid ${C.border}`,background:tab===t?C.sakura:C.white,color:tab===t?C.roseDark:C.textMid,fontSize:13,fontWeight:tab===t?700:500,textTransform:"capitalize"}}>{t}</button>
        ))}
      </div>

      {tab==="settings" && (
        <div style={{display:"flex",flexDirection:"column",gap:14,maxWidth:520}}>
          <Card>
            <STitle>Season scoring</STitle>
            <p style={{fontSize:13,color:C.textSoft,marginBottom:16}}>Changing this mid-season will NOT delete any game data.</p>
            <label style={{fontSize:11,fontWeight:700,color:C.textMid,display:"block",marginBottom:6,letterSpacing:".5px",textTransform:"uppercase"}}>Top N games that count toward season score</label>
            <input type="number" value={st.seasonSettings?.topGames||TOP_GAMES} onChange={e=>upd(s=>({...s,seasonSettings:{...s.seasonSettings,topGames:Number(e.target.value)}}))} style={{marginBottom:8}}/>
            <div style={{fontSize:11,color:C.textSoft,marginBottom:12}}>Each player's best N game scores sum to their season total.</div>
            <div style={{background:C.sakura,borderRadius:10,padding:"10px 14px",fontSize:13,color:C.roseDark,fontWeight:700}}>Currently: top {st.seasonSettings?.topGames||TOP_GAMES} games count</div>
          </Card>
          <Card>
            <STitle>Season-end placement payouts</STitle>
            <p style={{fontSize:13,color:C.textSoft,marginBottom:16}}>Update if the pot changes due to a player joining or leaving.</p>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {[["first","🥇 1st place"],["second","🥈 2nd place"],["third","🥉 3rd place"],["fourth","🎖️ 4th place"]].map(([field,label])=>(
                <div key={field} style={{display:"flex",alignItems:"center",gap:10}}>
                  <label style={{fontSize:13,fontWeight:700,color:C.textMid,minWidth:110}}>{label}</label>
                  <div style={{display:"flex",alignItems:"center",gap:4,flex:1}}>
                    <span style={{fontSize:14,color:C.textMid,fontWeight:700}}>$</span>
                    <input type="number" min="0" value={payouts[field]||0} onChange={e=>setPayoutField(field,e.target.value)} style={{width:"100%"}}/>
                  </div>
                </div>
              ))}
            </div>
            <div style={{background:C.mint,borderRadius:10,padding:"10px 14px",fontSize:13,color:C.mintDark,fontWeight:700,marginTop:12}}>
              Current pot: 1st ${payouts.first||0} · 2nd ${payouts.second||0} · 3rd ${payouts.third||0} · 4th ${payouts.fourth||0}
            </div>
          </Card>
          <Card>
            <STitle>Season-long challenge award prizes</STitle>
            <p style={{fontSize:13,color:C.textSoft,marginBottom:12}}>Prize amount for each of the 3 season-long awards (concealed hand, most sections, risk taker).</p>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <label style={{fontSize:13,fontWeight:700,color:C.textMid,minWidth:110}}>Prize each</label>
              <div style={{display:"flex",alignItems:"center",gap:4,flex:1}}>
                <span style={{fontSize:14,color:C.textMid,fontWeight:700}}>$</span>
                <input type="number" min="0" value={st.challengeAwardPrize||10} onChange={e=>upd(s=>({...s,challengeAwardPrize:parseInt(e.target.value)||0}))} style={{width:"100%"}}/>
              </div>
            </div>
          </Card>
          <ChallengePotEditor st={st} upd={upd}/>
        </div>
      )}

      {tab==="players" && (
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <Card>
            <STitle>Current players ({safe.length})</STitle>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(190px,1fr))",gap:8}}>
              {[...safe].sort((a,b)=>a.localeCompare(b)).map(p=>(
                <div key={p} style={{display:"flex",alignItems:"center",gap:8,background:C.petal,borderRadius:10,padding:"8px 10px",border:`1.5px solid ${C.border}`}}>
                  <Av name={p} players={safe} size={24}/>
                  <div style={{flex:1}}>
                    <div style={{fontSize:12,fontWeight:700}}>{p}</div>
                    <div style={{fontSize:11,color:C.textSoft}}>{stats[p]?.totalGames||0}g · {stats[p]?.totalPoints||0}pts · {(stats[p]?.ppg||0).toFixed(1)} ppg</div>
                  </div>
                  {removeTarget === p ? (
                    <div style={{display:"flex",flexDirection:"column",gap:4,alignItems:"flex-end"}}>
                      {!confirmRemove ? (
                        <>
                          <div style={{fontSize:10,color:C.roseDark,fontWeight:700,textAlign:"right",maxWidth:120}}>Remove {p} from league?</div>
                          <div style={{display:"flex",gap:4}}>
                            <button onClick={()=>setConfirmRemove(true)} style={{fontSize:10,padding:"3px 8px",borderRadius:6,background:C.roseDark,color:"#fff",border:"none",fontWeight:700}}>Confirm</button>
                            <button onClick={()=>{setRemoveTarget(null);setConfirmRemove(false);}} style={{fontSize:10,padding:"3px 8px",borderRadius:6,background:C.white,color:C.textMid,border:`1px solid ${C.border}`,fontWeight:700}}>Cancel</button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div style={{fontSize:10,color:C.roseDark,fontWeight:700,textAlign:"right",maxWidth:120}}>⚠ Are you sure? This cannot be undone.</div>
                          <div style={{display:"flex",gap:4}}>
                            <button onClick={()=>removePlayer(p)} style={{fontSize:10,padding:"3px 8px",borderRadius:6,background:"#A32D2D",color:"#fff",border:"none",fontWeight:700}}>Yes, remove</button>
                            <button onClick={()=>{setRemoveTarget(null);setConfirmRemove(false);}} style={{fontSize:10,padding:"3px 8px",borderRadius:6,background:C.white,color:C.textMid,border:`1px solid ${C.border}`,fontWeight:700}}>Cancel</button>
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <button onClick={()=>{setRemoveTarget(p);setConfirmRemove(false);}} style={{fontSize:10,padding:"3px 8px",borderRadius:6,background:"transparent",color:C.textSoft,border:`1px solid ${C.border}`,fontWeight:700}}>Remove</button>
                  )}
                </div>
              ))}
            </div>
            <div style={{background:C.goldLight,borderRadius:10,padding:"10px 14px",fontSize:12,color:"#9A6820",marginTop:12}}>
              ⚠ Removing a player keeps all game history intact — other players' scores from games with that player are not affected.
            </div>
          </Card>
          <Card>
            <STitle>Add a player mid-season</STitle>
            <p style={{fontSize:13,color:C.textSoft,marginBottom:14}}>New players start with 0 games and get added to all week RSVPs as pending.</p>
            <div style={{display:"flex",gap:8}}>
              <input value={newPlayer} onChange={e=>setNewPlayer(e.target.value)} placeholder="New player name…" onKeyDown={e=>e.key==="Enter"&&addPlayer()}/>
              <button onClick={addPlayer} style={{padding:"8px 18px",borderRadius:10,background:C.rose,color:"#fff",border:"none",fontWeight:700,fontSize:13,flexShrink:0}}>Add</button>
            </div>
            {safe.includes(newPlayer.trim()) && newPlayer.trim() && <div style={{fontSize:12,color:C.roseDark,marginTop:8,fontWeight:700}}>That name is already in the league!</div>}
          </Card>
        </div>
      )}

      {tab==="awards" && (
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <Card>
            <STitle>Season-long awards</STitle>
            <p style={{fontSize:12,color:C.textSoft,marginBottom:14,fontStyle:"italic"}}>Sections covered and Risk Taker awards are determined automatically from game data. Risk Taker goes to the player with the highest single hand value (jokerless +10 bonus included).</p>
            {(st.seasonAwards||[]).map(a=>(
              <div key={a.id} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 0",borderBottom:`1px dashed ${C.border}`}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:14,fontWeight:700}}>{a.label}</div>
                  <div style={{fontSize:12,color:C.textSoft}}>${st.challengeAwardPrize||a.prize} prize {a.auto?"(auto)":""}</div>
                </div>
                {!a.auto ? (
                  <select value={a.winner||""} onChange={e=>upd(s=>({...s,seasonAwards:s.seasonAwards.map(x=>x.id===a.id?{...x,winner:e.target.value||null}:x)}))} style={{width:"auto",fontSize:13}}>
                    <option value="">No winner yet</option>
                    {[...safe].sort((a,b)=>a.localeCompare(b)).map(p=><option key={p} value={p}>{p}</option>)}
                  </select>
                ) : <span style={{fontSize:13,fontWeight:700,color:C.mintDark}}>Auto ✓</span>}
              </div>
            ))}
          </Card>
          <Card>
            <STitle>Projected prizes</STitle>
            {sorted.slice(0,4).map((p,i)=>(
              <div key={p} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:i<3?`1px dashed ${C.border}`:"none"}}>
                <Av name={p} players={safe} size={32}/>
                <div style={{flex:1}}>
                  <div style={{fontSize:14,fontWeight:700}}>{["1st","2nd","3rd","4th"][i]} — {p}</div>
                  <div style={{fontSize:12,color:C.textSoft}}>{(stats[p]?.ppg||0).toFixed(1)} ppg · {stats[p]?.totalPoints||0} pts · {stats[p]?.totalGames||0}g</div>
                </div>
                <div style={{fontSize:18,fontWeight:700,color:C.mintDark}}>${[payouts.first||400,payouts.second||150,payouts.third||75,payouts.fourth||0][i]}</div>
              </div>
            ))}
          </Card>
        </div>
      )}
      {tab==="games" && (
        <GameEditor st={st} upd={upd} players={safe} stats={stats}/>
      )}

            {tab==="supabase" && (
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <SbDiagnostic/>
          <Card>
            <STitle>Supabase setup schema</STitle>
            <p style={{fontSize:13,color:C.textMid,marginBottom:12}}>Run this in Supabase → SQL Editor if you haven't already:</p>
            <div style={{background:"#2C2C2A",borderRadius:10,padding:"14px",marginBottom:12,overflowX:"auto"}}>
              <pre style={{fontSize:11,color:"#FAC775",lineHeight:1.6,whiteSpace:"pre-wrap",margin:0}}>{SCHEMA}</pre>
            </div>
            <div style={{background:C.goldLight,borderRadius:10,padding:"10px 14px",fontSize:13,color:"#9A6820",fontWeight:700}}>
              ✦ Every change saves to Supabase immediately and syncs to all devices within 20 seconds.
            </div>
          </Card>
        </div>
      )}

      {tab==="export" && (
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          {/* ── JSON backup ── */}
          <Card>
            <STitle>JSON data backup</STitle>
            <p style={{fontSize:13,color:C.textSoft,marginBottom:16}}>Downloads the complete season database as a file you can save to your computer.</p>
            <button onClick={()=>{const b=new Blob([JSON.stringify(st,null,2)],{type:"application/json"});const u=URL.createObjectURL(b);const a=document.createElement("a");a.href=u;a.download="mahjong_league_2026.json";a.click();}} style={{background:`linear-gradient(90deg,${C.roseDark},${C.lavDark})`,color:"#fff",border:"none",borderRadius:10,padding:"10px 20px",fontSize:13,fontWeight:700}}>
              ↓ Download full JSON backup
            </button>
          </Card>

          {/* ── Printable / email-ready weekly summary ── */}
          <Card>
            <STitle>Weekly summary report</STitle>
            <p style={{fontSize:13,color:C.textSoft,marginBottom:4}}>
              Generates a clean, printable summary of every week — games played, winners, scores, and challenge results.
              You can print it, save it as a PDF, or copy the text into an email.
            </p>
            <p style={{fontSize:12,color:C.textSoft,marginBottom:16,fontStyle:"italic"}}>
              To save as PDF: click "Open report", then use your browser's Print function (Cmd+P on Mac, Ctrl+P on Windows) and choose "Save as PDF" as the destination.
            </p>
            <button onClick={()=>openWeeklySummary(st, stats, safe)} style={{background:`linear-gradient(90deg,${C.roseDark},${C.lavDark})`,color:"#fff",border:"none",borderRadius:10,padding:"10px 20px",fontSize:13,fontWeight:700,marginBottom:16}}>
              📄 Open printable report
            </button>
            <div style={{background:C.petal,borderRadius:12,padding:"1rem",border:`1.5px solid ${C.border}`}}>
              <div style={{fontSize:12,fontWeight:700,color:C.textMid,marginBottom:10,letterSpacing:".5px",textTransform:"uppercase"}}>Preview — current standings</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:8}}>
                {[...safe].sort((a,b)=>a.localeCompare(b)).map(p=>(
                  <div key={p} style={{background:C.white,borderRadius:10,padding:"10px 12px",border:`1.5px solid ${C.border}`}}>
                    <div style={{fontWeight:700,fontSize:13,marginBottom:4}}>{p}</div>
                    <div style={{fontSize:12,color:C.textMid}}>PPG: {(stats[p]?.ppg||0).toFixed(1)}</div>
                    <div style={{fontSize:12,color:C.textMid}}>Total: {stats[p]?.totalPoints||0}pts</div>
                    <div style={{fontSize:12,color:C.textMid}}>Games: {stats[p]?.totalGames||0}</div>
                    <div style={{fontSize:12,color:C.textMid}}>3P: {stats[p]?.threePersonGames||0}</div>
                    <div style={{fontSize:12,color:C.textMid}}>Sections: {stats[p]?.sectionsCount||0}</div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

// ─── WEEKLY SUMMARY REPORT (opens in new tab, printable / saveable as PDF) ───
function openWeeklySummary(st, stats, players) {
  const weeks   = st.weeks || [];
  const sorted  = [...players].sort((a,b) => (stats[b]?.ppg||0)-(stats[a]?.ppg||0));
  const fmtDate = d => { try{const[,m,dy]=d.split("-");return ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][+m-1]+" "+Number(dy);}catch{return d||"";} };

  // Build standings table rows
  const standingRows = sorted.map((p,i) => {
    const s = stats[p] || {};
    const all = [...(s.allGames||[])].sort((a,b)=>b.points-a.points);
    const scorePills = all.map((g) => `<span style="display:inline-block;background:#B8E4D8;color:#3D9E84;border-radius:4px;padding:1px 6px;font-size:11px;margin:1px;">${g.points}pt</span>`).join(" ");
    return `<tr style="background:${i%2===0?"#fff":"#FFF0F5"}">
      <td style="padding:8px 10px;font-weight:700;">${i+1}</td>
      <td style="padding:8px 10px;font-weight:700;">${p}</td>
      <td style="padding:8px 10px;text-align:center;font-size:18px;font-weight:700;color:#C45575;">${(s.ppg||0).toFixed(1)}</td>
      <td style="padding:8px 10px;text-align:center;font-weight:700;">${s.totalPoints||0}</td>
      <td style="padding:8px 10px;text-align:center;">${s.totalGames||0}</td>
      <td style="padding:8px 10px;text-align:center;">${s.sectionsCount||0}</td>
      <td style="padding:8px 10px;text-align:center;">${s.highestHandBonus||0}</td>
      <td style="padding:8px 10px;font-size:12px;">${scorePills||"—"}</td>
    </tr>`;
  }).join("\n");

  // Build week-by-week section
  const weekSections = weeks.map(w => {
    const ch = (st.seasonSettings?.challenges || []) || [];
    const chDesc = ["First Mahjong of the night","Mahjong with Dragons","Mahjong with Winds","Mahjong with Flowers","Mahjong from Evens section (2468)","Mahjong from Odds section (13579)","Mahjong with less than 10 tiles on the wall","Mahjong with at least 2 pairs","Mahjong with 3 different tile families","Mahjong from the top row of any section","Closest to Mahjong without winning","Mahjong from 2026 section"][w.week-1] || "";
    const chWinners = (w.challengeWinners||[]).filter(x=>x!=="__rollover__");
    const chRolled  = (w.challengeWinners||[]).includes("__rollover__");
    const pot = w.challengePot || 5;

    const gameRows = (w.games||[]).map((g,gi) => {
      const players = (g.players||[]).sort((a,b)=>a.localeCompare(b));
      const resultCells = players.map(p => {
        const r = g.results?.[p] || {};
        const isW = g.winner === p;
        return `<td style="padding:6px 8px;background:${isW?"#B8E4D8":"transparent"};font-weight:${isW?700:400};">
          ${p}: <strong>${r.points||0}pt</strong>
          ${isW && r.section ? `<br><span style="font-size:10px;color:#7B5EA7">${r.section} ${r.line||""}</span>` : ""}
          ${isW && !r.jokersUsed ? `<span style="font-size:10px;color:#9A6820"> +10 no jokers</span>` : ""}
        </td>`;
      }).join("");
      const typeLabel = g.type==="wall"?"Wall game":g.type==="false_declare"?"False declaration":"Completed hand";
      return `<tr><td style="padding:6px 8px;font-weight:700;color:#7A4A5E;">Game ${gi+1}</td>
        <td style="padding:6px 8px;color:#7A4A5E;font-size:12px;">${typeLabel}</td>
        ${resultCells}</tr>`;
    }).join("\n");

    const attendees = Object.entries(w.rsvps||{}).filter(([,v])=>v==="yes").map(([k])=>k).sort().join(", ") || "None recorded";

    return `<div style="margin-bottom:24px;border:1.5px solid #F0C8D8;border-radius:12px;overflow:hidden;">
      <div style="background:linear-gradient(90deg,#C45575,#7B5EA7);color:#fff;padding:12px 16px;">
        <strong style="font-size:16px;">Week ${w.week}</strong>
        <span style="margin-left:12px;font-size:13px;opacity:.9;">${fmtDate(w.date)}</span>
        ${w.location ? `<span style="margin-left:12px;font-size:13px;opacity:.9;">📍 ${w.location}</span>` : ""}
      </div>
      <div style="padding:12px 16px;background:#FFF0F5;">
        <div style="font-size:12px;color:#7A4A5E;margin-bottom:8px;"><strong>Attending:</strong> ${attendees}</div>
        <div style="font-size:12px;color:#9A6820;margin-bottom:8px;">
          <strong>⭐ Challenge:</strong> ${chDesc}
          ${chWinners.length>0 ? `— <strong style="color:#3D9E84">Won by: ${chWinners.join(", ")} (+$${chWinners.length>1?Math.floor(pot/chWinners.length):pot} each)</strong>` : ""}
          ${chRolled ? `— <em>Rolled over to week ${w.week+1}</em>` : ""}
          ${!chWinners.length && !chRolled ? "— No winner recorded yet" : ""}
        </div>
      </div>
      ${(w.games||[]).length > 0 ? `
      <table style="width:100%;border-collapse:collapse;font-size:13px;">
        <thead><tr style="background:#FFD6E5;">
          <th style="padding:6px 8px;text-align:left;">#</th>
          <th style="padding:6px 8px;text-align:left;">Type</th>
          <th style="padding:6px 8px;text-align:left;" colspan="10">Results</th>
        </tr></thead>
        <tbody>${gameRows}</tbody>
      </table>` : `<div style="padding:12px 16px;font-size:13px;color:#B07A90;font-style:italic;">No games logged yet.</div>`}
    </div>`;
  }).join("\n");

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Mahjong League 2026 — Season Summary</title>
  <style>
    body { font-family: Arial, sans-serif; color: #3D1F2E; max-width: 960px; margin: 0 auto; padding: 20px; }
    h1 { font-family: Georgia, serif; color: #C45575; font-style: italic; }
    h2 { font-family: Georgia, serif; color: #C45575; font-style: italic; font-size: 18px; margin: 24px 0 12px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    th { background: #FFD6E5; padding: 8px 10px; text-align: left; font-size: 12px; }
    @media print {
      button { display: none; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="no-print" style="background:#FFF3DC;border:1px solid #E8C87A;border-radius:8px;padding:10px 14px;margin-bottom:20px;font-size:13px;color:#9A6820;">
    <strong>To save as PDF:</strong> Use your browser's Print function (Cmd+P on Mac / Ctrl+P on Windows), then choose "Save as PDF" as the destination.
    To email: copy all the text on this page and paste it into an email, or attach the PDF.
  </div>
  <h1>🀄 Mahjong League 2026 — Season Summary</h1>
  <p style="color:#7A4A5E;font-size:13px;">Generated: ${new Date().toLocaleDateString("en-US",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}</p>
  <p style="color:#7A4A5E;font-size:13px;">Scoring: ranked by average points per game (all games count). Total points and games played shown for reference.</p>

  <h2>📊 Season standings</h2>
  <table>
    <thead><tr style="background:#FFD6E5;">
      <th>#</th><th>Player</th><th>PPG</th><th>Total</th><th>Games</th><th>Sections</th><th>Best hand</th><th>All scores</th>
    </tr></thead>
    <tbody>${standingRows}</tbody>
  </table>

  <h2>📅 Week-by-week results</h2>
  ${weekSections}

  <p style="font-size:11px;color:#B07A90;margin-top:24px;">Report generated by Mahjong League Tracker • mahjitlikeitshot.netlify.app</p>
</body>
</html>`;

  const blob = new Blob([html], {type:"text/html"});
  const url  = URL.createObjectURL(blob);
  window.open(url, "_blank");
}

// ─── GAME EDITOR (Admin > Games tab) ─────────────────────────────────────────
function GameEditor({st, upd, players, stats}) {
  const [selWeek, setSelWeek] = useState(0);
  const [editing,  setEditing] = useState(null); // {weekIdx, gameIdx}
  const [editData, setEditData] = useState(null);
  const safe  = players || [];
  const weeks = st.weeks || [];
  const week  = weeks[selWeek] || {};
  const games = week.games || [];
  const fmtDate = d => { try{const[,m,dy]=d.split("-");return["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][+m-1]+" "+Number(dy);}catch{return d||"";} };

  // Editable fields for a game
  function startEdit(weekIdx, gameIdx) {
    const g = (weeks[weekIdx]?.games||[])[gameIdx];
    if (!g) return;
    setEditing({weekIdx, gameIdx});
    setEditData({
      type:    g.type   || "completed",
      winner:  g.winner || "",
      falseDeclarant: g.falseDeclarant || "",
      players: [...(g.players||[])],
      results: JSON.parse(JSON.stringify(g.results||{})),
    });
  }

  function saveEdit() {
    if (!editing || !editData) return;
    const {weekIdx, gameIdx} = editing;
    upd(s => ({
      ...s,
      weeks: s.weeks.map((w,wi) => {
        if (wi !== weekIdx) return w;
        const newGames = [...(w.games||[])];
        const orig = newGames[gameIdx] || {};
        // Recompute points based on edited fields
        const results = {};
        if (editData.type === "wall") {
          editData.players.forEach(p => { results[p] = {points:10}; });
        } else if (editData.type === "false_declare") {
          editData.players.forEach(p => { results[p] = {points: p===editData.falseDeclarant?0:10}; });
        } else {
          // For completed hands, preserve original result data but update winner
          editData.players.forEach(p => {
            if (p === editData.winner) {
              // Keep original result stats for winner, or use edited override
              const origWinnerResult = editData.results[p] || orig.results?.[p] || {};
              results[p] = {...origWinnerResult, points: origWinnerResult.points || 0};
            } else {
              results[p] = {points:0};
            }
          });
        }
        newGames[gameIdx] = {
          ...orig,
          type: editData.type,
          winner: editData.type==="completed" ? editData.winner : null,
          falseDeclarant: editData.type==="false_declare" ? editData.falseDeclarant : null,
          players: editData.players,
          results,
          lastEditedBy: "Admin",
          lastEditedAt: new Date().toISOString(),
        };
        return {...w, games:newGames};
      }),
    }));
    setEditing(null);
    setEditData(null);
  }

  function deleteGame(weekIdx, gameIdx) {
    if (!window.confirm("Delete this game? This cannot be undone.")) return;
    upd(s => ({
      ...s,
      weeks: s.weeks.map((w,wi) => {
        if (wi !== weekIdx) return w;
        return {...w, games:(w.games||[]).filter((_,gi)=>gi!==gameIdx)};
      }),
    }));
    setEditing(null);
  }

  // Points override for completed hand edit
  function setResultPoints(player, pts) {
    setEditData(prev => ({...prev, results:{...prev.results,[player]:{...(prev.results[player]||{}),points:Number(pts)||0}}}));
  }
  function setResultField(player, field, val) {
    setEditData(prev => ({...prev, results:{...prev.results,[player]:{...(prev.results[player]||{}),[field]:val}}}));
  }

  return (
    <div>
      <Card style={{marginBottom:14}}>
        <STitle>Edit or delete games</STitle>
        <p style={{fontSize:13,color:C.textSoft,marginBottom:14}}>
          Select a week to view its games. You can edit the winner, game type, or player list, or delete a game entirely.
          Use this to fix anything entered incorrectly.
        </p>
        <div style={{marginBottom:12}}>
          <label style={{fontSize:11,fontWeight:700,color:C.textMid,display:"block",marginBottom:6,letterSpacing:".5px",textTransform:"uppercase"}}>Select week</label>
          <select value={selWeek} onChange={e=>setSelWeek(Number(e.target.value))} style={{width:"auto",minWidth:200}}>
            {weeks.map((w,i)=>(
              <option key={i} value={i}>Week {w.week} — {fmtDate(w.date)} ({(w.games||[]).length} games)</option>
            ))}
          </select>
        </div>

        {games.length === 0
          ? <p style={{fontSize:13,color:C.textSoft,fontStyle:"italic"}}>No games logged for this week yet.</p>
          : games.map((g,gi) => {
            const isEditingThis = editing?.weekIdx===selWeek && editing?.gameIdx===gi;
            const wPlayers = [...(g.players||[])].sort((a,b)=>a.localeCompare(b));
            return (
              <div key={gi} style={{border:`1.5px solid ${isEditingThis?C.rose:C.border}`,borderRadius:12,padding:"12px 14px",marginBottom:10,background:isEditingThis?C.petal:C.white}}>
                {/* Game summary row */}
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:isEditingThis?12:0,flexWrap:"wrap",gap:8}}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <span style={{fontSize:12,fontWeight:700,color:C.textMid}}>GAME {gi+1}</span>
                    <span className="pill" style={{background:C.goldLight,color:"#9A6820"}}>{g.type==="wall"?"Wall 🃏":g.type==="false_declare"?"False ❌":"Completed 🀄"}</span>
                    {g.winner && <span style={{fontSize:13,fontWeight:700,color:C.mintDark}}>🏆 {g.winner}</span>}
                    <span style={{fontSize:12,color:C.textSoft}}>{wPlayers.join(", ")}</span>
                  </div>
                  <div style={{display:"flex",gap:6}}>
                    {!isEditingThis && (
                      <button onClick={()=>startEdit(selWeek,gi)} style={{fontSize:12,padding:"5px 12px",borderRadius:8,border:`1.5px solid ${C.rose}`,background:C.white,color:C.roseDark,fontWeight:700}}>
                        Edit
                      </button>
                    )}
                    <button onClick={()=>deleteGame(selWeek,gi)} style={{fontSize:12,padding:"5px 12px",borderRadius:8,border:"1.5px solid #E24B4A",background:C.white,color:"#A32D2D",fontWeight:700}}>
                      Delete
                    </button>
                  </div>
                </div>

                {/* Edit form */}
                {isEditingThis && editData && (
                  <div style={{display:"flex",flexDirection:"column",gap:12}}>
                    {/* Game type */}
                    <div>
                      <label style={{fontSize:11,fontWeight:700,color:C.textMid,display:"block",marginBottom:6,textTransform:"uppercase",letterSpacing:".5px"}}>Game type</label>
                      <div style={{display:"flex",gap:8}}>
                        {[["completed","Completed 🀄"],["wall","Wall 🃏"],["false_declare","False ❌"]].map(([v,l])=>(
                          <button key={v} onClick={()=>setEditData(p=>({...p,type:v}))} style={{flex:1,padding:"8px",borderRadius:10,border:editData.type===v?`2px solid ${C.rose}`:`1.5px solid ${C.border}`,background:editData.type===v?C.sakura:C.white,color:editData.type===v?C.roseDark:C.textMid,fontSize:11,fontWeight:editData.type===v?700:500}}>
                            {l}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Winner (for completed hands) */}
                    {editData.type==="completed" && (
                      <div>
                        <label style={{fontSize:11,fontWeight:700,color:C.textMid,display:"block",marginBottom:6,textTransform:"uppercase",letterSpacing:".5px"}}>Winner</label>
                        <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                          {[...editData.players].sort((a,b)=>a.localeCompare(b)).map(p=>(
                            <button key={p} onClick={()=>setEditData(prev=>({...prev,winner:p}))} style={{padding:"6px 13px",borderRadius:20,border:editData.winner===p?`2px solid ${C.mintDark}`:`1.5px solid ${C.border}`,background:editData.winner===p?C.mint:C.white,color:editData.winner===p?C.mintDark:C.textMid,fontSize:13,fontWeight:editData.winner===p?700:500}}>
                              {p}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* False declarant */}
                    {editData.type==="false_declare" && (
                      <div>
                        <label style={{fontSize:11,fontWeight:700,color:C.textMid,display:"block",marginBottom:6,textTransform:"uppercase",letterSpacing:".5px"}}>Who false declared?</label>
                        <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                          {[...editData.players].sort((a,b)=>a.localeCompare(b)).map(p=>(
                            <button key={p} onClick={()=>setEditData(prev=>({...prev,falseDeclarant:p}))} style={{padding:"6px 13px",borderRadius:20,border:editData.falseDeclarant===p?`2px solid ${C.roseDark}`:`1.5px solid ${C.border}`,background:editData.falseDeclarant===p?C.sakura:C.white,color:editData.falseDeclarant===p?C.roseDark:C.textMid,fontSize:13,fontWeight:editData.falseDeclarant===p?700:500}}>
                              {p}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Point overrides for completed hands */}
                    {editData.type==="completed" && (
                      <div>
                        <label style={{fontSize:11,fontWeight:700,color:C.textMid,display:"block",marginBottom:6,textTransform:"uppercase",letterSpacing:".5px"}}>Override winner's points (optional)</label>
                        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
                          {editData.winner && (
                            <>
                              <div>
                                <label style={{fontSize:10,color:C.textSoft,display:"block",marginBottom:3}}>Points total</label>
                                <input type="number" value={editData.results[editData.winner]?.points||""} onChange={e=>setResultPoints(editData.winner,e.target.value)} placeholder="pts"/>
                              </div>
                              <div>
                                <label style={{fontSize:10,color:C.textSoft,display:"block",marginBottom:3}}>Section</label>
                                <select value={editData.results[editData.winner]?.section||""} onChange={e=>setResultField(editData.winner,"section",e.target.value)}>
                                  <option value="">–</option>
                                  {Object.keys(CARD_2026).map(s=><option key={s} value={s}>{s}</option>)}
                                </select>
                              </div>
                              <div>
                                <label style={{fontSize:10,color:C.textSoft,display:"block",marginBottom:3}}>Line</label>
                                <select value={editData.results[editData.winner]?.line||""} onChange={e=>setResultField(editData.winner,"line",e.target.value)}>
                                  <option value="">–</option>
                                  {(CARD_2026[editData.results[editData.winner]?.section]||[]).map(l=><option key={l} value={l}>{l}</option>)}
                                </select>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Save / cancel */}
                    <div style={{display:"flex",gap:8}}>
                      <button onClick={saveEdit} style={{padding:"9px 20px",borderRadius:10,background:C.rose,color:"#fff",border:"none",fontWeight:700,fontSize:13}}>Save changes ✓</button>
                      <button onClick={()=>{setEditing(null);setEditData(null);}} style={{padding:"9px 20px",borderRadius:10,background:C.white,color:C.textMid,border:`1.5px solid ${C.border}`,fontWeight:700,fontSize:13}}>Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        }
      </Card>

      {/* Other editable data reference */}
      <Card>
        <STitle>Other data you can edit</STitle>
        <div style={{display:"flex",flexDirection:"column",gap:8,fontSize:13,color:C.textMid,lineHeight:1.8}}>
          {[
            ["Weekly location & date", "Go to 📅 Weekly tab → select the week → edit the location or date fields directly (Admin only)."],
            ["RSVPs", "Any player can update their own RSVP on the Weekly tab. As admin you can see all RSVPs there."],
            ["Table assignments", "Go to 📅 Weekly tab → suggest new tables → confirm. This overwrites the saved assignment."],
            ["Challenge winners", "Go to ⭐ Challenges tab → select the week → use the Remove button next to any winner, or undo a rollover."],
            ["Season award winners", "Go to ⚙ Admin → Awards tab → use the dropdown to change or clear any award winner."],
            ["Season scoring setting (top N games)", "Go to ⚙ Admin → Settings tab — safe to change at any time."],
            ["Adding a new player mid-season", "Go to ⚙ Admin → Players tab."],
            ["Challenge pot amounts", "These are calculated automatically from rollovers. If a pot is wrong, you can fix it by undoing a rollover on the Challenges tab and re-entering it."],
          ].map(([title, desc]) => (
            <div key={title} style={{background:C.petal,borderRadius:10,padding:"10px 14px",border:`1.5px solid ${C.border}`}}>
              <strong style={{color:C.roseDark}}>{title}:</strong> {desc}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
