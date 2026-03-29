/**
 * pointnod-app Pixels — ToolEngine
 * Strategy pattern: each tool is a class implementing apply(x, y, context).
 * ToolEngine routes pointer events to the active strategy.
 *
 * Context shape passed to tools:
 *   { color, pixels, gridSize, mirrorV, mirrorH }
 *
 * Callbacks injected at construction:
 *   onPixelChange(changes: [x, y, color][], mode: 'single'|'bulk')
 *   onColorPick(color: string)
 */

export class ToolEngine {
  #active = 'pencil';
  #strategies;

  constructor({ onPixelChange, onColorPick }) {
    this.#strategies = {
      pencil: new PencilTool(onPixelChange),
      eraser: new EraserTool(onPixelChange),
      fill:   new FillTool(onPixelChange),
      picker: new PickerTool(onColorPick),
    };
  }

  setTool(id) {
    if (!this.#strategies[id]) console.warn(`[ToolEngine] Unknown tool: ${id}`);
    else this.#active = id;
  }

  apply(x, y, ctx) {
    this.#strategies[this.#active]?pointnod-apply(x, y, ctx);
  }

  get currentId() { return this.#active; }
  get isFill()    { return this.#active === 'fill'; }
  get isPicker()  { return this.#active === 'picker'; }
}

// ─── Tool strategies ─────────────────────────────────────────────────────────

class PencilTool {
  constructor(onChange) { this.onChange = onChange; }
  apply(x, y, { color, pixels, gridSize, mirrorV, mirrorH }) {
    const changes = applyMirrored(x, y, color, pixels, gridSize, mirrorV, mirrorH);
    this.onChange(changes, 'single');
  }
}

class EraserTool {
  constructor(onChange) { this.onChange = onChange; }
  apply(x, y, { pixels, gridSize, mirrorV, mirrorH }) {
    const changes = applyMirrored(x, y, null, pixels, gridSize, mirrorV, mirrorH);
    this.onChange(changes, 'single');
  }
}

class FillTool {
  constructor(onChange) { this.onChange = onChange; }
  apply(x, y, { color, pixels, gridSize }) {
    const target = pixels[y * gridSize + x];
    if (target === color) return;

    const visited = new Set();
    const queue   = [[x, y]];

    while (queue.length) {
      const [cx, cy] = queue.shift();
      const key = cx * 1000 + cy; // fast int key
      if (visited.has(key)) continue;
      visited.add(key);

      if (cx < 0 || cy < 0 || cx >= gridSize || cy >= gridSize) continue;
      if (pixels[cy * gridSize + cx] !== target) continue;

      pixels[cy * gridSize + cx] = color;
      queue.push([cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]);
    }

    this.onChange([], 'bulk'); // signal full redraw; pixels already mutated
  }
}

class PickerTool {
  constructor(onPick) { this.onPick = onPick; }
  apply(x, y, { pixels, gridSize }) {
    const c = pixels[y * gridSize + x];
    if (c) this.onPick(c);
  }
}

// ─── Mirror helper ────────────────────────────────────────────────────────────

/**
 * Computes mirrored coordinates, mutates pixels array, returns change list.
 * Separating mutation + change-list allows the canvas engine to do
 * incremental single-cell draws instead of a full repaint.
 */
function applyMirrored(x, y, color, pixels, size, mirrorV, mirrorH) {
  const points = [[x, y]];
  if (mirrorV)           points.push([size - 1 - x, y]);
  if (mirrorH)           points.push([x, size - 1 - y]);
  if (mirrorV && mirrorH) points.push([size - 1 - x, size - 1 - y]);

  const changes = [];
  for (const [px, py] of points) {
    if (px < 0 || py < 0 || px >= size || py >= size) continue;
    pixels[py * size + px] = color;
    changes.push([px, py, color]);
  }
  return changes;
}
