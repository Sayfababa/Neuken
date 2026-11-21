// Spielflaeche: Hintergrund, Gegner, Krieger, HP-Balken, Schadenszahlen, Boss-Button, Skill-Leiste.
import { state } from '../core/state.js';
import { on, emit } from '../core/events.js';
import { CONFIG } from '../data/config.js';
import { DUNGEONS } from '../data/dungeons.js';
import { ACTIVE_SKILLS } from '../data/skills.js';
import { Assets } from '../systems/assets.js';
import { bossAvailable } from '../systems/boss.js';
import { isActiveUnlocked } from '../systems/skills.js';
import { $, createEl, setText, setHTML, setAsset, setStyle, setAttr, toggleClass, setClass, restartAnim, onTap, onTapWithin, fmtNum } from './render.js';

let el;
const pool = [];
let poolNext = 0;
let attackUntil = 0;
let hitUntil = 0;
let skillCount = -1;
let skillRings = [];

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
    float(fmtNum(h.amount), 'z-enemy', h.skill ? 'skill' : h.crit ? 'crit' : 'dmg');
    restartAnim(el.enemySprite, 'flash');
  } else {
    float(fmtNum(h.amount), 'z-warrior', 'hurt');
    hitUntil = now + CONFIG.ui.hitPoseMs;
  }
}

function buildSkillBar() {
  const list = ACTIVE_SKILLS.filter(isActiveUnlocked);
  skillCount = list.length;
  setHTML(el.skills, list.map(s => `
    <button class="skill-btn" data-id="${s.id}" aria-label="${s.name}">
      <span class="skill-btn-icon">${Assets.get(s.asset)}</span>
      <span class="cd-ring">${Assets.get('ui_cooldown_ring_001')}</span>
    </button>`).join(''));
  skillRings = list.map(s => ({ skill: s, el: el.skills.querySelector(`[data-id="${s.id}"]`) }));
}

export function init() {
  el = {
    bg: $('#stage-bg'), dungeon: $('#dungeon-name'), bossProg: $('#boss-progress'), bossBtn: $('#btn-boss'),
    enemyZone: $('#enemy-zone'), enemyName: $('#enemy-name'), enemySprite: $('#enemy-sprite'),
    enemyFill: $('#enemy-hp-fill'), enemyText: $('#enemy-hp-text'),
    warrior: $('#warrior-sprite'), warriorFill: $('#warrior-hp-fill'), warriorText: $('#warrior-hp-text'),
    fx: $('#fx-layer'), death: $('#death-note'), deathTime: $('#death-time'), skills: $('#skill-bar'),
  };
  for (let i = 0; i < CONFIG.ui.damagePoolSize; i++) pool.push(createEl('div', 'float', el.fx));

  onTap(el.bossBtn, () => emit('boss:challenge'));
  onTapWithin(el.skills, '.skill-btn', (btn) => emit('skill:trigger', { id: btn.dataset.id }));

  on('combat:hit', onHit);
  on('warrior:attack', () => {
    attackUntil = performance.now() + CONFIG.ui.attackPoseMs;
    restartAnim(el.warrior, 'lunge');
  });
  on('enemy:spawned', () => restartAnim(el.enemySprite, 'spawn'));
  on('rewards:gained', (r) => float(`+${fmtNum(r.gold)} Gold  +${fmtNum(r.xp)} XP`, 'z-enemy', 'reward'));
  on('skill:cast', (s) => float(s.name, 'z-warrior', 'skillname'));
}

let lastDungeon = null;

export function frame(now) {
  const dg = state.dungeons;
  const cb = state.combat;
  if (dg.current !== lastDungeon) {
    lastDungeon = dg.current;
    const d = DUNGEONS.find(x => x.id === dg.current);
    setAsset(el.bg, Assets.get(d.bg));
    setText(el.dungeon, d.name);
    setText(el.bossBtn, `BOSS: ${d.bossName}`);
  }
  setText(el.bossProg, cb.bossFight ? 'BOSSKAMPF' : `Boss ${dg.killsInCurrent}/${CONFIG.boss.killsRequired}`);
  toggleClass(el.bossProg, 'fight', cb.bossFight);
  setAttr(el.bossBtn, 'hidden', !bossAvailable());

  const e = cb.enemy;
  toggleClass(el.enemyZone, 'gone', !e);
  if (e) {
    toggleClass(el.enemyZone, 'boss', !!e.isBoss);
    toggleClass(el.enemySprite, 'stunned', cb.stunTimer > 0);
    setAsset(el.enemySprite, Assets.get(e.asset));
    setText(el.enemyName, `${e.name} · Lv ${e.level}`);
    setStyle(el.enemyFill, 'transform', `scaleX(${e.hp / e.maxHP})`);
    setText(el.enemyText, `${fmtNum(e.hp)} / ${fmtNum(e.maxHP)}`);
  }

  const ch = state.character;
  const max = state.derived.maxHP;
  const pose = cb.dead ? 'death' : now < attackUntil ? 'attack' : now < hitUntil ? 'hit' : 'idle';
  setAsset(el.warrior, Assets.get('warrior_' + pose));
  toggleClass(el.warrior, 'buffed', !!cb.buff);
  setStyle(el.warriorFill, 'transform', `scaleX(${Math.max(0, ch.currentHP) / max})`);
  setText(el.warriorText, `${fmtNum(Math.ceil(ch.currentHP))} / ${fmtNum(max)}`);

  toggleClass(el.death, 'show', cb.dead);
  if (cb.dead) setText(el.deathTime, Math.ceil(cb.deadTimer / 1000));

  if (ACTIVE_SKILLS.filter(isActiveUnlocked).length !== skillCount) buildSkillBar();
  for (const r of skillRings) {
    const left = cb.skillCd[r.skill.id] || 0;
    setStyle(r.el, '--p', (left / r.skill.cooldownMs).toFixed(3));
    toggleClass(r.el, 'ready', left <= 0);
  }
}
