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
import { SaveManager } from './core/SaveManager.js';

const canvas = document.getElementById('game');
const touchContainer = document.getElementById('ui-overlay');

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

const lastSlot = localStorage.getItem('deutsch_last_slot');
if (lastSlot !== null) {
  const data = game.save.get(parseInt(lastSlot, 10));
  if (data) game.save.lastSave = data;
}

game.start('intro');

if (typeof window !== 'undefined') {
  window.game = game;
  window.DEUTSCH_ABENTEUER = {
    version: '1.0.0',
    build: 'modular',
    author: 'Deutsch Abenteuer Team',
  };
}
