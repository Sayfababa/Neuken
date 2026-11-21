// Audio-Manager (Phase 4): kurze Effekte fuer Treffer, Krit, Levelup, Loot und Boss.
// Spielt nur Dateien aus assets/audio/. Fehlt eine Datei oder kann das Geraet sie nicht abspielen,
// bleibt es still – ohne Fehler. Beachtet settings.sfx im Spielstand.
// Web Audio statt <audio>: auf iOS ohne Verzoegerung und mehrere Klaenge gleichzeitig.
import { state } from '../core/state.js';
import { on } from '../core/events.js';
import { CONFIG } from '../data/config.js';

const A = CONFIG.audio;
const raw = new Map();          // Sound-Name -> geladene Datei, noch nicht dekodiert
const buffers = new Map();      // Sound-Name -> dekodierter Klang
const lastAt = new Map();       // Sound-Name -> Zeitpunkt des letzten Abspielens
let ctx = null;
let master = null;

function createContext() {
  const Ctx = typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext);
  if (!Ctx) return null;
  try {
    const c = new Ctx();
    master = c.createGain();
    master.gain.value = A.masterVolume;
    master.connect(c.destination);
    return c;
  } catch { return null; }
}

async function loadSound(name, file) {
  try {
    const res = await fetch(A.dir + file + A.ext);
    if (!res.ok) return;
    raw.set(name, await res.arrayBuffer());
    if (ctx) decodePending();
  } catch { /* keine Datei: dieser Effekt bleibt still */ }
}

function decodePending() {
  for (const [name, data] of raw) {
    raw.delete(name);
    new Promise((ok, fail) => ctx.decodeAudioData(data, ok, fail))
      .then(buf => buffers.set(name, buf))
      .catch(() => { /* unlesbare Datei: still */ });
  }
}

// iOS gibt Ton erst nach einer Beruehrung frei (und sperrt ihn nach Unterbrechungen wieder).
// Der Audio-Kontext entsteht deshalb erst bei der ersten Beruehrung.
function unlock() {
  if (!ctx) {
    ctx = createContext();
    if (!ctx) return;
    decodePending();
  }
  if (ctx.state !== 'running') ctx.resume().catch(() => {});
}

export function play(name) {
  if (!ctx || !state.settings.sfx || ctx.state !== 'running') return;
  const buf = buffers.get(name);
  if (!buf) return;
  const now = performance.now();
  if (now - (lastAt.get(name) || -Infinity) < A.sounds[name].minGapMs) return;
  lastAt.set(name, now);
  const src = ctx.createBufferSource();
  const gain = ctx.createGain();
  gain.gain.value = A.sounds[name].volume;
  src.buffer = buf;
  src.connect(gain).connect(master);
  src.start();
}

export function init() {
  if (typeof fetch === 'undefined' || typeof document === 'undefined') return;
  for (const [name, s] of Object.entries(A.sounds)) loadSound(name, s.file);
  for (const ev of ['touchend', 'pointerdown', 'keydown']) document.addEventListener(ev, unlock, { passive: true });

  on('combat:hit', (h) => { if (h.target === 'enemy') play(h.crit ? 'crit' : 'hit'); });
  on('character:levelup', () => play('levelup'));
  on('item:created', () => play('loot'));
  on('boss:started', () => play('boss'));
}
