import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NameInputScene } from '../src/scenes/NameInputScene.js';

const makeGame = () => {
  const pending = {};
  return {
    pending,
    font: { textWidth: () => 0, drawText: () => {} },
    audio: {
      playSFX: vi.fn(),
      playErika: vi.fn(),
    },
    l10n: {
      lang: 'DE',
      langCode: 'DE',
      t: (k) => k,
    },
    input: {
      wasPressed: vi.fn(() => false),
      keys: {},
    },
    save: {
      newData: vi.fn((name, avatar) => ({ name, avatar, ok: true })),
      set: vi.fn(() => true),
      setLastSlot: vi.fn(),
      lastSave: null,
    },
    sprites: { getSheet: () => null },
    engine: { ctx: { fillStyle: '', fillRect: () => {}, strokeStyle: '', lineWidth: 0, strokeRect: () => {} } },
    scenes: { switchTo: vi.fn() },
  };
};

const dispatchKey = (scene, key) => {
  const ev = new KeyboardEvent('keydown', { key, bubbles: true });
  scene._onKey(ev);
  return ev;
};

describe('NameInputScene', () => {
  let game;
  let scene;

  beforeEach(() => {
    game = makeGame();
    scene = new NameInputScene(game);
    scene.enter();
  });

  it('acepta letras y números', () => {
    dispatchKey(scene, 'E');
    dispatchKey(scene, 'n');
    dispatchKey(scene, 'o');
    dispatchKey(scene, 'c');
    dispatchKey(scene, '1');
    expect(scene.text).toBe('Enoc1');
  });

  it('acepta vocales alemanas con diéresis y ñ', () => {
    dispatchKey(scene, 'M');
    dispatchKey(scene, 'ü');
    dispatchKey(scene, 'l');
    dispatchKey(scene, 'l');
    dispatchKey(scene, 'e');
    dispatchKey(scene, 'r');
    expect(scene.text).toBe('Müller');
  });

  it('rechaza caracteres no permitidos', () => {
    dispatchKey(scene, '@');
    dispatchKey(scene, '#');
    dispatchKey(scene, '!');
    expect(scene.text).toBe('');
  });

  it('respeta el límite de 12 caracteres', () => {
    for (let i = 0; i < 20; i++) {
      dispatchKey(scene, 'a');
    }
    expect(scene.text.length).toBe(12);
  });

  it('backspace borra el último carácter', () => {
    dispatchKey(scene, 'E');
    dispatchKey(scene, 'n');
    dispatchKey(scene, 'o');
    dispatchKey(scene, 'c');
    dispatchKey(scene, 'Backspace');
    expect(scene.text).toBe('Eno');
  });

  it('backspace no hace nada si está vacío', () => {
    dispatchKey(scene, 'Backspace');
    expect(scene.text).toBe('');
  });

  it('Enter con nombre vacío NO avanza de escena y muestra error', () => {
    dispatchKey(scene, 'Enter');
    expect(game.scenes.switchTo).not.toHaveBeenCalled();
    expect(scene.errorMsg).toBeTruthy();
  });

  it('Enter con nombre válido guarda y avanza a GameScene', () => {
    dispatchKey(scene, 'E');
    dispatchKey(scene, 'n');
    dispatchKey(scene, 'o');
    dispatchKey(scene, 'c');
    dispatchKey(scene, 'Enter');
    expect(game.save.set).toHaveBeenCalled();
    expect(game.save.setLastSlot).toHaveBeenCalled();
    expect(game.scenes.switchTo).toHaveBeenCalledWith('game', expect.objectContaining({ city: 'berlin' }));
  });

  it('Enter usa pendingCharId como avatar', () => {
    game.pendingCharId = 'max';
    dispatchKey(scene, 'E');
    dispatchKey(scene, 'n');
    dispatchKey(scene, 'o');
    dispatchKey(scene, 'c');
    dispatchKey(scene, 'Enter');
    expect(game.save.set).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ avatar: 'max' }));
  });

  it('Enter usa pendingSaveSlot como slot', () => {
    game.pendingSaveSlot = 2;
    dispatchKey(scene, 'E');
    dispatchKey(scene, 'n');
    dispatchKey(scene, 'o');
    dispatchKey(scene, 'c');
    dispatchKey(scene, 'Enter');
    expect(game.save.set).toHaveBeenCalledWith(2, expect.any(Object));
    expect(game.save.setLastSlot).toHaveBeenCalledWith(2);
  });

  it('Enter usa slot 0 si pendingSaveSlot no es un número', () => {
    game.pendingSaveSlot = 'foo';
    dispatchKey(scene, 'E');
    dispatchKey(scene, 'n');
    dispatchKey(scene, 'o');
    dispatchKey(scene, 'c');
    dispatchKey(scene, 'Enter');
    expect(game.save.set).toHaveBeenCalledWith(0, expect.any(Object));
  });

  it('Enter usa "enoc" como avatar por defecto si pendingCharId es inválido', () => {
    game.pendingCharId = undefined;
    dispatchKey(scene, 'E');
    dispatchKey(scene, 'n');
    dispatchKey(scene, 'o');
    dispatchKey(scene, 'c');
    dispatchKey(scene, 'Enter');
    expect(game.save.set).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ avatar: 'enoc' }));
  });

  it('muestra error si el guardado falla', () => {
    game.save.set.mockReturnValue(false);
    dispatchKey(scene, 'E');
    dispatchKey(scene, 'n');
    dispatchKey(scene, 'o');
    dispatchKey(scene, 'c');
    dispatchKey(scene, 'Enter');
    expect(game.scenes.switchTo).not.toHaveBeenCalled();
    expect(scene.errorMsg).toBeTruthy();
  });

  it('Escape vuelve a charSelect', () => {
    dispatchKey(scene, 'Escape');
    expect(game.scenes.switchTo).toHaveBeenCalledWith('charSelect', expect.objectContaining({ mode: 'new' }));
  });

  it('llama a preventDefault en todas las teclas', () => {
    const ev1 = dispatchKey(scene, 'a');
    const ev2 = dispatchKey(scene, 'Backspace');
    const ev3 = dispatchKey(scene, 'Enter');
    expect(ev1.defaultPrevented).toBe(true);
    expect(ev2.defaultPrevented).toBe(true);
    expect(ev3.defaultPrevented).toBe(true);
  });

  it('exit() remueve el listener', () => {
    scene.exit();
    expect(scene._attached).toBe(false);
  });

  it('enter() no duplica el listener', () => {
    scene.enter();
    scene.enter();
    expect(scene._attached).toBe(true);
  });

  it('update() con wasPressed("enter") llama a _tryConfirm', () => {
    game.input.wasPressed.mockImplementation((k) => k === 'enter');
    scene.text = 'Enoc';
    scene.update(0.016);
    expect(game.scenes.switchTo).toHaveBeenCalledWith('game', expect.any(Object));
  });

  it('update() con wasPressed("escape") vuelve a charSelect', () => {
    game.input.wasPressed.mockImplementation((k) => k === 'escape');
    scene.update(0.016);
    expect(game.scenes.switchTo).toHaveBeenCalledWith('charSelect', expect.any(Object));
  });

  it('render() no lanza con estado vacío', () => {
    expect(() => scene.render()).not.toThrow();
  });

  it('render() no lanza con texto y error', () => {
    scene.text = 'Enoc';
    scene.errorMsg = 'test error';
    expect(() => scene.render()).not.toThrow();
  });
});
