// Ausruesten mit einem Tap, AUTO EQUIP. Altes Item geht zurueck ins Inventar.
import { state } from '../core/state.js';
import { on, emit } from '../core/events.js';
import { itemScoreOf } from '../data/config.js';
import { SLOTS } from '../data/items.js';

const slotsFor = (slotType) => SLOTS.filter(s => s.accepts === slotType).map(s => s.id);

// Ziel-Slot: passender freier Slot, sonst der mit dem schwaecheren Item (relevant fuer Ringe).
export function targetSlot(item) {
  const slots = slotsFor(item.slotType);
  const free = slots.find(id => !state.equipment[id]);
  if (free) return free;
  let weakest = slots[0];
  for (const id of slots) {
    if (itemScoreOf(state.equipment[id]) < itemScoreOf(state.equipment[weakest])) weakest = id;
  }
  return weakest;
}

// Item, das beim Anlegen ersetzt wuerde (null = Slot frei)
export function replacedBy(item) {
  return state.equipment[targetSlot(item)];
}

// Vergleich gegen das ersetzte Item: 1 besser, -1 schlechter, 0 gleich
export function compare(item) {
  const cur = replacedBy(item);
  if (!cur) return 1;
  const d = itemScoreOf(item) - itemScoreOf(cur);
  return d > 0 ? 1 : d < 0 ? -1 : 0;
}

function put(slot, item) {
  const inv = state.inventory;
  const idx = inv.indexOf(item);
  if (idx >= 0) inv.splice(idx, 1);
  const old = state.equipment[slot];
  if (old) inv.push(old);
  state.equipment[slot] = item;
  return old;
}

function equip({ itemId }) {
  const item = state.inventory.find(it => it.id === itemId);
  if (!item) return;
  const slot = targetSlot(item);
  const old = put(slot, item);
  emit('stats:dirty');
  emit('equipment:changed', { slot, item, old });
  emit('inventory:changed');
}

function autoEquip() {
  const changed = [];
  const types = [...new Set(SLOTS.map(s => s.accepts))];
  for (const type of types) {
    const slots = slotsFor(type);
    const pool = [...slots.map(id => state.equipment[id]).filter(Boolean),
      ...state.inventory.filter(it => it.slotType === type)];
    const best = pool.sort((a, b) => itemScoreOf(b) - itemScoreOf(a)).slice(0, slots.length);
    // bereits gut belegte Slots behalten, Rest auffuellen
    const keep = new Set(slots.filter(id => best.includes(state.equipment[id])));
    const toPlace = best.filter(it => !slots.some(id => keep.has(id) && state.equipment[id] === it));
    for (const id of slots) {
      if (keep.has(id) || !toPlace.length) continue;
      put(id, toPlace.shift());
      changed.push(id);
    }
  }
  if (changed.length) {
    emit('stats:dirty');
    emit('equipment:changed', { slots: changed });
    emit('inventory:changed');
  }
  emit('equip:autoDone', { changed });
}

export function init() {
  on('equip:request', equip);
  on('equip:auto', autoEquip);
}
