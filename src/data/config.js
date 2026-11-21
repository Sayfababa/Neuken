// ALLE Balancing-Zahlen und Formeln (Spec Abschnitt 6).
// Werte mit "ANNAHME (bestaetigt)" standen nicht im Spec und wurden vom Auftraggeber nach Phase 1 bestaetigt.

import { AFFIXES, AFFIX_IDS } from './items.js';
import { PASSIVE_SKILLS } from './skills.js';

export const CONFIG = {
  // Logik-Takt (Spec Abschnitt 2)
  logicTickMs: 100,
  maxCatchUpMs: 1000,           // technisch: nach Tab-Wechsel max. 1 s nachrechnen

  character: {
    name: 'Warrior',
    startLevel: 1,
    startStrength: 0,           // ANNAHME (bestaetigt)
    startVitality: 0,           // ANNAHME (bestaetigt)
    strengthPerLevel: 2,
    vitalityPerLevel: 2,
    base: {
      hp: 100, hpPerLevel: 18, hpPerVitality: 7,
      attack: 10, attackPerLevel: 2.5, attackPerStrength: 1.2,
      defense: 5, defensePerLevel: 1.2,
      attackSpeed: 1.0, attackSpeedCap: 5.0,
      critChance: 5, critChanceCap: 75,
      critDamage: 150,
    },
    hpRegenPctPerSec: 1.5,      // ANNAHME (bestaetigt): Regeneration in % maxHP pro Sekunde
    deathPauseMs: 3000,
  },

  xp: { base: 50, exp: 1.55 },   // xpBenoetigt(level) = floor(base * level^exp)

  damage: {
    rollMin: 0.90, rollMax: 1.10,
    mitigationBase: 50, mitigationPerLevel: 10,
    minDamage: 1,
  },

  monster: {
    hpBase: 60, hpGrowth: 1.11,              // Phase 3: Spec 1.18 (Dungeon 5 sonst unerreichbar)
    attackBase: 8, attackGrowth: 1.09,       // Phase 3: Spec 1.15
    defenseBase: 3, defenseGrowth: 1.12,
    xpBase: 15, xpExp: 1.20,                 // Phase 3: Spec xpBase 12 (Level 10 nach ~11 min)
    goldBase: 8, goldExp: 1.15, goldRollMin: 0.8, goldRollMax: 1.2,
    attacksPerSec: 0.8,         // ANNAHME (bestaetigt)
    respawnMs: 450,             // ANNAHME (bestaetigt), Phase 3: 600 -> 450
  },

  boss: {
    hpMult: 12, attackMult: 2.0, xpMult: 15, goldMult: 20,  // Standard; je Boss in dungeons.js ueberschrieben (Phase 3)
    dropChance: 1.0, minRarity: 'rare', firstKillRarity: 'epic',
    killsRequired: 10,          // Spec Abschnitt 9: Boss-Button nach 10 Kills
    typeMult: 1.0,              // ANNAHME: Boss nutzt gegnerHP/-Angriff ohne Typ-Multiplikator
  },

  loot: {
    dropChance: 0.22,
    enabledRarities: ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'],
    highRarityShiftPerLevel: 0.03, // gilt fuer Rare und hoeher
    highRarityFrom: 'rare',
    itemLevelPerDungeonLevel: 3, itemLevelSpread: 2,
    itemLevelMin: 1, itemLevelMax: 999,
  },

  rarities: [
    { id: 'common',    label: 'Common',    weight: 60.0, affixes: 1, mult: 1.00, color: '#9aa0a6' },
    { id: 'uncommon',  label: 'Uncommon',  weight: 25.0, affixes: 2, mult: 1.15, color: '#4ade80' },
    { id: 'rare',      label: 'Rare',      weight: 10.0, affixes: 3, mult: 1.30, color: '#60a5fa' },
    { id: 'epic',      label: 'Epic',      weight: 4.0,  affixes: 4, mult: 1.50, color: '#a855f7' },
    { id: 'legendary', label: 'Legendary', weight: 0.06, affixes: 5, mult: 1.75, color: '#f59e0b' }, // Phase 3: Spec 0.9 (erstes Legendary ~60-90 min)
    { id: 'mythic',    label: 'Mythic',    weight: 0.0067, affixes: 6, mult: 2.00, color: '#ef4444' }, // Phase 3: Spec 0.1 (Verhaeltnis 1:9 beibehalten)
  ],

  affix: {
    levelExp: 0.6, rollMin: 0.85, rollMax: 1.15,  // Phase 3: Spec 0.85 (Item-Sprung zwischen Dungeons zu gross)
    minValue: 1,                // ANNAHME (bestaetigt): kein Affix mit Wert 0
  },

  // Nutzwert fuer Vergleich / Ring-Wahl / Verwerfen (Spec Abschnitt 7)
  score: { attack: 1.0, hp: 0.15, defense: 0.8, critChance: 8, critDamage: 0.5, attackSpeed: 40 },

  inventory: { max: 120 },

  save: {
    key: 'eternal_grind_save_v1',
    version: 1,
    autosaveMs: 10000,
    corruptPrefix: 'eg_save_corrupt_',
    backupPrefix: 'eg_save_backup_',
    autosaveFromRarity: 'rare',
  },

  // Reine Darstellungs-Zeiten (keine Spielwerte), hier zentral statt verstreut im UI.
  ui: {
    damagePoolSize: 16,
    damageOffsetsPx: [-34, 22, -12, 38, 4, -40, 30, -22],
    attackPoseMs: 180,
    hitPoseMs: 200,
    toastMs: 2400,
    toastMax: 3,
    reloadDelayMs: 800,
  },
};

