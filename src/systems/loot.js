// Drop-Wurf nach jedem besiegten Gegner.
import { on, emit } from '../core/events.js';
import { rng } from '../core/rng.js';
import { CONFIG, rarityWeights, rollItemLevel } from '../data/config.js';

function onKill(e) {
  if (rng.float() >= CONFIG.loot.dropChance) return;
  const rarity = rng.weighted(rarityWeights(e.level));
  emit('loot:drop', { rarity, itemLevel: rollItemLevel(rng, e.level) });
}

export function init() {
  on('enemy:killed', onKill);
}
