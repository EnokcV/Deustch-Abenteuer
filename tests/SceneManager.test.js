import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SceneManager } from '../src/core/SceneManager.js';

class FakeScene {
  constructor(id, opts = {}) {
    this.id = id;
    this.opts = opts;
    this.enterCalls = 0;
    this.exitCalls = 0;
    this.updateCalls = 0;
    this.renderCalls = 0;
  }
  enter(params) { this.enterCalls++; this.lastParams = params; if (this.opts.throwOnEnter) throw new Error('enter boom'); }
  exit() { this.exitCalls++; if (this.opts.throwOnExit) throw new Error('exit boom'); }
  update(dt) { this.updateCalls++; if (this.opts.throwOnUpdate) throw new Error('update boom'); }
  render(ctx) { this.renderCalls++; if (this.opts.throwOnRender) throw new Error('render boom'); }
}

const makeGame = () => ({
  audio: { playErika: () => {} },
  font: { textWidth: () => 0, drawText: () => {} },
});

describe('SceneManager', () => {
  let sm;
  let game;

  beforeEach(() => {
    game = makeGame();
    sm = new SceneManager(game);
  });

  it('registra escenas', () => {
    const s = new FakeScene('menu');
    sm.register('menu', s);
    expect(sm.scenes.has('menu')).toBe(true);
  });

  it('rechaza argumentos inválidos en register', () => {
    sm.register(null, null);
    expect(sm.scenes.size).toBe(0);
  });

  it('switchTo llama a exit y enter correctamente', () => {
    const a = new FakeScene('a');
    const b = new FakeScene('b');
    sm.register('a', a);
    sm.register('b', b);
    sm.switchTo('a');
    expect(sm.currentId).toBe('a');
    sm.switchTo('b');
    expect(a.exitCalls).toBe(1);
    expect(b.enterCalls).toBe(1);
    expect(sm.currentId).toBe('b');
  });

  it('switchTo a escena inexistente cae al menú', () => {
    const menu = new FakeScene('menu');
    sm.register('menu', menu);
    sm.switchTo('nope');
    expect(sm.currentId).toBe('menu');
  });

  it('switchTo a id inválido (no string) cae al menú', () => {
    const menu = new FakeScene('menu');
    sm.register('menu', menu);
    sm.switchTo(null);
    expect(sm.currentId).toBe('menu');
  });

  it('switchTo con enter que lanza cae al menú', () => {
    const a = new FakeScene('a');
    const broken = new FakeScene('broken', { throwOnEnter: true });
    const menu = new FakeScene('menu');
    sm.register('a', a);
    sm.register('broken', broken);
    sm.register('menu', menu);
    sm.switchTo('a');
    sm.switchTo('broken');
    expect(sm.currentId).toBe('menu');
    expect(menu.enterCalls).toBe(1);
  });

  it('switchTo con exit que lanza no rompe el flujo', () => {
    const a = new FakeScene('a', { throwOnExit: true });
    const b = new FakeScene('b');
    const menu = new FakeScene('menu');
    sm.register('a', a);
    sm.register('b', b);
    sm.register('menu', menu);
    sm.switchTo('a');
    sm.switchTo('b');
    expect(b.enterCalls).toBe(1);
    expect(sm.currentId).toBe('b');
  });

  it('update con excepción no rompe el motor', () => {
    const a = new FakeScene('a', { throwOnUpdate: true });
    const menu = new FakeScene('menu');
    sm.register('a', a);
    sm.register('menu', menu);
    sm.switchTo('a');
    expect(() => sm.update(0.016)).not.toThrow();
  });

  it('render con excepción no rompe el motor', () => {
    const a = new FakeScene('a', { throwOnRender: true });
    const menu = new FakeScene('menu');
    sm.register('a', a);
    sm.register('menu', menu);
    sm.switchTo('a');
    expect(() => sm.render({})).not.toThrow();
  });

  it('switchTo a la misma escena re-llama enter', () => {
    const a = new FakeScene('a');
    sm.register('a', a);
    sm.switchTo('a');
    sm.switchTo('a');
    expect(a.enterCalls).toBe(2);
  });

  it('has() informa de escenas registradas', () => {
    const a = new FakeScene('a');
    sm.register('a', a);
    expect(sm.has('a')).toBe(true);
    expect(sm.has('b')).toBe(false);
  });

  it('fallbackToMenu sin escena menu deja currentId en null', () => {
    sm.fallbackToMenu('test');
    expect(sm.currentId).toBeNull();
  });
});