// ---------- Formeln ----------

export function emptyTotals() {
  const t = {};
  for (const id of AFFIX_IDS) t[id] = 0;
  return t;
}

// Summe aller Affixe eines Items in Spieleinheiten
export function itemTotals(item, into = emptyTotals()) {
  for (const a of item.affixes) into[a.type] += a.value * AFFIXES[a.type].scale;
  return into;
}

export const itemScoreOf = (item) => itemScore(itemTotals(item));

export const xpRequired = (level) => Math.floor(CONFIG.xp.base * Math.pow(level, CONFIG.xp.exp));

// passive: { skillId: stufe }  -> Prozent-Boni multiplikativ, Krit-Chance additiv
export function passiveBonus(passive = {}) {
  const out = { attack: 0, maxHP: 0, defense: 0, attackSpeed: 0, critChance: 0 };
  for (const p of PASSIVE_SKILLS) {
    const lv = passive[p.id] || 0;
    out[p.stat] += lv * (p.perLevelPct ?? p.perLevelFlat);
  }
  return out;
}

export function deriveStats(ch, gear, passive) {
  const b = CONFIG.character.base;
  const pb = passiveBonus(passive);
  const lv = ch.level - 1;
  const strength = ch.strength + gear.strength;
  const vitality = ch.vitality + gear.vitality;
  const pct = (v, p) => v * (1 + p / 100);
  return {
    strength, vitality,
    maxHP: Math.floor(pct(b.hp + b.hpPerLevel * lv + vitality * b.hpPerVitality + gear.hp, pb.maxHP)),
    attack: Math.floor(pct(b.attack + b.attackPerLevel * lv + strength * b.attackPerStrength + gear.attackDamage, pb.attack)),
    defense: Math.floor(pct(b.defense + b.defensePerLevel * lv + gear.defense, pb.defense)),
    attackSpeed: Math.min(b.attackSpeedCap, pct(b.attackSpeed + gear.attackSpeed, pb.attackSpeed)),
    critChance: Math.min(b.critChanceCap, b.critChance + gear.critChance + pb.critChance),
    critDamage: b.critDamage + gear.critDamage,
  };
}

