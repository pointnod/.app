/**
 * .app Core — StateManager
 * Reactive state store scoped to a namespace.
 * Each module owns its own StateManager instance.
 *
 * Usage:
 *   const store = new StateManager('pixels', { tool: 'pencil' });
 *   store.set('tool', 'eraser');
 *   store.subscribe('tool', ({ value }) => console.log(value));
 *   store.subscribe(state => console.log(state)); // full state
 */
import { bus } from './EventBus.js';

export class StateManager {
  #ns;
  #state;

  constructor(namespace, initialState = {}) {
    this.#ns = namespace;
    this.#state = structuredClone(initialState);
  }

  /** Get one key or the full state snapshot */
  get(key) {
    return key !== undefined ? this.#state[key] : { ...this.#state };
  }

  /** Set a single key, emits if value changed */
  set(key, value) {
    const prev = this.#state[key];
    if (Object.is(prev, value)) return this;
    this.#state[key] = value;
    bus.emit(`${this.#ns}:state:${key}`, { key, value, prev });
    bus.emit(`${this.#ns}:state:changed`, { ...this.#state });
    return this;
  }

  /** Shallow-merge a partial state object */
  patch(partial) {
    Object.keys(partial).forEach(k => {
      if (!Object.is(this.#state[k], partial[k])) {
        this.#state[k] = partial[k];
        bus.emit(`${this.#ns}:state:${k}`, { key: k, value: partial[k], prev: this.#state[k] });
      }
    });
    bus.emit(`${this.#ns}:state:changed`, { ...this.#state });
    return this;
  }

  /**
   * Subscribe to state changes.
   * - subscribe('key', handler) — specific key
   * - subscribe(handler) — any state change
   * Returns unsubscribe fn.
   */
  subscribe(keyOrHandler, handler) {
    if (typeof keyOrHandler === 'function') {
      return bus.on(`${this.#ns}:state:changed`, keyOrHandler);
    }
    return bus.on(`${this.#ns}:state:${keyOrHandler}`, handler);
  }
}
