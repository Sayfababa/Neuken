// Untere Navigation. Phase 1: HOME und GEAR aktiv, Rest sichtbar deaktiviert.
import { emit } from '../core/events.js';
import { Assets } from '../systems/assets.js';
import { $, setHTML, onTapWithin, toggleClass } from './render.js';

const TABS = [
  { id: 'home',    label: 'HOME',    icon: 'ui_nav_home_001',    enabled: true },
  { id: 'gear',    label: 'GEAR',    icon: 'ui_nav_gear_001',    enabled: true },
  { id: 'skills',  label: 'SKILLS',  icon: 'ui_nav_skills_001',  enabled: false },
  { id: 'dungeon', label: 'DUNGEON', icon: 'ui_nav_dungeon_001', enabled: false },
  { id: 'hero',    label: 'HERO',    icon: 'ui_nav_hero_001',    enabled: false },
];

let root;
let active = 'home';

export function setActive(id) {
  active = id;
  for (const btn of root.querySelectorAll('.nav-btn')) toggleClass(btn, 'active', btn.dataset.tab === id);
  emit('ui:tab', id);
}

export function init() {
  root = $('#nav');
  setHTML(root, TABS.map(t => `
    <button class="nav-btn${t.enabled ? '' : ' locked'}" data-tab="${t.id}" ${t.enabled ? '' : 'disabled aria-disabled="true"'}>
      <span class="nav-icon">${Assets.get(t.icon)}</span>
      <span class="nav-label">${t.label}</span>
    </button>`).join(''));
  onTapWithin(root, '.nav-btn:not([disabled])', (btn) => setActive(btn.dataset.tab));
  setActive(active);
}
