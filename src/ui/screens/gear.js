// GEAR: 9 Slots, Inventarliste (scrollt im Panel), Item-Sheet mit AUSRUESTEN.
import { state } from '../../core/state.js';
import { on, emit } from '../../core/events.js';
import { CONFIG, rarityIndex } from '../../data/config.js';
import { AFFIXES, SLOTS, SLOT_TYPE_LABEL } from '../../data/items.js';
import { Assets } from '../../systems/assets.js';
import { $, setHTML, setText, setAttr, onTap, onTapWithin, esc, fmtNum } from '../render.js';
import { show as toast } from '../toast.js';

let el;
let open = false;
let dirty = true;
let sheetItem = null;

const rarityOf = (id) => CONFIG.rarities.find(r => r.id === id);

function affixText(a) {
  const def = AFFIXES[a.type];
  const v = a.value * def.scale;
  if (def.fmt === 'pct') return `+${v}% ${def.label}`;
  if (def.fmt === 'speed') return `+${v.toFixed(2)}/s ${def.label}`;
  return `+${fmtNum(v)} ${def.label}`;
}

function renderSlots() {
  setHTML(el.slots, SLOTS.map(s => {
    const it = state.equipment[s.id];
    if (!it) return `<div class="slot empty"><span class="slot-label">${s.label}</span></div>`;
    return `<button class="slot filled" data-slot="${s.id}" style="--rc:${rarityOf(it.rarity).color}">
      <span class="slot-icon">${Assets.get(it.asset)}</span><span class="slot-lv">${it.itemLevel}</span></button>`;
  }).join(''));
  const d = state.derived;
  setHTML(el.stats, `<span>ATK <b>${fmtNum(d.attack)}</b></span><span>HP <b>${fmtNum(d.maxHP)}</b></span>
    <span>DEF <b>${fmtNum(d.defense)}</b></span><span>SPD <b>${d.attackSpeed.toFixed(2)}</b></span>
    <span>CRIT <b>${d.critChance}%</b></span>`);
}

function sortedInventory() {
  return state.inventory.slice().sort((a, b) =>
    rarityIndex(b.rarity) - rarityIndex(a.rarity) || b.itemLevel - a.itemLevel);
}

function renderInventory() {
  const inv = sortedInventory();
  setText(el.count, `${inv.length} / ${CONFIG.inventory.max}`);
  if (!inv.length) {
    setHTML(el.list, '<p class="inv-empty">Noch keine Items. Besiege Gegner – sie lassen Beute fallen.</p>');
    return;
  }
  setHTML(el.list, inv.map(it => {
    const r = rarityOf(it.rarity);
    return `<button class="inv-row" data-id="${it.id}" style="--rc:${r.color}">
      <span class="inv-icon">${Assets.get(it.asset)}</span>
      <span class="inv-main"><span class="inv-name">${esc(it.name)}</span>
        <span class="inv-sub">iLvl ${it.itemLevel} · ${SLOT_TYPE_LABEL[it.slotType]} · ${esc(affixText(it.affixes[0]))}</span></span>
    </button>`;
  }).join(''));
}

function refresh() {
  if (!open) { dirty = true; return; }
  dirty = false;
  renderSlots();
  renderInventory();
}

function openSheet(item, equipped) {
  sheetItem = item;
  const r = rarityOf(item.rarity);
  setHTML(el.sheetBody, `
    <div class="sheet-head" style="--rc:${r.color}">
      <span class="sheet-icon">${Assets.get(item.asset)}</span>
      <div><h2 class="sheet-name">${esc(item.name)}</h2>
      <p class="sheet-meta">${r.label} · iLvl ${item.itemLevel} · ${SLOT_TYPE_LABEL[item.slotType]}</p></div>
    </div>
    <ul class="sheet-affixes">${item.affixes.map(a => `<li>${esc(affixText(a))}</li>`).join('')}</ul>`);
  setAttr(el.equipBtn, 'hidden', equipped);
  setAttr(el.equippedNote, 'hidden', !equipped);
  setAttr(el.sheet, 'hidden', false);
  setAttr(el.backdrop, 'hidden', false);
}

function closeSheet() {
  sheetItem = null;
  setAttr(el.sheet, 'hidden', true);
  setAttr(el.backdrop, 'hidden', true);
}

export function init() {
  el = {
    panel: $('#panel-gear'), slots: $('#slot-grid'), stats: $('#gear-stats'),
    list: $('#inv-list'), count: $('#inv-count'),
    sheet: $('#sheet'), sheetBody: $('#sheet-body'), backdrop: $('#sheet-backdrop'),
    equipBtn: $('#sheet-equip'), equippedNote: $('#sheet-equipped'), close: $('#sheet-close'),
  };
  setHTML($('#gear-silhouette'), Assets.get('warrior_idle'));
  setHTML(el.close, Assets.get('ui_close_001'));

  onTapWithin(el.list, '.inv-row', (row) => {
    const it = state.inventory.find(x => x.id === row.dataset.id);
    if (it) openSheet(it, false);
  });
  onTapWithin(el.slots, '.slot.filled', (btn) => {
    const it = state.equipment[btn.dataset.slot];
    if (it) openSheet(it, true);
  });
  onTap(el.equipBtn, () => {
    if (!sheetItem) return;
    const name = sheetItem.name;
    emit('equip:request', { itemId: sheetItem.id });
    closeSheet();
    toast(`Ausgerüstet: ${name}`, { kind: 'info' });
  });
  onTap(el.close, closeSheet);
  onTap(el.backdrop, closeSheet);

  on('ui:tab', (tab) => {
    open = tab === 'gear';
    setAttr(el.panel, 'hidden', !open);
    if (!open) closeSheet();
    if (open && dirty) refresh();
  });
  on('inventory:changed', refresh);
  on('equipment:changed', refresh);
  on('stats:changed', () => { if (open) renderSlots(); else dirty = true; });
}
