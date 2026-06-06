import { CONFIG, DIRECTION } from '../core/Config.js';
import { WORLD_DISPLAY } from '../data/vocabulary.js';
import { Player } from '../entities/Player.js';
import { WorldMap } from '../worlds/WorldMap.js';
import { TilesetGenerator } from '../graphics/TilesetGenerator.js';

const CITY_SPAWN = {
  berlin: { x: 65, y: 10 },
  hamburg: { x: 20, y: 10 },
  frankfurt: { x: 40, y: 45 },
  munchen: { x: 65, y: 55 },
};

export class WorldMapScene {
  constructor(game) {
    this.game = game;
    this.font = game.font;
    this.ctx = game.engine.ctx;
    this.world = new WorldMap(game);
    this.tileset = new TilesetGenerator();
    this.player = null;
    this.camX = 0;
    this.camY = 0;
    this.messageText = null;
    this.messageTimer = 0;
  }

  enter(params = {}) {
    try {
      console.log('[WorldMap] enter()', params);
      this.world.loadCity('worldmap', null);
      const spawn = params.cityId ? CITY_SPAWN[params.cityId] || CITY_SPAWN.berlin : CITY_SPAWN.berlin;
      const sx = spawn.x * CONFIG.TILE + (CONFIG.TILE - CONFIG.PLAYER_W) / 2;
      const sy = spawn.y * CONFIG.TILE + (CONFIG.TILE - CONFIG.PLAYER_H) / 2;
      this.player = new Player(this.game, sx, sy);
      this.player.id = (this.game.save.lastSave && this.game.save.lastSave.avatar) || 'enoc';
      try { this.game.audio.playErika(); } catch (_) {}
      this.camX = Math.max(0, Math.min(this.world.MAP_W * CONFIG.TILE - 320, this.player.x + this.player.w / 2 - 160));
      this.camY = Math.max(0, Math.min(this.world.MAP_H * CONFIG.TILE - 240, this.player.y + this.player.h / 2 - 120));
      this.messageText = null;
      this.messageTimer = 0;
    } catch (e) {
      console.error('[WorldMap] Error en enter():', e);
      throw e;
    }
  }

  exit() {}

  update(dt) {
    try {
    if (this.messageTimer > 0) {
      this.messageTimer -= dt;
      if (this.messageTimer <= 0) this.messageText = null;
    }
    this.player.update(dt, this.world);
    this._updateCamera(dt);
    this._checkPortals();
    this.tileset.update(dt);
    } catch (e) {
      console.error('[WorldMap] Error en update():', e);
    }
  }

  _updateCamera(dt) {
    const W = 320, H = 240;
    const cx = this.player.x + this.player.w / 2;
    const cy = this.player.y + this.player.h / 2;
    let lookX = 0, lookY = 0;
    if (this.player.isSprinting && this.player.isMoving) {
      switch (this.player.facing) {
        case DIRECTION.DOWN: lookY = CONFIG.LOOK_AHEAD; break;
        case DIRECTION.UP: lookY = -CONFIG.LOOK_AHEAD; break;
        case DIRECTION.LEFT: lookX = -CONFIG.LOOK_AHEAD; break;
        case DIRECTION.RIGHT: lookX = CONFIG.LOOK_AHEAD; break;
      }
    }
    const targetX = cx + lookX - W / 2;
    const targetY = cy + lookY - H / 2;
    const maxX = this.world.MAP_W * CONFIG.TILE - W;
    const maxY = this.world.MAP_H * CONFIG.TILE - H;
    const clampedX = Math.max(0, Math.min(maxX, targetX));
    const clampedY = Math.max(0, Math.min(maxY, targetY));
    this.camX += (clampedX - this.camX) * CONFIG.CAMERA_LERP;
    this.camY += (clampedY - this.camY) * CONFIG.CAMERA_LERP;
  }

