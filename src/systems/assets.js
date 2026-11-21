// Asset-Manager. Spiellogik und UI kennen nur IDs; was dahinter steckt, weiss nur diese Datei.
// Phase 4: liegt unter assets/<ordner>/<id>.png eine Datei, wird sie verwendet; sonst greift der
// CSS/SVG-Platzhalter unten. Ordner und Masse je ID: assets/README.md.

import { emit } from '../core/events.js';

// data-asset: erlaubt der UI, ein Platzhalter-Element gegen die nachgeladene Datei zu tauschen.
let currentId = '';
const svg = (body, cls = '') =>
  `<svg class="asset ${cls}" data-asset="${currentId}" viewBox="0 0 100 100" aria-hidden="true">${body}</svg>`;

// ---------- Krieger ----------
function warrior(pose) {
  const tint = pose === 'hit' ? '#f87171' : pose === 'death' ? '#4b5563' : '#94a3b8';
  const cape = pose === 'death' ? '#374151' : '#7f1d1d';
  const sword = pose === 'attack'
    ? '<g transform="rotate(-70 66 52)"><rect x="64" y="10" width="5" height="44" rx="1" fill="#e5e7eb"/><rect x="58" y="52" width="17" height="4" fill="#a16207"/><rect x="64" y="56" width="5" height="9" fill="#78350f"/></g>'
    : '<rect x="72" y="18" width="5" height="44" rx="1" fill="#e5e7eb"/><rect x="66" y="58" width="17" height="4" fill="#a16207"/><rect x="72" y="62" width="5" height="9" fill="#78350f"/>';
  const body = `
    <path d="M34 40 L66 40 L72 88 L28 88 Z" fill="${cape}"/>
    <rect x="38" y="70" width="9" height="22" rx="2" fill="#334155"/>
    <rect x="53" y="70" width="9" height="22" rx="2" fill="#334155"/>
    <rect x="35" y="40" width="30" height="34" rx="5" fill="${tint}"/>
    <rect x="35" y="56" width="30" height="5" fill="#475569"/>
    <circle cx="50" cy="28" r="12" fill="${tint}"/>
    <rect x="42" y="26" width="16" height="4" rx="1" fill="#0f172a"/>
    <path d="M50 12 L54 18 L46 18 Z" fill="#b91c1c"/>
    ${sword}
    <path d="M18 44 L34 44 L34 62 Q26 72 18 62 Z" fill="#78716c" stroke="#d6d3d1" stroke-width="2"/>`;
  const wrap = pose === 'death' ? `<g transform="rotate(80 50 80) translate(0 10)">${body}</g>` : body;
  return svg(wrap, `pose-${pose}`);
}

