/**
 * .nod Pixels — CanvasEngine
 * Owns all canvas I/O: grid, cells, full redraw, preview, export.
 * No state mutations, no bus events — pure rendering from the outside in.
 */

export class CanvasEngine {
  #gridCtx;
  #paintCtx;
  #previewCtx;
  #gridCanvas;
  #paintCanvas;
  #previewCanvas;
  #viewport;

  #gridSize  = 32;
  #pixelSize = 12;
  #showGrid  = true;

  constructor({ gridCanvas, paintCanvas, previewCanvas, viewport }) {
    this.#gridCanvas    = gridCanvas;
    this.#paintCanvas   = paintCanvas;
    this.#previewCanvas = previewCanvas;
    this.#viewport      = viewport;
    this.#gridCtx       = gridCanvas.getContext('2d');
    this.#paintCtx      = paintCanvas.getContext('2d');
    this.#previewCtx    = previewCanvas.getContext('2d');
  }

  // ─── Configuration ──────────────────────────────────────────────────────────

  setGridSize(n)   { this.#gridSize  = n; }
  setPixelSize(n)  { this.#pixelSize = n; }
  setGridVisible(v){ this.#showGrid  = v; }

  /** Resize canvases + viewport to match current grid/pixel settings */
  setup({ gridSize, pixelSize }) {
    this.#gridSize  = gridSize;
    this.#pixelSize = pixelSize;
    const wpx = gridSize * pixelSize;
    const hpx = gridSize * pixelSize;

    [this.#gridCanvas, this.#paintCanvas].forEach(c => {
      c.width        = wpx;
      c.height       = hpx;
      c.style.width  = `${wpx}px`;
      c.style.height = `${hpx}px`;
    });

    if (this.#viewport) {
      this.#viewport.style.width  = `${wpx}px`;
      this.#viewport.style.height = `${hpx}px`;
    }
  }

  // ─── Grid ───────────────────────────────────────────────────────────────────

  drawGrid() {
    const { w, h } = this.#dims();
    this.#gridCtx.clearRect(0, 0, w, h);
    if (!this.#showGrid) return;

    this.#gridCtx.strokeStyle = 'rgba(0,0,0,0.15)';
    this.#gridCtx.lineWidth   = 0.5;

    for (let x = 0; x <= this.#gridSize; x++) {
      const px = x * this.#pixelSize;
      this.#gridCtx.beginPath();
      this.#gridCtx.moveTo(px, 0);
      this.#gridCtx.lineTo(px, h);
      this.#gridCtx.stroke();
    }
    for (let y = 0; y <= this.#gridSize; y++) {
      const py = y * this.#pixelSize;
      this.#gridCtx.beginPath();
      this.#gridCtx.moveTo(0, py);
      this.#gridCtx.lineTo(w, py);
      this.#gridCtx.stroke();
    }
  }

  // ─── Pixel rendering ────────────────────────────────────────────────────────

  /** Draw or clear a single cell (called per-pointer for performance) */
  drawCell(x, y, color) {
    const ps = this.#pixelSize;
    if (color) {
      this.#paintCtx.fillStyle = color;
      this.#paintCtx.fillRect(x * ps, y * ps, ps, ps);
    } else {
      this.#paintCtx.clearRect(x * ps, y * ps, ps, ps);
    }
  }

  /** Full repaint from pixel array — used after fill / undo / load */
  redrawAll(pixels, gridSize) {
    const size = gridSize ?? this.#gridSize;
    const ps   = this.#pixelSize;
    this.#paintCtx.clearRect(0, 0, size * ps, size * ps);

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const c = pixels[y * size + x];
        if (c) {
          this.#paintCtx.fillStyle = c;
          this.#paintCtx.fillRect(x * ps, y * ps, ps, ps);
        }
      }
    }
  }

  // ─── Preview ────────────────────────────────────────────────────────────────

  /** 1-pixel-per-cell preview thumbnail */
  updatePreview(pixels, gridSize) {
    const size = gridSize ?? this.#gridSize;
    this.#previewCanvas.width  = size;
    this.#previewCanvas.height = size;
    this.#previewCtx.imageSmoothingEnabled = false;

    const img = this.#previewCtx.createImageData(size, size);
    for (let i = 0; i < pixels.length; i++) {
      const c = pixels[i];
      if (!c) continue;
      const rgb = hexToRgb(c);
      if (!rgb) continue;
      const idx = i * 4;
      img.data[idx]     = rgb.r;
      img.data[idx + 1] = rgb.g;
      img.data[idx + 2] = rgb.b;
      img.data[idx + 3] = 255;
    }
    this.#previewCtx.putImageData(img, 0, 0);
  }

  // ─── Export ─────────────────────────────────────────────────────────────────

  /** Returns a data URL at the requested scale */
  exportPNG(pixels, gridSize, scale = 1) {
    const size = gridSize ?? this.#gridSize;
    const tmp  = document.createElement('canvas');
    tmp.width  = size;
    tmp.height = size;
    const tctx = tmp.getContext('2d');
    const img  = tctx.createImageData(size, size);

    for (let i = 0; i < pixels.length; i++) {
      const c = pixels[i];
      if (!c) continue;
      const rgb = hexToRgb(c);
      if (!rgb) continue;
      const idx = i * 4;
      img.data[idx]     = rgb.r;
      img.data[idx + 1] = rgb.g;
      img.data[idx + 2] = rgb.b;
      img.data[idx + 3] = 255;
    }
    tctx.putImageData(img, 0, 0);

    const out = document.createElement('canvas');
    out.width  = size * scale;
    out.height = size * scale;
    const octx = out.getContext('2d');
    octx.imageSmoothingEnabled = false;
    octx.drawImage(tmp, 0, 0, out.width, out.height);
    return out.toDataURL('image/png');
  }

  // ─── Viewport ───────────────────────────────────────────────────────────────

  applyViewTransform(x, y, scale) {
    if (this.#viewport) {
      this.#viewport.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
    }
  }

  // ─── Internals ──────────────────────────────────────────────────────────────

  #dims() {
    return { w: this.#gridSize * this.#pixelSize, h: this.#gridSize * this.#pixelSize };
  }

  get paintCanvas() { return this.#paintCanvas; }
}

// ─── Pure color utilities ────────────────────────────────────────────────────

export function hexToRgb(hex) {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return m ? { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) } : null;
}
