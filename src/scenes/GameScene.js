import { CONFIG, TILE, DIRECTION } from '../core/Config.js';
import { Player } from '../entities/Player.js';
import { WorldMap } from '../worlds/WorldMap.js';
import { TilesetGenerator } from '../graphics/TilesetGenerator.js';
import { MonumentGenerator } from '../graphics/MonumentGenerator.js';
import { PedestrianGenerator } from '../entities/PedestrianGenerator.js';
import { WeatherSystem } from '../graphics/WeatherSystem.js';
import { HUD } from '../ui/HUD.js';
import { DialogueSystem, buildHansTree, buildFrauMuellerTree, buildLukasTree, buildKapitaenOttoTree } from '../ui/DialogueSystem.js';
import { TrafficSystem } from '../entities/TrafficSystem.js';
import { PedestrianSystem } from '../entities/PedestrianSystem.js';
import { WindSystem, FlagWaver, Fountain, PigeonFlock } from '../graphics/AmbientEffects.js';
import { TranslationQuiz } from '../minigames/TranslationQuiz.js';
import { MatchingGame } from '../minigames/MatchingGame.js';
import { SentenceBuilder } from '../minigames/SentenceBuilder.js';
import { SignReading } from '../minigames/SignReading.js';

const NPC_TREES = {
  'Hans': buildHansTree,
  'Frau Müller': buildFrauMuellerTree,
  'Lukas': buildLukasTree,
  'Kapitän Otto': buildKapitaenOttoTree,
};

export class GameScene {
  constructor(game) {
    this.game = game;
    this.font = game.font;
    this.ctx = game.engine.ctx;
    this.world = null;
    this.tileset = new TilesetGenerator();
    this.monuments = new MonumentGenerator();
    this.pedestrianGen = new PedestrianGenerator();
    this.weather = new WeatherSystem();
    this.player = null;
    this.hud = new HUD(game);
    this.dialogue = new DialogueSystem(game);
    this.traffic = new TrafficSystem();
    this.pedestrians = new PedestrianSystem();
    this.wind = new WindSystem();
    this.flags = [];
    this.fountains = [];
    this.pigeons = null;
    this.camX = 0;
    this.camY = 0;
    this.dialogueActive = false;
    this.miniGame = null;
    this.messageText = null;
    this.messageTimer = 0;
    this.paused = false;
    this.fadeAlpha = 0;
    this.fadeTarget = 0;
  }

  enter(params = {}) {
    try {
      this.cityId = params.city || 'berlin';
      this.sceneId = params.scene || 'town';
      console.log('[GameScene] enter() city=' + this.cityId + ' scene=' + this.sceneId);
      this.world = new WorldMap(this.game);
      this.world.loadCity(this.cityId, this.sceneId);
      const startX = (params.x || 60) * CONFIG.TILE + (CONFIG.TILE - CONFIG.PLAYER_W) / 2;
      const startY = (params.y || 38) * CONFIG.TILE + (CONFIG.TILE - CONFIG.PLAYER_H) / 2;
      this.player = new Player(this.game, startX, startY);
      this.player.id = (this.game.save.lastSave && this.game.save.lastSave.avatar) || 'enoc';
      this.player.sprintUnlocked = (this.game.save.lastSave && this.game.save.lastSave.sprintUnlocked) || false;
      try { this.game.audio.playCityBGM(this.cityId); } catch (e) { console.warn('[GameScene] audio.playCityBGM falló:', e); }
      try { this.weather.setType(this.world.ambient, this.world.ambientIntensity); } catch (e) { console.warn('[GameScene] weather falló:', e); }
      this.dialogueActive = false;
      this.dialogue.active = false;
      this.miniGame = null;
      this.fadeAlpha = 1;
      this.fadeTarget = 0;
      try { this.traffic.setup(this.cityId, this.sceneId); } catch (e) { console.warn('[GameScene] traffic.setup falló:', e); }
      try { this.pedestrians.setup(this.cityId, this.sceneId, this.pedestrianGen); } catch (e) { console.warn('[GameScene] pedestrians.setup falló:', e); }
      try { this._setupBerlinAmbient(); } catch (e) { console.warn('[GameScene] _setupBerlinAmbient falló:', e); }
      console.log('[GameScene] enter() completado OK');
    } catch (e) {
      console.error('[GameScene] Error crítico en enter():', e);
      try { this.game.scenes.switchTo('menu', { reason: 'game-scene-error' }); } catch (_) {}
      throw e;
    }
  }

