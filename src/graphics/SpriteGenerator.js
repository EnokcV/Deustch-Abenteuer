import { CHARACTERS } from '../core/Config.js';

const FRAME_W = 16;
const FRAME_H = 24;

const SPRITE_SHEETS = {
  enoc: 'assets/sprites/characters-enoc-max.png',
  max: 'assets/sprites/characters-enoc-max.png',
  vera: 'assets/sprites/characters-vera-cesar.png',
  cesar: 'assets/sprites/characters-vera-cesar.png',
};

const SHEET_OFFSET = {
  enoc: 0,
  max: 1,
  vera: 0,
  cesar: 1,
};

export class SpriteGenerator {
  constructor() {
    this.cache = new Map();
    this.sheetCache = new Map();
    this.loadedSheets = new Map();
    this.useRealSprites = true;
    this._loadSheets();
  }

  _loadSheets() {
    if (!this.useRealSprites) return;
    for (const [charId, url] of Object.entries(SPRITE_SHEETS)) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        this.loadedSheets.set(url, img);
        this.cache.delete(charId);
        this.cache.delete('npc_' + charId);
      };
      img.onerror = () => {
        console.warn('Could not load sprite sheet:', url);
      };
      img.src = url;
    }
  }

  getSheet(characterId) {
    if (this.cache.has(characterId)) return this.cache.get(characterId);

    const ch = CHARACTERS.find((c) => c.id === characterId);
    if (!ch) return null;

    const url = SPRITE_SHEETS[characterId];
    const realSheet = this.loadedSheets.get(url);

    if (realSheet) {
      const canvas = this._extractFromSheet(realSheet, characterId);
      if (canvas) {
        this.cache.set(characterId, canvas);
        return canvas;
      }
    }

    const canvas = this._generateProcedural(ch);
    this.cache.set(characterId, canvas);
    return canvas;
  }

  _extractFromSheet(sheetImg, characterId) {
    const canvas = document.createElement('canvas');
    canvas.width = FRAME_W * 4 * 4;
    canvas.height = FRAME_H * 4;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    const offset = SHEET_OFFSET[characterId];
    if (offset === undefined) return null;

    const sourceW = sheetImg.width;
    const sourceH = sheetImg.height;
    const portraitW = sourceW / 2;
    const portraitH = sourceH / 2;

    const col = offset % 2;
    const row = Math.floor(offset / 2);
    const srcX = col * portraitW;
    const srcY = row * portraitH + 0;

    try {
      ctx.drawImage(
        sheetImg,
        srcX, srcY + 30, portraitW, portraitH - 30,
        0, 0, canvas.width, canvas.height
      );
    } catch (e) {
      return null;
    }
    return canvas;
  }

  _generateProcedural(ch) {
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

  _px(ctx, x, y, color) { ctx.fillStyle = color; ctx.fillRect(x, y, 1, 1); }
  _rect(ctx, x, y, w, h, color) { ctx.fillStyle = color; ctx.fillRect(x, y, w, h); }

  _drawIdle(ctx, ox, oy, ch, dir) {
    const p = ch.palette;
    const isVera = ch.id === 'vera';
    const skin = p.skin;
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
}
