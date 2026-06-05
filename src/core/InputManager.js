export class InputManager {
  constructor(target = window, touchContainer = null) {
    this.target = target;
    this.keys = {};
    this.pressed = {};
    this.justReleased = {};
    this.touchKeys = {};
    this.touchContainer = touchContainer;

    this._kd = (e) => this._onKeyDown(e);
    this._ku = (e) => this._onKeyUp(e);
    target.addEventListener('keydown', this._kd);
    target.addEventListener('keyup', this._ku);

    if (touchContainer) {
      this._setupTouch();
    }
  }

  _normalizeKey(e) {
    const k = e.key.toLowerCase();
    if (k === 'arrowup') return 'w';
    if (k === 'arrowdown') return 's';
    if (k === 'arrowleft') return 'a';
    if (k === 'arrowright') return 'd';
    if (k === ' ') return 'enter';
    return k;
  }

  _onKeyDown(e) {
    const k = this._normalizeKey(e);
    if (e.key === 'Escape') {
      if (!this.keys['escape']) this.pressed['escape'] = true;
      this.keys['escape'] = true;
    }
    if (!this.keys[k]) this.pressed[k] = true;
    this.keys[k] = true;
    if (['w', 'a', 's', 'd', 'enter', 'escape', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(k)) {
      e.preventDefault();
    }
  }

  _onKeyUp(e) {
    const k = this._normalizeKey(e);
    this.keys[k] = false;
    this.justReleased[k] = true;
  }

  _setupTouch() {
    const btns = this.touchContainer.querySelectorAll('button[data-key]');
    btns.forEach((btn) => {
      const k = btn.dataset.key;
      const start = (e) => {
        e.preventDefault();
        if (!this.keys[k]) this.pressed[k] = true;
        this.keys[k] = true;
      };
      const end = (e) => {
        e.preventDefault();
        this.keys[k] = false;
        this.justReleased[k] = true;
      };
      btn.addEventListener('touchstart', start, { passive: false });
      btn.addEventListener('touchend', end, { passive: false });
      btn.addEventListener('touchcancel', end, { passive: false });
      btn.addEventListener('mousedown', start);
      btn.addEventListener('mouseup', end);
      btn.addEventListener('mouseleave', end);
    });
  }

  isDown(...keys) {
    return keys.some((k) => this.keys[k]);
  }

  wasPressed(k) {
    if (this.pressed[k]) {
      this.pressed[k] = false;
      return true;
    }
    return false;
  }

  endFrame() {
    this.pressed = {};
    this.justReleased = {};
  }

  destroy() {
    this.target.removeEventListener('keydown', this._kd);
    this.target.removeEventListener('keyup', this._ku);
  }
}
