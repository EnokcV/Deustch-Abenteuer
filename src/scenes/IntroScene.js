import { CHARACTERS } from '../core/Config.js';

export class IntroScene {
  constructor(game) {
    this.game = game;
    this.font = game.font;
    this.ctx = game.engine.ctx;
    this.timer = 0;
    this.fadeIn = 0;
  }

  enter() {
    this.timer = 0;
    this.fadeIn = 0;
    console.log('[Intro] enter()');
    try {
      this.game.audio.init();
      this.game.audio.resume();
      this.game.audio.playErika();
    } catch (e) {
      console.warn('[Intro] Audio no disponible:', e);
    }
  }

  update(dt) {
    try {
      this.timer += dt;
      this.fadeIn = Math.min(1, this.timer / 1.5);
      if (this.timer > 1.5) {
        const blink = Math.floor(this.timer * 2) % 2 === 0;
        if (blink && this.game.input.wasPressed('enter')) {
          this.game.audio.playSFX('select');
          this.game.scenes.switchTo('menu');
        }
      }
    } catch (e) {
      console.error('[Intro] Error en update():', e);
    }
  }

  render() {
    try {
      const ctx = this.ctx;
      const grd = ctx.createLinearGradient(0, 0, 0, 240);
      grd.addColorStop(0, '#1a1a3a');
      grd.addColorStop(0.5, '#3a2a5a');
      grd.addColorStop(1, '#1a1a3a');
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, 320, 240);
      for (let i = 0; i < 50; i++) {
        const x = (i * 73 + this.timer * 10) % 320;
        const y = (i * 41 + this.timer * 5) % 240;
        ctx.fillStyle = '#fff';
        ctx.fillRect(x, y, 1, 1);
      }
      const charIds = CHARACTERS.map(c => c.id);
      const charNames = CHARACTERS.map(c => c.name[this.game.l10n.langCode.toLowerCase() === 'de' ? 'de' : 'es']);
      for (let i = 0; i < charIds.length; i++) {
        const sp = this.game.sprites.getSheet(charIds[i]);
        const x = 40 + i * 60;
        const y = 100 + Math.sin(this.timer * 2 + i) * 3;
        if (sp) ctx.drawImage(sp, 0, 0, 16, 24, x, y, 16 * 2, 24 * 2);
        this.font.drawText(charNames[i] || charIds[i], x + 4, y + 50, '#fff', 1);
      }
      const tw = this.font.textWidth(this.game.l10n.t('title'), 3);
      this.font.drawText(this.game.l10n.t('title'), (320 - tw) / 2, 30, '#ff0', 3);
      const sw = this.font.textWidth(this.game.l10n.t('subtitle'), 1);
      this.font.drawText(this.game.l10n.t('subtitle'), (320 - sw) / 2, 60, '#fff', 1);
      const blink = Math.floor(this.timer * 2) % 2 === 0;
      if (blink && this.timer > 1.5) {
        const pw = this.font.textWidth(this.game.l10n.t('introStart'), 1);
        this.font.drawText(this.game.l10n.t('introStart'), (320 - pw) / 2, 200, '#aaa', 1);
      }
    } catch (e) {
      console.error('[Intro] Error en render():', e);
    }
  }
}
