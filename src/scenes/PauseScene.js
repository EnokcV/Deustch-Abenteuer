export class PauseScene {
  constructor(game) {
    this.game = game;
    this.font = game.font;
    this.ctx = game.engine.ctx;
    this.selected = 0;
    this.params = null;
  }

  enter(params = {}) {
    this.params = params;
  }

  exit() {}

  update(dt) {
    if (this.game.input.wasPressed('w') || this.game.input.wasPressed('arrowup')) {
      this.selected = (this.selected - 1 + 3) % 3;
      this.game.audio.playSFX('blip');
    }
    if (this.game.input.wasPressed('s') || this.game.input.wasPressed('arrowdown')) {
      this.selected = (this.selected + 1) % 3;
      this.game.audio.playSFX('blip');
    }
    if (this.game.input.wasPressed('escape')) {
      this.game.audio.playSFX('select');
      this.game.scenes.switchTo('game', this.params);
    }
    if (this.game.input.wasPressed('enter')) {
      this.game.audio.playSFX('select');
      if (this.selected === 0) this.game.scenes.switchTo('game', this.params);
      else if (this.selected === 1) {
        this.game.save.lastSave.lastCity = this.params.city;
        this.game.save.lastSave.lastScene = this.params.scene;
        this.game.save.lastSave.lastX = this.params.x;
        this.game.save.lastSave.lastY = this.params.y;
        this.game.save.set(0, this.game.save.lastSave);
        this._showMsg(this.game.l10n.t('save'));
        setTimeout(() => this.game.scenes.switchTo('game', this.params), 600);
      } else if (this.selected === 2) {
        this.game.audio.playErika();
        this.game.scenes.switchTo('menu');
      }
    }
  }

  _showMsg(t) {
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(0, 100, 320, 40);
    const w = this.font.textWidth(t, 2);
    this.font.drawText(t, (320 - w) / 2, 112, '#0f0', 2);
  }

  render() {
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(0, 0, 320, 240);
    ctx.fillStyle = '#1a1a3a';
    ctx.fillRect(40, 60, 240, 140);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.strokeRect(40.5, 60.5, 239, 139);
    const tw = this.font.textWidth(this.game.l10n.t('pause'), 2);
    this.font.drawText(this.game.l10n.t('pause'), (320 - tw) / 2, 75, '#ff0', 2);
    const items = [this.game.l10n.t('resume'), this.game.l10n.t('save'), this.game.l10n.t('quit')];
    for (let i = 0; i < items.length; i++) {
      const y = 110 + i * 22;
      const isSel = i === this.selected;
      this.font.drawText(items[i], 80, y, isSel ? '#ff0' : '#fff', 1);
      if (isSel) {
        ctx.fillStyle = '#ff0';
        ctx.fillRect(64, y + 3, 4, 4);
      }
    }
  }
}
