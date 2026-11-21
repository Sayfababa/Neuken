const R = new URL('../src/', import.meta.url).href;
const { state, freshSave, loadIntoState, snapshot } = await import(R+'core/state.js');
const { on, emit } = await import(R+'core/events.js');
const { runTicks } = await import(R+'core/loop.js');
loadIntoState(freshSave(7));
const m={}; for (const s of ['character','dungeon','combat','progression','loot','itemgen','inventory','equipment','skills','boss']) { m[s]=await import(R+'systems/'+s+'.js'); m[s].init(); }
const { PASSIVE_SKILLS } = await import(R+'data/skills.js');
on('boss:defeated', e => { if (e.unlocked && e.unlocked<=2) emit('dungeon:select',{id:e.unlocked}); });
const minutes = +(process.argv[2]||8);
for (let i=0;i<minutes*600;i++){ runTicks(1);
  if(i%50===0){ emit('equip:auto'); const p=PASSIVE_SKILLS[(i/50)%5|0]; if(m.skills.nextPassiveCost(p.id)!==null && state.currency.gold>m.skills.nextPassiveCost(p.id)*3) emit('skill:buy',{id:p.id}); if(i%300===0&&state.character.level>=6&&m.boss.bossAvailable()&&state.dungeons.current===1) emit('boss:challenge'); } }
// ein paar bessere Items unausgeruestet im Inventar lassen
process.stdout.write(JSON.stringify(snapshot()));
