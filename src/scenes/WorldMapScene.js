import { CONFIG } from '../core/Config.js';
import { WORLD_DISPLAY } from '../data/vocabulary.js';
import { Player } from '../entities/Player.js';
import { WorldMap } from '../worlds/WorldMap.js';
import { TilesetGenerator } from '../graphics/TilesetGenerator.js';
import { WeatherSystem } from '../graphics/WeatherSystem.js';

export class WorldMapScene {
  constructor(game) {
    this.game = game;
    this.font = game.font;
    this.ctx = game.engine.ctx;
    this.world = new WorldMap(game);
    this.tileset = new TilesetGenerator();
    this.weather = new WeatherSystem();
    this.player = null;
  }

  enter(params = {}) {
    this.world.loadCity('worldmap', null);
    this.player = new Player(this.game, params.x ? params.x * 16 : 8 * 16, params.y ? params.y * 16 : 14 * 16);
    this.player.id = this.game.save.lastSave?.avatar || 'enoc';
    this.game.audio.playErika();
    this.weather.setType('none');
  }

  exit() {}

  update(dt) {
    this.player.update(dt, this.world);
    this._checkPortals();
  }

  _checkPortals() {
    for (const p of this.world.portals) {
      const dx = Math.abs((this.player.x + 6) - (p.x + 8));
      const dy = Math.abs((this.player.y + 6) - (p.y + 8));
      if (dx < 14 && dy < 14) {
        if (this.game.input.wasPressed('enter')) {
          const target = p.targetCity;
          if (!this.game.save.lastSave.unlocked.includes(target) && target !== 'berlin') {
            this.game.showMessage?.(this.game.l10n.t('locked'));
            return;
          }
          this.game.audio.playSFX('open');
          this.game.audio.playCityBGM(target);
          this.game.scenes.switchTo('game', { city: target, scene: 'town', x: 4, y: 15 });
        }
        if (this.game.input.wasPressed('enter') === false && Math.random() < 0.01) {
        }
      }
    }
  }

  render() {
    const ctx = this.ctx;
    this._renderMap();
    this._renderUI();
  }

  _renderMap() {
    const ctx = this.ctx;
    const sky = ctx.createLinearGradient(0, 0, 0, 140);
    sky.addColorStop(0, '#3a6aaa');
    sky.addColorStop(1, '#a0d0e8');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, 320, 140);
    ctx.fillStyle = '#fff';
    for (let i = 0; i < 6; i++) {
      const cx = (i * 60 + 30) % 320;
      const cy = 20 + (i % 3) * 12;
      this._drawCloud(ctx, cx, cy);
    }
    for (let x = 0; x < this.world.MAP_W; x++) for (let y = 0; y < this.world.MAP_H; y++) {
      const t = this.world.getTile(x, y);
      if (t === 0) continue;
      const tile = this.tileset.getTile(t);
      if (tile) ctx.drawImage(tile, x * 16, y * 16);
    }
    for (const key of Object.keys(WORLD_DISPLAY)) {
      const d = WORLD_DISPLAY[key];
      const unlocked = this.game.save.lastSave?.unlocked.includes(key);
      this._drawCityMarker(ctx, d.x, d.y, d, unlocked);
    }
    for (const p of this.world.portals) {
      ctx.fillStyle = this.game.save.lastSave?.unlocked.includes(p.targetCity) ? '#0f0' : '#f00';
      ctx.fillRect(p.x, p.y, 12, 12);
      ctx.fillStyle = '#000';
      ctx.fillRect(p.x + 4, p.y + 4, 4, 4);
    }
    const camX = 0;
    const camY = 0;
    const sp = this.game.sprites.getSheet(this.player.id);
    this.player.render(ctx, camX, camY, sp);
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
      ctx.arc(x + 8, y + 8, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#888';
      this.font.drawText('?', x + 5, y + 5, '#fff', 1);
    } else {
      ctx.fillStyle = d.color;
      ctx.beginPath();
      ctx.arc(x + 8, y + 8, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.fillRect(x + 7, y + 14, 2, 4);
      const tw = this.font.textWidth(d[this.game.l10n.langCode.toLowerCase()] || d.de, 1);
      ctx.fillStyle = '#000';
      ctx.fillRect(x + 8 - tw / 2 - 2, y - 8, tw + 4, 9);
      this.font.drawText(d[this.game.l10n.langCode.toLowerCase()] || d.de, x + 8 - tw / 2, y - 6, '#fff', 1);
    }
  }

  _renderUI() {
    const ctx = this.ctx;
    const cw = this.font.textWidth(this.game.l10n.t('chooseDest'), 1);
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect((320 - cw) / 2 - 4, 220, cw + 8, 14);
    this.font.drawText(this.game.l10n.t('chooseDest'), (320 - cw) / 2, 224, '#ff0', 1);
  }
}
