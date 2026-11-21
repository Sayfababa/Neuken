// GEAR: 9 Slots, AUTO EQUIP, Inventarliste (scrollt im Panel) mit Vergleichspfeilen, Item-Sheet mit Vergleich.
import { state } from '../../core/state.js';
import { on, emit } from '../../core/events.js';
import { CONFIG, rarityIndex, itemTotals } from '../../data/config.js';
import { AFFIXES, AFFIX_IDS, SLOTS, SLOT_TYPE_LABEL } from '../../data/items.js';
import { Assets } from '../../systems/assets.js';
import { compare, replacedBy } from '../../systems/equipment.js';
import { $, setHTML, setText, setAttr, setClass, onTap, onTapWithin, elementFromHTML, setChildren, esc, fmtNum } from '../render.js';
import { openSheet } from '../sheet.js';
import { show as toast } from '../toast.js';

let el;
let open = false;
let dirty = true;

const rarityOf = (id) => CONFIG.rarities.find(r => r.id === id);
const ARROW = { 1: ['↑', 'up'], 0: ['=', 'eq'], '-1': ['↓', 'down'] };

function fmtValue(type, v) {
  const def = AFFIXES[type];
  if (def.fmt === 'pct') return `${v}%`;
  if (def.fmt === 'speed') return `${v.toFixed(2)}/s`;
  return fmtNum(v);
}

function affixText(a) {
  const v = a.value * AFFIXES[a.type].scale;
  return `+${fmtValue(a.type, v)} ${AFFIXES[a.type].label}`;
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
    <span>CRIT <b>${d.critChance.toFixed(1).replace('.0', '')}%</b></span>`);
}

function sortedInventory() {
  return state.inventory.slice().sort((a, b) =>
    rarityIndex(b.rarity) - rarityIndex(a.rarity) || b.itemLevel - a.itemLevel);
}

// Zeilen werden je Item einmal gebaut und wiederverwendet; nur Pfeile werden aktualisiert.
const rows = new Map();   // itemId -> { el, arrow, cmp }

function rowHTML(it) {
  const r = rarityOf(it.rarity);
  return `<button class="inv-row" data-id="${it.id}" style="--rc:${r.color}">
      <span class="inv-icon">${Assets.ref(it.asset)}</span>
      <span class="inv-main"><span class="inv-name">${esc(it.name)}</span>
        <span class="inv-sub">iLvl ${it.itemLevel} · ${SLOT_TYPE_LABEL[it.slotType]} · ${esc(affixText(it.affixes[0]))}</span></span>
      <span class="inv-arrow"></span>
    </button>`;
}

function renderInventory() {
  const inv = sortedInventory();
  setText(el.count, `${inv.length} / ${CONFIG.inventory.max}`);
  setAttr(el.auto, 'disabled', !inv.length);
  const alive = new Set(inv.map(it => it.id));
  for (const id of rows.keys()) if (!alive.has(id)) rows.delete(id);
  if (!inv.length) {
    setHTML(el.list, '<p class="inv-empty">Noch keine Items. Besiege Gegner – sie lassen Beute fallen.</p>');
    return;
  }
  const nodes = inv.map(it => {
    let row = rows.get(it.id);
    if (!row) {
      const node = elementFromHTML(rowHTML(it));
      row = { el: node, arrow: node.querySelector('.inv-arrow'), cmp: null };
      rows.set(it.id, row);
    }
    const c = compare(it);
    if (c !== row.cmp) {
      row.cmp = c;
      const [sym, cls] = ARROW[c];
      setText(row.arrow, sym);
      setClass(row.arrow, `inv-arrow ${cls}`);
    }
    return row.el;
  });
  setChildren(el.list, nodes);
}

function refresh() {
  if (!open) { dirty = true; return; }
  dirty = false;
  renderSlots();
  renderInventory();
}

function itemHead(item) {
  const r = rarityOf(item.rarity);
  return `<div class="sheet-head" style="--rc:${r.color}">
      <span class="sheet-icon">${Assets.get(item.asset)}</span>
      <div><h2 class="sheet-name">${esc(item.name)}</h2>
      <p class="sheet-meta">${r.label} · iLvl ${item.itemLevel} · ${SLOT_TYPE_LABEL[item.slotType]}</p></div>
    </div>`;
}

// Vergleichstabelle: neuer Wert und Differenz zum ersetzten Item, gruen/rot
function compareRows(item, cur) {
  const a = itemTotals(item);
  const b = cur ? itemTotals(cur) : null;
  const types = AFFIX_IDS.filter(t => a[t] || (b && b[t]));
  return types.map(t => {
    const diff = b ? a[t] - b[t] : a[t];
    const cls = diff > 0 ? 'up' : diff < 0 ? 'down' : 'eq';
    const sign = diff > 0 ? '+' : diff < 0 ? '−' : '±';
    return `<li><span>${AFFIXES[t].label}</span><b>${a[t] ? fmtValue(t, a[t]) : '–'}</b>
      <em class="${cls}">${sign}${fmtValue(t, Math.abs(diff))}</em></li>`;
  }).join('');
}

function openItem(item, equipped) {
  if (equipped) {
    openSheet(`${itemHead(item)}<ul class="sheet-affixes">${item.affixes.map(a => `<li>${esc(affixText(a))}</li>`).join('')}</ul>
      <p class="sheet-note">Ausgerüstet</p>`);
    return;
  }
  const cur = replacedBy(item);
  const vs = cur
    ? `<p class="sheet-vs">Vergleich mit <span style="color:${rarityOf(cur.rarity).color}">${esc(cur.name)}</span></p>`
    : '<p class="sheet-vs">Slot ist frei</p>';
  openSheet(`${itemHead(item)}${vs}<ul class="sheet-compare">${compareRows(item, cur)}</ul>`, [{
    label: 'AUSRÜSTEN', primary: true,
    onTap: () => {
      emit('equip:request', { itemId: item.id });
      toast(`Ausgerüstet: ${item.name}`, { kind: 'info' });
    },
  }]);
}

export function init() {
  el = {
    panel: $('#panel-gear'), slots: $('#slot-grid'), stats: $('#gear-stats'),
    list: $('#inv-list'), count: $('#inv-count'), auto: $('#btn-auto-equip'),
  };
  setHTML($('#gear-silhouette'), Assets.get('warrior_idle'));
  setHTML($('#asset-sprites'), Assets.spriteSheet());

  onTapWithin(el.list, '.inv-row', (row) => {
    const it = state.inventory.find(x => x.id === row.dataset.id);
    if (it) openItem(it, false);
  });
  onTapWithin(el.slots, '.slot.filled', (btn) => {
    const it = state.equipment[btn.dataset.slot];
    if (it) openItem(it, true);
  });
  onTap(el.auto, () => emit('equip:auto'));
  on('equip:autoDone', ({ changed }) => {
    if (!changed.length) { toast('AUTO EQUIP: bereits optimal', { kind: 'info' }); return; }
    const names = changed.map(id => SLOTS.find(s => s.id === id).label);
    toast(`AUTO EQUIP: ${changed.length} geändert – ${names.join(', ')}`, { kind: 'info' });
  });

  on('ui:tab', (tab) => {
    open = tab === 'gear';
    setAttr(el.panel, 'hidden', !open);
    if (open && dirty) refresh();
  });
  on('inventory:changed', refresh);
  on('equipment:changed', refresh);
  on('stats:changed', () => { if (open) renderSlots(); else dirty = true; });
}
