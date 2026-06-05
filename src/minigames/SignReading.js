import { getLessonWords } from '../data/vocabulary.js';

export class SignReading {
  constructor(game, lesson, onComplete) {
    this.game = game;
    this.lesson = lesson;
    this.onComplete = onComplete;
    this.words = [];
    this.questions = [];
    this.qIndex = 0;
    this.selected = 0;
    this.state = 'playing';
    this.correct = 0;
    this.timer = 0;
    this.maxTime = 50;
  }

  start() {
    const all = getLessonWords(this.lesson).filter((w) => w.type);
    this.words = all;
    if (this.words.length < 1) {
      this.onComplete({ score: 0, total: 0, words: [] });
      return;
    }
    const shuffled = [...this.words].sort(() => Math.random() - 0.5).slice(0, 5);
    this.questions = shuffled;
    this.state = 'playing';
  }

  update(dt) {
    if (this.state !== 'playing') return;
    this.timer += dt;
    if (this.timer > this.maxTime) { this.finish(); return; }
    if (this.game.input.wasPressed('escape')) { this.finish(); return; }
    if (this.game.input.wasPressed('a') || this.game.input.wasPressed('arrowleft') || this.game.input.wasPressed('w') || this.game.input.wasPressed('arrowup')) {
      this.selected = 0;
      this.game.audio.playSFX('blip');
    }
    if (this.game.input.wasPressed('d') || this.game.input.wasPressed('arrowright') || this.game.input.wasPressed('s') || this.game.input.wasPressed('arrowdown')) {
      this.selected = 1;
      this.game.audio.playSFX('blip');
    }
    if (this.game.input.wasPressed('enter')) {
      const q = this.questions[this.qIndex];
      const isCorrect = (this.selected === 0 ? 'erlaubt' : 'verboten') === q.type;
      if (isCorrect) {
        this.correct++;
        this.game.audio.playSFX('correct');
      } else {
        this.game.audio.playSFX('wrong');
      }
      this.qIndex++;
      this.selected = 0;
      if (this.qIndex >= this.questions.length) this.finish();
    }
  }

  finish() {
    this.state = 'done';
    this.game.audio.playSFX(this.correct >= this.questions.length / 2 ? 'fanfare' : 'wrong');
  }

  render(ctx) {
    ctx.fillStyle = '#0a1a3a';
    ctx.fillRect(0, 0, 320, 240);
    if (this.state === 'playing') this._renderPlay(ctx);
    else this._renderResults(ctx);
  }

  _renderPlay(ctx) {
    const font = this.game.font;
    font.drawText(this.game.l10n.t('sign'), 130, 10, '#ff0', 1);
    font.drawText(`${this.qIndex + 1}/${this.questions.length}`, 280, 10, '#fff', 1);
    const q = this.questions[this.qIndex];
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(30, 50, 260, 50);
    const dw = font.textWidth(q.de, 2);
    font.drawText(q.de, (320 - dw) / 2, 65, '#fff', 2);
    const opts = [
      { label: this.game.l10n.t('erlaubt'), color: '#0a0' },
      { label: this.game.l10n.t('verboten'), color: '#a00' },
    ];
    for (let i = 0; i < 2; i++) {
      const x = 50 + i * 120;
      const y = 130;
      const isSel = i === this.selected;
      ctx.fillStyle = isSel ? opts[i].color : 'rgba(0,0,0,0.5)';
      ctx.fillRect(x, y, 100, 50);
      ctx.strokeStyle = isSel ? '#ff0' : opts[i].color;
      ctx.lineWidth = 2;
      ctx.strokeRect(x + 1, y + 1, 98, 48);
      const lw = font.textWidth(opts[i].label, 1);
      font.drawText(opts[i].label, x + (100 - lw) / 2, y + 20, '#fff', 1);
    }
    const timeLeft = Math.max(0, this.maxTime - this.timer);
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(20, 225, 280, 8);
    ctx.fillStyle = timeLeft > 10 ? '#0f0' : '#f00';
    ctx.fillRect(20, 225, 280 * (timeLeft / this.maxTime), 8);
  }

  _renderResults(ctx) {
    const font = this.game.font;
    font.drawText(this.game.l10n.t('results'), 130, 20, '#ff0', 2);
    font.drawText(`${this.correct}/${this.questions.length}`, 120, 60, '#fff', 3);
    font.drawText('[Enter]', 130, 220, '#ff0', 1);
  }
}
