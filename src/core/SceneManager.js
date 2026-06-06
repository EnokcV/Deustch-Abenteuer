export class SceneManager {
  constructor(game) {
    this.game = game;
    this.scenes = new Map();
    this.current = null;
    this.currentId = null;
    this.lastError = null;
  }

  register(id, sceneInstance) {
    if (!id || !sceneInstance) {
      console.warn('[SceneManager] register() con argumentos inválidos:', id, sceneInstance);
      return;
    }
    this.scenes.set(id, sceneInstance);
    console.log('[SceneManager] Registrada escena:', id);
  }

  has(id) {
    return this.scenes.has(id);
  }

  switchTo(id, params = {}) {
    console.log('[SceneManager] switchTo() solicitado ->', id, params);

    if (!id || typeof id !== 'string') {
      console.error('[SceneManager] switchTo: id inválido', id);
      return this.fallbackToMenu('invalid-id');
    }

    const next = this.scenes.get(id);
    if (!next) {
      console.error('[SceneManager] switchTo: escena no encontrada ->', id,
        '| registradas:', Array.from(this.scenes.keys()));
      return this.fallbackToMenu('scene-not-found:' + id);
    }

    if (this.current && this.current === next) {
      console.log('[SceneManager] switchTo: ya estamos en', id, '-> re-llamando enter()');
      try {
        if (this.current.enter) this.current.enter(params);
      } catch (e) {
        console.error('[SceneManager] Error re-llamando enter() en', id, e);
        this.lastError = e;
      }
      return;
    }

    const previousId = this.currentId;
    if (this.current && this.current.exit) {
      try {
        console.log('[SceneManager] exit() de', previousId);
        this.current.exit();
      } catch (e) {
        console.error('[SceneManager] Error en exit() de', previousId, e);
        this.lastError = e;
      }
    }

    this.current = next;
    this.currentId = id;

    try {
      console.log('[SceneManager] enter() en', id);
      if (this.current.enter) this.current.enter(params);
    } catch (e) {
      console.error('[SceneManager] Error en enter() de', id, e);
      this.lastError = e;
      return this.fallbackToMenu('enter-throw:' + id);
    }
  }

  fallbackToMenu(reason) {
    console.warn('[SceneManager] Fallback al menú principal. Motivo:', reason);
    if (this.scenes.has('menu')) {
      try {
        this.current = this.scenes.get('menu');
        this.currentId = 'menu';
        if (this.current.enter) this.current.enter({ reason });
      } catch (e) {
        console.error('[SceneManager] Incluso el menú falló:', e);
        this.current = null;
        this.currentId = null;
      }
    } else {
      console.error('[SceneManager] No hay escena "menu" registrada. Juego detenido.');
    }
  }

  update(dt) {
    if (this.current && this.current.update) {
      try {
        this.current.update(dt);
      } catch (e) {
        console.error('[SceneManager] Error en update() de', this.currentId, e);
        this.lastError = e;
      }
    }
  }

  render(ctx) {
    if (this.current && this.current.render) {
      try {
        this.current.render(ctx);
      } catch (e) {
        console.error('[SceneManager] Error en render() de', this.currentId, e);
        this.lastError = e;
      }
    }
  }
}
