// Aktueller Dungeon und Gegner-Erzeugung.
import { state } from '../core/state.js';
import { on, emit } from '../core/events.js';
import { rng } from '../core/rng.js';
import { monsterStats } from '../data/config.js';
import { DUNGEONS } from '../data/dungeons.js';
import { MONSTERS } from '../data/monsters.js';

export function currentDungeon() {
  return DUNGEONS.find(d => d.id === state.dungeons.current) || DUNGEONS[0];
}

function spawn() {
  const d = currentDungeon();
  const type = rng.pick(d.monsters);
  const def = MONSTERS[type];
  const s = monsterStats(rng, d.level, def.mult);
  const enemy = { type, name: def.name, asset: def.asset, ...s, hp: s.maxHP };
  state.combat.enemy = enemy;
  emit('enemy:spawned', enemy);
}

export function init() {
  on('enemy:spawnRequest', spawn);
}
