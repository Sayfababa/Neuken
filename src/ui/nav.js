// Untere Navigation: 5 Tabs, immer sichtbar.
import { on, emit } from '../core/events.js';
import { Assets } from '../systems/assets.js';
import { $, setHTML, onTapWithin, toggleClass } from './render.js';

const TABS = [
  { id: 'home',    label: 'HOME',    icon: 'ui_nav_home_001' },
  { id: 'gear',    label: 'GEAR',    icon: 'ui_nav_gear_001' },
  { id: 'skills',  label: 'SKILLS',  icon: 'ui_nav_skills_001' },
  { id: 'dungeon', label: 'DUNGEON', icon: 'ui_nav_dungeon_001' },
  { id: 'hero',    label: 'HERO',    icon: 'ui_nav_hero_001' },
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
    <button class="nav-btn" data-tab="${t.id}">
      <span class="nav-icon">${Assets.get(t.icon)}</span>
      <span class="nav-label">${t.label}</span>
    </button>`).join(''));
  onTapWithin(root, '.nav-btn', (btn) => setActive(btn.dataset.tab));
  on('ui:navigate', setActive);
  setActive(active);
}
