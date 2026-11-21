// Skills: passive Stufen mit Gold kaufen, aktive Skills feuern automatisch.
import { state } from '../core/state.js';
import { on, emit } from '../core/events.js';
import { PASSIVE_SKILLS, PASSIVE_MAX_LEVEL, passiveCost, ACTIVE_SKILLS } from '../data/skills.js';

export function passiveLevel(id) {
  return state.skills.passive[id] || 0;
}

export function nextPassiveCost(id) {
  const lv = passiveLevel(id);
  return lv >= PASSIVE_MAX_LEVEL ? null : passiveCost(lv);
}

export function isActiveUnlocked(skill) {
  return state.character.level >= skill.unlockLevel;
}

function buyPassive({ id }) {
  if (!PASSIVE_SKILLS.some(p => p.id === id)) return;
  const cost = nextPassiveCost(id);
  if (cost === null || state.currency.gold < cost) return;
  state.currency.gold -= cost;
  state.skills.passive[id] = passiveLevel(id) + 1;
  emit('stats:dirty');
  emit('skills:changed', { id, level: state.skills.passive[id] });
}

function ready(skill) {
  return isActiveUnlocked(skill) && !(state.combat.skillCd[skill.id] > 0);
}

function cast(skill) {
  const cb = state.combat;
  if (cb.dead || !cb.enemy || !ready(skill)) return false;
  cb.skillCd[skill.id] = skill.cooldownMs;
  emit('skill:cast', skill);
  return true;
}

// Automatisch: hoechstens ein Skill pro Schwung des Kriegers
function autoCast() {
  for (const s of ACTIVE_SKILLS) if (cast(s)) return;
}

export function init() {
  on('skill:buy', buyPassive);
  on('skill:trigger', ({ id }) => {
    const s = ACTIVE_SKILLS.find(x => x.id === id);
    if (s) cast(s);
  });
  on('warrior:attack', autoCast);
  on('tick', (dt) => {
    const cd = state.combat.skillCd;
    for (const id in cd) if (cd[id] > 0) cd[id] = Math.max(0, cd[id] - dt);
  });
  on('character:levelup', ({ level, gained }) => {
    for (const s of ACTIVE_SKILLS) {
      if (level >= s.unlockLevel && level - gained < s.unlockLevel) emit('skill:unlocked', s);
    }
  });
}
