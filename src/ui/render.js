// Einziger Ort, der ins DOM schreibt. Alle UI-Module nutzen diese Helfer.

export const $ = (sel, root = document) => root.querySelector(sel);

export function setText(el, text) {
  const t = String(text);
  if (el.textContent !== t) el.textContent = t;
}

export function setHTML(el, html) {
  el.innerHTML = html;
}

// Zuletzt geschriebene Werte je Element: das DOM wird nur bei echten Aenderungen angefasst.
const written = new WeakMap();
function cacheOf(el) {
  let c = written.get(el);
  if (!c) { c = {}; written.set(el, c); }
  return c;
}

// Asset-Markup nur bei Aenderung neu setzen
export function setAsset(el, html) {
  const c = cacheOf(el);
  if (c.asset === html) return;
  el.innerHTML = html;
  c.asset = html;
}

export function setStyle(el, prop, value) {
  const c = cacheOf(el);
  const v = String(value);
  if (c[prop] === v) return;
  c[prop] = v;
  if (prop.startsWith('--')) el.style.setProperty(prop, v);
  else el.style[prop] = v;
}

export function setClass(el, cls) {
  el.className = cls;
}

export function toggleClass(el, cls, on) {
  el.classList.toggle(cls, !!on);
}

export function setAttr(el, name, value) {
  if (value === null || value === false) el.removeAttribute(name);
  else el.setAttribute(name, value === true ? '' : value);
}

// CSS-Animation erneut abspielen (fuer wiederverwendete Pool-Elemente)
export function restartAnim(el, cls) {
  el.classList.remove(cls);
  void el.offsetWidth;
  el.classList.add(cls);
}

export function createEl(tag, cls, parent) {
  const el = document.createElement(tag);
  if (cls) el.className = cls;
  if (parent) parent.appendChild(el);
  return el;
}

export function moveToFront(el) {
  el.parentNode.prepend(el);
}

export function onTap(el, fn) {
  el.addEventListener('click', fn);
}

// Delegierter Tap: fn(matchedElement, event)
export function onTapWithin(root, selector, fn) {
  root.addEventListener('click', (e) => {
    const hit = e.target.closest(selector);
    if (hit && root.contains(hit)) fn(hit, e);
  });
}

export function esc(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

export function fmtNum(n) {
  n = Math.floor(n);
  if (n < 10000) return String(n);
  if (n < 1e6) return (n / 1e3).toFixed(n < 1e5 ? 1 : 0) + 'k';
  if (n < 1e9) return (n / 1e6).toFixed(n < 1e8 ? 1 : 0) + 'M';
  return (n / 1e9).toFixed(1) + 'B';
}
