// Spielflaeche: Hintergrund, Gegner, Krieger, HP-Balken, Schadenszahlen.
import { state } from '../core/state.js';
import { on } from '../core/events.js';
import { CONFIG } from '../data/config.js';
import { DUNGEONS } from '../data/dungeons.js';
import { Assets } from '../systems/assets.js';
import { $, createEl, setText, setAsset, setStyle, toggleClass, setClass, restartAnim, fmtNum } from './render.js';

let el;
const pool = [];
let poolNext = 0;
let attackUntil = 0;
let hitUntil = 0;

function float(text, zone, kind) {
  const d = pool[poolNext];
  const offsets = CONFIG.ui.damageOffsetsPx;
  setText(d, text);
  setClass(d, `float ${zone} ${kind}`);
  setStyle(d, '--x', offsets[poolNext % offsets.length] + 'px');
  poolNext = (poolNext + 1) % pool.length;
  restartAnim(d, 'play');
}

function onHit(h) {
  const now = performance.now();
  if (h.target === 'enemy') {
    float(fmtNum(h.amount), 'z-enemy', h.crit ? 'crit' : 'dmg');
    restartAnim(el.enemySprite, 'flash');
  } else {
    float(fmtNum(h.amount), 'z-warrior', 'hurt');
    hitUntil = now + CONFIG.ui.hitPoseMs;
  }
}

export function init() {
  el = {
    bg: $('#stage-bg'), dungeon: $('#dungeon-name'),
    enemyZone: $('#enemy-zone'), enemyName: $('#enemy-name'), enemySprite: $('#enemy-sprite'),
    enemyFill: $('#enemy-hp-fill'), enemyText: $('#enemy-hp-text'),
    warrior: $('#warrior-sprite'), warriorFill: $('#warrior-hp-fill'), warriorText: $('#warrior-hp-text'),
    fx: $('#fx-layer'), death: $('#death-note'), deathTime: $('#death-time'),
  };
  for (let i = 0; i < CONFIG.ui.damagePoolSize; i++) pool.push(createEl('div', 'float', el.fx));

  on('combat:hit', onHit);
  on('warrior:attack', () => {
    attackUntil = performance.now() + CONFIG.ui.attackPoseMs;
    restartAnim(el.warrior, 'lunge');
  });
  on('enemy:spawned', () => restartAnim(el.enemySprite, 'spawn'));
  on('rewards:gained', (r) => float(`+${fmtNum(r.gold)} Gold  +${fmtNum(r.xp)} XP`, 'z-enemy', 'reward'));
}

let lastDungeon = null;

export function frame(now) {
  const dId = state.dungeons.current;
  if (dId !== lastDungeon) {
    lastDungeon = dId;
    const d = DUNGEONS.find(x => x.id === dId);
    setAsset(el.bg, Assets.get(d.bg));
    setText(el.dungeon, d.name);
  }

  const cb = state.combat;
  const e = cb.enemy;
  toggleClass(el.enemyZone, 'gone', !e);
  if (e) {
    setAsset(el.enemySprite, Assets.get(e.asset));
    setText(el.enemyName, `${e.name} · Lv ${e.level}`);
    setStyle(el.enemyFill, 'transform', `scaleX(${e.hp / e.maxHP})`);
    setText(el.enemyText, `${fmtNum(e.hp)} / ${fmtNum(e.maxHP)}`);
  }

  const ch = state.character;
  const max = state.derived.maxHP;
  const pose = cb.dead ? 'death' : now < attackUntil ? 'attack' : now < hitUntil ? 'hit' : 'idle';
  setAsset(el.warrior, Assets.get('warrior_' + pose));
  setStyle(el.warriorFill, 'transform', `scaleX(${Math.max(0, ch.currentHP) / max})`);
  setText(el.warriorText, `${fmtNum(Math.ceil(ch.currentHP))} / ${fmtNum(max)}`);

  toggleClass(el.death, 'show', cb.dead);
  if (cb.dead) setText(el.deathTime, Math.ceil(cb.deadTimer / 1000));
}
