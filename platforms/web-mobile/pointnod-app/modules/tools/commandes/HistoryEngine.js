/**
 * pointnod-app Pixels — HistoryEngine
 * Undo / Redo with deep-copy snapshots.
 * Keeps stacks bounded to maxSize to cap memory usage.
 *
 * Contract: call snapshot() BEFORE any mutation.
 * Then call undo(currentState) to restore the previous state.
 */

export class HistoryEngine {
  #undo  = [];
  #redo  = [];
  #max;

  constructor(maxSize = 50) { this.#max = maxSize; }

  // ─── Public API ─────────────────────────────────────────────────────────────

  /** Snapshot current state BEFORE a mutation */
  snapshot(state) {
    this.#undo.push(this.#copy(state));
    if (this.#undo.length > this.#max) this.#undo.shift();
    this.#redo = []; // new action clears redo
  }

  /**
   * Undo: stash current state in redo, pop from undo.
   * @param {object} currentState
   * @returns {object|null} previous state or null if nothing to undo
   */
  undo(currentState) {
    if (!this.#undo.length) return null;
    this.#redo.push(this.#copy(currentState));
    return this.#copy(this.#undo.pop());
  }

  /**
   * Redo: stash current state in undo, pop from redo.
   * @param {object} currentState
   * @returns {object|null} next state or null if nothing to redo
   */
  redo(currentState) {
    if (!this.#redo.length) return null;
    this.#undo.push(this.#copy(currentState));
    return this.#copy(this.#redo.pop());
  }

  clear() { this.#undo = []; this.#redo = []; }

  get canUndo() { return this.#undo.length > 0; }
  get canRedo() { return this.#redo.length > 0; }
  get undoDepth() { return this.#undo.length; }

  // ─── Internal ────────────────────────────────────────────────────────────────

  /** Deep-copy a state snapshot (pixels array + primitives) */
  #copy(state) {
    return {
      pixels:       state.pixels.slice(),
      gridSize:     state.gridSize,
      pixelSize:    state.pixelSize,
      showGrid:     state.showGrid,
      mirrorV:      state.mirrorV,
      mirrorH:      state.mirrorH,
      palette:      state.palette.slice(),
      currentColor: state.currentColor,
      activeTool:   state.activeTool,
    };
  }
}
