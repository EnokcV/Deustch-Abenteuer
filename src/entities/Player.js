import { DIRECTION } from '../core/Config.js';

export class Player {
  constructor(game, x, y) {
    this.game = game;
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.w = 12;
    this.h = 14;
    this.dir = DIRECTION.DOWN;
    this.moving = false;
    this.walkFrame = 0;
    this.walkTimer = 0;
    this.onLadder = false;
    this.onGround = false;
    this.facing = 0;
    this.stepCooldown = 0;
    this.id = 'enoc';
  }

  update(dt, map) {
    const input = this.game.input;
    let mx = 0, my = 0;
    this.moving = false;

    if (input.isDown('a', 'arrowleft')) { mx = -1; this.facing = 2; }
    else if (input.isDown('d', 'arrowright')) { mx = 1; this.facing = 3; }
    if (input.isDown('w', 'arrowup')) { my = -1; this.facing = 1; }
    else if (input.isDown('s', 'arrowdown')) { my = 1; this.facing = 0; }

    if (mx === 0 && my === 0) {
      this.walkFrame = 0;
    } else {
      this.moving = true;
      const speed = 1.6;
      this.vx = mx * speed;
      this.vy = my * speed;
      this.walkTimer += dt;
      if (this.walkTimer > 0.12) {
        this.walkTimer = 0;
        this.walkFrame = (this.walkFrame + 1) % 4;
        if (this.walkFrame === 0 && this.stepCooldown <= 0) {
          this.game.audio.playSFX('step');
          this.stepCooldown = 0.2;
        }
      }
    }
    this.stepCooldown -= dt;

    this.x += this.vx;
    this._collideAxis('x', map);
    this.y += this.vy;
    this._collideAxis('y', map);

    if (this.x < 0) this.x = 0;
    if (this.x > (map.MAP_W * map.TILE - this.w)) this.x = map.MAP_W * map.TILE - this.w;
    if (this.y < 0) this.y = 0;
    if (this.y > 240) {
      this.game.onPlayerFall?.();
    }
  }

  _collideAxis(axis, map) {
    const TILE = map.TILE;
    const left = Math.floor(this.x / TILE);
    const right = Math.floor((this.x + this.w - 1) / TILE);
    const top = Math.floor(this.y / TILE);
    const bottom = Math.floor((this.y + this.h - 1) / TILE);

    for (let ty = top; ty <= bottom; ty++) {
      for (let tx = left; tx <= right; tx++) {
        if (tx < 0 || tx >= map.MAP_W || ty < 0 || ty >= map.MAP_H) continue;
        const tile = map.getTile(tx, ty);
        if (map.isSolid(tile)) {
          if (axis === 'x') {
            if (this.vx > 0) this.x = tx * TILE - this.w - 0.01;
            else if (this.vx < 0) this.x = (tx + 1) * TILE + 0.01;
            this.vx = 0;
          } else {
            if (this.vy > 0) this.y = ty * TILE - this.h - 0.01;
            else if (this.vy < 0) this.y = (ty + 1) * TILE + 0.01;
            this.vy = 0;
          }
        }
      }
    }
  }

  render(ctx, camX, camY, spriteSheet) {
    const dir = this.facing;
    const walkRow = this.moving ? Math.floor(this.walkFrame) : 0;
    const row = walkRow < 2 ? 1 : 2;
    const sx = dir * 64 + walkRow * 16;
    const sy = row * 24;
    const px = Math.floor(this.x - camX);
    const py = Math.floor(this.y - camY);
    if (spriteSheet) {
      ctx.drawImage(spriteSheet, sx, sy, 16, 24, px, py, 16, 24);
    } else {
      ctx.fillStyle = '#ff0';
      ctx.fillRect(px, py, 12, 14);
    }
  }
}