  _setupBerlinAmbient() {
    this.flags = [];
    this.fountains = [];
    this.wind.clear();
    if (this.cityId === 'berlin' && this.sceneId === 'town') {
      this.flags.push(new FlagWaver({ x: 60 * 32, y: 5 * 32, w: 16, h: 10, color: '#000' }));
      this.flags.push(new FlagWaver({ x: 60 * 32, y: 5 * 32, w: 16, h: 10, color: '#dd0', phaseOffset: 0.3 }));
      this.flags.push(new FlagWaver({ x: 60 * 32, y: 5 * 32, w: 16, h: 10, color: '#dd0000', phaseOffset: 0.6 }));
      this.fountains.push(new Fountain({ x: 56 * 32, y: 36 * 32 }));
      this.fountains.push(new Fountain({ x: 95 * 32, y: 28 * 32 }));
      this.pigeons = new PigeonFlock({ x: 8 * 32, y: 14 * 32, count: 8, sprite: this.monuments.get('pigeon') });
      for (let i = 0; i < 30; i++) {
        this.wind.add({
          x: (10 + Math.random() * 100) * CONFIG.TILE,
          y: (10 + Math.random() * 60) * CONFIG.TILE,
          phaseOffset: Math.random() * Math.PI * 2,
          speed: 1.5 + Math.random() * 1.5,
          amount: 0.5 + Math.random() * 1.5,
        });
      }
    }
  }

  exit() {
    this.weather.setType('none');
  }

  update(dt) {
    try {
    if (this.fadeAlpha !== this.fadeTarget) {
      this.fadeAlpha += (this.fadeTarget - this.fadeAlpha) * dt * 8;
      if (Math.abs(this.fadeAlpha - this.fadeTarget) < 0.01) this.fadeAlpha = this.fadeTarget;
    }

    if (this.miniGame) {
      this.miniGame.update(dt);
      if (this.miniGame.state === 'done') {
        if (this.game.input.wasPressed('enter') || this.game.input.wasPressed('escape')) {
          const mg = this.miniGame;
          this.miniGame = null;
          if (this.dialogueNpc) {
            const starsEarned = mg.correct || 0;
            const city = this.cityId;
            this.game.save.lastSave.stars[city] = (this.game.save.lastSave.stars[city] || 0) + starsEarned;
            this.game.save.lastSave.totalStars = this.game.save.totalStars(this.game.save.lastSave);
            this.game.save.set(0, this.game.save.lastSave);
            this._checkUnlock(starsEarned);
          }
          this.dialogueActive = false;
          this.dialogueNpc = null;
        }
      }
      return;
    }

    if (this.dialogue.active) {
      this.dialogue.update(dt);
      if (!this.dialogue.active) {
        this.player.isInteracting = false;
      }
      return;
    }

    if (this.game.input.wasPressed('escape')) {
      const tx = Math.floor((this.player.x + this.player.w / 2) / CONFIG.TILE);
      const ty = Math.floor((this.player.y + this.player.h / 2) / CONFIG.TILE);
      this.game.scenes.switchTo('pause', { city: this.cityId, scene: this.sceneId, x: tx, y: ty });
      return;
    }

    if (this.messageTimer > 0) {
      this.messageTimer -= dt;
      if (this.messageTimer <= 0) this.messageText = null;
    }

    this.player.update(dt, this.world);
    this._updateCamera(dt);
    this._checkInteractions();
    this._checkCollectibles();
    this._checkPortals();

    for (const npc of this.world.npcs) npc.update(dt, this.player);
    for (const col of this.world.collectibles) col.update(dt);
    for (const obj of this.world.interactables) obj.update(dt);
    for (const plat of this.world.movingPlatforms) {
      plat.update(dt);
      if (plat.isPlayerOn(this.player)) {
        this.player.x += plat.getDx(dt);
        this.player.y += plat.getDy(dt);
      }
    }
    this.traffic.update(dt, this.world);
    this.pedestrians.update(dt);
    for (const f of this.fountains) f.update(dt);
    if (this.pigeons) this.pigeons.update(dt);
    this.tileset.update(dt);
    this.weather.update(dt, this.camX, this.camY);
    } catch (e) {
      console.error('[GameScene] Error en update():', e);
    }
  }

