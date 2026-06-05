import { CONFIG } from '../core/Config.js';
import { Player } from '../entities/Player.js';
import { WorldMap } from '../worlds/WorldMap.js';
import { TilesetGenerator } from '../graphics/TilesetGenerator.js';
import { WeatherSystem } from '../graphics/WeatherSystem.js';
import { HUD } from '../ui/HUD.js';
import { TranslationQuiz } from '../minigames/TranslationQuiz.js';
import { MatchingGame } from '../minigames/MatchingGame.js';
import { SentenceBuilder } from '../minigames/SentenceBuilder.js';
import { SignReading } from '../minigames/SignReading.js';

export class GameScene {
  constructor(game) {
    this.game = game;
    this.font = game.font;
    this.ctx = game.engine.ctx;
    this.world = null;
    this.tileset = new TilesetGenerator();
    this.weather = new WeatherSystem();
    this.player = null;
    this.hud = new HUD(game);
    this.camX = 0;
    this.camY = 0;
    this.dialogueNpc = null;
    this.dialogueIndex = 0;
    this.dialogueActive = false;
    this.miniGame = null;
    this.messageText = null;
    this.messageTimer = 0;
    this.paused = false;
  }

  enter(params = {}) {
    this.cityId = params.city || 'berlin';
    this.sceneId = params.scene || 'town';
    this.world = new WorldMap(this.game);
    this.world.loadCity(this.cityId, this.sceneId);
    const startX = (params.x || 4) * 16;
    const startY = (params.y || 15) * 16;
    this.player = new Player(this.game, startX, startY);
    this.player.id = this.game.save.lastSave?.avatar || 'enoc';
    this.game.audio.playCityBGM(this.cityId);
    this.weather.setType(this.world.ambient, this.world.ambientIntensity);
    this.game.audio.playSFX('open');
    this.dialogueActive = false;
    this.dialogueNpc = null;
    this.miniGame = null;
  }

  exit() {
    this.weather.setType('none');
  }