// ---------- Monster ----------
const MONSTER_SVG = {
  slime: `<ellipse cx="50" cy="90" rx="30" ry="4" fill="#000" opacity=".35"/>
    <path d="M18 88 Q16 50 50 34 Q84 50 82 88 Z" fill="#22c55e"/>
    <path d="M28 60 Q34 46 46 42" stroke="#bbf7d0" stroke-width="4" fill="none" stroke-linecap="round"/>
    <circle cx="40" cy="66" r="6" fill="#052e16"/><circle cx="60" cy="66" r="6" fill="#052e16"/>
    <circle cx="42" cy="64" r="2" fill="#fff"/><circle cx="62" cy="64" r="2" fill="#fff"/>`,
  goblin: `<ellipse cx="50" cy="94" rx="24" ry="4" fill="#000" opacity=".35"/>
    <rect x="38" y="70" width="9" height="22" fill="#3f6212"/><rect x="53" y="70" width="9" height="22" fill="#3f6212"/>
    <rect x="34" y="46" width="32" height="30" rx="6" fill="#92400e"/>
    <path d="M30 30 L12 20 L32 40 Z M70 30 L88 20 L68 40 Z" fill="#65a30d"/>
    <circle cx="50" cy="34" r="16" fill="#65a30d"/>
    <circle cx="43" cy="32" r="3" fill="#fde047"/><circle cx="57" cy="32" r="3" fill="#fde047"/>
    <path d="M42 42 L58 42 L54 46 L46 46 Z" fill="#1a2e05"/>
    <rect x="70" y="44" width="4" height="26" fill="#d1d5db" transform="rotate(20 72 57)"/>`,
  skeleton: `<ellipse cx="50" cy="94" rx="24" ry="4" fill="#000" opacity=".35"/>
    <rect x="41" y="68" width="5" height="24" fill="#e7e5e4"/><rect x="54" y="68" width="5" height="24" fill="#e7e5e4"/>
    <rect x="47" y="44" width="6" height="28" fill="#e7e5e4"/>
    <path d="M36 48 H64 M34 55 H66 M36 62 H64" stroke="#e7e5e4" stroke-width="4"/>
    <circle cx="50" cy="30" r="14" fill="#f5f5f4"/>
    <circle cx="44" cy="29" r="4" fill="#111"/><circle cx="56" cy="29" r="4" fill="#111"/>
    <rect x="44" y="38" width="12" height="5" fill="#d6d3d1"/>`,
  wraith: `<path d="M24 92 L28 40 Q50 6 72 40 L76 92 L66 82 L58 92 L50 82 L42 92 L34 82 Z" fill="#6d28d9" opacity=".9"/>
    <path d="M34 40 Q50 18 66 40 L62 54 Q50 60 38 54 Z" fill="#1e1b4b"/>
    <circle cx="44" cy="42" r="4" fill="#67e8f9"/><circle cx="56" cy="42" r="4" fill="#67e8f9"/>`,
  demon: `<ellipse cx="50" cy="94" rx="28" ry="4" fill="#000" opacity=".35"/>
    <path d="M30 46 L6 30 L14 60 Z M70 46 L94 30 L86 60 Z" fill="#450a0a"/>
    <rect x="38" y="70" width="10" height="22" fill="#7f1d1d"/><rect x="52" y="70" width="10" height="22" fill="#7f1d1d"/>
    <rect x="32" y="44" width="36" height="32" rx="8" fill="#b91c1c"/>
    <path d="M36 24 L30 6 L44 20 Z M64 24 L70 6 L56 20 Z" fill="#fef3c7"/>
    <circle cx="50" cy="32" r="15" fill="#dc2626"/>
    <path d="M40 30 L47 33 M60 30 L53 33" stroke="#fde047" stroke-width="4" stroke-linecap="round"/>
    <path d="M42 40 Q50 46 58 40" stroke="#450a0a" stroke-width="3" fill="none"/>`,
};

const BOSS = {
  boss_forest:   { base: 'slime',    aura: '#16a34a' },
  boss_crypt:    { base: 'skeleton', aura: '#a8a29e' },
  boss_cavern:   { base: 'wraith',   aura: '#7c3aed' },
  boss_castle:   { base: 'demon',    aura: '#6b21a8' },
  boss_fortress: { base: 'demon',    aura: '#ea580c' },
};

function boss(id) {
  const b = BOSS[id];
  return svg(`<circle cx="50" cy="55" r="46" fill="${b.aura}" opacity=".25"/>
    ${MONSTER_SVG[b.base]}
    <path d="M36 14 L40 2 L46 10 L50 0 L54 10 L60 2 L64 14 Z" fill="#facc15" stroke="#a16207" stroke-width="1.5"/>`, 'boss');
}

// ---------- Hintergruende ----------
const BG = {
  bg_forest:   { sky: '#0f2a1d, #0a1410', deco: (c) => [10, 30, 70, 90].map(x => `<path d="M${x} 100 L${x - 9} 100 L${x} 58 L${x + 9} 100 Z" fill="${c}"/>`).join(''), c: '#0b3b24' },
  bg_crypt:    { sky: '#1c1917, #0c0a09', deco: (c) => [15, 40, 65, 88].map(x => `<rect x="${x - 5}" y="86" width="10" height="14" rx="5" fill="${c}"/>`).join(''), c: '#44403c' },
  bg_cavern:   { sky: '#111827, #030712', deco: (c) => [8, 28, 52, 76, 94].map(x => `<path d="M${x - 6} 0 L${x + 6} 0 L${x} 18 Z" fill="${c}"/>`).join(''), c: '#1f2937' },
  bg_castle:   { sky: '#2e1065, #0c0414', deco: (c) => [12, 88].map(x => `<rect x="${x - 7}" y="60" width="14" height="40" fill="${c}"/><path d="M${x - 9} 60 L${x} 46 L${x + 9} 60 Z" fill="${c}"/>`).join(''), c: '#1e1033' },
  bg_fortress: { sky: '#431407, #0c0402', deco: (c) => [5, 20, 35, 65, 80, 95].map(x => `<path d="M${x - 5} 100 L${x} 74 L${x + 5} 100 Z" fill="${c}"/>`).join(''), c: '#7c2d12' },
};

