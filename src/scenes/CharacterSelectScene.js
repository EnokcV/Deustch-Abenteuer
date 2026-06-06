import { CHARACTERS } from '../core/Config.js';

export class CharacterSelectScene {
  constructor(game) {
    this.game = game;
    this.font = game.font;
    this.ctx = game.engine.ctx;
    this.selected = 0;
    this.mode = 'new';
    this.errorMsg = null;
    this.errorTimer = 0;
  }

  enter(params = {}) {
    this.mode = params.mode || 'new';
    this.errorMsg = null;
    this.errorTimer = 0;
    console.log('[CharSelect] enter()', this.mode);
  }

  exit() {
    console.log('[CharSelect] exit()');
  }

  _setError(msg) {
    this.errorMsg = msg;
    this.errorTimer = 2.5;
  }

  update(dt) {
    if (this.errorTimer > 0) {
      this.errorTimer -= dt;
      if (this.errorTimer <= 0) this.errorMsg = null;
    }

    try {
      if (this.game.input.wasPressed('a') || this.game.input.wasPressed('arrowleft')) {
        this.selected = (this.selected - 1 + CHARACTERS.length) % CHARACTERS.length;
        this.game.audio.playSFX('blip');
      }
      if (this.game.input.wasPressed('d') || this.game.input.wasPressed('arrowright')) {
        this.selected = (this.selected + 1) % CHARACTERS.length;
        this.game.audio.playSFX('blip');
      }
      if (this.game.input.wasPressed('escape')) {
        this.game.audio.playSFX('select');
        this.game.scenes.switchTo('saveSlots', { mode: this.mode });
      }
      if (this.game.input.wasPressed('enter')) {
        const ch = CHARACTERS[this.selected];
        if (!ch || !ch.id) {
          console.error('[CharSelect] Personaje inválido en índice', this.selected);
          this._setError('Personaje no disponible.');
          return;
        }
        console.log('[CharSelect] Personaje elegido:', ch.id);
        this.game.audio.playSFX('select');
        this.game.pendingCharId = ch.id;
        this.game.scenes.switchTo('nameInput', { mode: this.mode });
      }
    } catch (e) {
      console.error('[CharSelect] Error en update():', e);
    }
  }

  render() {
    try {
      const ctx = this.ctx;
      ctx.fillStyle = '#1a1a3a';
      ctx.fillRect(0, 0, 320, 240);
      const tw = this.font.textWidth(this.game.l10n.t('chooseChar'), 2);
      this.font.drawText(this.game.l10n.t('chooseChar'), (320 - tw) / 2, 18, '#ff0', 2);
      for (let i = 0; i < CHARACTERS.length; i++) {
        const ch = CHARACTERS[i];
        const x = 30 + i * 70;
        const y = 70;
        const isSel = i === this.selected;
        ctx.fillStyle = isSel ? 'rgba(255,200,50,0.3)' : 'rgba(0,0,0,0.5)';
        ctx.fillRect(x, y, 60, 130);
        ctx.strokeStyle = isSel ? '#ff0' : '#666';
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 0.5, y + 0.5, 59, 129);
        const sp = this.game.sprites.getSheet(ch.id);
        if (sp) {
          const bob = Math.sin(performance.now() / 300) * 2;
          ctx.drawImage(sp, 0, 0, 16, 24, x + 22, y + 20 + bob, 16 * 2, 24 * 2);
        }
        this.font.drawText(ch.name[this.game.l10n.langCode.toLowerCase()] || ch.id, x + 12, y + 80, isSel ? '#ff0' : '#fff', 1);
      }
      this.font.drawText('[Enter] ' + this.game.l10n.t('confirm'), 90, 220, '#aaa', 1);
      this.font.drawText('[Esc] ' + this.game.l10n.t('back'), 110, 230, '#666', 1);

      if (this.errorMsg) {
        const w = this.font.textWidth(this.errorMsg, 1) + 16;
        this.ctx.fillStyle = 'rgba(120,0,0,0.9)';
        this.ctx.fillRect((320 - w) / 2, 50, w, 14);
        this.font.drawText(this.errorMsg, (320 - w) / 2 + 8, 54, '#fff', 1);
      }
    } catch (e) {
      console.error('[CharSelect] Error en render():', e);
    }
  }
}
