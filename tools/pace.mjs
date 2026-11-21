// Realistisches Spielermodell, misst Tempo-Ziele. Nutzung: node pace.mjs <seed> <minuten> ['{"pfad":wert}' Overrides]
const R = new URL('../src/', import.meta.url).href;
const { CONFIG } = await import(R+'data/config.js');
const over = JSON.parse(process.argv[4]||'{}');
const { DUNGEONS } = await import(R+'data/dungeons.js');
for (const [k,v] of Object.entries(over)) { const ks=k.split('.'); let o=CONFIG; if(ks[0]==='D'){ o=DUNGEONS; ks.shift(); } while(ks.length>1) o=o[ks.shift()]; o[ks[0]]=v; }
const { state, freshSave, loadIntoState } = await import(R+'core/state.js');
const { on, emit } = await import(R+'core/events.js');
const { runTicks } = await import(R+'core/loop.js');
const seed=+process.argv[2]||1, MIN=+process.argv[3]||120;
loadIntoState(freshSave(seed));
const m={}; for (const s of ['character','dungeon','combat','progression','loot','itemgen','inventory','equipment','skills','boss']) { m[s]=await import(R+'systems/'+s+'.js'); m[s].init(); }
const { PASSIVE_SKILLS } = await import(R+'data/skills.js');
let t=0; const T=()=>+(t/60000).toFixed(1);
const res={ L10:null, L20:null, L30:null, rare:null, epic:null, legendary:null, mythic:null, boss:{}, maxGap:0, deaths:0 };
let lastReward=0, failAt=-1e9, deathsWin=[], backAt=-1e9, best=1;
let evs=[]; on('warrior:died',()=>evs.push('tod')); on('boss:started',()=>evs.push('boss')); on('dungeon:changed',e=>evs.push('D'+e.id));
on('enemy:killed', e=>{ const g=(t-lastReward)/1000; if(g>res.maxGap){res.maxGap=g; res.gapCtx={at:T(),D:state.dungeons.current,L:state.character.level,ev:evs.join(',')};} lastReward=t; evs=[]; });
on('item:created', it=>{ if(res[it.rarity]===null && it.rarity in res) res[it.rarity]=T(); });
on('character:levelup', e=>{ for(const L of [10,20,30]) if(e.level>=L && res['L'+L]===null) res['L'+L]=T(); });
on('boss:defeated', e=>{ if(!res.boss[e.dungeonId]) res.boss[e.dungeonId]=T(); if(e.unlocked){ best=e.unlocked; emit('dungeon:select',{id:e.unlocked}); deathsWin=[]; } });
let fightStart=0; res.fight={}; on('boss:started',()=>{fightStart=t;}); const fl=(id)=>{const d=(t-fightStart)/1000; res.fight[id]=Math.max(res.fight[id]||0,+d.toFixed(1));};
on('boss:failed', ()=>{ failAt=t; fl('L'+state.dungeons.current); });
on('boss:defeated', e=>fl('W'+e.dungeonId));
on('warrior:died', ()=>{ res.deaths++; deathsWin.push(t); });
for(let i=0;i<MIN*600;i++){ runTicks(1); t+=100;
  if(i%600===0){ emit('equip:auto');
    for(let k=0;k<5;k++){ let b=null; for(const p of PASSIVE_SKILLS){const c=m.skills.nextPassiveCost(p.id); if(c!==null&&(!b||c<b.c)) b={id:p.id,c};} if(b&&state.currency.gold>=b.c) emit('skill:buy',{id:b.id}); else break; } }
  if(i%10===0){
    deathsWin=deathsWin.filter(x=>t-x<60000);
    const cur=state.dungeons.current;
    if(deathsWin.length>=3 && cur>1 && !state.combat.bossFight){ emit('dungeon:select',{id:cur-1}); deathsWin=[]; backAt=t; }
    else if(cur<best && t-backAt>300000){ emit('dungeon:select',{id:best}); deathsWin=[]; }
    if(m.boss.bossAvailable() && t-failAt>60000 && state.dungeons.current===best) emit('boss:challenge');
  }
}
res.endLevel=state.character.level; res.endDungeon=state.dungeons.current; res.items=state.stats.foundByRarity;
console.log(JSON.stringify(res));
