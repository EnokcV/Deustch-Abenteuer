import { CHARACTERS } from '../core/Config.js';

const FRAME_W = 16;
const FRAME_H = 24;
const DIRS = ['down', 'up', 'left', 'right'];

export class SpriteGenerator {
  constructor() {
    this.cache = new Map();
  }

  getSheet(characterId) {
    if (this.cache.has(characterId)) return this.cache.get(characterId);
    const ch = CHARACTERS.find((c) => c.id === characterId);
    if (!ch) return null;
    const canvas = document.createElement('canvas');
    canvas.width = FRAME_W * 4 * 4;
    canvas.height = FRAME_H * 4;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    for (let d = 0; d < 4; d++) {
      this._drawIdle(ctx, d * FRAME_W * 4, 0, ch, d);
      this._drawWalk(ctx, d * FRAME_W * 4, FRAME_H, ch, d, 0);
      this._drawWalk(ctx, d * FRAME_W * 4 + FRAME_W, FRAME_H, ch, d, 1);
      this._drawWalk(ctx, d * FRAME_W * 4 + FRAME_W * 2, FRAME_H, ch, d, 2);
      this._drawWalk(ctx, d * FRAME_W * 4 + FRAME_W * 3, FRAME_H, ch, d, 3);
      this._drawWalk(ctx, d * FRAME_W * 4, FRAME_H * 2, ch, d, 0);
      this._drawWalk(ctx, d * FRAME_W * 4 + FRAME_W, FRAME_H * 2, ch, d, 1);
      this._drawWalk(ctx, d * FRAME_W * 4 + FRAME_W * 2, FRAME_H * 2, ch, d, 2);
      this._drawWalk(ctx, d * FRAME_W * 4 + FRAME_W * 3, FRAME_H * 2, ch, d, 3);
      this._drawWalk(ctx, d * FRAME_W * 4, FRAME_H * 3, ch, d, 0);
      this._drawWalk(ctx, d * FRAME_W * 4 + FRAME_W, FRAME_H * 3, ch, d, 1);
      this._drawWalk(ctx, d * FRAME_W * 4 + FRAME_W * 2, FRAME_H * 3, ch, d, 2);
      this._drawWalk(ctx, d * FRAME_W * 4 + FRAME_W * 3, FRAME_H * 3, ch, d, 3);
    }
    this.cache.set(characterId, canvas);
    return canvas;
  }

  getNPCSprite(id) {
    if (this.cache.has('npc_' + id)) return this.cache.get('npc_' + id);
    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 24;
    const ctx = canvas.getContext('2d');
    this._drawNPC(ctx, 0, 0, id);
    this.cache.set('npc_' + id, canvas);
    return canvas;
  }

