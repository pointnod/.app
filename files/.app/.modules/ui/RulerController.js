/**
 * .app UI — RulerController
 * Renders H/V rulers that track the canvas viewport position.
 * Listens to viewMoved events from PixelModule.
 */

import { bus }        from '../core/EventBus.js';
import { pixelState } from '../tools/state/PixelState.js';

export class RulerController {
  #subs = [];

  constructor() { this.#bind(); }

  #bind() {
    const unsub = bus.on('pixels:viewMoved', () => this.update());
    this.#subs.push(unsub);
  }

  update() {
    const rulerH    = document.getElementById('ruler-h');
    const rulerV    = document.getElementById('ruler-v');
    const viewport  = document.getElementById('canvas-viewport');
    const workspace = document.getElementById('workspace-center');
    if (!rulerH || !rulerV || !viewport || !workspace) return;

    rulerH.innerHTML = '';
    rulerV.innerHTML = '';

    const rect          = viewport.getBoundingClientRect();
    const wsRect        = workspace.getBoundingClientRect();
    const { gridSize, pixelSize, viewScale } = pixelState.get();
    const step          = pixelSize * viewScale;
    const freq          = step < 10 ? 8 : step < 20 ? 4 : 2;

    const startX = rect.left - wsRect.left - 30;
    for (let i = 0; i <= gridSize; i++) {
      if (i % freq === 0 || i === gridSize) {
        const mark       = document.createElement('div');
        mark.className   = 'ruler-mark';
        mark.style.left  = `${startX + i * step}px`;
        mark.textContent = i;
        rulerH.appendChild(mark);
      }
    }

    const startY = rect.top - wsRect.top - 25;
    for (let i = 0; i <= gridSize; i++) {
      if (i % freq === 0 || i === gridSize) {
        const mark       = document.createElement('div');
        mark.className   = 'ruler-mark';
        mark.style.top   = `${startY + i * step}px`;
        mark.textContent = i;
        rulerV.appendChild(mark);
      }
    }
  }

  destroy() { this.#subs.forEach(fn => fn()); }
}
