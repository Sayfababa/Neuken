// Skills (Spec Abschnitt 8). Wird erst in Phase 2 verwendet.
export const PASSIVE_SKILLS = [
  { id: 'damage',     name: 'Increased Damage',          stat: 'attack',      perLevelPct: 4 },
  { id: 'health',     name: 'Increased Health',          stat: 'maxHP',       perLevelPct: 5 },
  { id: 'defense',    name: 'Increased Defense',         stat: 'defense',     perLevelPct: 4 },
  { id: 'critChance', name: 'Increased Critical Chance', stat: 'critChance',  perLevelFlat: 1.5 },
  { id: 'speed',      name: 'Increased Attack Speed',    stat: 'attackSpeed', perLevelPct: 3 },
];
export const PASSIVE_MAX_LEVEL = 10;
export const passiveCost = (stufe) => Math.floor(100 * Math.pow(1.6, stufe));

export const ACTIVE_SKILLS = [
  { id: 'heavyStrike',   name: 'Heavy Strike',   attackPct: 250, cooldownMs: 6000,  unlockLevel: 5 },
  { id: 'whirlwind',     name: 'Whirlwind',      attackPct: 120, cooldownMs: 10000, unlockLevel: 12, hitsAll: true },
  { id: 'shieldBash',    name: 'Shield Bash',    attackPct: 150, cooldownMs: 14000, unlockLevel: 20, stunMs: 2000 },
  { id: 'berserkerRage', name: 'Berserker Rage', buffAttackPct: 50, buffSpeedPct: 30, durationMs: 8000, cooldownMs: 30000, unlockLevel: 30 },
];
