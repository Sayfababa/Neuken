// SKILLS: passive Stufen kaufen, aktive Skills mit Freischaltstufe.
import { state } from '../../core/state.js';
import { on, emit } from '../../core/events.js';
import { PASSIVE_SKILLS, PASSIVE_MAX_LEVEL, ACTIVE_SKILLS } from '../../data/skills.js';
import { Assets } from '../../systems/assets.js';
import { passiveLevel, nextPassiveCost, isActiveUnlocked } from '../../systems/skills.js';
import { $, setHTML, setAttr, onTapWithin, fmtNum } from '../render.js';

let el;
let open = false;
let lastKey = '';

function perLevel(p) {
  return p.perLevelPct ?? p.perLevelFlat;
}

function renderPassive() {
  setHTML(el.passive, PASSIVE_SKILLS.map(p => {
    const lv = passiveLevel(p.id);
    const cost = nextPassiveCost(p.id);
    const total = +(lv * perLevel(p)).toFixed(1);
    const btn = cost === null
      ? '<span class="skill-max">MAX</span>'
      : `<button class="btn-buy" data-id="${p.id}" ${state.currency.gold < cost ? 'disabled' : ''}>
           <span class="buy-icon">${Assets.get('ui_gold_001')}</span>${fmtNum(cost)}</button>`;
    return `<div class="skill-row">
      <div class="skill-main"><span class="skill-name">${p.name}</span>
        <span class="skill-sub">Stufe ${lv}/${PASSIVE_MAX_LEVEL} · +${total}${p.unit} ${p.effect} · +${perLevel(p)}${p.unit}/Stufe</span></div>
      ${btn}</div>`;
  }).join(''));
}

function renderActive() {
  setHTML(el.active, ACTIVE_SKILLS.map(s => {
    const unlocked = isActiveUnlocked(s);
    return `<div class="skill-row active-skill ${unlocked ? '' : 'locked'}">
      <span class="skill-icon">${Assets.get(s.asset)}</span>
      <div class="skill-main"><span class="skill-name">${s.name}</span>
        <span class="skill-sub">${s.desc} · ${s.cooldownMs / 1000} s</span></div>
      <span class="skill-state">${unlocked ? 'Aktiv' : `ab Lv ${s.unlockLevel}`}</span></div>`;
  }).join(''));
}

// Neu zeichnen nur, wenn sich Gold-Leistbarkeit, Stufen oder Level aendern
function frameKey() {
  return [state.character.level, ...PASSIVE_SKILLS.map(p => {
    const c = nextPassiveCost(p.id);
    return `${passiveLevel(p.id)}:${c !== null && state.currency.gold >= c}`;
  })].join('|');
}

export function frame() {
  if (!open) return;
  const key = frameKey();
  if (key === lastKey) return;
  lastKey = key;
  renderPassive();
  renderActive();
}

export function init() {
  el = { panel: $('#panel-skills'), passive: $('#skills-passive'), active: $('#skills-active') };
  onTapWithin(el.passive, '.btn-buy:not([disabled])', (btn) => emit('skill:buy', { id: btn.dataset.id }));
  on('ui:tab', (tab) => {
    open = tab === 'skills';
    setAttr(el.panel, 'hidden', !open);
    lastKey = '';
    frame();
  });
}
