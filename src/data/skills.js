// Skills (Spec Abschnitt 8).
// Passiv: Stufe 1-10. Kosten fuer die naechste Stufe = 100 * 1.6^aktuelleStufe (erste Stufe 100 Gold).
export const PASSIVE_SKILLS = [
  { id: 'damage',     name: 'Increased Damage',          stat: 'attack',      perLevelPct: 4,    effect: 'Angriff',              unit: '%' },
  { id: 'health',     name: 'Increased Health',          stat: 'maxHP',       perLevelPct: 5,    effect: 'max HP',               unit: '%' },
  { id: 'defense',    name: 'Increased Defense',         stat: 'defense',     perLevelPct: 4,    effect: 'Verteidigung',         unit: '%' },
  { id: 'critChance', name: 'Increased Critical Chance', stat: 'critChance',  perLevelFlat: 1.5, effect: 'Krit-Chance',          unit: '%' },
  { id: 'speed',      name: 'Increased Attack Speed',    stat: 'attackSpeed', perLevelPct: 3,    effect: 'Angriffstempo',        unit: '%' },
];
export const PASSIVE_MAX_LEVEL = 10;
export const passiveCost = (stufe) => Math.floor(100 * Math.pow(1.6, stufe));

// Aktiv: feuern automatisch. kind: strike = Schaden, buff = Verstaerkung
export const ACTIVE_SKILLS = [
  { id: 'heavyStrike',   name: 'Heavy Strike',   kind: 'strike', attackPct: 250, cooldownMs: 6000,  unlockLevel: 5,
    asset: 'skill_heavy_strike_001', desc: '250 % Angriff auf ein Ziel' },
  { id: 'whirlwind',     name: 'Whirlwind',      kind: 'strike', attackPct: 120, cooldownMs: 10000, unlockLevel: 12, hitsAll: true,
    asset: 'skill_whirlwind_001', desc: '120 % Angriff auf alle anwesenden Gegner' },
  { id: 'shieldBash',    name: 'Shield Bash',    kind: 'strike', attackPct: 150, cooldownMs: 14000, unlockLevel: 20, stunMs: 2000,
    asset: 'skill_shield_bash_001', desc: '150 % Angriff, Gegner 2 s betäubt' },
  { id: 'berserkerRage', name: 'Berserker Rage', kind: 'buff', buffAttackPct: 50, buffSpeedPct: 30, durationMs: 8000, cooldownMs: 30000, unlockLevel: 30,
    asset: 'skill_berserker_rage_001', desc: '+50 % Angriff und +30 % Tempo für 8 s' },
];
