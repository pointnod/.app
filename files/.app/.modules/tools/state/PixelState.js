/**
 * .app Pixels — PixelState
 * Single source of truth for the pixel editor module.
 * Consumed by PixelModule (engine) and PixelUI (DOM).
 */
import { StateManager } from '../../core/StateManager.js';

export const pixelState = new StateManager('pixels', {
  // Canvas geometry
  gridSize:  32,
  pixelSize: 12,
  showGrid:  true,

  // Viewport (pan + zoom)
  viewX:     0,
  viewY:     0,
  viewScale: 1,

  // Active tool
  activeTool: 'pencil',  // pencil | eraser | fill | picker

  // Symmetry
  mirrorV: false,
  mirrorH: false,

  // Color
  currentColor: '#e5cf82',
  palette:      ['#e5cf82', '#ffffff', '#a0a0a0', '#4a4a4a', '#1a1a1a', '#d1b36d', '#8e7b50'],
  paletteMode:  'monochrome',

  // Canvas data — initialized by PixelModule on activate
  pixels: null,

  // Derived / display
  pixelCount:    0,
  statusMessage: 'Module: Texture Editor | Tool: PENCIL',
});
