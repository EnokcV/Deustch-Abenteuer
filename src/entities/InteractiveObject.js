export class InteractiveObject {
  constructor(data) {
    this.type = data.type;
    this.x = data.x;
    this.y = data.y;
    this.w = data.w || 16;
    this.h = data.h || 16;
    this.text = data.text;
    this.textDe = data.textDe;
    this.textEs = data.textEs;
    this.bob = Math.random() * Math.PI * 2;
  }

  update(dt) { this.bob += dt * 2; }

  isAdjacent(player) {
    const dx = Math.abs((player.x + player.w / 2) - (this.x + this.w / 2));
    const dy = Math.abs((player.y + player.h / 2) - (this.y + this.h / 2));
    return dx < 18 && dy < 22;
  }

  render(ctx, camX, camY) {
    const bob = Math.sin(this.bob) * 0.5;
    const px = Math.floor(this.x - camX);
    const py = Math.floor(this.y - camY + bob);
    switch (this.type) {
      case 'sign':
        ctx.fillStyle = '#5a3a1a';
        ctx.fillRect(px + 6, py + 4, 2, 12);
        ctx.fillStyle = '#8a5a2a';
        ctx.fillRect(px, py, 14, 6);
        ctx.fillStyle = '#000';
        ctx.fillRect(px, py, 14, 1);
        ctx.fillRect(px, py + 5, 14, 1);
        break;
      case 'bench':
        ctx.fillStyle = '#5a3a1a';
        ctx.fillRect(px + 1, py + 8, 14, 3);
        ctx.fillRect(px + 2, py + 11, 2, 4);
        ctx.fillRect(px + 12, py + 11, 2, 4);
        break;
      case 'lamp':
        ctx.fillStyle = '#3a3a3a';
        ctx.fillRect(px + 7, py + 4, 2, 12);
        ctx.fillStyle = '#ffe080';
        ctx.fillRect(px + 4, py, 8, 6);
        ctx.fillStyle = '#000';
        ctx.fillRect(px + 5, py + 1, 6, 4);
        break;
      case 'trash':
        ctx.fillStyle = '#2a4a2a';
        ctx.fillRect(px + 3, py + 4, 10, 12);
        ctx.fillStyle = '#1a3a1a';
        ctx.fillRect(px + 3, py + 4, 10, 1);
        break;
      case 'flower':
        ctx.fillStyle = '#3a6a1a';
        ctx.fillRect(px + 7, py + 6, 2, 10);
        ctx.fillStyle = '#e84a8a';
        for (let i = 0; i < 5; i++) {
          ctx.fillRect(px + 6 + (i % 3) * 2, py + 2 + Math.floor(i / 3) * 2, 2, 2);
        }
        break;
      case 'bookshelf':
        ctx.fillStyle = '#5a3a1a';
        ctx.fillRect(px, py, 16, 16);
        ctx.fillStyle = '#3a5a8a';
        ctx.fillRect(px + 1, py + 1, 6, 6);
        ctx.fillStyle = '#aa3a3a';
        ctx.fillRect(px + 8, py + 1, 6, 6);
        ctx.fillStyle = '#3a8a5a';
        ctx.fillRect(px + 1, py + 8, 6, 6);
        ctx.fillStyle = '#d0a040';
        ctx.fillRect(px + 8, py + 8, 6, 6);
        break;
      case 'table':
        ctx.fillStyle = '#5a3a1a';
        ctx.fillRect(px, py + 6, 16, 4);
        ctx.fillRect(px + 1, py + 10, 2, 6);
        ctx.fillRect(px + 13, py + 10, 2, 6);
        break;
      case 'painting':
        ctx.fillStyle = '#3a2a1a';
        ctx.fillRect(px, py, 16, 16);
        ctx.fillStyle = '#aa8a5a';
        ctx.fillRect(px + 1, py + 1, 14, 14);
        ctx.fillStyle = '#d0a040';
        ctx.fillRect(px + 6, py + 5, 4, 6);
        break;
      case 'candle':
        ctx.fillStyle = '#fff0c0';
        ctx.fillRect(px + 7, py + 2, 2, 6);
        ctx.fillStyle = '#e8c890';
        ctx.fillRect(px + 5, py + 8, 6, 4);
        break;
      case 'crate':
        ctx.fillStyle = '#7a5a2a';
        ctx.fillRect(px + 1, py + 2, 14, 12);
        ctx.fillStyle = '#5a3a1a';
        ctx.fillRect(px + 1, py + 2, 14, 1);
        ctx.fillRect(px + 1, py + 13, 14, 1);
        ctx.fillRect(px + 7, py + 2, 2, 12);
        break;
      case 'barrel':
        ctx.fillStyle = '#7a4a1a';
        ctx.fillRect(px + 2, py + 1, 12, 14);
        ctx.fillStyle = '#5a2a0a';
        ctx.fillRect(px + 2, py + 4, 12, 1);
        ctx.fillRect(px + 2, py + 11, 12, 1);
        break;
      case 'plant':
        ctx.fillStyle = '#3a2a1a';
        ctx.fillRect(px + 3, py + 10, 10, 6);
        ctx.fillStyle = '#3a8a2a';
        ctx.fillRect(px + 5, py + 2, 6, 8);
        ctx.fillRect(px + 3, py + 4, 10, 6);
        break;
      case 'phone':
        ctx.fillStyle = '#aa3a3a';
        ctx.fillRect(px + 5, py + 2, 6, 10);
        ctx.fillStyle = '#000';
        ctx.fillRect(px + 6, py + 3, 4, 6);
        break;
      case 'atm':
        ctx.fillStyle = '#5a5a6a';
        ctx.fillRect(px + 2, py + 1, 12, 14);
        ctx.fillStyle = '#3a8a3a';
        ctx.fillRect(px + 4, py + 3, 8, 4);
        ctx.fillStyle = '#000';
        ctx.fillRect(px + 4, py + 9, 8, 2);
        break;
      case 'beer':
        ctx.fillStyle = '#d0a040';
        ctx.fillRect(px + 5, py + 2, 6, 12);
        ctx.fillStyle = '#fff';
        ctx.fillRect(px + 5, py + 6, 6, 3);
        break;
      case 'pretzel':
        ctx.fillStyle = '#a06020';
        ctx.beginPath();
        ctx.arc(px + 8, py + 8, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#7a4010';
        ctx.beginPath();
        ctx.arc(px + 8, py + 8, 3, 0, Math.PI * 2);
        ctx.fill();
        break;
    }
  }

  renderIcon(ctx, camX, camY) {
    if (this.type !== 'sign') return;
    const bob = Math.sin(this.bob) * 0.5;
    const px = Math.floor(this.x - camX + 4);
    const py = Math.floor(this.y - camY + bob - 4);
    ctx.fillStyle = '#fff';
    ctx.fillRect(px, py, 8, 8);
    ctx.fillStyle = '#000';
    ctx.fillRect(px + 1, py + 1, 6, 6);
    ctx.fillStyle = '#fff';
    ctx.fillRect(px + 3, py + 3, 2, 1);
  }
}
