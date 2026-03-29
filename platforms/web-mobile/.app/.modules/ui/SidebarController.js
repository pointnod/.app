/**
 * .app UI — SidebarController
 * Manages sidebar visibility mode: hover → locked → hidden → hover...
 * Self-contained — no bus events needed.
 */

const MODES = ['hover', 'locked', 'hidden'];

const ICONS = {
  hover:  '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/>',
  locked: '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  hidden: '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>',
};

export class SidebarController {
  #mode = 'locked';

  constructor() { this.#apply(); this.#bind(); }

  #bind() {
    document.getElementById('uiModeBtn')?.addEventListener('click', () => {
      const idx  = MODES.indexOf(this.#mode);
      this.#mode = MODES[(idx + 1) % MODES.length];
      this.#apply();
    });
  }

  #apply() {
    document.body.classList.remove(...MODES.map(m => `ui-mode-${m}`));
    document.body.classList.add(`ui-mode-${this.#mode}`);
    const icon = document.getElementById('ui-mode-icon');
    if (icon) icon.innerHTML = ICONS[this.#mode];
  }
}
