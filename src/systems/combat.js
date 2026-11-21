// Automatischer Kampf: Krieger gegen aktuellen Gegner, in festen Logik-Schritten.
import { state } from '../core/state.js';
import { on, emit } from '../core/events.js';
import { rng } from '../core/rng.js';
import { CONFIG, computeDamage } from '../data/config.js';

const PCT = 100; // Prozent-Umrechnung

// Angriffswerte inkl. aktivem Buff (Berserker Rage)
function attacker(mult = 1) {
  const d = state.derived;
  const buff = state.combat.buff;
  const atk = d.attack * (buff ? 1 + buff.attackPct / PCT : 1) * mult;
  return { attack: atk, critChance: d.critChance, critDamage: d.critDamage };
}

function attackSpeed() {
  const buff = state.combat.buff;
  return Math.min(CONFIG.character.base.attackSpeedCap, state.derived.attackSpeed * (buff ? 1 + buff.speedPct / PCT : 1));
}

function strike(enemy, mult, skillId = null) {
  const hit = computeDamage(rng, attacker(mult), enemy);
  enemy.hp = Math.max(0, enemy.hp - hit.amount);
  emit('combat:hit', { target: 'enemy', amount: hit.amount, crit: hit.crit, skill: skillId });
  if (enemy.hp <= 0) killEnemy(enemy);
}

function killEnemy(enemy) {
  const cb = state.combat;
  cb.enemy = null;
  cb.stunTimer = 0;
  cb.respawnTimer = CONFIG.monster.respawnMs;
  emit('enemy:killed', {
    type: enemy.type, level: enemy.level, xp: enemy.xp, gold: enemy.gold,
    isBoss: !!enemy.isBoss, firstKill: !!enemy.firstKill, dungeonId: enemy.dungeonId,
  });
}

function enemyAttack(enemy) {
  const ch = state.character;
  const hit = computeDamage(rng, { attack: enemy.attack, critChance: 0, critDamage: PCT },
    { defense: state.derived.defense, level: ch.level });
  ch.currentHP = Math.max(0, ch.currentHP - hit.amount);
  emit('combat:hit', { target: 'warrior', amount: hit.amount, crit: false });
  if (ch.currentHP <= 0) warriorDied(enemy);
}

function warriorDied(enemy) {
  const cb = state.combat;
  cb.dead = true;
  cb.deadTimer = CONFIG.character.deathPauseMs;
  cb.enemy = null;
  cb.stunTimer = 0;
  cb.buff = null;
  emit('warrior:died', { wasBoss: !!enemy.isBoss });
}

function step(dt) {
  const cb = state.combat;
  if (cb.dead) {
    cb.deadTimer -= dt;
    if (cb.deadTimer <= 0) {
      cb.dead = false;
      cb.respawnTimer = 0;
      emit('character:revive');
    }
    return;
  }

  if (!cb.enemy) {
    cb.warriorCd = Math.max(0, cb.warriorCd - dt);
    cb.respawnTimer -= dt;
    if (cb.respawnTimer <= 0) emit('enemy:spawnRequest');
    return;
  }

  const enemy = cb.enemy;
  cb.warriorCd -= dt;
  while (cb.warriorCd <= 0 && cb.enemy === enemy) {
    emit('warrior:attack');                       // Skills koennen hier ausloesen
    if (cb.enemy === enemy) strike(enemy, 1);
    cb.warriorCd += 1000 / attackSpeed();
  }
  if (cb.enemy !== enemy) return;

  if (cb.stunTimer > 0) { cb.stunTimer = Math.max(0, cb.stunTimer - dt); return; }
  cb.enemyCd -= dt;
  while (cb.enemyCd <= 0 && !cb.dead) {
    enemyAttack(enemy);
    cb.enemyCd += 1000 / enemy.attacksPerSec;
  }
}

function onSkill(skill) {
  const cb = state.combat;
  const enemy = cb.enemy;
  if (skill.kind === 'buff') {
    cb.buff = { attackPct: skill.buffAttackPct, speedPct: skill.buffSpeedPct, timer: skill.durationMs };
    emit('buff:changed');
    return;
  }
  if (!enemy) return;
  // Whirlwind trifft alle anwesenden Gegner – es ist immer genau einer anwesend.
  if (skill.stunMs) cb.stunTimer = Math.max(cb.stunTimer, skill.stunMs);
  strike(enemy, skill.attackPct / PCT, skill.id);
}

// Gegner sofort ersetzen (Dungeon-Wechsel, Bosskampf)
function replaceEnemy() {
  const cb = state.combat;
  if (cb.dead) return;
  cb.enemy = null;
  cb.stunTimer = 0;
  cb.respawnTimer = 0;
}

export function init() {
  on('tick', step);
  on('tick', (dt) => {
    const b = state.combat.buff;
    if (b) { b.timer -= dt; if (b.timer <= 0) { state.combat.buff = null; emit('buff:changed'); } }
  });
  on('skill:cast', onSkill);
  on('enemy:replace', replaceEnemy);
  on('enemy:spawned', (enemy) => {
    state.combat.enemyCd = 1000 / enemy.attacksPerSec;
  });
}
