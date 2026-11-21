// Basis-Items, Affix-Pools und Namenslisten.
// basis-Werte der Affixe sind ANNAHMEN (Spec nennt basisWert(affixTyp) ohne Zahlen).
// scale: Umrechnung des ganzzahligen Affixwerts in die Spieleinheit (Attack Speed in 0.01 Angriffen/s).

export const AFFIXES = {
  strength:     { label: 'Strength',        basis: 1.0, scale: 1,    fmt: 'int',
    prefixes: ['Mighty', 'Brutish', 'Titan\'s'], suffixes: ['of Might', 'of the Ox', 'of Power'] },
  vitality:     { label: 'Vitality',        basis: 1.0, scale: 1,    fmt: 'int',
    prefixes: ['Hearty', 'Stout', 'Vital'], suffixes: ['of Vigor', 'of the Bear', 'of Life'] },
  attackDamage: { label: 'Attack Damage',   basis: 2.0, scale: 1,    fmt: 'int',
    prefixes: ['Sharp', 'Cruel', 'Savage'], suffixes: ['of Slaughter', 'of Wounding', 'of Carnage'] },
  defense:      { label: 'Defense',         basis: 1.5, scale: 1,    fmt: 'int',
    prefixes: ['Sturdy', 'Iron', 'Warded'], suffixes: ['of the Wall', 'of Warding', 'of Bulwark'] },
  critChance:   { label: 'Critical Chance', basis: 0.4, scale: 1,    fmt: 'pct',
    prefixes: ['Keen', 'Precise', 'Deadly'], suffixes: ['of Precision', 'of the Hawk', 'of Fortune'] },
  critDamage:   { label: 'Critical Damage', basis: 1.5, scale: 1,    fmt: 'pct',
    prefixes: ['Vicious', 'Rending', 'Ruthless'], suffixes: ['of Ruin', 'of Agony', 'of Execution'] },
  attackSpeed:  { label: 'Attack Speed',    basis: 1.0, scale: 0.01, fmt: 'speed',
    prefixes: ['Swift', 'Quick', 'Frenzied'], suffixes: ['of Haste', 'of the Wind', 'of Fury'] },
  hp:           { label: 'HP',              basis: 10,  scale: 1,    fmt: 'int',
    prefixes: ['Robust', 'Thick', 'Enduring'], suffixes: ['of the Whale', 'of Endurance', 'of Health'] },
};

export const AFFIX_IDS = Object.keys(AFFIXES);

// slotType bestimmt, in welchen Slot das Item passt. primary = garantierter erster Affix.
export const BASE_ITEMS = [
  { id: 'sword',  name: 'Sword',  slotType: 'weapon', asset: 'weapon_sword_001',     primary: 'attackDamage' },
  { id: 'axe',    name: 'Axe',    slotType: 'weapon', asset: 'weapon_axe_001',       primary: 'attackDamage' },
  { id: 'mace',   name: 'Mace',   slotType: 'weapon', asset: 'weapon_mace_001',      primary: 'attackDamage' },
  { id: 'helmet', name: 'Helm',   slotType: 'helmet', asset: 'armor_helmet_001',     primary: 'defense' },
  { id: 'chest',  name: 'Cuirass',slotType: 'chest',  asset: 'armor_chest_001',      primary: 'hp' },
  { id: 'gloves', name: 'Gauntlets', slotType: 'gloves', asset: 'armor_gloves_001',  primary: 'attackSpeed' },
  { id: 'boots',  name: 'Greaves',slotType: 'boots',  asset: 'armor_boots_001',      primary: 'vitality' },
  { id: 'shield', name: 'Shield', slotType: 'shield', asset: 'accessory_shield_001', primary: 'defense' },
  { id: 'ring',   name: 'Ring',   slotType: 'ring',   asset: 'accessory_ring_001',   primary: 'critChance' },
  { id: 'amulet', name: 'Amulet', slotType: 'amulet', asset: 'accessory_amulet_001', primary: 'strength' },
];

// Reihenfolge = Anzeige im GEAR-Raster (3x3)
export const SLOTS = [
  { id: 'ring1',  label: 'Ring',   accepts: 'ring' },
  { id: 'helmet', label: 'Helmet', accepts: 'helmet' },
  { id: 'amulet', label: 'Amulet', accepts: 'amulet' },
  { id: 'weapon', label: 'Weapon', accepts: 'weapon' },
  { id: 'chest',  label: 'Chest',  accepts: 'chest' },
  { id: 'shield', label: 'Shield', accepts: 'shield' },
  { id: 'gloves', label: 'Gloves', accepts: 'gloves' },
  { id: 'boots',  label: 'Boots',  accepts: 'boots' },
  { id: 'ring2',  label: 'Ring',   accepts: 'ring' },
];

export const SLOT_TYPE_LABEL = {
  weapon: 'Weapon', helmet: 'Helmet', chest: 'Chest', gloves: 'Gloves', boots: 'Boots',
  shield: 'Shield', ring: 'Ring', amulet: 'Amulet',
};
