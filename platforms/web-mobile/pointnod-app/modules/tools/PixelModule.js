/**
 * pointnod-app — PixelModule (pointnod-app.module.tools)
 * Orchestrates all pixel art sub-systems.
 * Implements the pointnod-app module interface: { id, label, activate(), deactivate() }
 *
 * Architecture:
 *   PixelModule ──owns──▶ CanvasEngine  (renders)
 *              ──owns──▶ ToolEngine    (tool strategies)
 *              ──owns──▶ PaletteEngine (pure color math)
 *              ──owns──▶ HistoryEngine (undo/redo snapshots)
 *              ──reads/writes──▶ pixelState (StateManager)
 *              ──listens/emits──▶ EventBus
 *
 * UI (PixelUI) communicates via bus events only — never touches engines directly.
 */

import { bus }           from '../core/EventBus.js';
import { pixelState }    from './state/PixelState.js';
import { CanvasEngine }  from './commandes/CanvasEngine.js';
import { ToolEngine }    from './commandes/ToolEngine.js';
import { PaletteEngine } from './commandes/PaletteEngine.js';
import { HistoryEngine } from './commandes/HistoryEngine.js';

export class PixelModule {
  id    = 'pixels';
  label = 'Texture Editor';

  #canvas;
  #tools;
  #palette;
  #history;

  #drawing   = false;
  #isPanning = false;
  #lastPtr   = { x: 0, y: 0 };
  #fillUsed  = false;

  // Cleanup fns collected on activate, called on deactivate
  #cleanup = [];

  // ─── Module lifecycle ───────────────────────────────────────────────────────

  async activate() {
    this.#initEngines();
    this.#ensurePixels();
    this.#applyStateToEngines();
    this.#redrawFromState();
    this.#bindPointerEvents();
    this.#bindBusListeners();
    this.#bindKeyboard();
    bus.emit('pixels:activated');
  }

  async deactivate() {
    this.#cleanup.forEach(fn => fn());
    this.#cleanup = [];
    bus.emit('pixels:deactivated');
  }

  // ─── Initialization ─────────────────────────────────────────────────────────

