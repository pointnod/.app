/**
 * .app Core — EventBus
 * Singleton pub/sub system for cross-layer communication.
 * All modules speak through events — zero direct coupling.
 *
 * Usage:
 *   import { bus } from './EventBus.js';
 *   const off = bus.on('pixels:toolChanged', ({ tool }) => ...);
 *   bus.emit('pixels:toolChanged', { tool: 'pencil' });
 *   off(); // unsubscribe
 */
export class EventBus {
  #listeners = new Map();

  /**
   * Subscribe to an event. Returns an unsubscribe function.
   * @param {string} event
   * @param {Function} handler
   * @returns {Function} unsubscribe
   */
  on(event, handler) {
    if (!this.#listeners.has(event)) this.#listeners.set(event, []);
    this.#listeners.get(event).push(handler);
    return () => this.off(event, handler);
  }

  /**
   * Subscribe once — auto-removes after first call.
   */
  once(event, handler) {
    const off = this.on(event, (payload) => { handler(payload); off(); });
    return off;
  }

  off(event, handler) {
    if (!this.#listeners.has(event)) return;
    this.#listeners.set(event, this.#listeners.get(event).filter(h => h !== handler));
  }

  emit(event, payload = {}) {
    this.#listeners.get(event)?.forEach(h => h(payload));
  }

  /** Debug: list all active event names */
  debug() {
    return [...this.#listeners.entries()]
      .filter(([, hs]) => hs.length > 0)
      .map(([k, hs]) => `${k} (${hs.length})`);
  }
}

/** Singleton bus — import this everywhere */
export const bus = new EventBus();
