// HOME = freie Sicht auf den Kampf. Schliesst offene Panels.
import { on } from '../../core/events.js';
import { $, toggleClass } from '../render.js';

export function init() {
  const stage = $('#stage');
  on('ui:tab', (tab) => toggleClass(stage, 'panel-open', tab !== 'home'));
}