  _px(ctx, x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, 1, 1);
  }

  _rect(ctx, x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
  }

  _drawIdle(ctx, ox, oy, ch, dir) {
    const p = ch.palette;
    const isVera = ch.id === 'vera';
    const skin = p.skin;
    const skinShade = this._shade(p.skin, -0.15);

    if (isVera) {
      this._rect(ctx, ox + 4, oy + 1, 8, 3, p.hat);
      this._rect(ctx, ox + 3, oy + 3, 10, 2, p.hat);
      this._rect(ctx, ox + 5, oy + 4, 6, 1, p.hatShadow);
    } else {
      this._rect(ctx, ox + 4, oy + 1, 8, 5, p.hair);
      this._rect(ctx, ox + 5, oy + 6, 6, 1, p.hairShadow);
    }

    if (dir === 0 || dir === 2 || dir === 3) {
      this._rect(ctx, ox + 5, oy + 6, 6, 5, skin);
      this._rect(ctx, ox + 5, oy + 9, 2, 1, '#000');
      this._rect(ctx, ox + 9, oy + 9, 2, 1, '#000');
    } else {
      this._rect(ctx, ox + 5, oy + 6, 6, 4, p.hair);
      this._rect(ctx, ox + 5, oy + 10, 6, 1, p.hairShadow);
    }

    this._rect(ctx, ox + 3, oy + 11, 10, 7, p.shirt);
    this._rect(ctx, ox + 3, oy + 14, 10, 1, p.shirtShadow);
    if (isVera) {
      this._rect(ctx, ox + 5, oy + 12, 2, 1, '#fff');
      this._rect(ctx, ox + 9, oy + 12, 2, 1, '#fff');
      this._rect(ctx, ox + 4, oy + 13, 1, 1, '#fff');
      this._rect(ctx, ox + 11, oy + 13, 1, 1, '#fff');
    } else {
      this._rect(ctx, ox + 7, oy + 11, 2, 1, p.accent);
    }

    this._rect(ctx, ox + 4, oy + 18, 3, 4, p.pants);
    this._rect(ctx, ox + 9, oy + 18, 3, 4, p.pants);
    this._rect(ctx, ox + 4, oy + 21, 1, 1, p.pantsShadow);
    this._rect(ctx, ox + 9, oy + 21, 1, 1, p.pantsShadow);

    this._rect(ctx, ox + 3, oy + 22, 4, 2, p.shoes);
    this._rect(ctx, ox + 9, oy + 22, 4, 2, p.shoes);
    this._rect(ctx, ox + 3, oy + 23, 4, 1, p.shoesShadow);
    this._rect(ctx, ox + 9, oy + 23, 4, 1, p.shoesShadow);
  }

  _drawWalk(ctx, ox, oy, ch, dir, frame) {
    const p = ch.palette;
    const isVera = ch.id === 'vera';
    const skin = p.skin;
    const legOffset = (frame === 1) ? -1 : (frame === 3 ? 1 : 0);
    const armOffset = (frame === 1) ? -1 : (frame === 3 ? 1 : 0);

    if (isVera) {
      this._rect(ctx, ox + 4, oy + 1, 8, 3, p.hat);
      this._rect(ctx, ox + 3, oy + 3, 10, 2, p.hat);
      this._rect(ctx, ox + 5, oy + 4, 6, 1, p.hatShadow);
    } else {
      this._rect(ctx, ox + 4, oy + 1, 8, 5, p.hair);
      this._rect(ctx, ox + 5, oy + 6, 6, 1, p.hairShadow);
    }

    if (dir === 0 || dir === 2 || dir === 3) {
      this._rect(ctx, ox + 5, oy + 6, 6, 5, skin);
      this._rect(ctx, ox + 5, oy + 9, 2, 1, '#000');
      this._rect(ctx, ox + 9, oy + 9, 2, 1, '#000');
    } else {
      this._rect(ctx, ox + 5, oy + 6, 6, 4, p.hair);
      this._rect(ctx, ox + 5, oy + 10, 6, 1, p.hairShadow);
    }

    this._rect(ctx, ox + 3, oy + 11, 10, 7, p.shirt);
    this._rect(ctx, ox + 3, oy + 14, 10, 1, p.shirtShadow);

    const lLegY = oy + 18 + (legOffset < 0 ? 1 : 0);
    const rLegY = oy + 18 + (legOffset > 0 ? 1 : 0);
    this._rect(ctx, ox + 4, lLegY, 3, 4, p.pants);
    this._rect(ctx, ox + 9, rLegY, 3, 4, p.pants);

    this._rect(ctx, ox + 3, oy + 22, 4, 2, p.shoes);
    this._rect(ctx, ox + 9, oy + 22, 4, 2, p.shoes);
    this._rect(ctx, ox + 3, oy + 23, 4, 1, p.shoesShadow);
    this._rect(ctx, ox + 9, oy + 23, 4, 1, p.shoesShadow);
  }

  _drawNPC(ctx, ox, oy, id) {
    const palettes = {
      profesor: { skin: '#d4a373', hair: '#5a3a2a', shirt: '#1f3a5f', pants: '#2a2a3a', shoes: '#3a2a1a' },
      bibliothekar: { skin: '#e0b89a', hair: '#3a2a2a', shirt: '#6a4a2a', pants: '#3a2a1a', shoes: '#1a1a1a' },
      studentin: { skin: '#d4a373', hair: '#8a4a1a', shirt: '#d04a4a', pants: '#3a3a5a', shoes: '#1a1a1a' },
      touristin: { skin: '#e0b89a', hair: '#1a1a1a', shirt: '#2a8a4a', pants: '#3a4a2a', shoes: '#5a3a1a' },
      bankier: { skin: '#d4a373', hair: '#2a2a2a', shirt: '#1a1a2a', pants: '#1a1a2a', shoes: '#0a0a0a' },
      boersenhändler: { skin: '#c89878', hair: '#3a2a1a', shirt: '#1a2a4a', pants: '#1a2a4a', shoes: '#0a0a0a' },
      hafenarbeiter: { skin: '#c89878', hair: '#3a2a1a', shirt: '#3a4a2a', pants: '#3a2a1a', shoes: '#0a0a0a' },
      strandwacht: { skin: '#c89878', hair: '#3a2a1a', shirt: '#e84a3a', pants: '#1a3a5a', shoes: '#0a0a0a' },
      eisverkaufer: { skin: '#d4a373', hair: '#5a3a2a', shirt: '#e8c8a8', pants: '#5a3a2a', shoes: '#3a2a1a' },
    };
    const p = palettes[id] || palettes.profesor;
    this._rect(ctx, ox + 4, oy + 1, 8, 5, p.hair);
    this._rect(ctx, ox + 5, oy + 6, 6, 5, p.skin);
    this._rect(ctx, ox + 5, oy + 9, 2, 1, '#000');
    this._rect(ctx, ox + 9, oy + 9, 2, 1, '#000');
    this._rect(ctx, ox + 3, oy + 11, 10, 7, p.shirt);
    this._rect(ctx, ox + 4, oy + 18, 3, 4, p.pants);
    this._rect(ctx, ox + 9, oy + 18, 3, 4, p.pants);
    this._rect(ctx, ox + 3, oy + 22, 4, 2, p.shoes);
    this._rect(ctx, ox + 9, oy + 22, 4, 2, p.shoes);
  }

  _shade(hex, pct) {
    const num = parseInt(hex.slice(1), 16);
    const r = (num >> 16) & 0xff;
    const g = (num >> 8) & 0xff;
    const b = num & 0xff;
    const f = (v) => Math.max(0, Math.min(255, Math.floor(v + (pct < 0 ? v * pct : (255 - v) * pct))));
    return '#' + ((f(r) << 16) | (f(g) << 8) | f(b)).toString(16).padStart(6, '0');
  }
}
