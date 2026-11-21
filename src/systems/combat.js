// Automatischer Kampf: Krieger gegen aktuellen Gegner, in festen Logik-Schritten.
import { state } from '../core/state.js';
import { on, emit } from '../core/events.js';
import { rng } from '../core/rng.js';
import { CONFIG, computeDamage } from '../data/config.js';

function warriorAttack(enemy) {
  const d = state.derived;
  const hit = computeDamage(rng, d, enemy);
  enemy.hp = Math.max(0, enemy.hp - hit.amount);
  emit('combat:hit', { target: 'enemy', amount: hit.amount, crit: hit.crit });
  if (enemy.hp <= 0) killEnemy(enemy);
}

function killEnemy(enemy) {
  const cb = state.combat;
  cb.enemy = null;
  cb.respawnTimer = CONFIG.monster.respawnMs;
  emit('enemy:killed', { type: enemy.type, level: enemy.level, xp: enemy.xp, gold: enemy.gold, isBoss: false });
}

function enemyAttack(enemy) {
  const ch = state.character;
  const hit = computeDamage(rng, { attack: enemy.attack, critChance: 0, critDamage: 100 },
    { defense: state.derived.defense, level: ch.level });
  ch.currentHP = Math.max(0, ch.currentHP - hit.amount);
  emit('combat:hit', { target: 'warrior', amount: hit.amount, crit: false });
  if (ch.currentHP <= 0) warriorDied();
}

function warriorDied() {
  const cb = state.combat;
  cb.dead = true;
  cb.deadTimer = CONFIG.character.deathPauseMs;
  cb.enemy = null;
  emit('warrior:died');
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
  cb.enemyCd -= dt;
  while (cb.warriorCd <= 0 && cb.enemy === enemy) {
    emit('warrior:attack');
    warriorAttack(enemy);
    cb.warriorCd += 1000 / state.derived.attackSpeed;
  }
  if (cb.enemy !== enemy) return;
  while (cb.enemyCd <= 0 && !cb.dead) {
    enemyAttack(enemy);
    cb.enemyCd += 1000 / enemy.attacksPerSec;
  }
}

export function init() {
  on('tick', step);
  on('enemy:spawned', (enemy) => {
    state.combat.enemyCd = 1000 / enemy.attacksPerSec;
  });
}
