// DUNGEON: Dungeon-Wahl, Boss-Fortschritt.
import { state } from '../../core/state.js';
import { on, emit } from '../../core/events.js';
import { CONFIG } from '../../data/config.js';
import { DUNGEONS } from '../../data/dungeons.js';
import { MONSTERS } from '../../data/monsters.js';
import { Assets } from '../../systems/assets.js';
import { $, setHTML, setAttr, onTapWithin } from '../render.js';

let el;
let open = false;
let lastKey = '';

function row(d) {
  const dg = state.dungeons;
  const unlocked = dg.unlocked.includes(d.id);
  const current = dg.current === d.id;
  const beaten = dg.bossesDefeated.includes(d.id);
  const monsters = d.monsters.map(m => MONSTERS[m].name).join(', ');
  const prev = DUNGEONS.find(x => x.id === d.unlockAfterBoss);
  const status = current
    ? `<span class="dg-status cur">Hier · Boss ${dg.killsInCurrent}/${CONFIG.boss.killsRequired}</span>`
    : unlocked ? '<span class="dg-status go">Betreten</span>'
      : `<span class="dg-status">Boss „${prev.bossName}" besiegen</span>`;
  const inner = `<span class="dg-bg">${Assets.get(d.bg)}</span>
    <span class="dg-main"><span class="dg-name">${d.id}. ${d.name}</span>
      <span class="dg-sub">Lv ${d.level} · ${monsters}</span>
      <span class="dg-sub">Boss: ${d.bossName} ${beaten ? '<b class="dg-check">✓ besiegt</b>' : ''}</span></span>
    ${status}`;
  return unlocked && !current
    ? `<button class="dg-row" data-id="${d.id}">${inner}</button>`
    : `<div class="dg-row ${current ? 'current' : 'locked'}">${inner}</div>`;
}

export function frame() {
  if (!open) return;
  const dg = state.dungeons;
  const key = `${dg.current}|${dg.unlocked.join()}|${dg.bossesDefeated.join()}|${dg.killsInCurrent}`;
  if (key === lastKey) return;
  lastKey = key;
  setHTML(el.list, DUNGEONS.map(row).join(''));
}

export function init() {
  el = { panel: $('#panel-dungeon'), list: $('#dungeon-list') };
  onTapWithin(el.list, 'button.dg-row', (btn) => {
    emit('dungeon:select', { id: Number(btn.dataset.id) });
    emit('ui:navigate', 'home');
  });
  on('ui:tab', (tab) => {
    open = tab === 'dungeon';
    setAttr(el.panel, 'hidden', !open);
    lastKey = '';
    frame();
  });
}
