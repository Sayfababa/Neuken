// HERO: Charakterwerte, Statistiken, Achievements, Spielstand exportieren/importieren.
import { state } from '../../core/state.js';
import { on } from '../../core/events.js';
import { CONFIG } from '../../data/config.js';
import { DUNGEONS } from '../../data/dungeons.js';
import { MONSTERS } from '../../data/monsters.js';
import { ACHIEVEMENTS } from '../../data/achievements.js';
import { Assets } from '../../systems/assets.js';
import { exportSave, importSave } from '../../systems/save.js';
import { achievementStat } from '../../systems/progression.js';
import { $, setHTML, setAttr, onTap, onTapWithin, fmtNum, esc } from '../render.js';
import { openSheet, sheetElement } from '../sheet.js';
import { show as toast } from '../toast.js';

let el;
let open = false;
let lastKey = '';

function stat(label, value) {
  return `<div class="hs"><span>${label}</span><b>${value}</b></div>`;
}

function render() {
  const d = state.derived;
  const s = state.stats;
  const dg = state.dungeons;
  setHTML(el.stats, [
    stat('Level', state.character.level), stat('Gesamt-XP', fmtNum(s.totalXP)),
    stat('Angriff', fmtNum(d.attack)), stat('max HP', fmtNum(d.maxHP)),
    stat('Verteidigung', fmtNum(d.defense)), stat('Tempo', `${d.attackSpeed.toFixed(2)}/s`),
    stat('Krit-Chance', `${+d.critChance.toFixed(1)}%`), stat('Krit-Schaden', `${d.critDamage}%`),
    stat('Stärke', d.strength), stat('Vitalität', d.vitality),
    stat('Kills gesamt', fmtNum(s.totalKills)), stat('Boss-Siege', fmtNum(s.bossKills)),
    stat('Dungeons', `${dg.unlocked.length}/${DUNGEONS.length}`), stat('Bosse', `${dg.bossesDefeated.length}/${DUNGEONS.length}`),
    stat('Legendaries', s.legendariesFound), stat('Mythics', s.mythicsFound),
    stat('Höchstes iLvl', s.highestItemLevel), stat('Achievements', `${state.achievements.length}/${ACHIEVEMENTS.length}`),
  ].join(''));
  setHTML(el.kills, Object.keys(MONSTERS).map(id =>
    `<div class="kill-chip"><span class="kill-icon">${Assets.get(MONSTERS[id].asset)}</span><b>${fmtNum(s.killsByType[id] || 0)}</b></div>`).join(''));
  setHTML(el.ach, ACHIEVEMENTS.map(a => {
    const done = state.achievements.includes(a.id);
    return `<button class="ach ${done ? 'done' : ''}" data-id="${a.id}" aria-label="${esc(a.name)}">
      ${Assets.get(done ? 'ui_trophy_001' : 'ui_lock_001')}</button>`;
  }).join(''));
}

export function frame() {
  if (!open) return;
  const s = state.stats;
  const key = `${state.character.level}|${s.totalKills}|${state.achievements.length}|${s.highestItemLevel}|${state.derived.attack}|${state.derived.maxHP}`;
  if (key === lastKey) return;
  lastKey = key;
  render();
}

function progressText(a) {
  const v = achievementStat(a.stat);
  if (a.stat === 'rarity') return '';
  return ` (${fmtNum(Math.min(v, a.goal))}/${fmtNum(a.goal)})`;
}

async function doExport() {
  const json = exportSave();
  try {
    await navigator.clipboard.writeText(json);
    toast('Spielstand in die Zwischenablage kopiert', { kind: 'info' });
  } catch {
    openSheet(`<h2 class="sheet-title">Spielstand exportieren</h2>
      <p class="sheet-meta">Text markieren und kopieren, dann sicher aufbewahren.</p>
      <textarea class="save-text scroll" readonly>${esc(json)}</textarea>`);
  }
}

function doImport() {
  openSheet(`<h2 class="sheet-title">Spielstand importieren</h2>
    <p class="sheet-meta">Exportierten Text einfügen. Der aktuelle Stand wird vorher gesichert.</p>
    <textarea class="save-text scroll" id="import-text" placeholder="Hier einfügen …"></textarea>`, [{
    label: 'IMPORTIEREN', primary: true,
    onTap: () => {
      const text = sheetElement('#import-text').value;
      if (importSave(text)) {
        toast('Spielstand importiert – lädt neu …', { kind: 'info' });
        setTimeout(() => location.reload(), CONFIG.ui.reloadDelayMs);
      } else {
        toast('Import fehlgeschlagen: kein gültiger Spielstand', { kind: 'info' });
      }
    },
  }]);
}

export function init() {
  el = { panel: $('#panel-hero'), stats: $('#hero-stats'), kills: $('#hero-kills'), ach: $('#hero-ach') };
  onTapWithin(el.ach, '.ach', (btn) => {
    const a = ACHIEVEMENTS.find(x => x.id === btn.dataset.id);
    const done = state.achievements.includes(a.id);
    toast(`${done ? '✓' : '🔒'} ${a.name}: ${a.desc}${done ? '' : progressText(a)}`, { kind: 'info' });
  });
  onTap($('#btn-export'), doExport);
  onTap($('#btn-import'), doImport);
  on('ui:tab', (tab) => {
    open = tab === 'hero';
    setAttr(el.panel, 'hidden', !open);
    lastKey = '';
    frame();
  });
}
