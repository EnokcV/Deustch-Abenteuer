export class HUD {
  constructor(game) {
    this.game = game;
    this.font = game.font;
  }

  drawPlayerBar(player, cityName, vocabScore) {
    const ctx = this.game.engine.ctx;
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(0, 0, 320, 14);
    const sprite = this.game.sprites.getSheet(player.id || 'enoc');
    if (sprite) ctx.drawImage(sprite, 0, 0, 16, 16, 2, -1, 16, 16);
    this.font.drawText(this.game.save.lastSave?.name || 'Spieler', 22, 3, '#fff', 1);
    this.font.drawText(cityName, 90, 3, '#ff0', 1);
    this.font.drawText('*' + (vocabScore || 0), 180, 3, '#fff', 1);
    if (this.game.input.keys['m']) {
      this.font.drawText('MAP', 220, 3, '#0f0', 1);
    }
    this.font.drawText('[M]', 280, 3, '#888', 1);
  }

  drawDialogue(name, msg) {
    const ctx = this.game.engine.ctx;
    ctx.fillStyle = 'rgba(0,0,0,0.85)';
    ctx.fillRect(4, 240 - 56, 312, 52);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.strokeRect(4.5, 240 - 55.5, 311, 51);
    ctx.fillStyle = '#3a3a4a';
    ctx.fillRect(10, 240 - 50, 32, 32);
    this.font.drawText(name, 50, 240 - 50, '#ff0', 1);
    this.font.drawTextWrapped(msg, 50, 240 - 38, '#fff', 1, 260);
    this.font.drawText('[E] weiter', 250, 240 - 10, '#888', 1);
  }

  drawMessage(text) {
    if (!text) return;
    const ctx = this.game.engine.ctx;
    const w = this.font.textWidth(text, 1) + 16;
    ctx.fillStyle = 'rgba(0,0,0,0.85)';
    ctx.fillRect((320 - w) / 2, 80, w, 14);
    this.font.drawText(text, (320 - w) / 2 + 8, 84, '#fff', 1);
  }

  drawMinimap(player, world, worldKey) {
    const ctx = this.game.engine.ctx;
    const W = 60, H = 40;
    const x = 320 - W - 4, y = 240 - H - 4;
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(x, y, W, H);
    ctx.strokeStyle = '#fff';
    ctx.strokeRect(x + 0.5, y + 0.5, W - 1, H - 1);
    const scaleX = W / (world.MAP_W * 16);
    const scaleY = H / (world.MAP_H * 16);
    for (let ty = 0; ty < world.MAP_H; ty++) {
      for (let tx = 0; tx < world.MAP_W; tx++) {
        const t = world.getTile(tx, ty);
        if (t === 1 || t === 14) { ctx.fillStyle = '#5a8530'; ctx.fillRect(x + tx * 16 * scaleX, y + ty * 16 * scaleY, 16 * scaleX, 16 * scaleY); }
        if (t === 2) { ctx.fillStyle = '#5a4530'; ctx.fillRect(x + tx * 16 * scaleX, y + ty * 16 * scaleY, 16 * scaleX, 16 * scaleY); }
        if (t === 4) { ctx.fillStyle = '#3a5a8a'; ctx.fillRect(x + tx * 16 * scaleX, y + ty * 16 * scaleY, 16 * scaleX, 16 * scaleY); }
      }
    }
    ctx.fillStyle = '#ff0';
    ctx.fillRect(x + (player.x + 6) * scaleX - 1, y + (player.y + 6) * scaleY - 1, 3, 3);
  }
}
