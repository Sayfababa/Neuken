// Bootstrap: Spielstand laden, Systeme und UI starten, Game-Loop starten.
import { state, loadIntoState } from './core/state.js';
import { startLoop } from './core/loop.js';
import { emit } from './core/events.js';
import { loadGame, saveGame } from './systems/save.js';

import * as character from './systems/character.js';
import * as dungeon from './systems/dungeon.js';
import * as combat from './systems/combat.js';
import * as progression from './systems/progression.js';
import * as loot from './systems/loot.js';
import * as itemgen from './systems/itemgen.js';
import * as inventory from './systems/inventory.js';
import * as equipment from './systems/equipment.js';
import * as skills from './systems/skills.js';
import * as boss from './systems/boss.js';
import * as save from './systems/save.js';
import * as audio from './systems/audio.js';

import * as hud from './ui/hud.js';
import * as combatview from './ui/combatview.js';
import * as toast from './ui/toast.js';
import * as home from './ui/screens/home.js';
import * as gear from './ui/screens/gear.js';
import * as skillsScreen from './ui/screens/skills.js';
import * as dungeonScreen from './ui/screens/dungeon.js';
import * as heroScreen from './ui/screens/hero.js';
import * as sheet from './ui/sheet.js';
import * as nav from './ui/nav.js';

const { save: loaded, notice } = loadGame();
loadIntoState(loaded);

// Reihenfolge zaehlt: Werte zuerst, Boss nach Loot (sammelt dessen Drops), Speichern zuletzt.
for (const sys of [character, dungeon, combat, progression, loot, itemgen, inventory, equipment, skills, boss, audio, save]) sys.init();
for (const ui of [hud, combatview, toast, sheet, home, gear, skillsScreen, dungeonScreen, heroScreen, nav]) ui.init();

if (notice === 'corrupt') toast.show('Spielstand war beschädigt – gesichert, neues Spiel gestartet.', { kind: 'info' });

startLoop((now) => {
  hud.frame(now);
  combatview.frame(now);
  toast.frame(now);
  skillsScreen.frame();
  dungeonScreen.frame();
  heroScreen.frame();
});

// iOS: Speichern, wenn die App in den Hintergrund geht
document.addEventListener('visibilitychange', () => { if (document.hidden) saveGame(); });
window.addEventListener('pagehide', saveGame);

// iOS ignoriert user-scalable=no: Pinch-Zoom und Gummiband-Scrollen selbst verhindern
document.addEventListener('gesturestart', (e) => e.preventDefault());
document.addEventListener('touchmove', (e) => {
  if (e.touches.length > 1 || !e.target.closest('.scroll')) e.preventDefault();
}, { passive: false });

// Testzugang fuer automatische Checks
window.__eg = { state, saveGame, emit };