// attacker: { attack, critChance, critDamage }  target: { defense, level }
export function computeDamage(rng, attacker, target) {
  const d = CONFIG.damage;
  const raw = attacker.attack * rng.range(d.rollMin, d.rollMax);
  const mitigation = target.defense / (target.defense + d.mitigationBase + d.mitigationPerLevel * target.level);
  let amount = Math.max(d.minDamage, Math.floor(raw * (1 - mitigation)));
  const crit = rng.float() * 100 < (attacker.critChance || 0);
  if (crit) amount = Math.floor(amount * attacker.critDamage / 100);
  return { amount, crit };
}

export function monsterStats(rng, dungeonLevel, typeMult) {
  const m = CONFIG.monster;
  const n = dungeonLevel - 1;
  return {
    level: dungeonLevel,
    maxHP: Math.floor(m.hpBase * Math.pow(m.hpGrowth, n) * typeMult),
    attack: Math.floor(m.attackBase * Math.pow(m.attackGrowth, n) * typeMult),
    defense: Math.floor(m.defenseBase * Math.pow(m.defenseGrowth, n)),
    xp: Math.floor(m.xpBase * Math.pow(dungeonLevel, m.xpExp)),
    gold: Math.floor(m.goldBase * Math.pow(dungeonLevel, m.goldExp) * rng.range(m.goldRollMin, m.goldRollMax)),
    attacksPerSec: m.attacksPerSec,
  };
}

// dungeon.bossHpMult / bossAttackMult: Feinabstimmung je Boss (Phase 3), sonst globale Werte
export function bossStats(rng, dungeon) {
  const B = CONFIG.boss;
  const m = monsterStats(rng, dungeon.level, B.typeMult);
  return {
    ...m,
    maxHP: Math.floor(m.maxHP * (dungeon.bossHpMult ?? B.hpMult)),
    attack: Math.floor(m.attack * (dungeon.bossAttackMult ?? B.attackMult)),
    xp: Math.floor(m.xp * B.xpMult),
    gold: Math.floor(m.gold * B.goldMult),
  };
}

export function rarityIndex(id) {
  return CONFIG.rarities.findIndex(r => r.id === id);
}

// Liefert [[rarityId, gewicht], ...] normalisiert auf Summe 100. minRarity: optionale Untergrenze.
export function rarityWeights(dungeonLevel, minRarity = null) {
  const l = CONFIG.loot;
  const from = rarityIndex(l.highRarityFrom);
  const list = CONFIG.rarities
    .map((r, i) => [r.id, i >= from ? r.weight * (1 + l.highRarityShiftPerLevel * (dungeonLevel - 1)) : r.weight])
    .filter(([id]) => l.enabledRarities.includes(id))
    .filter(([id]) => !minRarity || rarityIndex(id) >= rarityIndex(minRarity));
  const sum = list.reduce((s, [, w]) => s + w, 0);
  return list.map(([id, w]) => [id, (w / sum) * 100]);
}

export function rollItemLevel(rng, dungeonLevel) {
  const l = CONFIG.loot;
  const v = dungeonLevel * l.itemLevelPerDungeonLevel + rng.int(-l.itemLevelSpread, l.itemLevelSpread);
  return Math.min(l.itemLevelMax, Math.max(l.itemLevelMin, v));
}

export function affixValue(rng, basis, itemLevel, mult) {
  const a = CONFIG.affix;
  const v = Math.floor(basis * Math.pow(itemLevel, a.levelExp) * mult * rng.range(a.rollMin, a.rollMax));
  return Math.max(a.minValue, v);
}

// totals: aufsummierte Affixe eines Items (gleiche Felder wie Gear-Summen)
export function itemScore(t) {
  const s = CONFIG.score;
  const b = CONFIG.character.base;
  const attackGain = t.attackDamage + t.strength * b.attackPerStrength;
  const hpGain = t.hp + t.vitality * b.hpPerVitality;
  return attackGain * s.attack + hpGain * s.hp + t.defense * s.defense
    + t.critChance * s.critChance + t.critDamage * s.critDamage + t.attackSpeed * s.attackSpeed;
}
