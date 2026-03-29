/**
 * pointnod-app UI — TutorialController
 * Self-contained tutorial overlay — no external dependencies.
 */

const STEPS = [
  { title: 'Keyboard shortcuts',
    text:  'P = Pencil · E = Eraser · F = Fill · C / Space = Picker · G = Grid · Del = Clear · Ctrl+Z / Ctrl+Shift+Z = Undo/Redo' },
  { title: 'Canvas setup',
    text:  'Adjust grid size and zoom in the right panel, then click "Set" to apply. Scroll wheel to zoom, Alt+drag to pan.' },
  { title: 'Drawing tools',
    text:  'Pencil draws pixels. Eraser clears them. Fill floods a connected area. Picker samples any pixel from the canvas.' },
  { title: 'Symmetry',
    text:  'Mirror V/H paint every stroke symmetrically. Enable both for 4-way symmetry — great for icons and sprites.' },
  { title: 'Palette & harmony',
    text:  'Pick a harmony mode (Monochrome, Analogous…) to auto-generate a palette from your base color. Shuffle for random inspiration.' },
  { title: 'Save & export',
    text:  'Export 1:1 PNG or 20× HD for print. Save as pointnod-app.json to resume later — all state is preserved including undo history.' },
];

export class TutorialController {
  #step = 0;

  constructor() { this.#bind(); }

  #bind() {
    document.getElementById('helpBtn')?.addEventListener('click', () => {
      this.#step = 0;
      this.#render();
      document.getElementById('tutorialOverlay')?.classList.add('open');
    });
    document.getElementById('tutorialNext')?.addEventListener('click', () => {
      if (this.#step < STEPS.length - 1) { this.#step++; this.#render(); }
      else document.getElementById('tutorialOverlay')?.classList.remove('open');
    });
    document.getElementById('tutorialPrev')?.addEventListener('click', () => {
      if (this.#step > 0) { this.#step--; this.#render(); }
    });
    document.getElementById('tutorialClose')?.addEventListener('click', () => {
      document.getElementById('tutorialOverlay')?.classList.remove('open');
    });
  }

  #render() {
    const s    = STEPS[this.#step];
    const content = document.getElementById('tutorialContent');
    const prev    = document.getElementById('tutorialPrev');
    const next    = document.getElementById('tutorialNext');
    const title   = document.getElementById('tutorialTitle');

    if (title)   title.textContent   = s.title;
    if (content) content.textContent = s.text;
    if (prev)    prev.style.display  = this.#step === 0 ? 'none' : '';
    if (next)    next.textContent    = this.#step === STEPS.length - 1 ? 'Finish' : 'Next';
  }
}
