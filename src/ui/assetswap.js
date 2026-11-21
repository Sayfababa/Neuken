// Phase 4: Sobald eine Grafikdatei geladen ist, tauscht die UI die bereits gezeichneten
// Platzhalter dieser ID aus. Spaeter gezeichnete Stellen holen sich das Bild ohnehin ueber Assets.get.
import { on } from '../core/events.js';
import { Assets } from '../systems/assets.js';
import { $, setHTML, replaceAll } from './render.js';

export function init() {
  on('asset:ready', ({ id }) => {
    replaceAll(`[data-asset="${id}"]`, Assets.get(id));
    if (Assets.isIcon(id)) setHTML($('#asset-sprites'), Assets.spriteSheet());
  });
}
