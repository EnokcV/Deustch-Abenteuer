export class SaveSelectScene {
  constructor(game) {
    this.game = game;
    this.font = game.font;
    this.ctx = game.engine.ctx;
    this.selected = 0;
    this.mode = 'new';
  }

  enter(params = {}) {
    this.mode = params.mode || 'new';
    this.game.audio.playErika();
  }

  exit() {}

  update(dt) {
    if (this.game.input.wasPressed('a') || this.game.input.wasPressed('arrowleft')) {
      this.selected = (this.selected - 1 + 3) % 3;
      this.game.audio.playSFX('blip');
    }
    if (this.game.input.wasPressed('d') || this.game.input.wasPressed('arrowright')) {
      this.selected = (this.selected + 1) % 3;
      this.game.audio.playSFX('blip');
    }
    if (this.game.input.wasPressed('escape')) {
      this.game.scenes.switchTo('menu');
    }
    if (this.game.input.wasPressed('enter')) {
      this.game.audio.playSFX('select');
      const save = this.game.save.get(this.selected);
      if (this.mode === 'new') {
        this.game.pendingSaveSlot = this.selected;
        this.game.scenes.switchTo('charSelect', { mode: 'new' });
      } else {
        if (save) {
          this.game.save.lastSave = save;
          this.game.scenes.switchTo('game', { city: save.lastCity, scene: save.lastScene, x: save.lastX, y: save.lastY });
        }
      }
    }
  }

  render() {
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
  }
}
