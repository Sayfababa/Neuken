const { chromium, devices } = require('playwright');
const fs = require('fs');
const save = fs.readFileSync(require('path').join(__dirname,'mid.json'),'utf8');
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ ...devices['iPhone 13'] });
  await ctx.addInitScript(v => { if (!sessionStorage.getItem('x')) { sessionStorage.setItem('x','1'); localStorage.clear(); localStorage.setItem('eternal_grind_save_v1', v); } }, save);
  const p = await ctx.newPage(); const errs=[];
  // Phase 4: fehlende Dateien unter assets/ sind erwartet (Platzhalter greift) und zaehlen nicht als Fehler
  p.on('console', m => { if ((m.type()==='error'||m.type()==='warning') && !(m.location().url||'').includes('/assets/')) errs.push(m.text()); });
  p.on('pageerror', e => errs.push('PAGEERROR '+e.message));
  await p.goto('http://localhost:8080/'); await p.waitForTimeout(2500);
  const lay = () => p.evaluate(() => ({ noScroll: document.body.scrollHeight === innerHeight, over: [...document.querySelectorAll('body *')].filter(e => { if (e.closest('.inv-list') && e !== e.closest('.inv-list')) return false; const r=e.getBoundingClientRect(); return r.width && r.height && (r.right>innerWidth+.5||r.left<-.5); }).map(e=>e.className.baseVal??e.className).slice(0,4),
     panelOverflow: [...document.querySelectorAll('.panel:not([hidden])')].map(pn => pn.scrollHeight - pn.clientHeight) }));
  await p.screenshot({ path: require('path').join(__dirname,'out','p2-home.png') }); console.log('home', JSON.stringify(await lay()));
  for (const t of ['gear','skills','dungeon','hero']) { await p.click(`[data-tab=${t}]`); await p.waitForTimeout(300); await p.screenshot({ path: require('path').join(__dirname,'out',`p2-${t}.png`) }); console.log(t, JSON.stringify(await lay())); }
  await p.click('[data-tab=gear]'); await p.click('.inv-row >> nth=0'); await p.waitForTimeout(300); await p.screenshot({ path: require('path').join(__dirname,'out','p2-compare.png') }); console.log('sheet', JSON.stringify(await lay()));
  await p.click('#sheet-close');
  await p.click('[data-tab=home]'); await p.waitForTimeout(200);
  await p.click('#btn-boss'); await p.waitForTimeout(1500); await p.screenshot({ path: require('path').join(__dirname,'out','p2-bossfight.png') });
  await p.waitForFunction(() => !document.getElementById('boss-overlay').hidden || !__eg.state.combat.bossFight, null, { timeout: 60000 });
  await p.waitForTimeout(300); await p.screenshot({ path: require('path').join(__dirname,'out','p2-bossresult.png') }); console.log('bossresult', JSON.stringify(await lay()));
  console.log('errs', errs);
  await b.close();
})();
