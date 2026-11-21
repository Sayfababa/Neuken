// Meldungen: Levelup, Loot, Achievements, Skills, Boss. Fester Pool, keine neuen DOM-Knoten zur Laufzeit.
// Boss-Sieg: Vollbild-Belohnungsanzeige.
import { on, emit } from '../core/events.js';
import { CONFIG } from '../data/config.js';
import { DUNGEONS } from '../data/dungeons.js';
import { Assets } from '../systems/assets.js';
import { $, createEl, setHTML, setStyle, setAttr, toggleClass, setClass, restartAnim, moveToFront, onTap, esc, fmtNum } from './render.js';

const pool = [];
let next = 0;
let overlay;
let unlockTarget = null;

export function show(text, { color = null, icon = null, kind = '' } = {}) {
  const slot = pool[next];
  next = (next + 1) % pool.length;
  setHTML(slot.el, `${icon ? `<span class="toast-icon">${Assets.get(icon)}</span>` : ''}<span class="toast-text">${esc(text)}</span>`);
  setStyle(slot.el, '--tc', color || 'var(--c-text)');
  setClass(slot.el, 'toast ' + kind);
  restartAnim(slot.el, 'show');
  slot.until = performance.now() + CONFIG.ui.toastMs;
  moveToFront(slot.el);
}

export function frame(now) {
  for (const s of pool) {
    if (s.until && now > s.until) {
      s.until = 0;
      toggleClass(s.el, 'show', false);
    }
  }
}

function bossVictory(e) {
  const d = DUNGEONS.find(x => x.id === e.dungeonId);
  const nextD = e.unlocked ? DUNGEONS.find(x => x.id === e.unlocked) : null;
  unlockTarget = nextD ? nextD.id : null;
  const loot = e.items.map(it => {
    const r = CONFIG.rarities.find(x => x.id === it.rarity);
    return `<li style="--rc:${r.color}"><span class="bo-icon">${Assets.get(it.asset)}</span>
      <span class="bo-item"><b>${esc(it.name)}</b><small>${r.label} · iLvl ${it.itemLevel}</small></span></li>`;
  }).join('');
  setHTML(overlay.body, `
    <p class="bo-kicker">BOSS BESIEGT</p>
    <div class="bo-boss">${Assets.get(d.boss)}</div>
    <h2 class="bo-title">${esc(d.bossName)}</h2>
    <div class="bo-rewards">
      <div><span class="bo-ri">${Assets.get('fx_levelup')}</span>+${fmtNum(e.xp)} XP</div>
      <div><span class="bo-ri">${Assets.get('ui_gold_001')}</span>+${fmtNum(e.gold)} Gold</div>
    </div>
    <ul class="bo-loot">${loot}</ul>
    ${nextD ? `<p class="bo-unlock">Neuer Dungeon freigeschaltet: <b>${esc(nextD.name)}</b></p>` : ''}`);
  setAttr(overlay.enter, 'hidden', !nextD);
  setAttr(overlay.root, 'hidden', false);
}

function closeOverlay() {
  setAttr(overlay.root, 'hidden', true);
}

export function init() {
  const root = $('#toasts');
  for (let i = 0; i < CONFIG.ui.toastMax; i++) pool.push({ el: createEl('div', 'toast', root), until: 0 });
  overlay = { root: $('#boss-overlay'), body: $('#boss-overlay-body'), enter: $('#bo-enter'), close: $('#bo-close') };
  onTap(overlay.close, closeOverlay);
  onTap(overlay.enter, () => {
    closeOverlay();
    if (unlockTarget) emit('dungeon:select', { id: unlockTarget });
    emit('ui:navigate', 'home');
  });

  on('character:levelup', (e) => show(`Level ${e.level}!`, { color: 'var(--c-gold)', icon: 'fx_levelup', kind: 'levelup' }));
  on('item:created', (item) => {
    const r = CONFIG.rarities.find(x => x.id === item.rarity);
    show(item.name, { color: r.color, icon: item.asset, kind: 'loot' });
  });
  on('inventory:discarded', (item) => show(`Inventar voll – verworfen: ${item.name}`, { kind: 'info' }));
  on('save:failed', () => show('Speichern fehlgeschlagen (Speicher voll?)', { kind: 'info' }));
  on('achievement:unlocked', (a) => show(`Achievement: ${a.name}`, { color: 'var(--c-gold)', icon: 'ui_trophy_001', kind: 'levelup' }));
  on('skill:unlocked', (s) => show(`Neuer Skill: ${s.name}`, { color: 'var(--c-accent)', icon: s.asset, kind: 'levelup' }));
  on('boss:ready', () => show('Boss bereit – tippe auf BOSS', { color: 'var(--c-danger)', icon: 'ui_boss_001', kind: 'info' }));
  on('boss:failed', () => show('Boss zu stark – weiter grinden, er bleibt verfügbar', { kind: 'info' }));
  on('boss:defeated', bossVictory);
}
