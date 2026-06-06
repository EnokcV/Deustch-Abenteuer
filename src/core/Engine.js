export class Engine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false;
    this.SCALE = 1;
    this.W = 320;
    this.H = 240;
    this.running = false;
    this.lastTime = 0;
    this.accumulator = 0;
    this.fixedDt = 1000 / 60;
    this._loop = this._loop.bind(this);
    this._resize = this._resize.bind(this);
    window.addEventListener('resize', this._resize);
    this._resize();
  }

  _resize() {
    const ww = window.innerWidth;
    const wh = window.innerHeight;
    const sx = ww / this.W;
    const sy = wh / this.H;
    this.SCALE = Math.max(sx, sy);
    this.canvas.style.width = ww + 'px';
    this.canvas.style.height = wh + 'px';
    this.canvas.width = this.W;
    this.canvas.height = this.H;
  }

  start() {
    this.running = true;
    this.lastTime = performance.now();
    requestAnimationFrame(this._loop);
  }

  stop() { this.running = false; }

  _loop(now) {
    if (!this.running) return;
    const delta = Math.min(now - this.lastTime, 100);
    this.lastTime = now;
    this.accumulator += delta;
    while (this.accumulator >= this.fixedDt) {
      if (this.game && this.game.update) {
        try {
          this.game.update(this.fixedDt / 1000);
        } catch (e) {
          console.error('[Engine] Excepción en update():', e);
        }
      }
      this.accumulator -= this.fixedDt;
    }
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(0, 0, this.W, this.H);
    if (this.game && this.game.render) {
      try {
        this.game.render(this.ctx);
      } catch (e) {
        console.error('[Engine] Excepción en render():', e);
      }
    }
    requestAnimationFrame(this._loop);
  }
}
