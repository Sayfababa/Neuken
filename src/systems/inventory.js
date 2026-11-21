// Inventar mit Obergrenze. Bei vollem Inventar wird das schwaechste Common verworfen.
import { state } from '../core/state.js';
import { on, emit } from '../core/events.js';
import { CONFIG, itemScoreOf } from '../data/config.js';

function weakestIndex(list) {
  let pool = list.map((it, i) => [it, i]).filter(([it]) => it.rarity === 'common');
  if (!pool.length) pool = list.map((it, i) => [it, i]);
  let best = pool[0];
  for (const p of pool) {
    const a = itemScoreOf(p[0]);
    const b = itemScoreOf(best[0]);
    if (a < b || (a === b && p[0].itemLevel < best[0].itemLevel)) best = p;
  }
  return best[1];
}

function add(item) {
  const inv = state.inventory;
  inv.push(item);
  const s = state.stats;
  if (item.itemLevel > s.highestItemLevel) s.highestItemLevel = item.itemLevel;
  if (item.rarity === 'legendary') s.legendariesFound += 1;
  if (item.rarity === 'mythic') s.mythicsFound += 1;
  if (inv.length > CONFIG.inventory.max) {
    const [dropped] = inv.splice(weakestIndex(inv), 1);
    emit('inventory:discarded', dropped);
  }
  emit('inventory:changed');
}

export function init() {
  on('item:created', add);
}
