// XP, Level, Attribute, Gold, Kill-Statistik, Achievements.
import { state } from '../core/state.js';
import { on, emit } from '../core/events.js';
import { CONFIG, xpRequired } from '../data/config.js';
import { ACHIEVEMENTS } from '../data/achievements.js';

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
  emit('rewards:gained', { xp: e.xp, gold: e.gold, isBoss: e.isBoss });
  addXP(e.xp);
}

// ---------- Achievements ----------
export function achievementStat(stat) {
  const s = state.stats;
  switch (stat) {
    case 'kills': return s.totalKills;
    case 'level': return state.character.level;
    case 'rarity': return s.highestRarity;
    case 'bosses': return state.dungeons.bossesDefeated.length;
    case 'slotsFilled': return Object.values(state.equipment).filter(Boolean).length;
    case 'itemLevel': return s.highestItemLevel;
    default: return 0;
  }
}

let checkPending = true;

function checkAchievements() {
  checkPending = false;
  for (const a of ACHIEVEMENTS) {
    if (state.achievements.includes(a.id)) continue;
    if (achievementStat(a.stat) >= a.goal) {
      state.achievements.push(a.id);
      emit('achievement:unlocked', a);
    }
  }
}

// Prestige: nur vorbereitet (Spec Abschnitt 10)
export function prestigeAvailable() {
  return false;
}

export function init() {
  on('enemy:killed', onKill);
  // Pruefung im naechsten Tick, wenn alle Systeme ihre Werte aktualisiert haben
  for (const ev of ['enemy:killed', 'character:levelup', 'item:created', 'boss:defeated', 'equipment:changed']) {
    on(ev, () => { checkPending = true; });
  }
  on('tick', () => { if (checkPending) checkAchievements(); });
}
