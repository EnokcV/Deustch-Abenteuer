export class SceneManager {
  constructor(game) {
    this.game = game;
    this.scenes = new Map();
    this.current = null;
    this.currentId = null;
  }

  register(id, sceneInstance) {
    this.scenes.set(id, sceneInstance);
  }

  switchTo(id, params = {}) {
    const next = this.scenes.get(id);
    if (!next) {
      console.error('Scene not found:', id);
      return;
    }
    if (this.current && this.current.exit) this.current.exit();
    this.current = next;
    this.currentId = id;
    if (this.current.enter) this.current.enter(params);
  }

  update(dt) {
    if (this.current && this.current.update) this.current.update(dt);
  }

  render(ctx) {
    if (this.current && this.current.render) this.current.render(ctx);
  }
}
