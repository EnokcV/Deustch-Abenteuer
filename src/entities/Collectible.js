export class Collectible {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.w = 8;
    this.h = 8;
    this.collected = false;
    this.bob = Math.random() * Math.PI * 2;
  }

  update(dt) { this.bob += dt * 3; }

  isColliding(player) {
    if (this.collected) return false;
    return (
      player.x < this.x + this.w &&
      player.x + player.w > this.x &&
      player.y < this.y + this.h &&
      player.y + player.h > this.y
    );
  }

  render(ctx, camX, camY) {
    if (this.collected) return;
    const bob = Math.sin(this.bob) * 2;
    const px = Math.floor(this.x - camX);
    const py = Math.floor(this.y - camY + bob);
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.arc(px + 4, py + 4, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffec80';
    ctx.fillRect(px + 3, py + 2, 1, 1);
    ctx.fillRect(px + 5, py + 2, 1, 1);
  }
}
