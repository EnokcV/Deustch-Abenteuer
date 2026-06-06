// Minimal node environment shim for game tests.
// Provides a localStorage/sessionStorage shim and basic globals so we can
// test SaveManager, SceneManager, Engine and NameInputScene without jsdom.

class StorageShim {
  constructor() {
    this._data = new Map();
  }
  getItem(k) { return this._data.has(k) ? this._data.get(k) : null; }
  setItem(k, v) {
    if (arguments.length < 2) throw new TypeError('setItem requires 2 arguments');
    this._data.set(String(k), String(v));
  }
  removeItem(k) { this._data.delete(String(k)); }
  clear() { this._data.clear(); }
  key(i) { return Array.from(this._data.keys())[i] ?? null; }
  get length() { return this._data.size; }
}

globalThis.Storage = StorageShim;
globalThis.localStorage = new StorageShim();
globalThis.sessionStorage = new StorageShim();

// Minimal window/document shim
const noop = () => {};
const _listeners = new Map();
globalThis.window = {
  addEventListener: (event, cb) => { _listeners.set(event, cb); },
  removeEventListener: (event) => { _listeners.delete(event); },
  AudioContext: class {
    constructor() {
      this.state = 'running';
      this.currentTime = 0;
      this.destination = {};
    }
    createGain() { return { gain: { value: 0 }, connect: () => {} }; }
    createOscillator() { return { connect: () => {}, start: () => {}, stop: () => {}, frequency: { value: 0 }, type: '' }; }
    resume() {}
  },
  webkitAudioContext: null,
  innerWidth: 1024,
  innerHeight: 768,
  requestAnimationFrame: () => 0,
};
globalThis.document = {
  addEventListener: noop,
  removeEventListener: noop,
  getElementById: () => null,
  createElement: () => ({ getContext: () => ({}), addEventListener: noop }),
};

// Minimal canvas mock
globalThis.HTMLCanvasElement = class HTMLCanvasElement {};

globalThis.AudioContext = window.AudioContext;

globalThis.performance = globalThis.performance || { now: () => Date.now() };
globalThis.requestAnimationFrame = globalThis.requestAnimationFrame || (() => 0);

globalThis.KeyboardEvent = class KeyboardEvent {
  constructor(type, init = {}) {
    this.type = type;
    this.key = init.key ?? '';
    this.bubbles = !!init.bubbles;
    this.defaultPrevented = false;
  }
  preventDefault() { this.defaultPrevented = true; }
  stopPropagation() {}
};

// Suppress noise during tests
globalThis.console = {
  ...console,
  log: () => {},
  warn: () => {},
  info: () => {},
  error: console.error,
};
