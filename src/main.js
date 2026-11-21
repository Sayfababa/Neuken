// Bootstrap: Spielstand laden, Systeme und UI starten, Game-Loop starten.
import { state, loadIntoState } from './core/state.js';
import { startLoop } from './core/loop.js';
import { loadGame, saveGame } from './systems/save.js';

import * as character from './systems/character.js';
import * as dungeon from './systems/dungeon.js';
import * as combat from './systems/combat.js';
import * as progression from './systems/progression.js';
import * as loot from './systems/loot.js';
import * as itemgen from './systems/itemgen.js';
import * as inventory from './systems/inventory.js';
import * as equipment from './systems/equipment.js';
import * as save from './systems/save.js';
import * as audio from './systems/audio.js';

import * as hud from './ui/hud.js';
import * as combatview from './ui/combatview.js';
import * as toast from './ui/toast.js';
import * as home from './ui/screens/home.js';
import * as gear from './ui/screens/gear.js';
import * as nav from './ui/nav.js';

const { save: loaded, notice } = loadGame();
loadIntoState(loaded);

// Reihenfolge zaehlt: Werte zuerst, Speichern zuletzt.
for (const sys of [character, dungeon, combat, progression, loot, itemgen, inventory, equipment, audio, save]) sys.init();
for (const ui of [hud, combatview, toast, home, gear, nav]) ui.init();

if (notice === 'corrupt') toast.show('Spielstand war beschädigt – gesichert, neues Spiel gestartet.', { kind: 'info' });

startLoop((now) => {
  hud.frame(now);
  combatview.frame(now);
  toast.frame(now);
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
window.__eg = { state, saveGame };
