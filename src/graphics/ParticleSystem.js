export class ParticleSystem {
  constructor() { this.particles = []; }

  emit(x, y, count, opts = {}) {
    const color = opts.color || '#fff';
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x, y,
        vx: (Math.random() - 0.5) * (opts.spread || 2),
        vy: -Math.random() * (opts.up || 2),
        life: opts.life || 1,
        maxLife: opts.life || 1,
        color,
        size: opts.size || 1,
        gravity: opts.gravity || 0.05,
      });
    }
  }

  update(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.life -= dt;
      if (p.life <= 0) this.particles.splice(i, 1);
    }
  }

  render(ctx) {
    for (const p of this.particles) {
      const a = p.life / p.maxLife;
      ctx.globalAlpha = a;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.size, p.size);
    }
    ctx.globalAlpha = 1;
  }
}
