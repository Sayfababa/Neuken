// Sheet von unten (Item-Details, Import/Export). Ein Exemplar, Inhalt wird ersetzt.
import { on } from '../core/events.js';
import { Assets } from '../systems/assets.js';
import { $, setHTML, setAttr, onTap, onTapWithin, esc } from './render.js';

let el;
let actions = [];

// actions: [{ label, primary?, onTap }] — jede Aktion schliesst das Sheet, ausser keepOpen
export function openSheet(html, list = []) {
  actions = list;
  setHTML(el.body, html);
  setHTML(el.actions, list.map((a, i) =>
    `<button class="${a.primary ? 'btn-primary' : 'btn-secondary'}" data-i="${i}">${esc(a.label)}</button>`).join(''));
  setAttr(el.sheet, 'hidden', false);
  setAttr(el.backdrop, 'hidden', false);
}

export function closeSheet() {
  actions = [];
  setAttr(el.sheet, 'hidden', true);
  setAttr(el.backdrop, 'hidden', true);
}

export function sheetElement(selector) {
  return el.body.querySelector(selector);
}

export function init() {
  el = { sheet: $('#sheet'), body: $('#sheet-body'), actions: $('#sheet-actions'), backdrop: $('#sheet-backdrop'), close: $('#sheet-close') };
  setHTML(el.close, Assets.get('ui_close_001'));
  onTap(el.close, closeSheet);
  onTap(el.backdrop, closeSheet);
  on('ui:tab', closeSheet);
  onTapWithin(el.actions, 'button', (btn) => {
    const a = actions[Number(btn.dataset.i)];
    if (!a) return;
    if (!a.keepOpen) closeSheet();
    a.onTap();
  });
}
