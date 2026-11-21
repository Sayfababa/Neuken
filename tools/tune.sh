#!/bin/bash
# tune.sh '<overrides-json>' [minuten]
O="$1"; M=${2:-480}
for s in 1 2 3 4 5 6 7 8; do node "$(dirname "$0")/pace.mjs" $s $M "$O" & done | node -e '
const rows=require("fs").readFileSync(0,"utf8").trim().split("\n").map(JSON.parse);
const med=a=>{a=a.map(x=>x==null?1e9:x).sort((x,y)=>x-y);const v=a[a.length>>1];return v>=1e9?"–":v;};
const out={L10:med(rows.map(r=>r.L10)),L30:med(rows.map(r=>r.L30)),rare:med(rows.map(r=>r.rare)),rareMax:Math.max(...rows.map(r=>r.rare??1e9)),leg:med(rows.map(r=>r.legendary)),legMin:Math.min(...rows.map(r=>r.legendary??1e9)),myth:med(rows.map(r=>r.mythic))};
for(const b of [1,2,3,4,5]) out["B"+b]=med(rows.map(r=>r.boss[b]));
out.gap=Math.max(...rows.map(r=>r.maxGap)).toFixed(0); out.endL=med(rows.map(r=>r.endLevel)); out.deathsPerH=med(rows.map(r=>r.deaths))/('"$M"'/60);
console.log(JSON.stringify(out));'
