// Event-Bus: einzige Verbindung zwischen Systemen und UI.
const listeners = new Map();

export function on(event, fn) {
  if (!listeners.has(event)) listeners.set(event, []);
  listeners.get(event).push(fn);
  return () => off(event, fn);
}

export function off(event, fn) {
  const list = listeners.get(event);
  if (!list) return;
  const i = list.indexOf(fn);
  if (i >= 0) list.splice(i, 1);
}

export function emit(event, payload) {
  const list = listeners.get(event);
  if (!list) return;
  for (let i = 0; i < list.length; i++) list[i](payload);
}

export function clearAll() {
  listeners.clear();
}