  _checkPortals() {
    if (!this.world || !this.world.portals || !this.player) return;
    const pcx = this.player.x + this.player.w / 2;
    const pcy = this.player.y + this.player.h / 2;
    for (const p of this.world.portals) {
      const dx = Math.abs(pcx - (p.x + 16));
      const dy = Math.abs(pcy - (p.y + 16));
      if (dx < CONFIG.TILE && dy < CONFIG.TILE) {
        if (this.game.input.wasPressed('enter')) {
          const target = p.targetCity;
          if (!this.game.save.lastSave.unlocked.includes(target) && target !== 'berlin') {
            this._showMessage(this.game.l10n.t('locked'));
            return;
          }
          this.game.audio.playSFX('open');
          this.game.audio.playCityBGM(target);
          this.game.scenes.switchTo('game', { city: target, scene: 'town', x: 60, y: 38 });
        }
      }
    }
  }

  _showMessage(text) {
    this.messageText = text;
    this.messageTimer = 2;
  }

  render() {
    const ctx = this.ctx;
    try { this._renderSky(); } catch (e) { console.error('[WorldMap] _renderSky falló:', e); }
    try { this._renderMap(); } catch (e) { console.error('[WorldMap] _renderMap falló:', e); }
    try { this._renderPaths(); } catch (e) { console.error('[WorldMap] _renderPaths falló:', e); }
    try { this._renderCityMarkers(); } catch (e) { console.error('[WorldMap] _renderCityMarkers falló:', e); }
    try { this._renderPlayer(); } catch (e) { console.error('[WorldMap] _renderPlayer falló:', e); }
    try { this._renderPortals(); } catch (e) { console.error('[WorldMap] _renderPortals falló:', e); }
    if (this.messageText) {
      const w = this.font.textWidth(this.messageText, 1) + 16;
      ctx.fillStyle = 'rgba(0,0,0,0.85)';
      ctx.fillRect((320 - w) / 2, 80, w, 14);
      this.font.drawText(this.messageText, (320 - w) / 2 + 8, 84, '#f44', 1);
    }
    this._renderUI();
  }