  #initEngines() {
    this.#canvas  = new CanvasEngine({
      gridCanvas:    document.getElementById('gridCanvas'),
      paintCanvas:   document.getElementById('paintCanvas'),
      previewCanvas: document.getElementById('previewCanvas'),
      viewport:      document.getElementById('canvas-viewport'),
    });

    this.#tools = new ToolEngine({
      onPixelChange: (changes, mode) => this.#onPixelChange(changes, mode),
      onColorPick:   (color)         => this.#onColorPick(color),
    });

    this.#palette = new PaletteEngine();
    this.#history = new HistoryEngine(50);
  }

  #ensurePixels() {
    if (!pixelState.get('pixels')) {
      const size = pixelState.get('gridSize');
      pixelState.set('pixels', new Array(size * size).fill(null));
    }
  }

  #applyStateToEngines() {
    const { gridSize, pixelSize, showGrid, activeTool } = pixelState.get();
    this.#canvas.setup({ gridSize, pixelSize });
    this.#canvas.setGridVisible(showGrid);
    this.#tools.setTool(activeTool);
  }

  #redrawFromState() {
    const { pixels, gridSize, viewX, viewY, viewScale } = pixelState.get();
    this.#canvas.drawGrid();
    this.#canvas.redrawAll(pixels, gridSize);
    this.#canvas.updatePreview(pixels, gridSize);
    this.#canvaspointnod-applyViewTransform(viewX, viewY, viewScale);
    this.#updatePixelCount();
  }

  // ─── Pointer handling ────────────────────────────────────────────────────────

  #bindPointerEvents() {
    const container  = document.getElementById('canvas-container');
    const paintCanvas = document.getElementById('paintCanvas');

    const onDown = (e) => {
      // Alt or middle-click = pan mode
      if (e.altKey || e.button === 1) {
        this.#isPanning = true;
        this.#lastPtr   = { x: e.clientX, y: e.clientY };
        container.setPointerCapture(e.pointerId);
        return;
      }
      if (e.target !== paintCanvas) return;

      this.#drawing  = true;
      this.#fillUsed = false;
      paintCanvas.setPointerCapture(e.pointerId);

      const tool = pixelState.get('activeTool');
      if (tool === 'pencil' || tool === 'eraser') {
        this.#history.snapshot(this.#snapshot());
        bus.emit('pixels:historyChanged', { canUndo: this.#history.canUndo, canRedo: this.#history.canRedo });
      }
      this.#draw(e);
    };

    const onMove = (e) => {
      if (this.#isPanning) {
        const dx = e.clientX - this.#lastPtr.x;
        const dy = e.clientY - this.#lastPtr.y;
        pixelState.patch({
          viewX: pixelState.get('viewX') + dx,
          viewY: pixelState.get('viewY') + dy,
        });
        this.#lastPtr = { x: e.clientX, y: e.clientY };
        const { viewX, viewY, viewScale } = pixelState.get();
        this.#canvaspointnod-applyViewTransform(viewX, viewY, viewScale);
        bus.emit('pixels:viewMoved');
        return;
      }
      if (this.#drawing) this.#draw(e);
    };

    const onUp = (e) => {
      if (this.#isPanning) {
        this.#isPanning = false;
        try { container.releasePointerCapture(e.pointerId); } catch {}
      }
      if (this.#drawing) {
        this.#drawing = false;
        try { paintCanvas.releasePointerCapture(e.pointerId); } catch {}
      }
    };

    const onWheel = (e) => {
      e.preventDefault();
      const delta    = e.deltaY > 0 ? -0.1 : 0.1;
      const newScale = Math.max(0.1, Math.min(5, pixelState.get('viewScale') + delta));
      pixelState.set('viewScale', newScale);
      const { viewX, viewY } = pixelState.get();
      this.#canvaspointnod-applyViewTransform(viewX, viewY, newScale);
      bus.emit('pixels:viewMoved');
    };

    // Pinch-to-zoom
    let pinchDist = null;
    const onTouchStart = (e) => {
      if (e.touches.length === 2)
        pinchDist = Math.hypot(e.touches[0].pageX - e.touches[1].pageX, e.touches[0].pageY - e.touches[1].pageY);
    };
    const onTouchMove = (e) => {
      if (e.touches.length !== 2 || !pinchDist) return;
      const dist     = Math.hypot(e.touches[0].pageX - e.touches[1].pageX, e.touches[0].pageY - e.touches[1].pageY);
      const newScale = Math.max(0.1, Math.min(5, pixelState.get('viewScale') + (dist - pinchDist) * 0.01));
      pinchDist      = dist;
      pixelState.set('viewScale', newScale);
      const { viewX, viewY } = pixelState.get();
      this.#canvaspointnod-applyViewTransform(viewX, viewY, newScale);
    };
    const onTouchEnd = () => { pinchDist = null; };

    container.addEventListener('pointerdown',  onDown);
    container.addEventListener('pointermove',  onMove);
    container.addEventListener('pointerup',    onUp);
    container.addEventListener('wheel',        onWheel, { passive: false });
    container.addEventListener('touchstart',   onTouchStart, { passive: true });
    container.addEventListener('touchmove',    onTouchMove,  { passive: true });
    container.addEventListener('touchend',     onTouchEnd,   { passive: true });

    const onResize = () => {
      const { gridSize, pixelSize } = pixelState.get();
      this.#canvas.setup({ gridSize, pixelSize });
      this.#canvas.drawGrid();
      this.#canvas.redrawAll(pixelState.get('pixels'), gridSize);
      bus.emit('pixels:viewMoved');
    };
    window.addEventListener('resize', onResize);

    this.#cleanup.push(
      () => container.removeEventListener('pointerdown',  onDown),
      () => container.removeEventListener('pointermove',  onMove),
      () => container.removeEventListener('pointerup',    onUp),
      () => container.removeEventListener('wheel',        onWheel),
      () => container.removeEventListener('touchstart',   onTouchStart),
      () => container.removeEventListener('touchmove',    onTouchMove),
      () => container.removeEventListener('touchend',     onTouchEnd),
      () => window.removeEventListener('resize',          onResize),
    );
  }

  #draw(e) {
    const paintCanvas = document.getElementById('paintCanvas');
    const rect        = paintCanvas.getBoundingClientRect();
    const scale       = pixelState.get('viewScale');
    const ps          = pixelState.get('pixelSize');
    const gridSize    = pixelState.get('gridSize');

    const x = Math.floor((e.clientX - rect.left)  / (ps * scale));
    const y = Math.floor((e.clientY - rect.top)    / (ps * scale));
    if (x < 0 || y < 0 || x >= gridSize || y >= gridSize) return;

    const tool = pixelState.get('activeTool');

    // Fill fires once per click
    if (tool === 'fill') {
      if (this.#fillUsed) return;
      this.#fillUsed = true;
      this.#history.snapshot(this.#snapshot());
      bus.emit('pixels:historyChanged', { canUndo: this.#history.canUndo, canRedo: this.#history.canRedo });
    }

    this.#toolspointnod-apply(x, y, {
      color:    pixelState.get('currentColor'),
      pixels:   pixelState.get('pixels'),
      gridSize,
      mirrorV:  pixelState.get('mirrorV'),
      mirrorH:  pixelState.get('mirrorH'),
    });
  }

  // ─── Pixel change handler ────────────────────────────────────────────────────

  #onPixelChange(changes, mode) {
    const pixels   = pixelState.get('pixels');
    const gridSize = pixelState.get('gridSize');

    if (mode === 'single') {
      // Incremental: draw only changed cells
      for (const [x, y, color] of changes) {
        this.#canvas.drawCell(x, y, color);
      }
    } else {
      // Bulk (fill / undo): full repaint
      this.#canvas.redrawAll(pixels, gridSize);
    }

    this.#canvas.updatePreview(pixels, gridSize);
    this.#updatePixelCount();
  }

  #onColorPick(color) {
    pixelState.set('currentColor', color);
    bus.emit('pixels:colorChanged', { color });
  }

  // ─── Bus listeners (from UI) ────────────────────────────────────────────────

  #bindBusListeners() {
    const subs = [
      bus.on('pixels:ui:setTool',      ({ tool })          => this.setTool(tool)),
      bus.on('pixels:ui:setColor',     ({ color })         => this.setColor(color)),
      bus.on('pixels:ui:setPaletteMode', ({ mode })        => this.setPaletteMode(mode)),
      bus.on('pixels:ui:randomPalette', ()                 => this.randomPalette()),
      bus.on('pixels:ui:undo',         ()                  => this.undo()),
      bus.on('pixels:ui:redo',         ()                  => this.redo()),
      bus.on('pixels:ui:clear',        ()                  => this.clear()),
      bus.on('pixels:ui:resize',       ({ gridSize, pixelSize }) => this.resize(gridSize, pixelSize)),
      bus.on('pixels:ui:mirrorV',      ()                  => this.toggleMirrorV()),
      bus.on('pixels:ui:mirrorH',      ()                  => this.toggleMirrorH()),
      bus.on('pixels:ui:toggleGrid',   ()                  => this.toggleGrid()),
      bus.on('pixels:ui:export',       ({ scale })         => this.export(scale)),
      bus.on('pixels:ui:saveJSON',     ()                  => this.saveJSON()),
      bus.on('pixels:ui:loadJSON',     ({ data })          => this.loadJSON(data)),
    ];
    this.#cleanup.push(...subs);
  }

  // ─── Keyboard shortcuts ──────────────────────────────────────────────────────

  #bindKeyboard() {
    const onKey = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;

      const key = e.key.toLowerCase();
      if (!e.ctrlKey && !e.metaKey) {
        if (key === 'p') return this.setTool('pencil');
        if (key === 'e') return this.setTool('eraser');
        if (key === 'f') return this.setTool('fill');
        if (key === 'c' || key === ' ') { e.preventDefault(); return this.setTool('picker'); }
        if (key === 'g') return this.toggleGrid();
        if (key === 'delete') return this.clear();
      }
      if ((e.ctrlKey || e.metaKey) && key === 'z') {
        e.preventDefault();
        e.shiftKey ? this.redo() : this.undo();
      }
    };
    document.addEventListener('keydown', onKey);
    this.#cleanup.push(() => document.removeEventListener('keydown', onKey));
  }

  // ─── Public actions ──────────────────────────────────────────────────────────

  setTool(tool) {
    pixelState.set('activeTool', tool);
    this.#tools.setTool(tool);
    const pc = document.getElementById('paintCanvas');
    if (pc) pc.className = `cursor-${tool}`;
    bus.emit('pixels:toolChanged', { tool });
  }

  setColor(color) {
    pixelState.set('currentColor', color);
    this.#regeneratePalette();
    bus.emit('pixels:colorChanged', { color });
  }

  setPaletteMode(mode) {
    pixelState.set('paletteMode', mode);
    this.#regeneratePalette();
  }

  randomPalette() {
    const p = this.#palette.random();
    pixelState.set('palette', p);
    bus.emit('pixels:paletteUpdated', { palette: p });
  }

  toggleMirrorV() {
    const v = !pixelState.get('mirrorV');
    pixelState.set('mirrorV', v);
    bus.emit('pixels:mirrorVChanged', { value: v });
  }

  toggleMirrorH() {
    const v = !pixelState.get('mirrorH');
    pixelState.set('mirrorH', v);
    bus.emit('pixels:mirrorHChanged', { value: v });
  }

  toggleGrid() {
    const v = !pixelState.get('showGrid');
    pixelState.set('showGrid', v);
    this.#canvas.setGridVisible(v);
    this.#canvas.drawGrid();
    bus.emit('pixels:gridToggled', { value: v });
  }

  clear() {
    this.#history.snapshot(this.#snapshot());
    const size = pixelState.get('gridSize');
    const empty = new Array(size * size).fill(null);
    pixelState.set('pixels', empty);
    this.#canvas.redrawAll(empty, size);
    this.#canvas.updatePreview(empty, size);
    this.#updatePixelCount();
    bus.emit('pixels:historyChanged', { canUndo: this.#history.canUndo, canRedo: this.#history.canRedo });
  }

  resize(gridSize, pixelSize) {
    this.#history.snapshot(this.#snapshot());
    const oldSize   = pixelState.get('gridSize');
    const oldPixels = pixelState.get('pixels');
    const newPixels = new Array(gridSize * gridSize).fill(null);
    const ox        = Math.floor((gridSize - oldSize) / 2);
    const oy        = Math.floor((gridSize - oldSize) / 2);

    for (let y = 0; y < oldSize; y++) {
      for (let x = 0; x < oldSize; x++) {
        const nx = x + ox, ny = y + oy;
        if (nx >= 0 && ny >= 0 && nx < gridSize && ny < gridSize) {
          newPixels[ny * gridSize + nx] = oldPixels[y * oldSize + x];
        }
      }
    }

    pixelState.patch({ gridSize, pixelSize, pixels: newPixels });
    this.#canvas.setGridSize(gridSize);
    this.#canvas.setPixelSize(pixelSize);
    this.#canvas.setup({ gridSize, pixelSize });
    this.#canvas.drawGrid();
    this.#canvas.redrawAll(newPixels, gridSize);
    this.#canvas.updatePreview(newPixels, gridSize);
    this.#canvaspointnod-applyViewTransform(...this.#viewArgs());
    this.#updatePixelCount();
    bus.emit('pixels:resized', { gridSize, pixelSize });
    bus.emit('pixels:viewMoved');
    bus.emit('pixels:historyChanged', { canUndo: this.#history.canUndo, canRedo: this.#history.canRedo });
  }

  undo() {
    const prev = this.#history.undo(this.#snapshot());
    if (!prev) return;
    this.#restoreSnapshot(prev);
    bus.emit('pixels:historyChanged', { canUndo: this.#history.canUndo, canRedo: this.#history.canRedo });
  }

  redo() {
    const next = this.#history.redo(this.#snapshot());
    if (!next) return;
    this.#restoreSnapshot(next);
    bus.emit('pixels:historyChanged', { canUndo: this.#history.canUndo, canRedo: this.#history.canRedo });
  }

  export(scale = 1) {
    const { pixels, gridSize } = pixelState.get();
    const url = this.#canvas.exportPNG(pixels, gridSize, scale);
    const a   = Object.assign(document.createElement('a'), { href: url, download: `pixelart_${gridSize}x${gridSize}@${scale}x.png` });
    a.click();
  }

  saveJSON() {
    const state = this.#snapshot();
    const blob  = new Blob([JSON.stringify({ version: 3, ...state })], { type: 'application/json' });
    const a     = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: 'pixelartpointnod-app.json' });
    a.click();
  }

  loadJSON(data) {
    try {
      const d        = typeof data === 'string' ? JSON.parse(data) : data;
      const gridSize = d.gridSize ?? d.size ?? d.w ?? 32;
      const pixelSize = d.pixelSize ?? 12;

      pixelState.patch({
        gridSize,
        pixelSize,
        showGrid:     d.showGrid     !== false,
        mirrorV:      !!d.mirrorV,
        mirrorH:      !!d.mirrorH,
        palette:      d.palette      ?? pixelState.get('palette'),
        currentColor: d.currentColor ?? '#e5cf82',
        activeTool:   d.activeTool   ?? 'pencil',
        pixels:       d.pixels       ?? new Array(gridSize * gridSize).fill(null),
      });

      this.#canvas.setGridSize(gridSize);
      this.#canvas.setPixelSize(pixelSize);
      this.#canvas.setGridVisible(pixelState.get('showGrid'));
      this.#canvas.setup({ gridSize, pixelSize });
      this.#canvas.drawGrid();
      this.#canvas.redrawAll(pixelState.get('pixels'), gridSize);
      this.#canvas.updatePreview(pixelState.get('pixels'), gridSize);
      this.#history.clear();
      this.#updatePixelCount();

      bus.emit('pixels:loaded',         pixelState.get());
      bus.emit('pixels:historyChanged', { canUndo: false, canRedo: false });
      bus.emit('pixels:viewMoved');
    } catch (err) {
      console.error('[PixelModule] loadJSON failed:', err);
    }
  }

  // ─── Internals ───────────────────────────────────────────────────────────────

  #regeneratePalette() {
    const p = this.#palette.generate(pixelState.get('currentColor'), pixelState.get('paletteMode'));
    pixelState.set('palette', p);
    bus.emit('pixels:paletteUpdated', { palette: p });
  }

  #updatePixelCount() {
    const count = pixelState.get('pixels')?.filter(Boolean).length ?? 0;
    pixelState.set('pixelCount', count);
  }

  /** Capture current state for history snapshot */
  #snapshot() {
    const s = pixelState.get();
    return {
      pixels:       s.pixels,
      gridSize:     s.gridSize,
      pixelSize:    s.pixelSize,
      showGrid:     s.showGrid,
      mirrorV:      s.mirrorV,
      mirrorH:      s.mirrorH,
      palette:      s.palette,
      currentColor: s.currentColor,
      activeTool:   s.activeTool,
    };
  }

  /** Apply a history snapshot back to state + engines */
  #restoreSnapshot(snap) {
    pixelState.patch(snap);
    this.#canvas.setGridSize(snap.gridSize);
    this.#canvas.setPixelSize(snap.pixelSize);
    this.#canvas.setGridVisible(snap.showGrid);
    this.#canvas.setup({ gridSize: snap.gridSize, pixelSize: snap.pixelSize });
    this.#canvas.drawGrid();
    this.#canvas.redrawAll(snap.pixels, snap.gridSize);
    this.#canvas.updatePreview(snap.pixels, snap.gridSize);
    this.#tools.setTool(snap.activeTool);
    this.#updatePixelCount();
    bus.emit('pixels:restored', snap);
    bus.emit('pixels:viewMoved');
  }

  #viewArgs() {
    const { viewX, viewY, viewScale } = pixelState.get();
    return [viewX, viewY, viewScale];
  }
}
