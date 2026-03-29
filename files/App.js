/**
 * .nod — App Bootstrap
 * Entry point. Wires core systems, registers modules, activates default.
 *
 * Load order:
 *   1. Core systems (bus, registry) — imported as singletons
 *   2. UI controllers — sidebar, tutorial, rulers
 *   3. Module registration — PixelModule + future modules
 *   4. Module UI mount — PixelUI
 *   5. Default activation — 'pixels'
 */

import { registry }           from './core/ModuleRegistry.js';
import { bus }                from './core/EventBus.js';
import { PixelModule }        from './modules/pixels/PixelModule.js';
import { PixelUI }            from './modules/pixels/ui/PixelUI.js';
import { SidebarController }  from './ui/SidebarController.js';
import { TutorialController } from './ui/TutorialController.js';
import { RulerController }    from './ui/RulerController.js';

async function boot() {
  console.log('[.nod] Booting…');

  // ── UI controllers (stateless, can init before modules) ──
  new SidebarController();
  new TutorialController();
  const rulers = new RulerController();

  // ── Register modules ──
  registry.register('pixels', new PixelModule());
  // Future: registry.register('dashboard', new DashboardModule());
  // Future: registry.register('code',      new CodeModule());

  // ── Module UI (pixel) ──
  const pixelUI = new PixelUI();
  pixelUI.mount();

  // ── Module navigation buttons ──
  document.querySelectorAll('#sidebar-left .sidebar-circle[data-module]').forEach(btn => {
    btn.addEventListener('click', () => registry.activate(btn.dataset.module));
  });

  // ── Sidebar flip ──
  document.getElementById('switchSidebarBtn')?.addEventListener('click', () => {
    document.getElementById('app').classList.toggle('sidebar-flipped');
  });

  // ── Reflect active module in nav + panel visibility ──
  bus.on('nod:module:activated', ({ id }) => {
    document.querySelectorAll('#sidebar-left .sidebar-circle[data-module]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.module === id);
    });
    document.querySelectorAll('[data-for-module]').forEach(el => {
      el.style.display = el.dataset.forModule === id ? 'flex' : 'none';
    });
  });

  // ── Rulers refresh on viewport move / resize ──
  bus.on('pixels:viewMoved', () => rulers.update());
  window.addEventListener('resize', () => {
    setTimeout(() => rulers.update(), 100);
  });

  // ── Default module ──
  await registry.activate('pixels');

  console.log('[.nod] Ready ✓ | Modules:', registry.listIds());
}

boot().catch(err => console.error('[.nod] Boot failed:', err));
