import { getLessonWords } from '../data/vocabulary.js';

export class MatchingGame {
  constructor(game, lesson, onComplete) {
    this.game = game;
    this.lesson = lesson;
    this.onComplete = onComplete;
    this.words = [];
    this.pairs = [];
    this.selectedDe = -1;
    this.selectedEs = -1;
    this.matched = new Set();
    this.time = 60;
    this.state = 'playing';
    this.correct = 0;
  }

  start() {
    this.words = getLessonWords(this.lesson).slice(0, 6);
    this.pairs = this.words.map((w, i) => ({ de: w.de, es: w.es, idx: i }));
    const deShuffled = [...this.pairs].sort(() => Math.random() - 0.5);
    const esShuffled = [...this.pairs].sort(() => Math.random() - 0.5);
    this.deItems = deShuffled.map((p, i) => ({ ...p, slot: i }));
    this.esItems = esShuffled.map((p, i) => ({ ...p, slot: i }));
    this.state = 'playing';
  }

  update(dt) {
    if (this.state !== 'playing') return;
    this.time -= dt;
    if (this.time <= 0) { this.finish(); return; }
    if (this.game.input.wasPressed('escape')) { this.finish(); return; }
    if (this.game.input.wasPressed('a') || this.game.input.wasPressed('arrowleft')) {
      this.selectedDe = (this.selectedDe - 1 + this.deItems.length) % this.deItems.length;
      this.game.audio.playSFX('blip');
    }
    if (this.game.input.wasPressed('d') || this.game.input.wasPressed('arrowright')) {
      this.selectedDe = (this.selectedDe + 1) % this.deItems.length;
      this.game.audio.playSFX('blip');
    }
    if (this.game.input.wasPressed('w') || this.game.input.wasPressed('arrowup')) {
      this.selectedEs = (this.selectedEs - 1 + this.esItems.length) % this.esItems.length;
      this.game.audio.playSFX('blip');
    }
    if (this.game.input.wasPressed('s') || this.game.input.wasPressed('arrowdown')) {
      this.selectedEs = (this.selectedEs + 1) % this.esItems.length;
      this.game.audio.playSFX('blip');
    }
    if (this.game.input.wasPressed('enter') || this.game.input.wasPressed(' ')) {
      if (this.selectedDe < 0 || this.selectedEs < 0) return;
      const de = this.deItems[this.selectedDe];
      const es = this.esItems[this.selectedEs];
      if (de.idx === es.idx && !this.matched.has(de.idx)) {
        this.matched.add(de.idx);
        this.correct++;
        this.game.audio.playSFX('correct');
        if (this.matched.size >= this.pairs.length) { this.finish(); return; }
      } else {
        this.game.audio.playSFX('wrong');
      }
      this.selectedDe = -1;
      this.selectedEs = -1;
    }
  }

  finish() {
    this.state = 'done';
    this.game.audio.playSFX(this.correct >= this.pairs.length / 2 ? 'fanfare' : 'wrong');
  }

  render(ctx) {
    ctx.fillStyle = '#0a1a3a';
    ctx.fillRect(0, 0, 320, 240);
    if (this.state === 'playing') this._renderPlay(ctx);
    else this._renderResults(ctx);
  }

  _renderPlay(ctx) {
    const font = this.game.font;
    font.drawText(this.game.l10n.t('match'), 110, 10, '#ff0', 1);
    font.drawText(`${Math.floor(this.time)}s`, 280, 10, this.time < 10 ? '#f00' : '#fff', 1);
    for (let i = 0; i < this.deItems.length; i++) {
      const y = 40 + i * 28;
      const p = this.deItems[i];
      const isSel = i === this.selectedDe;
      const matched = this.matched.has(p.idx);
      ctx.fillStyle = matched ? 'rgba(0,150,0,0.4)' : (isSel ? 'rgba(255,200,50,0.3)' : 'rgba(0,0,0,0.4)');
      ctx.fillRect(10, y, 140, 22);
      ctx.strokeStyle = matched ? '#0f0' : (isSel ? '#ff0' : '#888');
      ctx.strokeRect(10.5, y + 0.5, 139, 21);
      font.drawText(p.de.substring(0, 14), 16, y + 6, matched ? '#0f0' : (isSel ? '#ff0' : '#fff'), 1);
    }
    for (let i = 0; i < this.esItems.length; i++) {
      const y = 40 + i * 28;
      const p = this.esItems[i];
      const isSel = i === this.selectedEs;
      const matched = this.matched.has(p.idx);
      ctx.fillStyle = matched ? 'rgba(0,150,0,0.4)' : (isSel ? 'rgba(255,200,50,0.3)' : 'rgba(0,0,0,0.4)');
      ctx.fillRect(170, y, 140, 22);
      ctx.strokeStyle = matched ? '#0f0' : (isSel ? '#ff0' : '#888');
      ctx.strokeRect(170.5, y + 0.5, 139, 21);
      font.drawText(p.es.substring(0, 14), 176, y + 6, matched ? '#0f0' : (isSel ? '#ff0' : '#fff'), 1);
    }
    font.drawText('[W/S] ES  [A/D] DE  [Enter]', 30, 220, '#888', 1);
  }

  _renderResults(ctx) {
    const font = this.game.font;
    font.drawText(this.game.l10n.t('results'), 130, 20, '#ff0', 2);
    font.drawText(`${this.correct}/${this.pairs.length}`, 120, 60, '#fff', 3);
    font.drawText('[Enter]', 130, 220, '#ff0', 1);
  }
}
