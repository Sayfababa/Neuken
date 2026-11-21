// Dungeons (Spec Abschnitt 9). Phase 1 nutzt nur Dungeon 1.
export const DUNGEONS = [
  { id: 1, name: 'Forgotten Forest', level: 1,  monsters: ['slime', 'goblin'],    bg: 'bg_forest',   boss: 'boss_forest',   unlockAfterBoss: null },
  { id: 2, name: 'Skeleton Crypt',   level: 8,  monsters: ['skeleton', 'goblin'], bg: 'bg_crypt',    boss: 'boss_crypt',    unlockAfterBoss: 1 },
  { id: 3, name: 'Dark Caverns',     level: 18, monsters: ['skeleton', 'wraith'], bg: 'bg_cavern',   boss: 'boss_cavern',   unlockAfterBoss: 2 },
  { id: 4, name: 'Cursed Castle',    level: 32, monsters: ['wraith', 'demon'],    bg: 'bg_castle',   boss: 'boss_castle',   unlockAfterBoss: 3 },
  { id: 5, name: 'Demon Fortress',   level: 50, monsters: ['demon'],              bg: 'bg_fortress', boss: 'boss_fortress', unlockAfterBoss: 4 },
];
