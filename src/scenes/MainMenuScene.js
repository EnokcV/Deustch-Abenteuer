import { Menu } from '../ui/Menu.js';

export class MainMenuScene {
  constructor(game) {
    this.game = game;
    this.font = game.font;
    this.ctx = game.engine.ctx;
    this.selected = 0;
    this.items = [
      { label: () => this.game.l10n.t('newGame'), action: () => this.goTo('saveSlots', { mode: 'new' }) },
      { label: () => this.game.l10n.t('continue'), action: () => this.goTo('saveSlots', { mode: 'continue' }) },
      { label: () => this.game.l10n.t('options'), action: () => this.goTo('options') },
    ];
  }

  enter() {
    this.game.audio.playErika();
  }

  goTo(id, params) { this.game.scenes.switchTo(id, params); }

  update(dt) {
    if (this.game.input.wasPressed('w') || this.game.input.wasPressed('arrowup')) {
      this.selected = (this.selected - 1 + this.items.length) % this.items.length;
      this.game.audio.playSFX('blip');
    }
    if (this.game.input.wasPressed('s') || this.game.input.wasPressed('arrowdown')) {
      this.selected = (this.selected + 1) % this.items.length;
      this.game.audio.playSFX('blip');
    }
    if (this.game.input.wasPressed('enter')) {
      this.game.audio.playSFX('select');
      this.items[this.selected].action();
    }
  }

  render() {
    const ctx = this.ctx;
    const grd = ctx.createLinearGradient(0, 0, 0, 240);
    grd.addColorStop(0, '#1a1a3a');
    grd.addColorStop(0.5, '#3a2a5a');
    grd.addColorStop(1, '#1a1a3a');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, 320, 240);
    for (let i = 0; i < 40; i++) {
      const x = (i * 53) % 320;
      const y = (i * 31) % 240;
      ctx.fillStyle = '#fff';
      ctx.fillRect(x, y, 1, 1);
    }
    const tw = this.font.textWidth(this.game.l10n.t('title'), 3);
    this.font.drawText(this.game.l10n.t('title'), (320 - tw) / 2, 30, '#ff0', 3);
    const sw = this.font.textWidth(this.game.l10n.t('subtitle'), 1);
    this.font.drawText(this.game.l10n.t('subtitle'), (320 - sw) / 2, 60, '#fff', 1);
    for (let i = 0; i < this.items.length; i++) {
      const y = 100 + i * 28;
      const isSel = i === this.selected;
      if (isSel) {
        ctx.fillStyle = 'rgba(255,200,50,0.25)';
        ctx.fillRect(50, y - 4, 220, 22);
        ctx.strokeStyle = '#ff0';
        ctx.lineWidth = 1;
        ctx.strokeRect(50.5, y - 3.5, 219, 21);
      }
      const color = isSel ? '#ff0' : '#fff';
      const text = this.items[i].label();
      const itemW = this.font.textWidth(text, 2);
      this.font.drawText(text, (320 - itemW) / 2, y, color, 2);
    }
  }
}
