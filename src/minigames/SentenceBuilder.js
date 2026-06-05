import { getLessonWords } from '../data/vocabulary.js';

export class SentenceBuilder {
  constructor(game, lesson, onComplete) {
    this.game = game;
    this.lesson = lesson;
    this.onComplete = onComplete;
    this.words = [];
    this.questions = [];
    this.qIndex = 0;
    this.selected = [];
    this.available = [];
    this.state = 'playing';
    this.correct = 0;
  }

  start() {
    this.words = getLessonWords(this.lesson);
    const targets = this.words.slice(0, 4);
    this.questions = targets.map((w) => {
      const tokens = w.de.split(' ');
      return { target: w.de, tokens, scrambled: [...tokens].sort(() => Math.random() - 0.5) };
    });
    this.state = 'playing';
    this._loadQuestion();
  }

  _loadQuestion() {
    const q = this.questions[this.qIndex];
    this.selected = [];
    this.available = [...q.scrambled];
  }

  update(dt) {
    if (this.state !== 'playing') return;
    if (this.game.input.wasPressed('escape')) { this.finish(); return; }
    if (this.game.input.wasPressed('a') || this.game.input.wasPressed('arrowleft')) {
      if (this.selected.length > 0) {
        const last = this.selected.pop();
        this.available.push(last);
        this.game.audio.playSFX('blip');
      }
    }
    if (this.game.input.wasPressed('d') || this.game.input.wasPressed('arrowright')) {
      if (this.selected.length < this.questions[this.qIndex].tokens.length) {
        this.selected.push(this.available.shift());
        this.game.audio.playSFX('blip');
      }
    }
    if (this.game.input.wasPressed('enter')) {
      const built = this.selected.join(' ');
      const target = this.questions[this.qIndex].target;
      if (built === target) {
        this.correct++;
        this.game.audio.playSFX('correct');
      } else {
        this.game.audio.playSFX('wrong');
      }
      this.qIndex++;
      if (this.qIndex >= this.questions.length) this.finish();
      else this._loadQuestion();
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
    font.drawText(this.game.l10n.t('sentence'), 90, 10, '#ff0', 1);
    font.drawText(`${this.qIndex + 1}/${this.questions.length}`, 280, 10, '#fff', 1);
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fillRect(20, 40, 280, 30);
    ctx.strokeStyle = '#fff';
    ctx.strokeRect(20.5, 40.5, 279, 29);
    let cx = 30;
    for (const t of this.selected) {
      const w = font.textWidth(t, 1) + 6;
      ctx.fillStyle = '#0a4';
      ctx.fillRect(cx, 46, w, 18);
      font.drawText(t, cx + 3, 50, '#fff', 1);
      cx += w + 4;
    }
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fillRect(20, 90, 280, 30);
    let ax = 30;
    for (const t of this.available) {
      const w = font.textWidth(t, 1) + 6;
      ctx.fillStyle = '#444';
      ctx.fillRect(ax, 96, w, 18);
      font.drawText(t, ax + 3, 100, '#fff', 1);
      ax += w + 4;
      if (ax > 280) break;
    }
    font.drawText('[D] add  [A] undo  [Enter]', 50, 220, '#888', 1);
  }

  _renderResults(ctx) {
    const font = this.game.font;
    font.drawText(this.game.l10n.t('results'), 130, 20, '#ff0', 2);
    font.drawText(`${this.correct}/${this.questions.length}`, 120, 60, '#fff', 3);
    font.drawText('[Enter]', 130, 220, '#ff0', 1);
  }
}
