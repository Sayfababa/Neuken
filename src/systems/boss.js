// Bosskampf: Herausforderung, Sieg (Belohnung, Freischaltung), Niederlage ohne Verlust.
import { state } from '../core/state.js';
import { on, emit } from '../core/events.js';
import { CONFIG } from '../data/config.js';
import { DUNGEONS } from '../data/dungeons.js';

let drops = [];

export function bossAvailable() {
  const cb = state.combat;
  return state.dungeons.killsInCurrent >= CONFIG.boss.killsRequired && !cb.bossFight && !cb.dead;
}

function challenge() {
  if (!bossAvailable()) return;
  state.combat.bossFight = true;
  emit('enemy:replace');
  emit('boss:started');
}

function onKilled(e) {
  if (!e.isBoss) return;
  const dg = state.dungeons;
  state.combat.bossFight = false;
  dg.killsInCurrent = 0;
  state.stats.bossKills += 1;
  let unlocked = null;
  if (!dg.bossesDefeated.includes(e.dungeonId)) {
    dg.bossesDefeated.push(e.dungeonId);
    const next = DUNGEONS.find(d => d.unlockAfterBoss === e.dungeonId);
    if (next && !dg.unlocked.includes(next.id)) {
      dg.unlocked.push(next.id);
      unlocked = next.id;
    }
  }
  emit('boss:defeated', { dungeonId: e.dungeonId, xp: e.xp, gold: e.gold, items: drops, unlocked, first: e.firstKill });
  drops = [];
}

export function init() {
  // boss.init laeuft nach loot/itemgen/inventory: Drops des Bosses sind bei 'enemy:killed' bereits erzeugt.
  on('enemy:spawned', () => { drops = []; });
  on('item:created', (item) => { if (state.combat.bossFight) drops.push(item); });
  on('enemy:killed', onKilled);
  on('boss:challenge', challenge);
  on('warrior:died', ({ wasBoss }) => {
    if (!wasBoss) return;
    state.combat.bossFight = false;   // Zaehler bleibt bei 10 – sofort erneut antreten moeglich
    emit('boss:failed');
  });
}