  update(dt) {
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
          this.dialogueIndex = 0;
        }
      }
      return;
    }

    if (this.dialogueActive) {
      if (this.game.input.wasPressed('enter') || this.game.input.wasPressed(' ')) {
        this.game.audio.playSFX('blip');
        this.dialogueIndex++;
        if (this.dialogueIndex >= this.dialogueNpc.msg.length) {
          this._startMiniGame(this.dialogueNpc);
        }
      }
      return;
    }

    if (this.game.input.wasPressed('escape')) {
      this.game.scenes.switchTo('pause', { city: this.cityId, scene: this.sceneId, x: Math.floor(this.player.x / 16), y: Math.floor(this.player.y / 16) });
      return;
    }

    if (this.messageTimer > 0) {
      this.messageTimer -= dt;
      if (this.messageTimer <= 0) this.messageText = null;
    }

    this.player.update(dt, this.world);
    this._updateCamera();
    this._checkInteractions();
    this._checkCollectibles();
    this._checkPortals();

    for (const npc of this.world.npcs) npc.update(dt);
    for (const col of this.world.collectibles) col.update(dt);
    for (const obj of this.world.interactables) obj.update(dt);
    this.weather.update(dt, this.camX, this.camY);
  }

  _updateCamera() {
    const W = 320, H = 240;
    const targetX = this.player.x + 6 - W / 2;
    const targetY = this.player.y + 7 - H / 2;
    const maxX = this.world.MAP_W * 16 - W;
    const maxY = this.world.MAP_H * 16 - H;
    const tx = Math.max(0, Math.min(maxX, targetX));
    const ty = Math.max(0, Math.min(maxY, targetY));
    this.camX += (tx - this.camX) * 0.15;
    this.camY += (ty - this.camY) * 0.15;
  }

  _checkInteractions() {
    for (const npc of this.world.npcs) {
      if (npc.isAdjacent(this.player)) {
        npc.iconCooldown = 0.5;
        if (this.game.input.wasPressed('enter')) {
          this.game.audio.playSFX('select');
          this.dialogueActive = true;
          this.dialogueNpc = npc;
          this.dialogueIndex = 0;
          return;
        }
      }
    }
    for (const obj of this.world.interactables) {
      if (obj.type === 'sign' && obj.isAdjacent(this.player)) {
        if (this.game.input.wasPressed('enter')) {
          this._showMessage(this.game.l10n.lang === 'DE' ? obj.textDe : obj.textEs);
          this.game.audio.playSFX('blip');
          return;
        }
      }
    }
  }

  _checkCollectibles() {
    for (const c of this.world.collectibles) {
      if (c.isColliding(this.player)) {
        c.collected = true;
        this.game.audio.playSFX('coin');
        const city = this.cityId;
        this.game.save.lastSave.collectibles[city] = (this.game.save.lastSave.collectibles[city] || 0) + 1;
        this._showMessage('+1 ' + this.game.l10n.t('stars'));
      }
    }
  }

  _checkPortals() {
    for (const p of this.world.portals) {
      const dx = Math.abs((this.player.x + 6) - (p.x + 8));
      const dy = Math.abs((this.player.y + 6) - (p.y + 8));
      if (dx < 14 && dy < 14) {
        if (this.game.input.wasPressed('enter')) {
          this.game.audio.playSFX('open');
          if (p.toCity === 'worldmap') {
            this.game.save.lastSave.lastCity = this.cityId;
            this.game.save.lastSave.lastScene = this.sceneId;
            this.game.save.lastSave.lastX = Math.floor(this.player.x / 16);
            this.game.save.lastSave.lastY = Math.floor(this.player.y / 16);
            this.game.save.set(0, this.game.save.lastSave);
            this.game.audio.playErika();
            this.game.scenes.switchTo('worldmap', { x: 1, y: 1 });
            return;
          }
          this.game.scenes.switchTo('game', { city: p.toCity, scene: p.toScene, x: p.toX || 4, y: p.toY || 15 });
          return;
        }
        this._showMessage('[E] ' + this.game.l10n.t(p.name) + ' ' + this.game.l10n.t('enter'));
      }
    }
  }

  _startMiniGame(npc) {
    this.game.audio.playSFX('fanfare');
    const lesson = npc.lesson;
    if (npc.type === 'quiz') {
      this.miniGame = new TranslationQuiz(this.game, lesson, (r) => this._onMiniGameEnd(r));
    } else if (npc.type === 'matching') {
      this.miniGame = new MatchingGame(this.game, lesson, (r) => this._onMiniGameEnd(r));
    } else if (npc.type === 'sentence') {
      this.miniGame = new SentenceBuilder(this.game, lesson, (r) => this._onMiniGameEnd(r));
    } else if (npc.type === 'sign') {
      this.miniGame = new SignReading(this.game, lesson, (r) => this._onMiniGameEnd(r));
    } else {
      this.miniGame = new TranslationQuiz(this.game, lesson, (r) => this._onMiniGameEnd(r));
    }
    this.miniGame.start();
  }

  _onMiniGameEnd(r) {
    this.dialogueActive = false;
    this.dialogueNpc = null;
    this.dialogueIndex = 0;
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
      this.miniGame.render(this.ctx);
      return;
    }
    this._renderWorld();
    this._renderUI();
    if (this.dialogueActive && this.dialogueNpc) {
      this.hud.drawDialogue(this.dialogueNpc.name, this.dialogueNpc.msg[this.dialogueIndex]);
    }
    if (this.messageText) {
      this.hud.drawMessage(this.messageText);
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

    const startCol = Math.max(0, Math.floor(this.camX / 16));
    const endCol = Math.min(this.world.MAP_W - 1, Math.floor((this.camX + 320) / 16) + 1);
    const startRow = Math.max(0, Math.floor(this.camY / 16));
    const endRow = Math.min(this.world.MAP_H - 1, Math.floor((this.camY + 240) / 16) + 1);
    for (let y = startRow; y <= endRow; y++) {
      for (let x = startCol; x <= endCol; x++) {
        const t = this.world.getTile(x, y);
        if (t === 0) continue;
        const tile = this.tileset.getTile(t);
        if (tile) ctx.drawImage(tile, x * 16 - this.camX, y * 16 - this.camY);
      }
    }

    for (const obj of this.world.interactables) obj.render(ctx, this.camX, this.camY);
    for (const col of this.world.collectibles) col.render(ctx, this.camX, this.camY);
    for (const npc of this.world.npcs) npc.render(ctx, this.camX, this.camY, this.game.sprites.getNPCSprite(npc.sprite));

    const sp = this.game.sprites.getSheet(this.player.id);
    this.player.render(ctx, this.camX, this.camY, sp);

    for (const npc of this.world.npcs) if (npc.isAdjacent(this.player)) npc.renderIcon(ctx, this.camX, this.camY);

    this.weather.render(ctx);
  }

  _renderUI() {
    const cityName = this.game.l10n.t(this.cityId);
    const vocabScore = this.game.save.lastSave?.totalStars || 0;
    this.hud.drawPlayerBar(this.player, cityName, vocabScore);
    if (this.game.input.keys['m'] || this._minimapVisible()) {
      this.hud.drawMinimap(this.player, this.world, this.cityId);
    }
  }

  _minimapVisible() { return true; }
}
