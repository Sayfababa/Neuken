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
  const before = await p.evaluate(() => JSON.stringify({ l: __eg.state.character.level, g: __eg.state.currency.gold, inv: __eg.state.inventory.length, eq: __eg.state.equipment }));
  await p.evaluate(() => __eg.saveGame()); await p.reload(); await p.waitForTimeout(300);
  const after = await p.evaluate(() => JSON.stringify({ l: __eg.state.character.level, g: __eg.state.currency.gold, inv: __eg.state.inventory.length, eq: __eg.state.equipment }));
  console.log(JSON.stringify({ heap1MB: (h1/1e6).toFixed(2), heap10MB: (h10/1e6).toFixed(2), growthPct: ((h10/h1-1)*100).toFixed(1), saveRoundtrip: before === after, level: JSON.parse(before).l, errs }));
  await b.close();
})();
