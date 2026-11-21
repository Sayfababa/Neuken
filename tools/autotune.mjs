import { execFile } from 'node:child_process';
const run = (seed, min, over) => new Promise(r => execFile('node', [new URL('./pace.mjs', import.meta.url).pathname, String(seed), String(min), JSON.stringify(over)], (e, out) => r(JSON.parse(out))));
const SEEDS = [1,2,3,4,5,6,7,8];
const base = { 'monster.hpGrowth': 1.13, 'monster.attackGrowth': 1.11, 'monster.respawnMs': 450 };
const targets = [15, 35, 70, 140, 280];
const med = a => { a = a.map(x => x ?? 1e9).sort((x, y) => x - y); return a[a.length >> 1]; };
const over = { ...base };
for (let k = 0; k < 5; k++) {
  let lo = 1, hi = 400, best = null;
  for (let it = 0; it < 12; it++) {
    const s = Math.sqrt(lo * hi);
    Object.assign(over, { [`D.${k}.bossHpMult`]: +(12 * s).toFixed(1), [`D.${k}.bossAttackMult`]: +(2 * s).toFixed(2) });
    const horizon = Math.ceil(targets[k] * 1.6);
    const rows = await Promise.all(SEEDS.map(sd => run(sd, horizon, over)));
    const t = med(rows.map(r => r.boss[k + 1])); const gap = Math.max(...rows.map(r => r.maxGap));
    console.error(`B${k+1} s=${s.toFixed(2)} -> ${t >= 1e9 ? 'nie' : t} min, gap ${gap.toFixed(0)}s`);
    best = { s, t, gap };
    if (Math.abs(t - targets[k]) / targets[k] < 0.08) break;
    if (t < targets[k]) lo = s; else hi = s;
  }
  console.error(`==> B${k+1}: s=${best.s.toFixed(2)} (hp ${over[`D.${k}.bossHpMult`]}, atk ${over[`D.${k}.bossAttackMult`]}) t=${best.t}`);
}
console.log(JSON.stringify(over));
