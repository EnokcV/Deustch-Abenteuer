export class WeatherSystem {
  constructor() {
    this.particles = [];
    this.type = 'none';
  }

  setType(type, intensity = 0.4) {
    this.type = type;
    this.intensity = intensity;
    this.particles = [];
    if (type === 'rain') {
      const n = Math.floor(40 + intensity * 60);
      for (let i = 0; i < n; i++) {
        this.particles.push({
          x: Math.random() * 320,
          y: Math.random() * 240,
          speed: 3 + Math.random() * 4,
          len: 4 + Math.random() * 4,
        });
      }
    } else if (type === 'snow') {
      const n = Math.floor(30 + intensity * 50);
      for (let i = 0; i < n; i++) {
        this.particles.push({
          x: Math.random() * 320,
          y: Math.random() * 240,
          speed: 0.5 + Math.random() * 1.2,
          drift: (Math.random() - 0.5) * 0.6,
          size: 1 + Math.floor(Math.random() * 2),
        });
      }
    } else if (type === 'leaves') {
      const n = Math.floor(15 + intensity * 25);
      const colors = ['#aa5a2a', '#d08a3a', '#7a4a1a', '#c06030'];
      for (let i = 0; i < n; i++) {
        this.particles.push({
          x: Math.random() * 320,
          y: Math.random() * 240,
          speed: 0.6 + Math.random() * 0.8,
          drift: (Math.random() - 0.5) * 1.2,
          rot: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.1,
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }
    }
  }

  update(dt, camX = 0, camY = 0) {
    if (this.type === 'none') return;
    for (const p of this.particles) {
      p.y += p.speed;
      if (p.drift !== undefined) p.x += p.drift;
      if (p.rot !== undefined) p.rot += p.rotSpeed;
      if (p.y > 240) { p.y = -8; p.x = Math.random() * 320; }
      if (p.x < -8) p.x = 328;
      if (p.x > 328) p.x = -8;
    }
  }

  render(ctx) {
    if (this.type === 'none') return;
    if (this.type === 'rain') {
      ctx.strokeStyle = 'rgba(180, 200, 230, 0.6)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (const p of this.particles) {
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - 1, p.y + p.len);
      }
      ctx.stroke();
    } else if (this.type === 'snow') {
      ctx.fillStyle = '#fff';
      for (const p of this.particles) {
        ctx.fillRect(p.x, p.y, p.size, p.size);
      }
    } else if (this.type === 'leaves') {
      for (const p of this.particles) {
        ctx.fillStyle = p.color;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillRect(-2, -1, 4, 2);
        ctx.restore();
      }
    }
  }
}
