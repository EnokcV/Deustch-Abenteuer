export class NPC {
  constructor(game, data) {
    this.game = game;
    this.name = data.name;
    this.x = data.x;
    this.y = data.y;
    this.dir = data.dir ?? 0;
    this.type = data.type;
    this.lesson = data.lesson;
    this.sprite = data.sprite;
    this.msg = data.msg || [];
    this.secondary = data.secondary;
    this.w = 12;
    this.h = 14;
    this.bobTimer = Math.random() * Math.PI * 2;
    this.iconCooldown = 0;
  }

  update(dt) {
    this.bobTimer += dt * 2;
    if (this.iconCooldown > 0) this.iconCooldown -= dt;
  }

  isAdjacent(player) {
    const dx = Math.abs((player.x + player.w / 2) - (this.x + this.w / 2));
    const dy = Math.abs((player.y + player.h / 2) - (this.y + this.h / 2));
    return dx < 20 && dy < 20;
  }

  render(ctx, camX, camY, spriteSheet) {
    const bob = Math.sin(this.bobTimer) * 0.5;
    const px = Math.floor(this.x - camX);
    const py = Math.floor(this.y - camY + bob);
    if (spriteSheet) {
      ctx.drawImage(spriteSheet, this.dir * 64, 0, 16, 24, px, py, 16, 24);
    } else {
      ctx.fillStyle = '#0f0';
      ctx.fillRect(px, py, 12, 14);
    }
    if (this.iconCooldown > 0) {
      const blink = Math.sin(this.iconCooldown * 8) > 0;
      if (blink) {
        ctx.fillStyle = '#ff0';
        ctx.font = '8px monospace';
        ctx.fillText('!', px + 6, py - 4);
      }
    }
  }

  renderIcon(ctx, camX, camY) {
    const bob = Math.sin(this.bobTimer) * 0.5;
    const px = Math.floor(this.x - camX + 4);
    const py = Math.floor(this.y - camY + bob - 6);
    ctx.fillStyle = '#ff0';
    ctx.fillRect(px, py, 8, 8);
    ctx.fillStyle = '#000';
    ctx.fillRect(px + 1, py + 1, 6, 6);
    ctx.fillStyle = '#fff';
    ctx.fillRect(px + 3, py + 2, 1, 1);
    ctx.fillRect(px + 4, py + 2, 1, 1);
  }
}
