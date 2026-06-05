import { getLessonWords } from '../data/vocabulary.js';

export class TranslationQuiz {
  constructor(game, lesson, onComplete) {
    this.game = game;
    this.lesson = lesson;
    this.onComplete = onComplete;
    this.words = [];
    this.questions = [];
    this.qIndex = 0;
    this.correct = 0;
    this.selected = 0;
    this.state = 'playing';
    this.timer = 0;
    this.maxTime = 0;
    this.timePerQ = 12;
    this.results = [];
  }

  start() {
    this.words = getLessonWords(this.lesson);
    if (this.words.length < 4) {
      this.onComplete({ score: 0, total: 0, words: [] });
      return;
    }
    const shuffled = [...this.words].sort(() => Math.random() - 0.5);
    this.questions = shuffled.slice(0, Math.min(5, shuffled.length)).map((q) => {
      const others = this.words.filter((w) => w.de !== q.de).sort(() => Math.random() - 0.5).slice(0, 3);
      const opts = [...others, q].sort(() => Math.random() - 0.5);
      return { word: q, options: opts, correctIdx: opts.indexOf(q) };
    });
    this.maxTime = this.questions.length * this.timePerQ;
    this.state = 'playing';
  }

  update(dt) {
    if (this.state !== 'playing') return;
    this.timer += dt;
    if (this.timer > this.maxTime) {
      this.finish();
    }
    if (this.game.input.wasPressed('w') || this.game.input.wasPressed('arrowup')) {
      this.selected = (this.selected - 1 + 4) % 4;
      this.game.audio.playSFX('blip');
    }
    if (this.game.input.wasPressed('s') || this.game.input.wasPressed('arrowdown')) {
      this.selected = (this.selected + 1) % 4;
      this.game.audio.playSFX('blip');
    }
    if (this.game.input.wasPressed('enter')) {
      const q = this.questions[this.qIndex];
      const isCorrect = this.selected === q.correctIdx;
      this.results.push({ q: q.word.de, a: q.options[this.selected].es, correct: isCorrect });
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

  confirmExit() {
    if (this.game.input.wasPressed('escape')) {
      this.onComplete({ score: this.correct, total: this.questions.length, words: this.results });
      return true;
    }
    return false;
  }

  render(ctx) {
    ctx.fillStyle = '#0a1a3a';
    ctx.fillRect(0, 0, 320, 240);
    if (this.state === 'playing') {
      this._renderQuestion(ctx);
    } else {
      this._renderResults(ctx);
    }
  }

  _renderQuestion(ctx) {
    const font = this.game.font;
    const q = this.questions[this.qIndex];
    font.drawText(this.game.l10n.t('translate'), 110, 16, '#ff0', 1);
    font.drawText(`${this.qIndex + 1}/${this.questions.length}`, 280, 16, '#fff', 1);
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(30, 50, 260, 50);
    ctx.strokeStyle = '#fff';
    ctx.strokeRect(30.5, 50.5, 259, 49);
    const dw = font.textWidth(q.word.de, 2);
    font.drawText(q.word.de, (320 - dw) / 2, 65, '#fff', 2);
    for (let i = 0; i < q.options.length; i++) {
      const y = 115 + i * 22;
      const isSel = i === this.selected;
      ctx.fillStyle = isSel ? 'rgba(255,200,50,0.3)' : 'rgba(0,0,0,0.4)';
      ctx.fillRect(40, y, 240, 18);
      ctx.strokeStyle = isSel ? '#ff0' : '#888';
      ctx.strokeRect(40.5, y + 0.5, 239, 17);
      font.drawText(q.options[i].es, 50, y + 4, isSel ? '#ff0' : '#fff', 1);
    }
    const timeLeft = Math.max(0, this.maxTime - this.timer);
    const pct = timeLeft / this.maxTime;
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(20, 225, 280, 8);
    ctx.fillStyle = pct > 0.3 ? '#0f0' : '#f00';
    ctx.fillRect(20, 225, 280 * pct, 8);
  }

  _renderResults(ctx) {
    const font = this.game.font;
    font.drawText(this.game.l10n.t('results'), 130, 20, '#ff0', 2);
    font.drawText(`${this.correct}/${this.questions.length}`, 120, 60, '#fff', 3);
    font.drawText(this.game.l10n.t('vocabRecap'), 80, 110, '#0ff', 1);
    for (let i = 0; i < Math.min(5, this.results.length); i++) {
      const y = 130 + i * 14;
      const c = this.results[i].correct ? '#0f0' : '#f00';
      font.drawText(this.results[i].q.substring(0, 12), 30, y, c, 1);
      font.drawText(this.results[i].a.substring(0, 12), 160, y, '#fff', 1);
    }
    font.drawText('[Enter]', 130, 220, '#ff0', 1);
  }
}
