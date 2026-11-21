// Drop-Wurf nach jedem besiegten Gegner. Bosse: immer ein Drop, mindestens Rare; erster Sieg mindestens Epic.
import { on, emit } from '../core/events.js';
import { rng } from '../core/rng.js';
import { CONFIG, rarityWeights, rollItemLevel } from '../data/config.js';

function onKill(e) {
  const B = CONFIG.boss;
  const chance = e.isBoss ? B.dropChance : CONFIG.loot.dropChance;
  if (rng.float() >= chance) return;
  const min = e.isBoss ? (e.firstKill ? B.firstKillRarity : B.minRarity) : null;
  const rarity = rng.weighted(rarityWeights(e.level, min));
  emit('loot:drop', { rarity, itemLevel: rollItemLevel(rng, e.level) });
}

export function init() {
  on('enemy:killed', onKill);
}