  _updateCamera(dt) {
    const W = 320, H = 240;
    const cx = this.player.x + this.player.w / 2;
    const cy = this.player.y + this.player.h / 2;
    let lookX = 0, lookY = 0;
    if (this.player.isSprinting && this.player.isMoving) {
      switch (this.player.facing) {
        case DIRECTION.DOWN: lookY = CONFIG.LOOK_AHEAD; break;
        case DIRECTION.UP: lookY = -CONFIG.LOOK_AHEAD; break;
        case DIRECTION.LEFT: lookX = -CONFIG.LOOK_AHEAD; break;
        case DIRECTION.RIGHT: lookX = CONFIG.LOOK_AHEAD; break;
      }
    }
    const targetX = cx + lookX - W / 2;
    const targetY = cy + lookY - H / 2;
    const maxX = this.world.MAP_W * CONFIG.TILE - W;
    const maxY = this.world.MAP_H * CONFIG.TILE - H;
    const clampedX = Math.max(0, Math.min(maxX, targetX));
    const clampedY = Math.max(0, Math.min(maxY, targetY));
    this.camX += (clampedX - this.camX) * CONFIG.CAMERA_LERP;
    this.camY += (clampedY - this.camY) * CONFIG.CAMERA_LERP;
  }

  _checkInteractions() {
    const ray = this.player.getFacingRay();
    const active = this.game.input.wasPressed('enter') || this.game.input.wasPressed(' ');

    let closest = null;
    let closestDist = Infinity;

    for (const npc of this.world.npcs) {
      if (this._rayIntersects(ray, npc)) {
        const d = this._distTo(ray, npc);
        if (d < closestDist) {
          closestDist = d;
          closest = npc;
        }
      }
    }

    if (closest && active) {
      this.game.audio.playSFX('select');
      this.player.isInteracting = true;
      this.dialogueNpc = closest;
      this._startDialogue(closest);
      return;
    }

    for (const obj of this.world.interactables) {
      if (obj.type === 'sign' && this._rayIntersects(ray, obj)) {
        if (active) {
          this._showMessage(this.game.l10n.lang === 'DE' ? obj.textDe : obj.textEs);
          this.game.audio.playSFX('blip');
          return;
        }
      }
    }
  }

  _startDialogue(npc) {
    const treeBuilder = NPC_TREES[npc.name];
    if (treeBuilder) {
      this.dialogue.start(npc, treeBuilder(this.game), (miniGameType) => {
        this._startMiniGame(npc, miniGameType);
      });
    } else {
      this.dialogue.start(npc, { start: { text: npc.msg?.[0] || 'Hallo!', end: true } });
    }
  }

  _distTo(ray, entity) {
    const ex = entity.x + (entity.w || 16) / 2;
    const ey = entity.y + (entity.h || 16) / 2;
    const dx = ex - ray.x1;
    const dy = ey - ray.y1;
    return Math.sqrt(dx * dx + dy * dy);
  }

