// Abgeleitete Werte (maxHP, Angriff, ...) aus Level, Attributen und Ausruestung.
// Schreibt state.derived; Kampf liest nur dort.
import { state } from '../core/state.js';
import { on, emit } from '../core/events.js';
import { CONFIG, deriveStats, emptyTotals, itemTotals } from '../data/config.js';

function gearTotals() {
  const t = emptyTotals();
  for (const item of Object.values(state.equipment)) if (item) itemTotals(item, t);
  return t;
}

export function recompute() {
  state.derived = deriveStats(state.character, gearTotals());
  const ch = state.character;
  if (ch.currentHP == null || ch.currentHP > state.derived.maxHP) ch.currentHP = state.derived.maxHP;
  emit('stats:changed');
}

function healFull() {
  state.character.currentHP = state.derived.maxHP;
  emit('hp:changed');
}

export function init() {
  on('stats:dirty', recompute);
  on('character:levelup', healFull);
  on('character:revive', healFull);
  on('tick', (dt) => {
    if (state.combat.dead) return;
    const ch = state.character;
    const max = state.derived.maxHP;
    if (ch.currentHP >= max) return;
    ch.currentHP = Math.min(max, ch.currentHP + max * CONFIG.character.hpRegenPctPerSec / 100 * dt / 1000);
  });
  recompute();
}
