import { Game } from './core/Game.js';
import { SpriteGenerator } from './graphics/SpriteGenerator.js';
import { IntroScene } from './scenes/IntroScene.js';
import { MainMenuScene } from './scenes/MainMenuScene.js';
import { SaveSelectScene } from './scenes/SaveSelectScene.js';
import { CharacterSelectScene } from './scenes/CharacterSelectScene.js';
import { NameInputScene } from './scenes/NameInputScene.js';
import { OptionsScene } from './scenes/OptionsScene.js';
import { WorldMapScene } from './scenes/WorldMapScene.js';
import { GameScene } from './scenes/GameScene.js';
import { PauseScene } from './scenes/PauseScene.js';
import { ResultsScene } from './scenes/ResultsScene.js';

window.addEventListener('error', (event) => {
  console.error('[GlobalError]', event.error || event.message, {
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
  });
  showFatalError(event.error || new Error(event.message));
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('[GlobalUnhandledRejection]', event.reason);
  showFatalError(event.reason instanceof Error ? event.reason : new Error(String(event.reason)));
  event.preventDefault();
});

function showFatalError(err) {
  try {
    const overlay = document.getElementById('fatal-error-overlay');
    if (overlay) {
      overlay.remove();
    }
    const div = document.createElement('div');
    div.id = 'fatal-error-overlay';
    div.style.cssText = [
      'position:fixed',
      'inset:0',
      'background:rgba(0,0,0,0.92)',
      'color:#fff',
      'font-family:monospace',
      'padding:24px',
      'z-index:999999',
      'overflow:auto',
      'white-space:pre-wrap',
    ].join(';');
    const msg = (err && err.stack) ? err.stack : String(err);
    div.textContent = 'Error inesperado:\n\n' + msg + '\n\nEl juego volverá al menú principal.';
    document.body.appendChild(div);
    setTimeout(() => {
      if (window.game && window.game.scenes) {
        window.game.scenes.switchTo('menu');
      }
    }, 1500);
  } catch (_) {
  }
}

const canvas = document.getElementById('game');
const touchContainer = document.getElementById('ui-overlay');

if (!canvas) {
  throw new Error('No se encontró el elemento <canvas id="game"> en el DOM.');
}

const game = new Game(canvas, touchContainer);
game.sprites = new SpriteGenerator();

game.scenes.register('intro', new IntroScene(game));
game.scenes.register('menu', new MainMenuScene(game));
game.scenes.register('saveSlots', new SaveSelectScene(game));
game.scenes.register('charSelect', new CharacterSelectScene(game));
game.scenes.register('nameInput', new NameInputScene(game));
game.scenes.register('options', new OptionsScene(game));
game.scenes.register('worldmap', new WorldMapScene(game));
game.scenes.register('game', new GameScene(game));
game.scenes.register('pause', new PauseScene(game));
game.scenes.register('results', new ResultsScene(game));

console.log('[Main] Escenas registradas:', Array.from(game.scenes.scenes.keys()));

try {
  const lastSlotRaw = localStorage.getItem('deutsch_last_slot');
  if (lastSlotRaw !== null) {
    const data = game.save.get(parseInt(lastSlotRaw, 10));
    if (data) {
      game.save.lastSave = data;
      console.log('[Main] Save cargada desde slot', lastSlotRaw, '->', data.name);
    }
  }
} catch (e) {
  console.warn('[Main] No se pudo cargar el último slot:', e);
}

console.log('[Main] Iniciando juego con escena "intro"');
game.start('intro');

if (typeof window !== 'undefined') {
  window.game = game;
  window.DEUTSCH_ABENTEUER = {
    version: '1.0.0',
    build: 'modular',
    author: 'Deutsch Abenteuer Team',
  };
}