  _rayIntersects(ray, entity) {
    const ex = entity.x;
    const ey = entity.y;
    const ew = entity.w || 32;
    const eh = entity.h || 32;
    const cx = ex + ew / 2;
    const cy = ey + eh / 2;
    const dx = cx - ray.x1;
    const dy = cy - ray.y1;
    const dot = (cx - ray.x1) * (ray.x2 - ray.x1) + (cy - ray.y1) * (ray.y2 - ray.y1);
    if (dot < 0) return false;
    const lenSq = (ray.x2 - ray.x1) ** 2 + (ray.y2 - ray.y1) ** 2;
    if (dot > lenSq) return false;
    const dist = Math.sqrt(dx * dx + dy * dy);
    return dist < CONFIG.INTERACT_RADIUS;
  }

  _checkCollectibles() {
    for (const c of this.world.collectibles) {
      if (c.isColliding(this.player)) {
        c.collect();
        this.game.audio.playSFX('coin');
        const city = this.cityId;
        this.game.save.lastSave.collectibles[city] = (this.game.save.lastSave.collectibles[city] || 0) + 1;
        this._showMessage('+1 ' + this.game.l10n.t('stars'));
      }
    }
  }

  _checkPortals() {
    const pcx = this.player.x + this.player.w / 2;
    const pcy = this.player.y + this.player.h / 2;
    for (const p of this.world.portals) {
      const dx = Math.abs(pcx - (p.x + 16));
      const dy = Math.abs(pcy - (p.y + 16));
      if (dx < CONFIG.TILE && dy < CONFIG.TILE) {
        if (this.game.input.wasPressed('enter')) {
          this.player.isInteracting = true;
          this.game.audio.playSFX('open');
          this.fadeTarget = 1;
          if (p.name === 'worldmap') {
            this.game.save.lastSave.lastCity = this.cityId;
            this.game.save.lastSave.lastScene = this.sceneId;
            this.game.save.lastSave.lastX = Math.floor(pcx / CONFIG.TILE);
            this.game.save.lastSave.lastY = Math.floor(pcy / CONFIG.TILE);
            this.game.save.set(0, this.game.save.lastSave);
            this.game.audio.playErika();
            this.game.scenes.switchTo('worldmap', { cityId: this.cityId });
          } else {
            this.game.scenes.switchTo('game', { city: p.targetCity, scene: p.targetScene, x: p.toX || 60, y: p.toY || 38 });
          }
          return;
        }
        const portalName = p.name === 'worldmap' ? this.game.l10n.t('worldmap') : p.name;
        this._showMessage('[E] ' + portalName + ' ' + this.game.l10n.t('enter'));
      }
    }
  }

  _startMiniGame(npc, miniGameType) {
    this.game.audio.playSFX('fanfare');
    this.player.isInteracting = true;
    const lesson = npc.lesson;
    let game;
    if (miniGameType === 'quiz') game = new TranslationQuiz(this.game, lesson, (r) => this._onMiniGameEnd(r));
    else if (miniGameType === 'matching') game = new MatchingGame(this.game, lesson, (r) => this._onMiniGameEnd(r));
    else if (miniGameType === 'sentence') game = new SentenceBuilder(this.game, lesson, (r) => this._onMiniGameEnd(r));
    else if (miniGameType === 'sign') game = new SignReading(this.game, lesson, (r) => this._onMiniGameEnd(r));
    else game = new TranslationQuiz(this.game, lesson, (r) => this._onMiniGameEnd(r));
    this.miniGame = game;
    this.miniGame.start();
  }

  _onMiniGameEnd(r) {
    this.player.isInteracting = false;
    this.dialogueActive = false;
    this.dialogueNpc = null;
  }

  _checkUnlock(stars) {
    const save = this.game.save.lastSave;
    const order = ['berlin', 'frankfurt', 'munchen', 'hamburg'];
    const idx = order.indexOf(this.cityId);
    if (idx >= 0 && idx < order.length - 1) {
      if (save.stars[this.cityId] >= 3 && !save.unlocked.includes(order[idx + 1])) {
        save.unlocked.push(order[idx + 1]);
        this._showMessage('Unlocked: ' + this.game.l10n.t(order[idx + 1]));
        this.game.audio.playSFX('fanfare');
        this.player.sprintUnlocked = true;
        save.sprintUnlocked = true;
      }
    }
    this.game.save.set(0, save);
  }

