/**
 * pointnod-app Core — ModuleRegistry
 * Manages module lifecycle: register → activate → deactivate.
 * Modules implement { id, label, activate(), deactivate() }.
 *
 * Usage:
 *   registry.register('pixels', new PixelModule());
 *   await registry.activate('pixels');
 */
import { bus } from './EventBus.js';

export class ModuleRegistry {
  #modules = new Map();
  #active = null;

  /**
   * Register a module instance by id.
   * @param {string} id
   * @param {{ activate(): Promise, deactivate(): Promise }} moduleInstance
   */
  register(id, moduleInstance) {
    if (this.#modules.has(id)) {
      console.warn(`[Registry] Module "${id}" already registered — overwriting.`);
    }
    this.#modules.set(id, moduleInstance);
    bus.emit('app:module:registered', { id, label: moduleInstance.label });
    return this;
  }

  /** Deactivate current, activate target */
  async activate(id) {
    if (this.#active === id) return;

    if (this.#active) {
      const prev = this.#modules.get(this.#active);
      try { await prev?.deactivate?.(); } catch (e) { console.error(e); }
      bus.emit('app:module:deactivated', { id: this.#active });
    }

    const mod = this.#modules.get(id);
    if (!mod) {
      console.warn(`[Registry] Unknown module: "${id}"`);
      return;
    }

    this.#active = id;
    try { await mod.activate?.(); } catch (e) { console.error(e); }
    bus.emit('app:module:activated', { id, label: mod.label });
  }

  get(id) { return this.#modules.get(id); }
  getActiveId() { return this.#active; }
  listIds() { return [...this.#modules.keys()]; }
}

export const registry = new ModuleRegistry();
