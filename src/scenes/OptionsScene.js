export class OptionsScene {
  constructor(game) {
    this.game = game;
    this.font = game.font;
    this.ctx = game.engine.ctx;
    this.selected = 0;
  }

  enter() {}

  exit() {}

  update(dt) {
    if (this.game.input.wasPressed('w') || this.game.input.wasPressed('arrowup')) {
      this.selected = (this.selected - 1 + 4) % 4;
      this.game.audio.playSFX('blip');
    }
    if (this.game.input.wasPressed('s') || this.game.input.wasPressed('arrowdown')) {
      this.selected = (this.selected + 1) % 4;
      this.game.audio.playSFX('blip');
    }
    if (this.game.input.wasPressed('a') || this.game.input.wasPressed('arrowleft')) {
      this.adjust(-1);
    }
    if (this.game.input.wasPressed('d') || this.game.input.wasPressed('arrowright')) {
      this.adjust(1);
    }
    if (this.game.input.wasPressed('escape')) {
      this.game.audio.playSFX('select');
      this.game.scenes.switchTo('menu');
    }
  }

  adjust(dir) {
    this.game.audio.playSFX('blip');
    if (this.selected === 0) {
      this.game.audio.setMusicVol(Math.max(0, Math.min(1, this.game.audio.musicVol + dir * 0.1)));
    } else if (this.selected === 1) {
      this.game.audio.setSfxVol(Math.max(0, Math.min(1, this.game.audio.sfxVol + dir * 0.1)));
    } else if (this.selected === 2) {
      this.game.l10n.set(this.game.l10n.lang === 'DE' ? 'ES' : 'DE');
    }
  }

  render() {
    const ctx = this.ctx;
    ctx.fillStyle = '#1a1a3a';
    ctx.fillRect(0, 0, 320, 240);
    const tw = this.font.textWidth(this.game.l10n.t('options'), 2);
    this.font.drawText(this.game.l10n.t('options'), (320 - tw) / 2, 20, '#ff0', 2);
    const items = [
      { label: this.game.l10n.t('music'), value: Math.round(this.game.audio.musicVol * 100) + '%' },
      { label: this.game.l10n.t('sfx'), value: Math.round(this.game.audio.sfxVol * 100) + '%' },
      { label: this.game.l10n.t('language'), value: this.game.l10n.lang },
      { label: '[ESC] ' + this.game.l10n.t('back'), value: '' },
    ];
    for (let i = 0; i < items.length; i++) {
      const y = 80 + i * 28;
      const isSel = i === this.selected;
      if (isSel) {
        ctx.fillStyle = 'rgba(255,200,50,0.2)';
        ctx.fillRect(40, y - 4, 240, 22);
      }
      this.font.drawText(items[i].label, 60, y, isSel ? '#ff0' : '#fff', 1);
      if (items[i].value) this.font.drawText(items[i].value, 240, y, '#aaa', 1);
    }
  }
}