  _showMessage(text) {
    this.messageText = text;
    this.messageTimer = 3;
  }

  render() {
    if (this.miniGame) {
      try { this.miniGame.render(this.ctx); } catch (e) { console.error('[GameScene] miniGame.render falló:', e); }
      return;
    }
    try { this._renderWorld(); } catch (e) { console.error('[GameScene] _renderWorld falló:', e); }
    try { this._renderUI(); } catch (e) { console.error('[GameScene] _renderUI falló:', e); }
    if (this.messageText) {
      try { this.hud.drawMessage(this.messageText); } catch (e) { console.error('[GameScene] drawMessage falló:', e); }
    }
    if (this.dialogue.active) {
      try { this.dialogue.render(this.ctx); } catch (e) { console.error('[GameScene] dialogue.render falló:', e); }
    }
    if (this.fadeAlpha > 0.01) {
      this.ctx.fillStyle = `rgba(0,0,0,${this.fadeAlpha})`;
      this.ctx.fillRect(0, 0, 320, 240);
    }
  }

  _renderWorld() {
    const ctx = this.ctx;
    const skyColors = {
      berlin: ['#3a4a6a', '#5a6a8a'],
      hamburg: ['#3a4a6a', '#5a7a9a'],
      frankfurt: ['#5a6a8a', '#7a9aba'],
      munchen: ['#5a8aca', '#a0c8e0'],
    };
    const colors = skyColors[this.cityId] || skyColors.berlin;
    const grd = ctx.createLinearGradient(0, 0, 0, 240);
    grd.addColorStop(0, colors[0]);
    grd.addColorStop(1, colors[1]);
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, 320, 240);

    if (this.cityId === 'berlin' && this.sceneId === 'town') {
      const ft = this.monuments.get('fernsehturm');
      if (ft) ctx.drawImage(ft, 110 * CONFIG.TILE - this.camX, 5 * CONFIG.TILE - this.camY);
    }

    const visibleChunks = this.world.getVisibleChunks(this.camX, this.camY);
    for (const key of visibleChunks) {
      const canvas = this.world.getChunkCanvas(key, this.tileset);
      if (canvas) {
        const [cx, cy] = key.split(',').map(Number);
        ctx.drawImage(canvas,
          cx * this.world.chunkSize * CONFIG.TILE - this.camX,
          cy * this.world.chunkSize * CONFIG.TILE - this.camY);
      }
    }

    const startCol = Math.max(0, Math.floor(this.camX / CONFIG.TILE));
    const endCol = Math.min(this.world.MAP_W - 1, Math.floor((this.camX + 320) / CONFIG.TILE) + 1);
    const startRow = Math.max(0, Math.floor(this.camY / CONFIG.TILE));
    const endRow = Math.min(this.world.MAP_H - 1, Math.floor((this.camY + 240) / CONFIG.TILE) + 1);

    for (let y = startRow; y <= endRow; y++) {
      for (let x = startCol; x <= endCol; x++) {
        const t = this.world.getTile(x, y);
        if (t !== TILE.WALL && t !== TILE.ROOF) continue;
        const tile = this.tileset.getTile(t);
        if (tile) ctx.drawImage(tile, x * CONFIG.TILE - this.camX, y * CONFIG.TILE - this.camY);
      }
    }

    for (let y = startRow; y <= endRow; y++) {
      for (let x = startCol; x <= endCol; x++) {
        if (this.world.getTile(x, y) !== TILE.BRIDGE) continue;
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.fillRect(x * CONFIG.TILE - this.camX, (y + 1) * CONFIG.TILE - this.camY, CONFIG.TILE, 4);
      }
    }