function background(id) {
  const b = BG[id];
  return `<div class="asset-bg" data-asset="${id}" style="background:linear-gradient(180deg, ${b.sky})">
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">${b.deco(b.c)}</svg></div>`;
}

// ---------- Items & UI-Icons ----------
const ICON = {
  weapon_sword_001: '<rect x="46" y="8" width="8" height="58" rx="2" fill="#e5e7eb"/><rect x="32" y="64" width="36" height="7" fill="#a16207"/><rect x="46" y="71" width="8" height="18" fill="#78350f"/>',
  weapon_axe_001: '<rect x="46" y="12" width="8" height="78" fill="#78350f"/><path d="M54 14 Q86 26 80 52 L54 44 Z" fill="#d1d5db"/>',
  weapon_mace_001: '<rect x="46" y="40" width="8" height="52" fill="#78350f"/><circle cx="50" cy="30" r="18" fill="#9ca3af"/><path d="M50 6 V14 M26 30 H34 M66 30 H74 M50 46 V54" stroke="#9ca3af" stroke-width="6"/>',
  armor_helmet_001: '<path d="M20 64 Q20 18 50 18 Q80 18 80 64 Z" fill="#94a3b8"/><rect x="30" y="46" width="40" height="7" fill="#0f172a"/><rect x="46" y="53" width="8" height="16" fill="#94a3b8"/>',
  armor_chest_001: '<path d="M22 24 L40 16 Q50 26 60 16 L78 24 L72 84 L28 84 Z" fill="#94a3b8"/><rect x="30" y="54" width="40" height="6" fill="#475569"/>',
  armor_gloves_001: '<path d="M30 86 L30 40 Q30 30 38 30 L38 20 L46 20 L46 30 L54 30 L54 20 L62 20 L62 34 L72 40 L70 60 L66 86 Z" fill="#a8a29e"/>',
  armor_boots_001: '<path d="M30 14 H54 V64 L84 70 Q88 86 78 88 H30 Z" fill="#78716c"/><rect x="30" y="80" width="56" height="8" fill="#44403c"/>',
  accessory_shield_001: '<path d="M18 16 H82 V48 Q82 78 50 92 Q18 78 18 48 Z" fill="#78716c" stroke="#d6d3d1" stroke-width="5"/><path d="M50 22 V84 M24 46 H76" stroke="#b91c1c" stroke-width="6"/>',
  accessory_ring_001: '<circle cx="50" cy="58" r="26" fill="none" stroke="#facc15" stroke-width="9"/><path d="M38 30 L50 14 L62 30 L50 38 Z" fill="#60a5fa"/>',
  accessory_amulet_001: '<path d="M22 10 Q50 60 78 10" fill="none" stroke="#d6d3d1" stroke-width="4"/><circle cx="50" cy="64" r="20" fill="#facc15"/><circle cx="50" cy="64" r="10" fill="#dc2626"/>',
  ui_gold_001: '<circle cx="50" cy="50" r="38" fill="#facc15" stroke="#a16207" stroke-width="8"/><path d="M50 30 V70" stroke="#a16207" stroke-width="8"/>',
  ui_gem_001: '<path d="M50 10 L84 38 L50 90 L16 38 Z" fill="#22d3ee" stroke="#0e7490" stroke-width="5"/>',
  ui_close_001: '<path d="M24 24 L76 76 M76 24 L24 76" stroke="currentColor" stroke-width="12" stroke-linecap="round"/>',
  ui_nav_home_001: '<path d="M14 50 L50 18 L86 50 M26 42 V84 H74 V42" fill="none" stroke="currentColor" stroke-width="9" stroke-linejoin="round"/>',
  ui_nav_gear_001: '<path d="M20 16 L40 10 Q50 20 60 10 L80 16 L74 88 L26 88 Z" fill="none" stroke="currentColor" stroke-width="9" stroke-linejoin="round"/>',
  ui_nav_skills_001: '<path d="M56 6 L24 56 H48 L42 94 L76 40 H52 Z" fill="none" stroke="currentColor" stroke-width="8" stroke-linejoin="round"/>',
  ui_nav_dungeon_001: '<path d="M18 90 V40 Q18 12 50 12 Q82 12 82 40 V90 Z M38 90 V58 Q38 46 50 46 Q62 46 62 58 V90" fill="none" stroke="currentColor" stroke-width="8"/>',
  ui_trophy_001: '<path d="M28 14 H72 V40 Q72 62 50 64 Q28 62 28 40 Z" fill="#facc15"/><path d="M28 22 H14 Q14 44 30 46 M72 22 H86 Q86 44 70 46" fill="none" stroke="#facc15" stroke-width="6"/><rect x="44" y="62" width="12" height="14" fill="#ca8a04"/><rect x="30" y="76" width="40" height="10" rx="3" fill="#a16207"/>',
  ui_lock_001: '<rect x="24" y="44" width="52" height="42" rx="6" fill="#4b5563"/><path d="M34 44 V32 Q34 16 50 16 Q66 16 66 32 V44" fill="none" stroke="#6b7280" stroke-width="8"/><circle cx="50" cy="62" r="6" fill="#1f2937"/>',
  ui_boss_001: '<path d="M18 40 Q18 12 50 12 Q82 12 82 40 V60 L70 70 V86 H30 V70 L18 60 Z" fill="#e5e7eb"/><circle cx="37" cy="44" r="9" fill="#7f1d1d"/><circle cx="63" cy="44" r="9" fill="#7f1d1d"/><path d="M40 72 V84 M50 72 V84 M60 72 V84" stroke="#111" stroke-width="4"/>',
  skill_heavy_strike_001: '<path d="M20 86 L68 38" stroke="#e5e7eb" stroke-width="12" stroke-linecap="round"/><path d="M60 22 L80 42 L90 16 Z" fill="#f59e0b"/><circle cx="74" cy="28" r="20" fill="none" stroke="#fde68a" stroke-width="5"/>',
  skill_whirlwind_001: '<path d="M50 50 m-6 0 a6 6 0 1 1 12 0 a14 14 0 1 1 -28 0 a22 22 0 1 1 44 0 a30 30 0 1 1 -60 0" fill="none" stroke="#7dd3fc" stroke-width="7" stroke-linecap="round"/>',
  skill_shield_bash_001: '<path d="M22 18 H78 V46 Q78 74 50 88 Q22 74 22 46 Z" fill="#78716c" stroke="#d6d3d1" stroke-width="5"/><path d="M50 30 L58 46 L74 48 L60 58 L64 74 L50 64 L36 74 L40 58 L26 48 L42 46 Z" fill="#fde047"/>',
  skill_berserker_rage_001: '<path d="M50 6 Q74 34 66 54 Q84 48 80 30 Q96 60 78 82 Q62 98 40 92 Q14 84 16 58 Q18 40 32 30 Q30 48 42 52 Q32 26 50 6 Z" fill="#ef4444"/><path d="M50 50 Q62 66 54 82 Q40 84 38 70 Q38 58 50 50 Z" fill="#fde047"/>',
  ui_nav_hero_001:'<circle cx="50" cy="32" r="18" fill="none" stroke="currentColor" stroke-width="9"/><path d="M16 92 Q16 58 50 58 Q84 58 84 92" fill="none" stroke="currentColor" stroke-width="9"/>',
};

