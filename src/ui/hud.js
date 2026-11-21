// Oberer Bereich: Level, Name, XP-Balken, Gold, Gems (Platzhalter, Wert 0, ohne Funktion).
import { state } from '../core/state.js';
import { CONFIG, xpRequired } from '../data/config.js';
import { Assets } from '../systems/assets.js';
import { $, setText, setAsset, setStyle, fmtNum } from './render.js';

let el;

export function init() {
  el = {
    level: $('#hud-level'), name: $('#hud-name'),
    gold: $('#hud-gold'), gems: $('#hud-gems'),
    xpFill: $('#hud-xp-fill'), xpText: $('#hud-xp-text'),
  };
  setText(el.name, CONFIG.character.name);
  setAsset($('#hud-gold-icon'), Assets.get('ui_gold_001'));
  setAsset($('#hud-gem-icon'), Assets.get('ui_gem_001'));
}

let lastXp = -1;
let lastLevel = -1;

export function frame() {
  const ch = state.character;
  setText(el.level, ch.level);
  setText(el.gold, fmtNum(state.currency.gold));
  setText(el.gems, fmtNum(state.currency.gems));
  if (ch.xp !== lastXp || ch.level !== lastLevel) {
    lastXp = ch.xp;
    lastLevel = ch.level;
    const need = xpRequired(ch.level);
    setStyle(el.xpFill, 'transform', `scaleX(${Math.min(1, ch.xp / need)})`);
    setText(el.xpText, `${fmtNum(ch.xp)} / ${fmtNum(need)} XP`);
  }
}