    for (let y = startRow; y <= endRow; y++) {
      for (let x = startCol; x <= endCol; x++) {
        const t = this.world.getTile(x, y);
        if (t !== TILE.BRIDGE) continue;
        const tile = this.tileset.getTile(t);
        if (tile) ctx.drawImage(tile, x * CONFIG.TILE - this.camX, y * CONFIG.TILE - this.camY);
      }
    }

    if (this.cityId === 'berlin' && this.sceneId === 'town') {
      const bg = this.monuments.get('brandenburger');
      if (bg) ctx.drawImage(bg, 50 * CONFIG.TILE - this.camX, 14 * CONFIG.TILE - 96 - this.camY);
      const rt = this.monuments.get('reichstag');
      if (rt) ctx.drawImage(rt, 75 * CONFIG.TILE - this.camX, 6 * CONFIG.TILE - 80 - this.camY);
      const dom = this.monuments.get('dom');
      if (dom) ctx.drawImage(dom, 90 * CONFIG.TILE - this.camX, 24 * CONFIG.TILE - 96 - this.camY);
      const mu = this.monuments.get('museum');
      if (mu) ctx.drawImage(mu, 88 * CONFIG.TILE - this.camX, 36 * CONFIG.TILE - 80 - this.camY);
    }

    for (const flag of this.flags) flag.render(ctx, this.camX, this.camY);
    for (const f of this.fountains) f.render(ctx, this.camX, this.camY);
    if (this.pigeons) this.pigeons.render(ctx, this.camX, this.camY);

    const bottomY = (entity) => entity.y + (entity.h || 32);
    const entities = [
      ...this.world.interactables.map(e => ({ entity: e, sortY: bottomY(e) })),
      ...this.world.collectibles.map(e => ({ entity: e, sortY: e.y + 16 })),
      ...this.world.npcs.map(e => ({ entity: e, sortY: e.y + 28 })),
      ...this.world.movingPlatforms.map(e => ({ entity: e, sortY: e.y + e.h })),
      ...this.pedestrians.pedestrians.map(e => ({ entity: { _ped: e, render: (cx, cy) => e.render(cx, cy) }, sortY: e.y })),
      { entity: { _isPlayer: true }, sortY: this.player.y + this.player.h },
    ];
    entities.sort((a, b) => a.sortY - b.sortY);

    for (const { entity } of entities) {
      if (entity._isPlayer) {
        const sp = this.game.sprites.getSheet(this.player.id);
        this.player.render(ctx, this.camX, this.camY, sp);
      } else if (entity._ped) {
        entity._ped.render(ctx, this.camX, this.camY);
      } else if (entity.render) {
        entity.render(ctx, this.camX, this.camY);
      }
    }

    this.traffic.render(ctx, this.camX, this.camY, this.monuments);

    for (const npc of this.world.npcs) {
      const dist = this._distTo(this.player.getFacingRay(), npc);
      if (dist < CONFIG.INTERACT_RADIUS) npc.renderIcon(ctx, this.camX, this.camY);
    }

    for (const p of this.world.portals) {
      const px = Math.floor(p.x + 16 - this.camX);
      const py = Math.floor(p.y - this.camY - 8 + Math.sin(Date.now() / 300) * 2);
      ctx.fillStyle = 'rgba(255, 255, 100, 0.6)';
      ctx.beginPath();
      ctx.arc(px, py, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.fillRect(px - 3, py - 1, 6, 2);
      ctx.fillRect(px - 1, py - 3, 2, 6);
    }

    this.weather.render(ctx);
  }

  _renderUI() {
    try {
    const cityName = this.game.l10n.t(this.cityId);
    const vocabScore = (this.game.save.lastSave && this.game.save.lastSave.totalStars) || 0;
    this.hud.drawPlayerBar(this.player, cityName, vocabScore);
    if (this.game.input.keys['m'] || this._minimapVisible()) {
      this.hud.drawMinimap(this.player, this.world, this.cityId);
    }
    } catch (e) {
      console.error('[GameScene] Error en _renderUI():', e);
    }
  }

  _minimapVisible() { return true; }
}
