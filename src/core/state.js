// Einziger Ort fuer den Spielzustand.
// Persistente Felder = Spielstand (Spec Abschnitt 11). Laufzeitfelder werden nie gespeichert.
import { CONFIG } from '../data/config.js';

export const state = {};

export function freshSave(seed = 1) {
  const c = CONFIG.character;
  return {
    saveVersion: CONFIG.save.version,
    savedAt: 0,
    character: { level: c.startLevel, xp: 0, strength: c.startStrength, vitality: c.startVitality, currentHP: null },
    currency: { gold: 0, gems: 0 },
    equipment: {
      helmet: null, chest: null, gloves: null, boots: null, weapon: null,
      shield: null, ring1: null, ring2: null, amulet: null,
    },
    inventory: [],
    skills: { passive: {}, active: {} },
    dungeons: { current: 1, unlocked: [1], killsInCurrent: 0, bossesDefeated: [] },
    stats: { totalKills: 0, killsByType: {}, totalXP: 0, legendariesFound: 0, mythicsFound: 0, highestItemLevel: 0 },
    achievements: [],
    prestigeCount: 0,
    settings: { sfx: true, reducedMotion: false },
    meta: { rngState: seed >>> 0, nextItemId: 1 },
  };
}

export const SAVE_KEYS = Object.keys(freshSave());

function freshRuntime() {
  return {
    derived: { strength: 0, vitality: 0, maxHP: 1, attack: 0, defense: 0, attackSpeed: 1, critChance: 0, critDamage: 0 },
    combat: {
      enemy: null,
      respawnTimer: 0,
      warriorCd: 0,
      enemyCd: 0,
      dead: false,
      deadTimer: 0,
    },
  };
}

export function loadIntoState(save) {
  for (const k of Object.keys(state)) delete state[k];
  Object.assign(state, JSON.parse(JSON.stringify(save)), freshRuntime());
}

export function snapshot() {
  const out = {};
  for (const k of SAVE_KEYS) out[k] = state[k];
  return out;
}
