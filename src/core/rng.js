// Seedbarer Zufall (mulberry32). Der Zustand liegt im Spielstand, damit Laeufe reproduzierbar sind.
import { state } from './state.js';

function next() {
  let t = (state.meta.rngState = (state.meta.rngState + 0x6D2B79F5) >>> 0);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

export const rng = {
  seed(n) { state.meta.rngState = n >>> 0; },
  float: next,
  range(min, max) { return min + (max - min) * next(); },
  int(min, max) { return min + Math.floor(next() * (max - min + 1)); },
  pick(arr) { return arr[Math.floor(next() * arr.length)]; },
  // entries: [[key, gewicht], ...]
  weighted(entries) {
    let total = 0;
    for (const [, w] of entries) total += w;
    let roll = next() * total;
    for (const [key, w] of entries) {
      roll -= w;
      if (roll < 0) return key;
    }
    return entries[entries.length - 1][0];
  },
};

export function newSeed() {
  return (Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0;
}
