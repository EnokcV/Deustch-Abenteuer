export class NameInputScene {
  constructor(game) {
    this.game = game;
    this.font = game.font;
    this.ctx = game.engine.ctx;
    this.text = '';
    this._kd = (e) => this._onKey(e);
  }

  enter() {
    document.addEventListener('keydown', this._kd);
  }

  exit() {
    document.removeEventListener('keydown', this._kd);
  }

  _onKey(e) {
    if (e.key === 'Backspace') {
      this.text = this.text.slice(0, -1);
      this.game.audio.playSFX('blip');
      e.preventDefault();
      return;
    }
    if (e.key === 'Enter' || e.key === ' ') return;
    if (e.key.length === 1) {
      const c = e.key;
      if (/[a-zA-Z0-9 ]/.test(c) && this.text.length < 12) {
        this.text += c;
        this.game.audio.playSFX('blip');
      }
    }
  }

  update(dt) {
    if (this.game.input.wasPressed('escape')) {
      this.game.scenes.switchTo('charSelect');
    }
    if (this.game.input.wasPressed('enter')) {
      if (this.text.length > 0) {
        this.game.audio.playSFX('select');
        const data = this.game.save.newData(this.text, this.game.pendingCharId || 'enoc');
        this.game.save.set(this.game.pendingSaveSlot, data);
        this.game.save.lastSave = data;
        this.game.scenes.switchTo('game', { city: 'berlin', scene: 'town', x: 4, y: 15, newSave: true });
      }
    }
  }

  render() {
    const ctx = this.ctx;
    ctx.fillStyle = '#1a1a3a';
    ctx.fillRect(0, 0, 320, 240);
    const tw = this.font.textWidth(this.game.l10n.t('yourName'), 2);
    this.font.drawText(this.game.l10n.t('yourName'), (320 - tw) / 2, 50, '#ff0', 2);
    ctx.fillStyle = '#fff';
    ctx.fillRect(40, 110, 240, 24);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.strokeRect(40.5, 110.5, 239, 23);
    this.font.drawText(this.text || '_', 50, 116, '#000', 2);
    if (Math.floor(performance.now() / 300) % 2 === 0) {
      const x = 50 + this.font.textWidth(this.text || '_', 2) + 2;
      ctx.fillStyle = '#000';
      ctx.fillRect(x, 116, 2, 12);
    }
    this.font.drawText('[Enter] ' + this.game.l10n.t('confirm'), 100, 180, '#aaa', 1);
  }
}
