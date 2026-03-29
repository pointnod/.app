/**
 * .app Pixels — PixelUI
 * Owns all DOM read/write for the pixel module.
 * Never calls engine methods directly — communicates via EventBus only.
 *
 * Responsibilities:
 *  - Bind DOM events → emit bus events
 *  - Listen to bus events → update DOM
 *  - Render palette swatches
 *  - Keep status bar / system path in sync
 */

import { bus }        from '../../core/EventBus.js';
import { pixelState } from '../state/PixelState.js';

export class PixelUI {
  #el = {};
  #subs = [];

  constructor() { this.#queryDOM(); }

  mount() {
    this.#bindDOM();
    this.#bindBus();
    this.#syncAll();
  }

  unmount() {
    this.#subs.forEach(fn => fn());
    this.#subs = [];
  }

  // ─── DOM queries ────────────────────────────────────────────────────────────

  #queryDOM() {
    const q  = id => document.getElementById(id);
    const qa = sel => document.querySelectorAll(sel);

    this.#el = {
      tools:          qa('.tool[data-tool]'),
      sizeInput:      q('sizeInput'),
      sizeSlider:     q('sizeSlider'),
      scaleInput:     q('scaleInput'),
      scaleSlider:    q('scaleSlider'),
      resizeBtn:      q('resizeBtn'),
      mirrorVBtn:     q('mirrorVBtn'),
      mirrorHBtn:     q('mirrorHBtn'),
      gridToggle:     q('gridToggle'),
      undoBtn:        q('undoBtn'),
      redoBtn:        q('redoBtn'),
      addColor:       q('addColor'),
      palettePreset:  q('palettePreset'),
      paletteRow:     q('paletteRow'),
      randomPalette:  q('randomPalette'),
      clearBtn:       q('clearBtn'),
      exportBtn:      q('exportBtn'),
      exportScaledBtn:q('exportScaledBtn'),
      downloadJSON:   q('downloadJSON'),
      loadJSON:       q('loadJSON'),
      statusMessage:  q('status-message'),
      pixelCount:     q('pixel-count'),
      systemPath:     q('system-path'),
      systemMetrics:  q('system-metrics'),
    };
  }

  // ─── DOM event bindings → bus emissions ─────────────────────────────────────

  #bindDOM() {
    const el = this.#el;
    const on = (target, evt, fn) => target?.addEventListener(evt, fn);

    // Tools
    el.tools.forEach(btn => on(btn, 'click', () =>
      bus.emit('pixels:ui:setTool', { tool: btn.dataset.tool })
    ));

    // Grid size slider ↔ input sync
    on(el.sizeSlider,  'input', () => el.sizeInput.value  = el.sizeSlider.value);
    on(el.sizeInput,   'input', () => el.sizeSlider.value = el.sizeInput.value);
    on(el.scaleSlider, 'input', () => el.scaleInput.value = el.scaleSlider.value);
    on(el.scaleInput,  'input', () => el.scaleSlider.value = el.scaleInput.value);

    on(el.resizeBtn, 'click', () => {
      const gridSize  = Math.max(8,  Math.min(128, parseInt(el.sizeInput.value)  || 32));
      const pixelSize = Math.max(4, Math.min(40,  parseInt(el.scaleInput.value) || 12));
      bus.emit('pixels:ui:resize', { gridSize, pixelSize });
    });

    // Symmetry & grid
    on(el.mirrorVBtn, 'click', () => bus.emit('pixels:ui:mirrorV'));
    on(el.mirrorHBtn, 'click', () => bus.emit('pixels:ui:mirrorH'));
    on(el.gridToggle, 'click', () => bus.emit('pixels:ui:toggleGrid'));

    // History
    on(el.undoBtn, 'click', () => bus.emit('pixels:ui:undo'));
    on(el.redoBtn, 'click', () => bus.emit('pixels:ui:redo'));

    // Color
    on(el.addColor, 'input', () => {
      bus.emit('pixels:ui:setColor', { color: el.addColor.value });
    });
    on(el.palettePreset, 'change', () => {
      bus.emit('pixels:ui:setPaletteMode', { mode: el.palettePreset.value });
    });
    on(el.randomPalette, 'click', () => bus.emit('pixels:ui:randomPalette'));

    // Canvas actions
    on(el.clearBtn,        'click', () => bus.emit('pixels:ui:clear'));
    on(el.exportBtn,       'click', () => bus.emit('pixels:ui:export', { scale: 1 }));
    on(el.exportScaledBtn, 'click', () => bus.emit('pixels:ui:export', { scale: 20 }));
    on(el.downloadJSON,    'click', () => bus.emit('pixels:ui:saveJSON'));

    on(el.loadJSON, 'change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = ev => {
        try {
          bus.emit('pixels:ui:loadJSON', { data: JSON.parse(ev.target.result) });
        } catch {
          console.error('[PixelUI] JSON parse failed');
        }
      };
      reader.readAsText(file);
      e.target.value = ''; // allow re-loading same file
    });
  }

  // ─── Bus event bindings → DOM updates ───────────────────────────────────────

  #bindBus() {
    const subs = [
      bus.on('pixels:toolChanged',    ({ tool })          => this.#renderTool(tool)),
      bus.on('pixels:colorChanged',   ({ color })         => this.#renderColor(color)),
      bus.on('pixels:paletteUpdated', ({ palette })       => this.#renderPalette(palette)),
      bus.on('pixels:historyChanged', ({ canUndo, canRedo }) => this.#renderHistory(canUndo, canRedo)),
      bus.on('pixels:mirrorVChanged', ({ value })         => this.#el.mirrorVBtn?.classList.toggle('active', value)),
      bus.on('pixels:mirrorHChanged', ({ value })         => this.#el.mirrorHBtn?.classList.toggle('active', value)),
      bus.on('pixels:gridToggled',    ({ value })         => this.#el.gridToggle?.classList.toggle('active', value)),
      bus.on('pixels:resized',        ({ gridSize, pixelSize }) => this.#renderSize(gridSize, pixelSize)),
      bus.on('pixels:restored',       ()                  => this.#syncAll()),
      bus.on('pixels:loaded',         ()                  => this.#syncAll()),

      // Status bar from state
      pixelState.subscribe(state => this.#renderStatus(state)),
    ];
    this.#subs.push(...subs);
  }

  // ─── Full sync from state (initial mount / undo restore / load) ─────────────

  #syncAll() {
    const s = pixelState.get();
    this.#renderTool(s.activeTool);
    this.#renderColor(s.currentColor);
    this.#renderPalette(s.palette);
    this.#renderHistory(false, false);
    this.#renderSize(s.gridSize, s.pixelSize);
    this.#el.mirrorVBtn?.classList.toggle('active', s.mirrorV);
    this.#el.mirrorHBtn?.classList.toggle('active', s.mirrorH);
    this.#el.gridToggle?.classList.toggle('active', s.showGrid);
    this.#el.palettePreset && (this.#el.palettePreset.value = s.paletteMode);
    this.#renderStatus(s);
  }

  // ─── Targeted DOM renders ────────────────────────────────────────────────────

  #renderTool(tool) {
    this.#el.tools.forEach(t => t.classList.toggle('active', t.dataset.tool === tool));
    const pc = document.getElementById('paintCanvas');
    if (pc) pc.className = `cursor-${tool}`;
  }

  #renderColor(color) {
    if (this.#el.addColor) this.#el.addColor.value = color;
    this.#el.paletteRow?.querySelectorAll('.swatch').forEach(sw => {
      sw.classList.toggle('selected', sw.dataset.hex === color);
    });
  }

  #renderPalette(palette) {
    const row     = this.#el.paletteRow;
    if (!row) return;
    const current = pixelState.get('currentColor');

    // Remove old swatches only (keep picker + shuffle at end)
    row.querySelectorAll('.swatch').forEach(s => s.remove());

    // Insert swatches before the color-picker-wrap
    const anchor = row.querySelector('.color-picker-wrap');

    palette.forEach(hex => {
      const sw = document.createElement('div');
      sw.className          = 'swatch';
      sw.style.backgroundColor = hex;
      sw.dataset.hex        = hex;
      sw.dataset.tooltip    = hex.toUpperCase();
      if (hex === current) sw.classList.add('selected');

      sw.addEventListener('click', () => {
        bus.emit('pixels:ui:setColor', { color: hex });
        sw.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      });

      anchor ? row.insertBefore(sw, anchor) : row.appendChild(sw);
    });
  }

  #renderHistory(canUndo, canRedo) {
    const { undoBtn, redoBtn } = this.#el;
    if (undoBtn) { undoBtn.disabled = !canUndo; undoBtn.style.opacity = canUndo ? '1' : '0.4'; }
    if (redoBtn) { redoBtn.disabled = !canRedo; redoBtn.style.opacity = canRedo ? '1' : '0.4'; }
  }

  #renderSize(gridSize, pixelSize) {
    const { sizeInput, sizeSlider, scaleInput, scaleSlider } = this.#el;
    if (sizeInput)   sizeInput.value   = gridSize;
    if (sizeSlider)  sizeSlider.value  = gridSize;
    if (scaleInput)  scaleInput.value  = pixelSize;
    if (scaleSlider) scaleSlider.value = pixelSize;
  }

  #renderStatus(state) {
    const tool  = (state.activeTool  ?? 'pencil').toUpperCase();
    const color = (state.currentColor ?? '#000000').toUpperCase();
    const count = state.pixelCount ?? 0;

    if (this.#el.statusMessage)
      this.#el.statusMessage.textContent = `Module: Texture Editor | Tool: ${tool} | ${color}`;

    if (this.#el.pixelCount)
      this.#el.pixelCount.textContent = `${count} Pixel${count !== 1 ? 's' : ''}`;

    if (this.#el.systemPath)
      this.#el.systemPath.textContent = `.app / module / Texture Editor / ${tool} / ${color}`;

    if (this.#el.systemMetrics)
      this.#el.systemMetrics.textContent = `Grid: ${state.gridSize}×${state.gridSize} | Zoom: ×${state.viewScale?.toFixed(1) ?? '1.0'}`;
  }
}
