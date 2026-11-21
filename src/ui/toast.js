// Kurze Meldungen (Levelup, Loot, Hinweise). Fester Pool, keine neuen DOM-Knoten zur Laufzeit.
import { on } from '../core/events.js';
import { CONFIG } from '../data/config.js';
import { Assets } from '../systems/assets.js';
import { $, createEl, setHTML, setStyle, toggleClass, setClass, restartAnim, moveToFront, esc } from './render.js';

const pool = [];
let next = 0;

export function show(text, { color = null, icon = null, kind = '' } = {}) {
  const slot = pool[next];
  next = (next + 1) % pool.length;
  setHTML(slot.el, `${icon ? `<span class="toast-icon">${Assets.get(icon)}</span>` : ''}<span class="toast-text">${esc(text)}</span>`);
  setStyle(slot.el, '--tc', color || 'var(--c-text)');
  setClass(slot.el, 'toast ' + kind);
  restartAnim(slot.el, 'show');
  slot.until = performance.now() + CONFIG.ui.toastMs;
  // neueste Meldung oben
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

export function init() {
  const root = $('#toasts');
  for (let i = 0; i < CONFIG.ui.toastMax; i++) pool.push({ el: createEl('div', 'toast', root), until: 0 });

  on('character:levelup', (e) => show(`Level ${e.level}!`, { color: 'var(--c-gold)', icon: 'fx_levelup', kind: 'levelup' }));
  on('item:created', (item) => {
    const r = CONFIG.rarities.find(x => x.id === item.rarity);
    show(item.name, { color: r.color, icon: item.asset, kind: 'loot' });
  });
  on('inventory:discarded', (item) => show(`Inventar voll – verworfen: ${item.name}`, { kind: 'info' }));
  on('save:failed', () => show('Speichern fehlgeschlagen (Speicher voll?)', { kind: 'info' }));
}
