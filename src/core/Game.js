import { Engine } from './Engine.js';
import { SceneManager } from './SceneManager.js';
import { InputManager } from './InputManager.js';
import { AudioManager } from './AudioManager.js';
import { SaveManager } from './SaveManager.js';
import { LocalizationManager } from './LocalizationManager.js';
import { FontRenderer } from './FontRenderer.js';

export class Game {
  constructor(canvas, touchContainer) {
    this.canvas = canvas;
    this.engine = new Engine(canvas);
    this.engine.game = this;
    this.font = new FontRenderer(this.engine.ctx);
    this.input = new InputManager(window, touchContainer);
    this.audio = new AudioManager();
    this.save = new SaveManager();
    this.l10n = new LocalizationManager();
    this.scenes = new SceneManager(this);
    this.engine.game = this;
    this.lastSave = null;
    this.currentCity = 'berlin';
    this.currentScene = 'town';
  }

  update(dt) {
    this.scenes.update(dt);
    this.input.endFrame();
  }

  render(ctx) {
    this.scenes.render(ctx);
  }

  start(initialScene = 'intro') {
    this.engine.start();
    this.scenes.switchTo(initialScene);
  }
}
