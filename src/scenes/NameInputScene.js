import { LOCALIZATION, getT } from '../data/localization.js';

const MAX_LEN = 12;

export class NameInputScene {
  constructor(game) {
    this.game = game;
    this.font = game.font;
    this.ctx = game.engine.ctx;
    this.text = '';
    this.errorMsg = null;
    this.errorTimer = 0;
    this._kd = (e) => this._onKey(e);
    this._attached = false;
  }

  enter() {
    this.text = '';
    this.errorMsg = null;
    this.errorTimer = 0;
    if (this._attached) return;
    window.addEventListener('keydown', this._kd, true);
    this._attached = true;
    console.log('[NameInput] enter() -> listener keydown en window (capture)');
  }

  exit() {
    if (this._attached) {
      window.removeEventListener('keydown', this._kd, true);
      this._attached = false;
      console.log('[NameInput] exit() -> listener keydown removido');
    }
  }

  _lang() {
    return (this.game.l10n && this.game.l10n.lang) || 'DE';
  }

  _t(key) {
    try {
      return this.game.l10n ? this.game.l10n.t(key) : (LOCALIZATION[this._lang()]?.[key] || LOCALIZATION.DE[key] || key);
    } catch (_) {
      return getT(this._lang(), key);
    }
  }

  _onKey(e) {
    if (!e || !e.key) return;
    if (e.key === 'Backspace') {
      if (this.text.length > 0) {
        this.text = this.text.slice(0, -1);
        this.errorMsg = null;
        try { this.game.audio.playSFX('blip'); } catch (_) {}
      }
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      this._tryConfirm();
      return;
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      try {
        this.game.audio.playSFX('select');
        this.game.scenes.switchTo('charSelect', { mode: 'new' });
      } catch (err) {
        console.error('[NameInput] Error al volver a charSelect:', err);
      }
      return;
    }
    if (e.key.length === 1) {
      const c = e.key;
      if (/[a-zA-Z0-9 äöüÄÖÜßáéíóúÁÉÍÓÚñÑ]/.test(c) && this.text.length < MAX_LEN) {
        this.text += c;
        this.errorMsg = null;
        try { this.game.audio.playSFX('blip'); } catch (_) {}
      }
      e.preventDefault();
      e.stopPropagation();
    }
  }

  _tryConfirm() {
    const name = (this.text || '').trim();
    console.log('[NameInput] Confirm pressed | name="' + name + '" | len=' + name.length);
    if (name.length === 0) {
      this.errorMsg = this._lang() === 'ES'
        ? 'Por favor, introduce un nombre.'
        : 'Bitte gib einen Namen ein.';
      this.errorTimer = 3;
      try { this.game.audio.playSFX('wrong'); } catch (_) {}
      console.warn('[NameInput] Nombre vacío -> se muestra mensaje de error.');
      return;
    }

    const slot = (typeof this.game.pendingSaveSlot === 'number')
      ? this.game.pendingSaveSlot
      : 0;
    const avatar = (typeof this.game.pendingCharId === 'string' && this.game.pendingCharId.length > 0)
      ? this.game.pendingCharId
      : 'enoc';

    console.log('[NameInput] Datos -> slot=' + slot + ' avatar=' + avatar + ' name="' + name + '"');

    let data;
    try {
      data = this.game.save.newData(name, avatar);
    } catch (e) {
      console.error('[NameInput] Error generando save data:', e);
      this.errorMsg = this._lang() === 'ES' ? 'Error al crear partida.' : 'Fehler beim Erstellen.';
      this.errorTimer = 3;
      return;
    }

    const ok = this.game.save.set(slot, data);
    if (!ok) {
      console.error('[NameInput] No se pudo guardar la partida en localStorage');
      this.errorMsg = this._lang() === 'ES'
        ? 'No se pudo guardar (modo privado?).'
        : 'Speichern fehlgeschlagen (Privater Modus?).';
      this.errorTimer = 3;
      return;
    }

    try {
      this.game.save.setLastSlot(slot);
    } catch (_) {}

    try {
      this.game.audio.playSFX('select');
    } catch (_) {}

    console.log('[NameInput] Guardado correcto. Cambiando a escena "game" (Berlin/town).');

    try {
      this.game.scenes.switchTo('game', {
        city: 'berlin',
        scene: 'town',
        x: 60,
        y: 38,
        newSave: true,
      });
    } catch (e) {
      console.error('[NameInput] Error en switchTo(game):', e);
      this.errorMsg = this._lang() === 'ES'
        ? 'Error al cargar el juego.'
        : 'Fehler beim Laden des Spiels.';
      this.errorTimer = 3;
    }
  }

  update(dt) {
    if (this.errorTimer > 0) {
      this.errorTimer -= dt;
      if (this.errorTimer <= 0) this.errorMsg = null;
    }

    if (this.game.input.wasPressed('enter')) {
      this._tryConfirm();
    }
    if (this.game.input.wasPressed('escape')) {
      try {
        this.game.audio.playSFX('select');
        this.game.scenes.switchTo('charSelect', { mode: 'new' });
      } catch (e) {
        console.error('[NameInput] Error al volver a charSelect (update):', e);
      }
    }
  }

  render() {
    const ctx = this.ctx;
    ctx.fillStyle = '#1a1a3a';
    ctx.fillRect(0, 0, 320, 240);

    const title = this._t('yourName');
    const tw = this.font.textWidth(title, 2);
    this.font.drawText(title, (320 - tw) / 2, 50, '#ff0', 2);

    ctx.fillStyle = '#fff';
    ctx.fillRect(40, 110, 240, 24);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.strokeRect(40.5, 110.5, 239, 23);

    const display = this.text || '_';
    this.font.drawText(display, 50, 116, '#000', 2);

    if (Math.floor(performance.now() / 300) % 2 === 0) {
      const x = 50 + this.font.textWidth(display, 2) + 2;
      ctx.fillStyle = '#000';
      ctx.fillRect(x, 116, 2, 12);
    }

    this.font.drawText('[' + (this._lang() === 'ES' ? 'Enter' : 'Enter') + '] ' + this._t('confirm'), 100, 180, '#aaa', 1);
    this.font.drawText('[' + (this._lang() === 'ES' ? 'Esc' : 'Esc') + '] ' + this._t('back'), 110, 200, '#888', 1);

    if (this.errorMsg) {
      const w = this.font.textWidth(this.errorMsg, 1) + 16;
      ctx.fillStyle = 'rgba(120,0,0,0.9)';
      ctx.fillRect((320 - w) / 2, 70, w, 14);
      this.font.drawText(this.errorMsg, (320 - w) / 2 + 8, 74, '#fff', 1);
    }
  }
}
