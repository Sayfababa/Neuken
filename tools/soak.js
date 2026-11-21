// Dauerlauf: 10 Min. Spiel, Heap nach 1 und 10 Min., Konsolenfehler, Save-Rundlauf. Server auf 8080 noetig.
const { chromium, devices } = require('playwright');
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ ...devices['iPhone 13'] });
  await ctx.addInitScript(() => { if (!sessionStorage.x) { sessionStorage.x = 1; localStorage.clear(); } });
  const p = await ctx.newPage(); const errs = [];
  p.on('console', m => { if ((m.type()==='error'||m.type()==='warning') && !(m.location().url||'').includes('/assets/')) errs.push(m.text()); });
  p.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  const cdp = await ctx.newCDPSession(p);
  const heap = async () => { await cdp.send('HeapProfiler.collectGarbage'); return (await cdp.send('Runtime.getHeapUsage')).usedSize; };
  await p.goto('http://localhost:8080/'); await p.tap('#stage');
  await p.waitForTimeout(60000); const h1 = await heap();
  for (let i = 0; i < 9; i++) { await p.waitForTimeout(60000); if (i % 3 === 0) { await p.click('[data-tab=gear]'); await p.waitForTimeout(500); await p.click('[data-tab=home]'); } }
  const h10 = await heap();
  // Speichern und Zustand im selben Augenblick festhalten, nach dem Neuladen sofort vergleichen
  const keys = ['character','currency','equipment','inventory','skills','dungeons','stats','achievements'];
  const before = await p.evaluate((keys) => { __eg.saveGame(); const s = JSON.parse(localStorage.getItem('eternal_grind_save_v1')); return JSON.stringify(keys.map(k => s[k])); }, keys);
  await p.reload({ waitUntil: 'commit' });
  const after = await p.evaluate((keys) => new Promise(r => setTimeout(() => r(JSON.stringify(keys.map(k => __eg.state[k]))), 0)), keys);
  const lvl = JSON.parse(before)[0].level;
  console.log(JSON.stringify({ heap1MB: (h1/1e6).toFixed(2), heap10MB: (h10/1e6).toFixed(2), growthPct: ((h10/h1-1)*100).toFixed(1), saveRoundtrip: before === after, level: lvl, errs }));
  await b.close();
})();