// ---------- Effekte ----------
const FX = {
  fx_hit: '<path d="M50 10 L58 40 L90 50 L58 60 L50 90 L42 60 L10 50 L42 40 Z" fill="#fde68a"/>',
  fx_crit: '<path d="M50 2 L60 36 L98 50 L60 64 L50 98 L40 64 L2 50 L40 36 Z" fill="#facc15"/><circle cx="50" cy="50" r="12" fill="#fff"/>',
  fx_levelup: '<circle cx="50" cy="50" r="40" fill="none" stroke="#facc15" stroke-width="6"/><path d="M50 22 L70 50 H58 V78 H42 V50 H30 Z" fill="#facc15"/>',
  fx_loot_rare: '<circle cx="50" cy="50" r="42" fill="#60a5fa" opacity=".35"/><circle cx="50" cy="50" r="22" fill="#60a5fa" opacity=".7"/>',
  fx_loot_legendary: '<circle cx="50" cy="50" r="46" fill="#f59e0b" opacity=".35"/><path d="M50 8 L60 40 L92 50 L60 60 L50 92 L40 60 L8 50 L40 40 Z" fill="#f59e0b"/>',
};

// ---------- Register ----------
const REGISTRY = {};
const KIND = {};                 // id -> CSS-Klasse des Platzhalters (bleibt auch beim Bild erhalten)
const reg = (id, kind, make) => { REGISTRY[id] = make; KIND[id] = kind; };
for (const pose of ['idle', 'attack', 'hit', 'death']) reg('warrior_' + pose, `pose-${pose}`, () => warrior(pose));
for (const m of Object.keys(MONSTER_SVG)) reg('monster_' + m, 'monster', () => svg(MONSTER_SVG[m], 'monster'));
for (const b of Object.keys(BOSS)) reg(b, 'boss', () => boss(b));
for (const b of Object.keys(BG)) reg(b, 'bg', () => background(b));
for (const i of Object.keys(ICON)) reg(i, 'icon', () => svg(ICON[i], 'icon'));
for (const f of Object.keys(FX)) reg(f, 'fx', () => svg(FX[f], 'fx'));
// Cooldown-Ring: Fortschritt kommt per CSS-Variable --p (Funktionsgrafik, nicht austauschbar)
reg('ui_cooldown_ring_001', 'ring', () => svg('<circle cx="50" cy="50" r="46" pathLength="100"/>', 'ring'));

