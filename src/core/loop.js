// requestAnimationFrame-Tick. Logik in festen Schritten, unabhaengig von der Bildrate.
import { CONFIG } from '../data/config.js';
import { emit } from './events.js';

let running = false;

export function startLoop(onFrame) {
  if (running) return;
  running = true;
  const step = CONFIG.logicTickMs;
  let last = performance.now();
  let acc = 0;

  function frame(now) {
    acc += Math.min(now - last, CONFIG.maxCatchUpMs);
    last = now;
    while (acc >= step) {
      emit('tick', step);
      acc -= step;
    }
    onFrame(now);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

// Fuer Tests / Simulation ohne Browser
export function runTicks(count) {
  for (let i = 0; i < count; i++) emit('tick', CONFIG.logicTickMs);
}
