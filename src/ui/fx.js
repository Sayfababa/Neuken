// Effekte auf der Spielflaeche: Treffer-Funken, Levelup, fliegende Beute in Seltenheitsfarbe.
// Alles aus festen Pools – zur Laufzeit entstehen keine neuen DOM-Knoten.
import { on } from '../core/events.js';
import { CONFIG, rarityIndex } from '../data/config.js';
import { Assets } from '../systems/assets.js';
import { $, createEl, setAsset, setStyle, restartAnim } from './render.js';

let el;
const orbs = [];
let orbNext = 0;
let lootRareFrom;
let lootLegendaryFrom;

function hitSpark(h) {
  if (h.target !== 'enemy') return;
  setAsset(el.spark, Assets.get(h.crit || h.skill ? 'fx_crit' : 'fx_hit'));
  restartAnim(el.spark, 'pop');
}

// Beute fliegt vom Gegner zum GEAR-Tab
function lootOrb(item) {
  const r = CONFIG.rarities.find(x => x.id === item.rarity);
  const ri = rarityIndex(item.rarity);
  const o = orbs[orbNext];
  orbNext = (orbNext + 1) % orbs.length;
  const glow = ri >= lootLegendaryFrom ? 'fx_loot_legendary' : ri >= lootRareFrom ? 'fx_loot_rare' : null;
  setAsset(o.glow, glow ? Assets.get(glow) : '');
  setAsset(o.icon, Assets.get(item.asset));
  setStyle(o.el, '--rc', r.color);
  // Ziel: GEAR-Button (Position relativ zur Spielflaeche)
  const s = el.stage.getBoundingClientRect();
  const g = el.gearBtn.getBoundingClientRect();
  setStyle(o.el, '--dx', `${Math.round(g.left + g.width / 2 - (s.left + s.width / 2))}px`);
  setStyle(o.el, '--dy', `${Math.round(g.top + g.height / 2 - (s.top + s.height * CONFIG.ui.lootStartY))}px`);
  restartAnim(o.el, ri >= lootRareFrom ? 'fly-big' : 'fly');
  restartAnim(el.gearBtn, 'got');
}

function levelUp() {
  restartAnim(el.levelup, 'burst');
  restartAnim(el.hudLevel, 'pulse');
}

export function init() {
  el = {
    stage: $('#stage'), spark: $('#fx-spark'), levelup: $('#fx-levelup'), hudLevel: $('.hud-level'),
    gearBtn: null,
  };
  lootRareFrom = rarityIndex(CONFIG.ui.lootGlowFrom);
  lootLegendaryFrom = rarityIndex(CONFIG.ui.lootBigGlowFrom);
  setAsset(el.levelup, Assets.get('fx_levelup'));
  setStyle(el.stage, '--loot-y', `${CONFIG.ui.lootStartY * 100}%`);
  const layer = $('#fx-layer');
  for (let i = 0; i < CONFIG.ui.lootPoolSize; i++) {
    const o = createEl('div', 'loot-orb', layer);
    orbs.push({ el: o, glow: createEl('span', 'loot-glow', o), icon: createEl('span', 'loot-icon', o) });
  }
  on('combat:hit', hitSpark);
  on('item:created', (item) => {
    if (!el.gearBtn) el.gearBtn = $('[data-tab="gear"]');
    lootOrb(item);
  });
  on('character:levelup', levelUp);
}
