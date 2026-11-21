// Aktueller Dungeon, Dungeon-Wahl, Gegner- und Boss-Erzeugung, Kill-Zaehler fuer den Boss.
import { state } from '../core/state.js';
import { on, emit } from '../core/events.js';
import { rng } from '../core/rng.js';
import { CONFIG, monsterStats, bossStats } from '../data/config.js';
import { DUNGEONS } from '../data/dungeons.js';
import { MONSTERS } from '../data/monsters.js';

export function currentDungeon() {
  return DUNGEONS.find(d => d.id === state.dungeons.current) || DUNGEONS[0];
}

function spawn() {
  const d = currentDungeon();
  let enemy;
  if (state.combat.bossFight) {
    const s = bossStats(rng, d.level);
    enemy = {
      type: d.boss, name: d.bossName, asset: d.boss, ...s, hp: s.maxHP,
      isBoss: true, dungeonId: d.id, firstKill: !state.dungeons.bossesDefeated.includes(d.id),
    };
  } else {
    const type = rng.pick(d.monsters);
    const def = MONSTERS[type];
    const s = monsterStats(rng, d.level, def.mult);
    enemy = { type, name: def.name, asset: def.asset, ...s, hp: s.maxHP, dungeonId: d.id };
  }
  state.combat.enemy = enemy;
  emit('enemy:spawned', enemy);
}

function onKill(e) {
  if (e.isBoss) return;
  const dg = state.dungeons;
  if (dg.killsInCurrent < CONFIG.boss.killsRequired) {
    dg.killsInCurrent += 1;
    if (dg.killsInCurrent === CONFIG.boss.killsRequired) emit('boss:ready');
  }
}

function select({ id }) {
  const dg = state.dungeons;
  if (!dg.unlocked.includes(id) || dg.current === id) return;
  dg.current = id;
  dg.killsInCurrent = 0;
  state.combat.bossFight = false;
  emit('enemy:replace');
  emit('dungeon:changed', { id });
}

export function init() {
  on('enemy:spawnRequest', spawn);
  on('enemy:killed', onKill);
  on('dungeon:select', select);
}
