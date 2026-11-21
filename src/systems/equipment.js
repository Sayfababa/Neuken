// Ausruesten mit einem Tap. Altes Item geht zurueck ins Inventar.
import { state } from '../core/state.js';
import { on, emit } from '../core/events.js';
import { itemScoreOf } from '../data/config.js';
import { SLOTS } from '../data/items.js';

// Ziel-Slot: passender freier Slot, sonst der mit dem schwaecheren Item (relevant fuer Ringe).
export function targetSlot(item) {
  const slots = SLOTS.filter(s => s.accepts === item.slotType).map(s => s.id);
  const free = slots.find(id => !state.equipment[id]);
  if (free) return free;
  let weakest = slots[0];
  for (const id of slots) {
    if (itemScoreOf(state.equipment[id]) < itemScoreOf(state.equipment[weakest])) weakest = id;
  }
  return weakest;
}

function equip({ itemId }) {
  const inv = state.inventory;
  const idx = inv.findIndex(it => it.id === itemId);
  if (idx < 0) return;
  const item = inv[idx];
  const slot = targetSlot(item);
  const old = state.equipment[slot];
  inv.splice(idx, 1);
  if (old) inv.push(old);
  state.equipment[slot] = item;
  emit('stats:dirty');
  emit('equipment:changed', { slot, item, old });
  emit('inventory:changed');
}

export function init() {
  on('equip:request', equip);
}
