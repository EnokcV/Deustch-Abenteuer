export class ResultsScene {
  constructor(game) {
    this.game = game;
    this.font = game.font;
    this.ctx = game.engine.ctx;
    this.results = { score: 0, total: 0, words: [] };
  }

  enter(params = {}) {
    this.results = params.results || this.results;
    this.nextScene = params.next || 'game';
    this.nextParams = params.nextParams || {};
  }

  exit() {}

  update(dt) {
    try {
    if (this.game.input.wasPressed('enter') || this.game.input.wasPressed('escape')) {
      this.game.audio.playSFX('select');
      this.game.scenes.switchTo(this.nextScene, this.nextParams);
    }
    } catch (e) {
      console.error('[Results] Error en update():', e);
    }
  }

  render() {
    const ctx = this.ctx;
    ctx.fillStyle = '#0a1a3a';
    ctx.fillRect(0, 0, 320, 240);
    const tw = this.font.textWidth(this.game.l10n.t('results'), 2);
    this.font.drawText(this.game.l10n.t('results'), (320 - tw) / 2, 30, '#ff0', 2);
    const sw = this.font.textWidth(`${this.results.score}/${this.results.total}`, 3);
    this.font.drawText(`${this.results.score}/${this.results.total}`, (320 - sw) / 2, 70, '#fff', 3);
    let y = 110;
    for (const w of (this.results.words || []).slice(0, 6)) {
      const c = w.correct ? '#0f0' : '#f00';
      this.font.drawText(w.q.substring(0, 14), 30, y, c, 1);
      this.font.drawText(w.a.substring(0, 14), 160, y, '#fff', 1);
      y += 12;
    }
    this.font.drawText('[Enter]', 130, 220, '#ff0', 1);
  }
}
