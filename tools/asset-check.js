// Phase-4-Abnahme: legt voruebergehend Test-Dateien nach assets/, prueft, dass sie die Platzhalter
// ersetzen und Ton (nur mit settings.sfx) abgespielt wird, und raeumt danach wieder auf.
// Vorher `python3 -m http.server 8080` im Projektordner starten.
const { chromium, devices } = require('playwright');
const fs = require('fs'); const path = require('path');
const A = path.join(__dirname, '..', 'assets');
const TEST = { 'monsters/monster_goblin.png': 'round', 'monsters/monster_slime.png': 'round', 'backgrounds/bg_forest.png': 'bg', 'ui/ui_nav_home_001.png': 'round', 'audio/sfx_hit.mp3': 'wav' };

function wav() { // 0,2 s Sinuston; Chromium erkennt das Format am Inhalt, nicht an der Endung
  const n = 4000, b = Buffer.alloc(44 + n * 2);
  b.write('RIFF', 0); b.writeUInt32LE(36 + n * 2, 4); b.write('WAVEfmt ', 8); b.writeUInt32LE(16, 16);
  b.writeUInt16LE(1, 20); b.writeUInt16LE(1, 22); b.writeUInt32LE(22050, 24); b.writeUInt32LE(44100, 28);
  b.writeUInt16LE(2, 32); b.writeUInt16LE(16, 34); b.write('data', 36); b.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) b.writeInt16LE(Math.round(8000 * Math.sin(i * 0.1)), 44 + i * 2);
  return b;
}

(async () => {
  const b = await chromium.launch();
  const pg = await b.newPage({ viewport: { width: 256, height: 256 } });
  const shot = async (html, transparent) => { await pg.setContent(`<body style="margin:0;background:transparent">${html}</body>`); return pg.screenshot({ omitBackground: transparent }); };
  const data = {
    round: await shot('<div style="width:256px;height:256px;border-radius:50%;background:radial-gradient(#ff0,#f0f)"></div>', true),
    bg: await shot('<div style="width:256px;height:256px;background:repeating-linear-gradient(45deg,#036 0 20px,#069 20px 40px)"></div>', false),
    wav: wav(),
  };
  for (const [f, k] of Object.entries(TEST)) fs.writeFileSync(path.join(A, f), data[k]);
  try {
    const ctx = await b.newContext({ ...devices['iPhone 13'] });
    await ctx.addInitScript(() => {
      localStorage.clear(); window.__starts = 0; const o = AudioBufferSourceNode.prototype.start;
      AudioBufferSourceNode.prototype.start = function (...a) { window.__starts++; return o.apply(this, a); };
    });
    const p = await ctx.newPage(); const errs = [];
    p.on('console', m => { if ((m.type() === 'error' || m.type() === 'warning') && !(m.location().url || '').includes('/assets/')) errs.push(m.text()); });
    p.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
    await p.goto('http://localhost:8080/'); await p.waitForTimeout(2500);
    const r = await p.evaluate(() => ({
      enemy: !!document.querySelector('#enemy-sprite img[data-asset^="monster_"]'),
      bg: !!document.querySelector('#stage-bg .asset-file[data-asset="bg_forest"]'),
      nav: !!document.querySelector('[data-tab=home] img[data-asset="ui_nav_home_001"]'),
      placeholderKept: !!document.querySelector('[data-tab=gear] svg[data-asset="ui_nav_gear_001"]'),
    }));
    await p.screenshot({ path: path.join(__dirname, 'out', 'p4-assets.png') });
    const before = await p.evaluate(() => window.__starts);
    await p.tap('#stage'); await p.waitForTimeout(3000);
    r.soundAfterTap = (await p.evaluate(() => window.__starts)) > 0;
    r.silentBeforeTap = before === 0;
    await p.evaluate(() => { __eg.state.settings.sfx = false; window.__starts = 0; }); await p.waitForTimeout(2500);
    r.silentWhenOff = (await p.evaluate(() => window.__starts)) === 0;
    r.errors = errs;
    console.log(JSON.stringify(r, null, 1));
  } finally {
    for (const f of Object.keys(TEST)) fs.rmSync(path.join(A, f), { force: true });
    await b.close();
  }
})();
