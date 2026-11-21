// Speichern, Laden, Migration. Ein Schluessel in localStorage.
import { state, freshSave, snapshot } from '../core/state.js';
import { on, emit } from '../core/events.js';
import { newSeed } from '../core/rng.js';
import { CONFIG, rarityIndex } from '../data/config.js';

const S = CONFIG.save;

// MIGRATIONS[v] hebt einen Spielstand von Version v auf v+1.
const MIGRATIONS = {};

function isObj(v) {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

// Fehlende Felder aus den Standardwerten ergaenzen, vorhandene nie ueberschreiben.
function fillDefaults(defaults, target) {
  for (const k of Object.keys(defaults)) {
    if (!(k in target)) target[k] = defaults[k];
    else if (isObj(defaults[k]) && isObj(target[k])) fillDefaults(defaults[k], target[k]);
  }
  return target;
}

export function migrate(save) {
  let v = Number.isInteger(save.saveVersion) ? save.saveVersion : 1;
  while (v < S.version) {
    const m = MIGRATIONS[v];
    if (m) save = m(save);
    v += 1;
    save.saveVersion = v;
  }
  return fillDefaults(freshSave(newSeed()), save);
}

function storage() {
  try { return window.localStorage; } catch { return null; }
}

// Liefert { save, notice } — notice: null | 'new' | 'corrupt'
export function loadGame() {
  const ls = storage();
  const raw = ls ? ls.getItem(S.key) : null;
  if (!raw) return { save: freshSave(newSeed()), notice: 'new' };
  try {
    const parsed = JSON.parse(raw);
    if (!isObj(parsed) || !isObj(parsed.character)) throw new Error('invalid save');
    return { save: migrate(parsed), notice: null };
  } catch {
    try { ls.setItem(S.corruptPrefix + Date.now(), raw); } catch { /* Speicher voll: Original bleibt erhalten */ }
    return { save: freshSave(newSeed()), notice: 'corrupt' };
  }
}

export function saveGame() {
  const ls = storage();
  if (!ls) return false;
  state.savedAt = Date.now();
  try {
    ls.setItem(S.key, JSON.stringify(snapshot()));
    emit('game:saved');
    return true;
  } catch {
    emit('save:failed');
    return false;
  }
}

export function exportSave() {
  return JSON.stringify(snapshot());
}

let sinceSave = 0;
let pending = false;

export function init() {
  const fromRarity = rarityIndex(S.autosaveFromRarity);
  on('tick', (dt) => {
    sinceSave += dt;
    if (pending || sinceSave >= S.autosaveMs) {
      pending = false;
      sinceSave = 0;
      saveGame();
    }
  });
  // Ereignis-Saves erst im naechsten Tick, damit alle Systeme ihren Teil erledigt haben.
  on('character:levelup', () => { pending = true; });
  on('item:created', (item) => { if (rarityIndex(item.rarity) >= fromRarity) pending = true; });
  on('equipment:changed', () => { pending = true; });
}
