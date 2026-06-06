export class SaveSelectScene {
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
    console.log('[SaveSelect] enter()', this.mode);
    this.game.audio.playErika();
  }

  exit() {}

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
        this.selected = (this.selected - 1 + 3) % 3;
        this.game.audio.playSFX('blip');
      }
      if (this.game.input.wasPressed('d') || this.game.input.wasPressed('arrowright')) {
        this.selected = (this.selected + 1) % 3;
        this.game.audio.playSFX('blip');
      }
      if (this.game.input.wasPressed('escape')) {
        this.game.audio.playSFX('select');
        this.game.scenes.switchTo('menu');
      }
      if (this.game.input.wasPressed('enter')) {
        this.game.audio.playSFX('select');
        if (this.mode === 'new') {
          this.game.pendingSaveSlot = this.selected;
          console.log('[SaveSelect] Slot seleccionado para nueva partida:', this.selected);
          this.game.scenes.switchTo('charSelect', { mode: 'new' });
        } else {
          const save = this.game.save.get(this.selected);
          if (save) {
            console.log('[SaveSelect] Continuando partida en slot', this.selected, '-', save.name);
            this.game.save.lastSave = save;
            this.game.save.setLastSlot(this.selected);
            this.game.scenes.switchTo('game', {
              city: save.lastCity || 'berlin',
              scene: save.lastScene || 'town',
              x: save.lastX || 60,
              y: save.lastY || 38,
            });
          } else {
            console.warn('[SaveSelect] Slot vacío:', this.selected);
            this._setError(this.game.l10n.langCode === 'ES'
              ? 'Slot vacío. Elige otro o crea una partida nueva.'
              : 'Leerer Slot. Wähle einen anderen oder starte ein neues Spiel.');
          }
        }
      }
    } catch (e) {
      console.error('[SaveSelect] Error en update():', e);
    }
  }

  render() {
    try {
      const ctx = this.ctx;
      ctx.fillStyle = '#1a1a3a';
      ctx.fillRect(0, 0, 320, 240);
      const tw = this.font.textWidth(this.game.l10n.t('saveSlot'), 2);
      this.font.drawText(this.game.l10n.t('saveSlot'), (320 - tw) / 2, 20, '#ff0', 2);
      for (let i = 0; i < 3; i++) {
        const x = 20 + i * 100;
        const y = 70;
        const isSel = i === this.selected;
        const save = this.game.save.get(i);
        ctx.fillStyle = isSel ? 'rgba(255,200,50,0.3)' : 'rgba(0,0,0,0.6)';
        ctx.fillRect(x, y, 80, 130);
        ctx.strokeStyle = isSel ? '#ff0' : '#fff';
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 0.5, y + 0.5, 79, 129);
        if (save) {
          const sp = this.game.sprites.getSheet(save.avatar);
          if (sp) ctx.drawImage(sp, 0, 0, 16, 24, x + 32, y + 10, 16, 24);
          this.font.drawText(save.name.substring(0, 8), x + 8, y + 45, '#fff', 1);
          this.font.drawText(this.game.l10n.t(save.world), x + 8, y + 60, '#ff0', 1);
          this.font.drawText('*' + (save.totalStars || 0), x + 8, y + 80, '#fff', 1);
        } else {
          this.font.drawText(this.game.l10n.t('empty'), x + 18, y + 50, '#666', 1);
        }
        this.font.drawText('#' + (i + 1), x + 8, y + 115, '#888', 1);
      }
      const help = this.mode === 'new' ? '[Enter] ' + this.game.l10n.t('newGame') : '[Enter] ' + this.game.l10n.t('continue');
      this.font.drawText(help, 60, 220, '#aaa', 1);

      if (this.errorMsg) {
        const w = this.font.textWidth(this.errorMsg, 1) + 16;
        ctx.fillStyle = 'rgba(120,0,0,0.9)';
        ctx.fillRect((320 - w) / 2, 200, w, 14);
        this.font.drawText(this.errorMsg, (320 - w) / 2 + 8, 204, '#fff', 1);
      }
    } catch (e) {
      console.error('[SaveSelect] Error en render():', e);
    }
  }
}
