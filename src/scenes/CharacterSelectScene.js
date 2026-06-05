import { CHARACTERS } from '../core/Config.js';

export class CharacterSelectScene {
  constructor(game) {
    this.game = game;
    this.font = game.font;
    this.ctx = game.engine.ctx;
    this.selected = 0;
    this.mode = 'new';
  }

  enter(params = {}) {
    this.mode = params.mode || 'new';
  }

  exit() {}

  update(dt) {
    if (this.game.input.wasPressed('a') || this.game.input.wasPressed('arrowleft')) {
      this.selected = (this.selected - 1 + CHARACTERS.length) % CHARACTERS.length;
      this.game.audio.playSFX('blip');
    }
    if (this.game.input.wasPressed('d') || this.game.input.wasPressed('arrowright')) {
      this.selected = (this.selected + 1) % CHARACTERS.length;
      this.game.audio.playSFX('blip');
    }
    if (this.game.input.wasPressed('escape')) {
      this.game.scenes.switchTo('saveSlots', { mode: this.mode });
    }
    if (this.game.input.wasPressed('enter')) {
      this.game.audio.playSFX('select');
      this.game.pendingCharId = CHARACTERS[this.selected].id;
      this.game.scenes.switchTo('nameInput');
    }
  }

  render() {
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
  }
}
