import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Engine } from '../src/core/Engine.js';

const makeCanvas = () => {
  const canvas = {
    width: 320,
    height: 240,
    style: {},
    getContext: () => ({
      fillStyle: '#000',
      fillRect: () => {},
      imageSmoothingEnabled: false,
    }),
  };
  return canvas;
};

describe('Engine', () => {
  let engine;
  let canvas;

  beforeEach(() => {
    canvas = makeCanvas();
    engine = new Engine(canvas);
    engine.running = true;
  });

  afterEach(() => {
    engine.stop();
  });

  it('crea el engine con W=320, H=240', () => {
    expect(engine.W).toBe(320);
    expect(engine.H).toBe(240);
  });

  it('el game loop llama a game.update con dt en segundos', () => {
    let receivedDt = null;
    engine.game = { update: (dt) => { receivedDt = dt; } };
    engine.accumulator = engine.fixedDt;
    engine._loop(performance.now());
    expect(receivedDt).toBeCloseTo(engine.fixedDt / 1000, 5);
  });

  it('el game loop llama a game.render', () => {
    const renderSpy = vi.fn();
    engine.game = { update: () => {}, render: renderSpy };
    engine.accumulator = engine.fixedDt;
    engine._loop(performance.now());
    expect(renderSpy).toHaveBeenCalled();
  });

  it('si game.update lanza, el motor no se detiene', () => {
    const renderSpy = vi.fn();
    engine.game = {
      update: () => { throw new Error('boom'); },
      render: renderSpy,
    };
    engine.accumulator = engine.fixedDt;
    expect(() => engine._loop(performance.now())).not.toThrow();
    expect(renderSpy).toHaveBeenCalled();
  });

  it('si game.render lanza, el motor sigue vivo', () => {
    engine.game = {
      update: () => {},
      render: () => { throw new Error('render boom'); },
    };
    engine.accumulator = engine.fixedDt;
    expect(() => engine._loop(performance.now())).not.toThrow();
    expect(engine.running).toBe(true);
  });

  it('stop() detiene el loop', () => {
    engine.game = { update: () => {}, render: () => {} };
    engine.stop();
    expect(engine.running).toBe(false);
  });
});
