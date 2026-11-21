// 15 Achievements (Spec Abschnitt 10). stat = Kennzahl aus progression.js, goal = Zielwert.
export const ACHIEVEMENTS = [
  { id: 'kills_1',      name: 'Erstes Blut',          desc: 'Besiege deinen ersten Gegner',     stat: 'kills',        goal: 1 },
  { id: 'kills_100',    name: 'Schlächter',           desc: '100 Gegner besiegt',               stat: 'kills',        goal: 100 },
  { id: 'kills_1000',   name: 'Tausend Klingen',      desc: '1.000 Gegner besiegt',             stat: 'kills',        goal: 1000 },
  { id: 'kills_10000',  name: 'Ewiger Krieger',       desc: '10.000 Gegner besiegt',            stat: 'kills',        goal: 10000 },
  { id: 'level_10',     name: 'Veteran',              desc: 'Erreiche Level 10',                stat: 'level',        goal: 10 },
  { id: 'level_25',     name: 'Champion',             desc: 'Erreiche Level 25',                stat: 'level',        goal: 25 },
  { id: 'level_50',     name: 'Legende',              desc: 'Erreiche Level 50',                stat: 'level',        goal: 50 },
  { id: 'rare_1',       name: 'Blauer Schimmer',      desc: 'Finde ein Rare-Item',              stat: 'rarity',       goal: 2 },
  { id: 'epic_1',       name: 'Violettes Leuchten',   desc: 'Finde ein Epic-Item',              stat: 'rarity',       goal: 3 },
  { id: 'legendary_1',  name: 'Erstes Legendary',     desc: 'Finde ein Legendary-Item',         stat: 'rarity',       goal: 4 },
  { id: 'mythic_1',     name: 'Mythos',               desc: 'Finde ein Mythic-Item',            stat: 'rarity',       goal: 5 },
  { id: 'boss_1',       name: 'Bossbezwinger',        desc: 'Besiege deinen ersten Boss',       stat: 'bosses',       goal: 1 },
  { id: 'boss_5',       name: 'Alle 5 Bosse',         desc: 'Besiege alle 5 Bosse',             stat: 'bosses',       goal: 5 },
  { id: 'full_gear',    name: 'Voll gerüstet',        desc: 'Alle 9 Slots belegt',              stat: 'slotsFilled',  goal: 9 },
  { id: 'ilvl_100',     name: 'Meisterschmied',       desc: 'Finde ein Item mit iLvl 100',      stat: 'itemLevel',    goal: 100 },
];