  _renderSky() {
    const ctx = this.ctx;
    const sky = ctx.createLinearGradient(0, 0, 0, 140);
    sky.addColorStop(0, '#2a4a8a');
    sky.addColorStop(0.5, '#6a9ad0');
    sky.addColorStop(1, '#b0d8f0');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, 320, 140);
    ctx.fillStyle = '#fff';
    for (let i = 0; i < 8; i++) {
      const cx = (i * 67 + 23) % 420 - 50;
      const cy = 15 + (i % 4) * 14;
      this._drawCloud(ctx, cx - this.camX * 0.1, cy);
    }
  }

  _renderMap() {
    const ctx = this.ctx;
    const visibleChunks = this.world.getVisibleChunks(this.camX, this.camY);
    for (const key of visibleChunks) {
      const canvas = this.world.getChunkCanvas(key, this.tileset);
      if (canvas) {
        const [cx, cy] = key.split(',').map(Number);
        ctx.drawImage(canvas,
          cx * this.world.chunkSize * CONFIG.TILE - this.camX,
          cy * this.world.chunkSize * CONFIG.TILE - this.camY);
      }
    }
    const startCol = Math.max(0, Math.floor(this.camX / CONFIG.TILE));
    const endCol = Math.min(this.world.MAP_W - 1, Math.floor((this.camX + 320) / CONFIG.TILE) + 1);
    const startRow = Math.max(0, Math.floor(this.camY / CONFIG.TILE));
    const endRow = Math.min(this.world.MAP_H - 1, Math.floor((this.camY + 240) / CONFIG.TILE) + 1);
    for (let y = startRow; y <= endRow; y++) {
      for (let x = startCol; x <= endCol; x++) {
        const t = this.world.getTile(x, y);
        if (t !== 2 && t !== 16) continue;
        const tile = this.tileset.getTile(t);
        if (tile) ctx.drawImage(tile, x * CONFIG.TILE - this.camX, y * CONFIG.TILE - this.camY);
      }
    }
  }

  _renderPaths() {
    const ctx = this.ctx;
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 6]);
    const keys = Object.keys(WORLD_DISPLAY);
    for (let i = 0; i < keys.length; i++) {
      for (let j = i + 1; j < keys.length; j++) {
        const a = WORLD_DISPLAY[keys[i]];
        const b = WORLD_DISPLAY[keys[j]];
        const ax = a.worldX - this.camX;
        const ay = a.worldY - this.camY;
        const bx = b.worldX - this.camX;
        const by = b.worldY - this.camY;
        if (this._lineVisible(ax, ay, bx, by)) {
          ctx.beginPath();
          ctx.moveTo(ax, ay);
          ctx.lineTo(bx, by);
          ctx.stroke();
        }
      }
    }
    ctx.setLineDash([]);
  }

  _lineVisible(x1, y1, x2, y2) {
    return !(x1 < -50 && x2 < -50 || x1 > 370 && x2 > 370 || y1 < -50 && y2 < -50 || y1 > 290 && y2 > 290);
  }

  _renderCityMarkers() {
    const ctx = this.ctx;
    for (const key of Object.keys(WORLD_DISPLAY)) {
      const d = WORLD_DISPLAY[key];
      const unlocked = this.game.save.lastSave?.unlocked.includes(key);
      const sx = d.worldX - this.camX;
      const sy = d.worldY - this.camY;
      if (sx < -30 || sx > 350 || sy < -30 || sy > 270) continue;
      this._drawCityMarker(ctx, sx, sy, d, unlocked);
    }
  }

  _renderPlayer() {
    const sp = this.game.sprites.getSheet(this.player.id);
    this.player.render(this.ctx, this.camX, this.camY, sp);
  }

  _renderPortals() {
    const ctx = this.ctx;
    for (const p of this.world.portals) {
      const px = Math.floor(p.x + 16 - this.camX);
      const py = Math.floor(p.y - this.camY - 8 + Math.sin(Date.now() / 300) * 2);
      ctx.fillStyle = 'rgba(255, 255, 100, 0.6)';
      ctx.beginPath();
      ctx.arc(px, py, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.fillRect(px - 3, py - 1, 6, 2);
      ctx.fillRect(px - 1, py - 3, 2, 6);
    }
  }

  _drawCloud(ctx, x, y) {
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(x, y, 6, 0, Math.PI * 2);
    ctx.arc(x + 6, y - 2, 7, 0, Math.PI * 2);
    ctx.arc(x + 12, y, 6, 0, Math.PI * 2);
    ctx.arc(x + 6, y + 2, 7, 0, Math.PI * 2);
    ctx.fill();
  }

  _drawCityMarker(ctx, x, y, d, unlocked) {
    if (!unlocked) {
      ctx.fillStyle = 'rgba(50,50,50,0.6)';
      ctx.beginPath();
      ctx.arc(x, y, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#888';
      this.font.drawText('?', x - 2, y - 4, '#fff', 1);
    } else {
      ctx.fillStyle = d.color;
      ctx.beginPath();
      ctx.arc(x, y, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.fillRect(x - 1, y + 6, 2, 4);
      const label = d[this.game.l10n.langCode.toLowerCase()] || d.de;
      const tw = this.font.textWidth(label, 1);
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(x - tw / 2 - 2, y - 20, tw + 4, 10);
      this.font.drawText(label, x - tw / 2, y - 18, '#fff', 1);
      ctx.fillStyle = '#fff';
      ctx.fillRect(x - 1, y - 30, 2, 10);
    }
  }

  _renderUI() {
    const ctx = this.ctx;
    const cw = this.font.textWidth(this.game.l10n.t('chooseDest'), 1);
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect((320 - cw) / 2 - 4, 224, cw + 8, 14);
    this.font.drawText(this.game.l10n.t('chooseDest'), (320 - cw) / 2, 228, '#ff0', 1);
  }
}
