export class TilesetGenerator {
  constructor() {
    this.cache = new Map();
  }

  getTile(tileId) {
    if (this.cache.has(tileId)) return this.cache.get(tileId);
    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext('2d');
    this._drawTile(ctx, 0, 0, tileId);
    this.cache.set(tileId, canvas);
    return canvas;
  }

  _px(ctx, x, y, c) { ctx.fillStyle = c; ctx.fillRect(x, y, 1, 1); }
  _rect(ctx, x, y, w, h, c) { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); }

  _drawTile(ctx, x, y, id) {
    switch (id) {
      case 0: break;
      case 1: this._ground(ctx, x, y); break;
      case 2: this._wall(ctx, x, y); break;
      case 3: this._platform(ctx, x, y); break;
      case 4: this._water(ctx, x, y); break;
      case 5: this._ladder(ctx, x, y); break;
      case 8: this._tree(ctx, x, y); break;
      case 9: this._sand(ctx, x, y); break;
      case 10: this._woodFloor(ctx, x, y); break;
      case 11: this._stoneFloor(ctx, x, y); break;
      case 12: this._carpet(ctx, x, y); break;
      case 13: this._tileFloor(ctx, x, y); break;
      case 14: this._grass(ctx, x, y); break;
      case 15: this._bridge(ctx, x, y); break;
      case 16: this._roof(ctx, x, y); break;
    }
  }

  _ground(ctx, x, y) {
    this._rect(ctx, x, y, 16, 16, '#5a4530');
    this._rect(ctx, x, y, 16, 2, '#7a6540');
    this._px(ctx, x + 2, y + 4, '#3a2818');
    this._px(ctx, x + 6, y + 7, '#3a2818');
    this._px(ctx, x + 11, y + 5, '#3a2818');
    this._px(ctx, x + 14, y + 10, '#3a2818');
    this._px(ctx, x + 4, y + 12, '#3a2818');
    this._px(ctx, x + 9, y + 13, '#3a2818');
    this._px(ctx, x, y + 1, '#9a8560');
    this._px(ctx, x + 15, y + 1, '#9a8560');
  }

  _wall(ctx, x, y) {
    this._rect(ctx, x, y, 16, 16, '#7a6a4a');
    this._rect(ctx, x, y, 16, 2, '#9a8a6a');
    this._rect(ctx, x, y + 8, 16, 1, '#5a4a2a');
    this._rect(ctx, x + 4, y, 1, 8, '#5a4a2a');
    this._rect(ctx, x + 11, y, 1, 8, '#5a4a2a');
    this._rect(ctx, x, y + 7, 16, 1, '#5a4a2a');
  }

  _platform(ctx, x, y) {
    this._rect(ctx, x, y, 16, 4, '#5a3520');
    this._rect(ctx, x, y, 16, 1, '#7a5530');
    this._rect(ctx, x, y + 4, 16, 1, '#3a2510');
  }

  _water(ctx, x, y) {
    this._rect(ctx, x, y, 16, 16, '#3a5a8a');
    this._rect(ctx, x, y, 16, 2, '#5a7aaa');
    this._px(ctx, x + 2, y + 3, '#7a9ada');
    this._px(ctx, x + 8, y + 3, '#7a9ada');
    this._px(ctx, x + 13, y + 3, '#7a9ada');
    this._px(ctx, x + 5, y + 8, '#5a7aaa');
    this._px(ctx, x + 11, y + 10, '#5a7aaa');
    this._px(ctx, x + 3, y + 13, '#5a7aaa');
  }

  _ladder(ctx, x, y) {
    this._rect(ctx, x + 2, y, 1, 16, '#8a6a3a');
    this._rect(ctx, x + 12, y, 1, 16, '#8a6a3a');
    for (let i = 0; i < 5; i++) {
      this._rect(ctx, x + 2, y + i * 4, 11, 1, '#5a3a1a');
    }
  }

  _tree(ctx, x, y) {
    this._rect(ctx, x, y, 16, 16, '#2a5a1a');
    this._rect(ctx, x + 1, y + 1, 14, 14, '#3a7a2a');
    this._rect(ctx, x + 2, y + 2, 12, 12, '#2a5a1a');
    this._px(ctx, x + 4, y + 3, '#5aaa3a');
    this._px(ctx, x + 10, y + 5, '#5aaa3a');
    this._px(ctx, x + 7, y + 11, '#5aaa3a');
  }

  _sand(ctx, x, y) {
    this._rect(ctx, x, y, 16, 16, '#e0c890');
    this._rect(ctx, x, y, 16, 2, '#f0d8a0');
    this._px(ctx, x + 3, y + 4, '#c0a870');
    this._px(ctx, x + 8, y + 7, '#c0a870');
    this._px(ctx, x + 12, y + 10, '#c0a870');
    this._px(ctx, x + 5, y + 13, '#c0a870');
  }

  _woodFloor(ctx, x, y) {
    this._rect(ctx, x, y, 16, 16, '#6a4a2a');
    for (let i = 0; i < 4; i++) {
      this._rect(ctx, x, y + i * 4, 16, 1, '#3a2510');
    }
    for (let i = 0; i < 5; i++) {
      const xo = (i * 3) % 16;
      this._rect(ctx, x + xo, y, 1, 16, '#8a6a4a');
    }
  }

  _stoneFloor(ctx, x, y) {
    this._rect(ctx, x, y, 16, 16, '#6a6a6a');
    this._rect(ctx, x, y, 16, 1, '#8a8a8a');
    this._rect(ctx, x, y + 8, 16, 1, '#4a4a4a');
    this._rect(ctx, x + 8, y, 1, 8, '#4a4a4a');
    this._px(ctx, x + 3, y + 4, '#5a5a5a');
    this._px(ctx, x + 11, y + 12, '#5a5a5a');
  }

  _carpet(ctx, x, y) {
    this._rect(ctx, x, y, 16, 16, '#8a1a1a');
    this._rect(ctx, x, y, 16, 1, '#aa3a3a');
    this._rect(ctx, x, y + 15, 16, 1, '#5a0a0a');
    this._rect(ctx, x, y, 1, 16, '#aa3a3a');
    this._rect(ctx, x + 15, y, 1, 16, '#5a0a0a');
    this._px(ctx, x + 7, y + 7, '#d0a040');
    this._px(ctx, x + 8, y + 7, '#d0a040');
  }

  _tileFloor(ctx, x, y) {
    this._rect(ctx, x, y, 16, 16, '#a0a0a0');
    this._rect(ctx, x, y, 16, 1, '#c0c0c0');
    this._rect(ctx, x, y + 8, 16, 1, '#707070');
    this._rect(ctx, x + 8, y, 1, 8, '#707070');
    this._rect(ctx, x + 8, y + 8, 1, 8, '#c0c0c0');
  }

  _grass(ctx, x, y) {
    this._rect(ctx, x, y, 16, 16, '#4a8a2a');
    this._rect(ctx, x, y, 16, 2, '#6aaa4a');
    this._px(ctx, x + 2, y + 4, '#3a6a1a');
    this._px(ctx, x + 6, y + 5, '#3a6a1a');
    this._px(ctx, x + 10, y + 6, '#3a6a1a');
    this._px(ctx, x + 4, y + 10, '#3a6a1a');
    this._px(ctx, x + 12, y + 12, '#3a6a1a');
  }

  _bridge(ctx, x, y) {
    this._rect(ctx, x, y, 16, 16, '#5a3a1a');
    for (let i = 0; i < 5; i++) {
      this._rect(ctx, x, y + i * 4, 16, 1, '#3a2010');
    }
    this._rect(ctx, x, y, 16, 2, '#7a5530');
  }

  _roof(ctx, x, y) {
    this._rect(ctx, x, y, 16, 16, '#aa3a3a');
    this._rect(ctx, x, y, 16, 2, '#cc5a5a');
    this._px(ctx, x + 4, y + 4, '#7a1a1a');
    this._px(ctx, x + 10, y + 8, '#7a1a1a');
    this._px(ctx, x + 6, y + 12, '#7a1a1a');
  }
}
