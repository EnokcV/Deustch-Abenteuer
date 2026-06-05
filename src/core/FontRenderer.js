const FONT = {
  A: [4, 10, 17, 31, 17, 17, 17], B: [30, 17, 17, 30, 17, 17, 30],
  C: [14, 17, 16, 16, 16, 17, 14], D: [30, 17, 17, 17, 17, 17, 30],
  E: [31, 16, 16, 30, 16, 16, 31], F: [31, 16, 16, 30, 16, 16, 16],
  G: [14, 17, 16, 23, 17, 17, 14], H: [17, 17, 17, 31, 17, 17, 17],
  I: [14, 4, 4, 4, 4, 4, 14], J: [7, 2, 2, 2, 2, 18, 12],
  K: [17, 18, 20, 24, 20, 18, 17], L: [16, 16, 16, 16, 16, 16, 31],
  M: [17, 27, 21, 21, 17, 17, 17], N: [17, 25, 21, 19, 17, 17, 17],
  O: [14, 17, 17, 17, 17, 17, 14], P: [30, 17, 17, 30, 16, 16, 16],
  Q: [14, 17, 17, 17, 21, 18, 13], R: [30, 17, 17, 30, 20, 18, 17],
  S: [15, 16, 16, 14, 1, 1, 30], T: [31, 4, 4, 4, 4, 4, 4],
  U: [17, 17, 17, 17, 17, 17, 14], V: [17, 17, 17, 17, 17, 10, 4],
  W: [17, 17, 17, 21, 21, 27, 17], X: [17, 17, 10, 4, 10, 17, 17],
  Y: [17, 17, 10, 4, 4, 4, 4], Z: [31, 1, 2, 4, 8, 16, 31],
  0: [14, 17, 19, 21, 25, 17, 14], 1: [4, 12, 4, 4, 4, 4, 14],
  2: [14, 17, 1, 2, 4, 8, 31], 3: [14, 17, 1, 6, 1, 17, 14],
  4: [2, 6, 10, 18, 31, 2, 2], 5: [31, 16, 30, 1, 1, 17, 14],
  6: [6, 8, 16, 30, 17, 17, 14], 7: [31, 1, 2, 4, 8, 8, 8],
  8: [14, 17, 17, 14, 17, 17, 14], 9: [14, 17, 17, 15, 1, 2, 12],
  '.': [0, 0, 0, 0, 0, 0, 6], ',': [0, 0, 0, 0, 0, 6, 4],
  '!': [4, 4, 4, 4, 4, 0, 4], '?': [14, 17, 1, 2, 4, 0, 4],
  ':': [0, 0, 6, 0, 6, 0, 0], '-': [0, 0, 0, 31, 0, 0, 0],
  '+': [0, 4, 4, 31, 4, 4, 0], '/': [1, 2, 2, 4, 8, 8, 16],
  ' ': [0, 0, 0, 0, 0, 0, 0], "'": [4, 4, 0, 0, 0, 0, 0],
  'ß': [14, 17, 28, 18, 17, 17, 14], 'Ä': [10, 0, 14, 17, 31, 17, 17],
  'Ö': [10, 0, 14, 17, 17, 17, 14], 'Ü': [10, 0, 17, 17, 17, 17, 14],
  '(': [2, 4, 8, 8, 8, 4, 2], ')': [8, 4, 2, 2, 2, 4, 8],
  '%': [17, 18, 4, 8, 16, 17, 17], '#': [10, 10, 31, 10, 31, 10, 10],
  'á': [10, 0, 14, 1, 15, 17, 15], 'é': [10, 0, 14, 16, 31, 17, 14],
  'í': [10, 0, 14, 4, 4, 4, 14], 'ó': [10, 0, 14, 17, 17, 17, 14],
  'ú': [10, 0, 17, 17, 17, 17, 14], 'ñ': [10, 4, 17, 21, 17, 17, 17],
  '*': [0, 10, 31, 14, 31, 10, 0],
};

export class FontRenderer {
  constructor(ctx) { this.ctx = ctx; }

  drawChar(c, x, y, color = '#fff', scale = 1) {
    const ch = (c || ' ').toUpperCase();
    const rows = FONT[ch];
    if (!rows) return 6 * scale;
    const s = scale;
    this.ctx.fillStyle = color;
    for (let r = 0; r < 7; r++) {
      for (let b = 0; b < 5; b++) {
        if (rows[r] & (16 >> b)) {
          this.ctx.fillRect(x + b * s, y + r * s, s, s);
        }
      }
    }
    return 6 * s;
  }

  drawText(text, x, y, color = '#fff', scale = 1) {
    let cx = x;
    const gap = 1 * scale;
    for (let i = 0; i < text.length; i++) {
      const w = this.drawChar(text[i], cx, y, color, scale);
      cx += w + gap;
    }
    return cx - x;
  }

  textWidth(text, scale = 1) {
    const s = scale;
    let w = 0;
    for (let i = 0; i < text.length; i++) {
      if (FONT[(text[i] || ' ').toUpperCase()]) w += 6 * s + 1 * s;
    }
    return w;
  }

  drawTextWrapped(text, x, y, color, scale, maxW) {
    const s = scale;
    let cx = x, cy = y;
    const gap = 1 * s;
    for (let i = 0; i < text.length; i++) {
      const w = (FONT[(text[i] || ' ').toUpperCase()] ? 6 * s + gap : 0);
      if (cx + w - x > maxW && cx > x) { cx = x; cy += 8 * s; }
      this.drawChar(text[i], cx, cy, color, s);
      cx += w;
    }
  }

  drawBox(x, y, w, h, fill = '#222', border = '#fff') {
    this.ctx.fillStyle = fill;
    this.ctx.fillRect(x, y, w, h);
    this.ctx.strokeStyle = border;
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
  }

  drawButton(x, y, w, h, text, fill = '#333', border = '#fff', textColor = '#fff', scale = 1) {
    this.drawBox(x, y, w, h, fill, border);
    const tw = this.textWidth(text, scale);
    this.drawText(text, x + (w - tw) / 2, y + (h - 7 * scale) / 2, textColor, scale);
  }
}
