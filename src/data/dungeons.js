// Dungeons (Spec Abschnitt 9). Freischaltung: Boss des vorherigen Dungeons besiegt.
export const DUNGEONS = [
  { id: 1, name: 'Forgotten Forest', level: 1,  monsters: ['slime', 'goblin'],    bg: 'bg_forest',   boss: 'boss_forest',   bossName: 'Slime King',   unlockAfterBoss: null },
  { id: 2, name: 'Skeleton Crypt',   level: 8,  monsters: ['skeleton', 'goblin'], bg: 'bg_crypt',    boss: 'boss_crypt',    bossName: 'Bone Lord',    unlockAfterBoss: 1 },
  { id: 3, name: 'Dark Caverns',     level: 18, monsters: ['skeleton', 'wraith'], bg: 'bg_cavern',   boss: 'boss_cavern',   bossName: 'Shade Matriarch',   unlockAfterBoss: 2 },
  { id: 4, name: 'Cursed Castle',    level: 32, monsters: ['wraith', 'demon'],    bg: 'bg_castle',   boss: 'boss_castle',   bossName: 'Castle Fiend',   unlockAfterBoss: 3 },
  { id: 5, name: 'Demon Fortress',   level: 50, monsters: ['demon'],              bg: 'bg_fortress', boss: 'boss_fortress', bossName: 'Archdemon', unlockAfterBoss: 4 },
];
