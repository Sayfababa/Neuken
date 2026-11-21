// ALLE Balancing-Zahlen und Formeln (Spec Abschnitt 6).
// Werte mit "ANNAHME" stehen NICHT im Spec und muessen vom Auftraggeber bestaetigt werden.

import { AFFIXES, AFFIX_IDS } from './items.js';

export const CONFIG = {
  // Logik-Takt (Spec Abschnitt 2)
  logicTickMs: 100,
  maxCatchUpMs: 1000,           // technisch: nach Tab-Wechsel max. 1 s nachrechnen

  character: {
    name: 'Warrior',
    startLevel: 1,
    startStrength: 0,           // ANNAHME
    startVitality: 0,           // ANNAHME
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
    hpRegenPctPerSec: 1.5,      // ANNAHME: Regeneration in % maxHP pro Sekunde
    deathPauseMs: 3000,
  },

  damage: {
    rollMin: 0.90, rollMax: 1.10,
    mitigationBase: 50, mitigationPerLevel: 10,
    minDamage: 1,
  },

  monster: {
    hpBase: 60, hpGrowth: 1.18,
    attackBase: 8, attackGrowth: 1.15,
    defenseBase: 3, defenseGrowth: 1.12,
    xpBase: 12, xpExp: 1.20,
    goldBase: 8, goldExp: 1.15, goldRollMin: 0.8, goldRollMax: 1.2,
    attacksPerSec: 0.8,         // ANNAHME
    respawnMs: 600,             // ANNAHME: Pause zwischen zwei Gegnern
  },

  boss: {
    hpMult: 12, attackMult: 2.0, xpMult: 15, goldMult: 20,
    dropChance: 1.0, minRarity: 'rare', firstKillRarity: 'epic',
  },

  loot: {
    dropChance: 0.22,
    // Phase 1: einfache Tabelle (nur diese Seltenheiten). Phase 2 schaltet alle frei.
    enabledRarities: ['common', 'uncommon', 'rare'],
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
    { id: 'legendary', label: 'Legendary', weight: 0.9,  affixes: 5, mult: 1.75, color: '#f59e0b' },
    { id: 'mythic',    label: 'Mythic',    weight: 0.1,  affixes: 6, mult: 2.00, color: '#ef4444' },
  ],

  affix: {
    levelExp: 0.85, rollMin: 0.85, rollMax: 1.15,
    minValue: 1,                // ANNAHME: kein Affix mit Wert 0
  },

  // Nutzwert fuer Vergleich / Ring-Wahl / Verwerfen (Spec Abschnitt 7)
  score: { attack: 1.0, hp: 0.15, defense: 0.8, critChance: 8, critDamage: 0.5, attackSpeed: 40 },

  inventory: { max: 120 },

  save: {
    key: 'eternal_grind_save_v1',
    version: 1,
    autosaveMs: 10000,
    corruptPrefix: 'eg_save_corrupt_',
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
    inventoryRowsPerChunk: 120,
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

export const xpRequired = (level) => Math.floor(50 * Math.pow(level, 1.55));

export function deriveStats(ch, gear) {
  const b = CONFIG.character.base;
  const lv = ch.level - 1;
  const strength = ch.strength + gear.strength;
  const vitality = ch.vitality + gear.vitality;
  return {
    strength, vitality,
    maxHP: Math.floor(b.hp + b.hpPerLevel * lv + vitality * b.hpPerVitality + gear.hp),
    attack: Math.floor(b.attack + b.attackPerLevel * lv + strength * b.attackPerStrength + gear.attackDamage),
    defense: Math.floor(b.defense + b.defensePerLevel * lv + gear.defense),
    attackSpeed: Math.min(b.attackSpeedCap, b.attackSpeed + gear.attackSpeed),
    critChance: Math.min(b.critChanceCap, b.critChance + gear.critChance),
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

export function rarityIndex(id) {
  return CONFIG.rarities.findIndex(r => r.id === id);
}

// Liefert [[rarityId, gewicht], ...] normalisiert auf Summe 100.
export function rarityWeights(dungeonLevel) {
  const l = CONFIG.loot;
  const from = rarityIndex(l.highRarityFrom);
  const list = CONFIG.rarities
    .map((r, i) => [r.id, i >= from ? r.weight * (1 + l.highRarityShiftPerLevel * (dungeonLevel - 1)) : r.weight])
    .filter(([id]) => l.enabledRarities.includes(id));
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
