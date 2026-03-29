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

import { registry } from './core/ModuleRegistry.js';
import { bus } from './core/EventBus.js';
import { PixelModule } from './modules/pixels/PixelModule.js';
import { PixelUI } from './modules/pixels/ui/PixelUI.js';
import { SidebarController } from './ui/SidebarController.js';
import { TutorialController } from './ui/TutorialController.js';
import { RulerController } from './ui/RulerController.js';

/**
 * Fonction d'amorçage asynchrone (Boot).
 * Elle initialise l'interface utilisateur globale avant d'instancier et
 * d'activer le module Pixel Art.
 */
async function boot() {
  console.log('[.nod] Booting…');

  // ── UI controllers (stateless, can init before modules) ──
  // Ces contrôleurs gèrent l'interaction hors de la zone de dessin (Tooltips, Menus).
  new SidebarController();
  new TutorialController();
  const rulers = new RulerController(); // Gère les règles (X, Y) au-dessus du canvas.

  // ── Register modules ──
  // Le registre des modules garde en mémoire tous les "logiciels" internes.
  registry.register('pixels', new PixelModule());
  // Future extensions possibles :
  // registry.register('dashboard', new DashboardModule());
  // registry.register('code',      new CodeModule());

  // ── Module UI (pixel) ──
  // Initialise l'interface spécifique du module Pixel (Panneaux d'outils, palette).
  const pixelUI = new PixelUI();
  pixelUI.mount();

  // ── Module navigation buttons ──
  // Ajoute des écouteurs de clics (EventListeners) sur tous les boutons de navigation (barre de gauche).
  document.querySelectorAll('#sidebar-left .sidebar-circle[data-module]').forEach(btn => {
    btn.addEventListener('click', () => registry.activate(btn.dataset.module));
  });

  // ── Sidebar flip ──
  // Permet d'inverser l'interface (gauchier / droitier) en modifiant les règles CSS (classe css).
  document.getElementById('switchSidebarBtn')?.addEventListener('click', () => {
    document.getElementById('app').classList.toggle('sidebar-flipped');
  });

  // ── Reflect active module in nav + panel visibility ──
  // Le bus d'évènement nous informe si le module actif change.
  // Lors de ce changement, nous masquons ou affichons les panneaux correspondants.
  bus.on('nod:module:activated', ({ id }) => {
    document.querySelectorAll('#sidebar-left .sidebar-circle[data-module]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.module === id);
    });
    // Les panneaux d'outils portent l'attribut `data-for-module`. S'ils correspondent à l'ID actif, on les affiche.
    document.querySelectorAll('[data-for-module]').forEach(el => {
      el.style.display = el.dataset.forModule === id ? 'flex' : 'none';
    });
  });

  // ── Rulers refresh on viewport move / resize ──
  // Réactive les règles si la vue bouge ou si la fenêtre est redimensionnée.
  bus.on('pixels:viewMoved', () => rulers.update());
  window.addEventListener('resize', () => {
    setTimeout(() => rulers.update(), 100);
  });

  // ── Default module ──
  // Active par défaut le module "pixels" une fois la configuration terminée.
  await registry.activate('pixels');

  console.log('[.nod] Ready ✓ | Modules:', registry.listIds());
}

boot().catch(err => console.error('[.nod] Boot failed:', err));
