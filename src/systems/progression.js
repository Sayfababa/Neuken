// XP, Level, Attribute, Gold, Kill-Statistik.
import { state } from '../core/state.js';
import { on, emit } from '../core/events.js';
import { CONFIG, xpRequired } from '../data/config.js';

function addXP(amount) {
  const ch = state.character;
  ch.xp += amount;
  state.stats.totalXP += amount;
  let gained = 0;
  while (ch.xp >= xpRequired(ch.level)) {
    ch.xp -= xpRequired(ch.level);
    ch.level += 1;
    ch.strength += CONFIG.character.strengthPerLevel;
    ch.vitality += CONFIG.character.vitalityPerLevel;
    gained += 1;
  }
  if (gained > 0) {
    emit('stats:dirty');
    emit('character:levelup', { level: ch.level, gained });
  }
}

function onKill(e) {
  const s = state.stats;
  s.totalKills += 1;
  s.killsByType[e.type] = (s.killsByType[e.type] || 0) + 1;
  state.currency.gold += e.gold;
  emit('rewards:gained', { xp: e.xp, gold: e.gold });
  addXP(e.xp);
}

// Prestige: nur vorbereitet (Spec Abschnitt 10)
export function prestigeAvailable() {
  return false;
}

export function init() {
  on('enemy:killed', onKill);
}