// ---------- Dateien ----------
export const ASSET_ROOT = 'assets/';
// Unterordner je ID-Praefix (Reihenfolge: spezifischster zuerst)
const FOLDERS = [
  ['warrior_', 'warrior'], ['monster_', 'monsters'], ['boss_', 'bosses'], ['bg_', 'backgrounds'],
  ['weapon_', 'items'], ['armor_', 'items'], ['accessory_', 'items'],
  ['skill_', 'skills'], ['fx_', 'fx'], ['ui_', 'ui'],
];
const NOT_REPLACEABLE = new Set(['ui_cooldown_ring_001']);

export function fileFor(id) {
  if (NOT_REPLACEABLE.has(id)) return null;
  const f = FOLDERS.find(([p]) => id.startsWith(p));
  return f ? `${ASSET_ROOT}${f[1]}/${id}.png` : null;
}

const files = new Map();         // id -> URL einer erfolgreich geladenen Datei

function fileMarkup(id, url) {
  if (KIND[id] === 'bg') return `<div class="asset-bg asset-file" data-asset="${id}" style="background-image:url('${url}')"></div>`;
  return `<img class="asset asset-file ${KIND[id]}" data-asset="${id}" src="${url}" alt="" draggable="false" decoding="sync">`;
}

const cache = new Map();
const warned = new Set();

export const Assets = {
  get(id) {
    if (cache.has(id)) return cache.get(id);
    const make = REGISTRY[id];
    if (!make) {
      if (!warned.has(id)) { warned.add(id); console.warn('[assets] unbekannte ID:', id); }
      return svg('<rect x="10" y="10" width="80" height="80" fill="#ff00ff"/>', 'missing');
    }
    currentId = id;
    const html = files.has(id) ? fileMarkup(id, files.get(id)) : make();
    currentId = '';
    cache.set(id, html);
    return html;
  },
  // Leichtgewichtiger Verweis fuer lange Listen: nutzt die einmal abgelegte Vorlage (spriteSheet).
  ref(id) {
    if (!(id in ICON)) return this.get(id);
    return `<svg class="asset icon" viewBox="0 0 100 100" aria-hidden="true"><use href="#asset-${id}"/></svg>`;
  },
  // Einmalig ins Dokument einzuhaengen (render.js): alle Item-/UI-Icons als Vorlagen.
  // Bei vorhandener Datei enthaelt die Vorlage das Bild, alle Verweise zeigen es sofort.
  spriteSheet() {
    return `<svg width="0" height="0" style="position:absolute" aria-hidden="true">${
      Object.keys(ICON).map(id => `<symbol id="asset-${id}" viewBox="0 0 100 100">${files.has(id)
        ? `<image href="${files.get(id)}" width="100" height="100" preserveAspectRatio="xMidYMid meet"/>`
        : ICON[id]}</symbol>`).join('')}</svg>`;
  },
  isIcon(id) { return id in ICON; },
  has(id) { return id in REGISTRY; },
  ids() { return Object.keys(REGISTRY); },
  fromFile(id) { return files.has(id); },
  // Phase 4: fuer jede ID still pruefen, ob eine Datei vorliegt. Fehlt sie, bleibt der Platzhalter.
  // Meldet jede gefundene Datei einzeln per 'asset:ready', damit die UI tauschen kann.
  load() {
    for (const id of Object.keys(REGISTRY)) {
      const url = fileFor(id);
      if (!url || typeof Image === 'undefined') continue;
      const img = new Image();
      img.onload = () => {
        if (!img.naturalWidth) return;
        files.set(id, url);
        cache.delete(id);
        emit('asset:ready', { id });
      };
      img.onerror = () => {};    // keine Datei (oder unlesbar): Platzhalter bleibt
      img.src = url;
    }
  },
};
