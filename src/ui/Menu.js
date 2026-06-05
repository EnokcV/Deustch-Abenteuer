export class Menu {
  constructor(game) {
    this.game = game;
    this.font = game.font;
    this.ctx = game.engine.ctx;
    this.items = [];
    this.selected = 0;
  }

  update(dt) {
    if (this.game.input.wasPressed('w') || this.game.input.wasPressed('arrowup')) {
      this.selected = (this.selected - 1 + this.items.length) % this.items.length;
      this.game.audio.playSFX('blip');
    }
    if (this.game.input.wasPressed('s') || this.game.input.wasPressed('arrowdown')) {
      this.selected = (this.selected + 1) % this.items.length;
      this.game.audio.playSFX('blip');
    }
  }

  renderBackground(title) {
    const ctx = this.ctx;
    const grd = ctx.createLinearGradient(0, 0, 0, 240);
    grd.addColorStop(0, '#0a0a2a');
    grd.addColorStop(0.5, '#1a2a5a');
    grd.addColorStop(1, '#0a0a2a');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, 320, 240);
    for (let i = 0; i < 30; i++) {
      const x = (i * 73) % 320;
      const y = (i * 41) % 240;
      const blink = (i + Math.floor(performance.now() / 200)) % 3 === 0;
      ctx.fillStyle = blink ? '#fff' : '#aaa';
      ctx.fillRect(x, y, 1, 1);
    }
    if (title) {
      const tw = this.font.textWidth(title, 2);
      this.font.drawText(title, (320 - tw) / 2, 18, '#ff0', 2);
    }
  }

  renderMenuItems() {
    const ctx = this.ctx;
    for (let i = 0; i < this.items.length; i++) {
      const y = 80 + i * 22;
      const isSel = i === this.selected;
      if (isSel) {
        ctx.fillStyle = 'rgba(255,200,50,0.2)';
        ctx.fillRect(50, y - 2, 220, 18);
        ctx.strokeStyle = '#ff0';
        ctx.strokeRect(50.5, y - 1.5, 219, 17);
      }
      const color = isSel ? '#ff0' : '#fff';
      this.font.drawText(this.items[i].label, 80, y + 2, color, 1);
      if (this.items[i].value !== undefined) {
        const val = String(this.items[i].value);
        this.font.drawText(val, 240, y + 2, '#aaa', 1);
      }
    }
  }

  isConfirmed() {
    return this.game.input.wasPressed('enter') || this.game.input.wasPressed(' ');
  }
}
