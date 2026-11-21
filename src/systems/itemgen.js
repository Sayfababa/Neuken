// Item-Generator: Basis-Item + zufaellige, einmalige Affixe.
import { state } from '../core/state.js';
import { on, emit } from '../core/events.js';
import { rng } from '../core/rng.js';
import { CONFIG, affixValue } from '../data/config.js';
import { AFFIXES, AFFIX_IDS, BASE_ITEMS } from '../data/items.js';

export function generateItem(rarityId, itemLevel) {
  const rarity = CONFIG.rarities.find(r => r.id === rarityId);
  const base = rng.pick(BASE_ITEMS);
  const types = [base.primary];
  const pool = AFFIX_IDS.filter(t => t !== base.primary);
  while (types.length < rarity.affixes && pool.length) {
    types.push(pool.splice(Math.floor(rng.float() * pool.length), 1)[0]);
  }
  const affixes = types.map(type => ({
    type,
    value: affixValue(rng, AFFIXES[type].basis, itemLevel, rarity.mult),
  }));

  // Name haengt vom staerksten Affix ab (Wert relativ zu seinem Basiswert)
  let strongest = affixes[0];
  for (const a of affixes) {
    if (a.value / AFFIXES[a.type].basis > strongest.value / AFFIXES[strongest.type].basis) strongest = a;
  }
  const def = AFFIXES[strongest.type];
  const name = `${rng.pick(def.prefixes)} ${base.name} ${rng.pick(def.suffixes)}`;

  return {
    id: 'i' + (state.meta.nextItemId++),
    baseId: base.id,
    slotType: base.slotType,
    asset: base.asset,
    name,
    rarity: rarityId,
    itemLevel,
    affixes,
  };
}

export function init() {
  on('loot:drop', ({ rarity, itemLevel }) => emit('item:created', generateItem(rarity, itemLevel)));
}
