import { CONFIG, TILE } from '../core/Config.js';
import {
  buildBerlinTown, buildHamburgPort, buildHamburgBeach, buildFrankfurtTown,
  buildMunchenTown, buildInterior,
} from './TerrainBuilder.js';
import { CITY_SCENES } from '../data/cityData.js';
import { InteractiveObject } from '../entities/InteractiveObject.js';
import { NPC } from '../entities/NPC.js';
import { Collectible } from '../entities/Collectible.js';

export class WorldMap {
  constructor(game) {
    this.game = game;
    this.MAP_W = CONFIG.MAP_W;
    this.MAP_H = CONFIG.MAP_H;
    this.TILE = CONFIG.TILE;
    this.tiles = new Array(this.MAP_W * this.MAP_H).fill(0);
    this.interactables = [];
    this.npcs = [];
    this.collectibles = [];
    this.portals = [];
    this.ambient = 'none';
    this.ambientIntensity = 0;
    this.name = '';
  }

  getTile(x, y) { return this.tiles[y * this.MAP_W + x] ?? 0; }
  setTile(x, y, v) {
    if (x < 0 || x >= this.MAP_W || y < 0 || y >= this.MAP_H) return;
    this.tiles[y * this.MAP_W + x] = v;
  }

  isSolid(tile) {
    return tile === TILE.GROUND || tile === TILE.WALL || tile === TILE.WATER;
  }

  loadCity(cityId, sceneId) {
    if (cityId === 'worldmap') {
      this.tiles = new Array(this.MAP_W * this.MAP_H).fill(0);
      for (let x = 0; x < this.MAP_W; x++) for (let y = 16; y < 19; y++) this.setTile(x, y, TILE.GROUND);
      for (let x = 0; x < this.MAP_W; x++) for (let y = 14; y < 16; y++) this.setTile(x, y, TILE.GRASS);
      for (let x = 0; x < this.MAP_W; x++) for (let y = 0; y < 14; y++) this.setTile(x, y, 0);
      this.name = 'Deutschland';
      this.ambient = 'none';
      this.interactables = [];
      this.collectibles = [];
      this.npcs = [];
      this.portals = [
        { x: 6 * 16, y: 14 * 16, targetCity: 'berlin', targetScene: 'town' },
        { x: 4 * 16, y: 6 * 16, targetCity: 'hamburg', targetScene: 'town' },
        { x: 10 * 16, y: 14 * 16, targetCity: 'frankfurt', targetScene: 'town' },
        { x: 14 * 16, y: 14 * 16, targetCity: 'munchen', targetScene: 'town' },
      ];
      return;
    }

    const data = CITY_SCENES[cityId]?.[sceneId];
    if (!data) return;

    this.tiles = new Array(this.MAP_W * this.MAP_H).fill(0);
    this.name = data.name;
    this.ambient = data.ambient;
    this.ambientIntensity = data.ambientIntensity || 0.3;

    const terrain = data.terrain;
    if (terrain === 'berlin_town') buildBerlinTown(this);
    else if (terrain === 'hamburg_port') buildHamburgPort(this);
    else if (terrain === 'hamburg_beach') buildHamburgBeach(this);
    else if (terrain === 'frankfurt_town') buildFrankfurtTown(this);
    else if (terrain === 'munchen_town') buildMunchenTown(this);
    else if (terrain === 'interior') buildInterior(this, data.walls, data.floor);

    this.interactables = [];
    this._addSceneInteractables(cityId, sceneId);

    this.npcs = data.npcs.map((n) => new NPC(this.game, n));
    this.collectibles = (data.collectibles || []).map((c) => new Collectible(c.x, c.y));
    this.portals = data.portals || [];
  }

  _addSceneInteractables(cityId, sceneId) {
    if (cityId === 'berlin' && sceneId === 'town') {
      this.interactables.push(
        { type: 'sign', x: 8 * 16, y: 14 * 16 - 4, text: 'Berlin', textDe: 'Berlin - Hauptstadt', textEs: 'Berlín - Capital' },
        { type: 'sign', x: 30 * 16, y: 14 * 16 - 4, text: 'Spree', textDe: 'Die Spree fließt durch Berlin.', textEs: 'El Spree fluye por Berlín.' },
        { type: 'sign', x: 55 * 16, y: 14 * 16 - 4, text: 'Museum', textDe: 'Museumsinsel - alte Geschichte', textEs: 'Isla de los Museos - historia antigua' },
        { type: 'bench', x: 23 * 16, y: 15 * 16 + 4 },
        { type: 'bench', x: 53 * 16, y: 15 * 16 + 4 },
        { type: 'lamp', x: 6 * 16 + 2, y: 14 * 16 },
        { type: 'lamp', x: 35 * 16, y: 14 * 16 },
        { type: 'lamp', x: 72 * 16, y: 14 * 16 },
        { type: 'trash', x: 25 * 16, y: 15 * 16 + 5 },
        { type: 'flower', x: 14 * 16, y: 15 * 16 + 4 },
        { type: 'flower', x: 62 * 16, y: 15 * 16 + 4 },
      );
    } else if (cityId === 'berlin' && sceneId === 'bibliothek') {
      this.interactables.push(
        { type: 'bookshelf', x: 8 * 16, y: 11 * 16 },
        { type: 'bookshelf', x: 23 * 16, y: 11 * 16 },
        { type: 'bookshelf', x: 55 * 16, y: 11 * 16 },
        { type: 'bookshelf', x: 88 * 16, y: 11 * 16 },
        { type: 'table', x: 35 * 16, y: 15 * 16 + 5 },
        { type: 'painting', x: 5 * 16, y: 11 * 16, text: 'Gemälde', textDe: 'Altes Gemälde', textEs: 'Cuadro antiguo' },
        { type: 'painting', x: 68 * 16, y: 11 * 16, text: 'Karte', textDe: 'Alte Karte von Berlin', textEs: 'Mapa antiguo de Berlín' },
        { type: 'candle', x: 20 * 16, y: 14 * 16 + 4 },
        { type: 'candle', x: 50 * 16, y: 14 * 16 + 4 },
        { type: 'candle', x: 80 * 16, y: 14 * 16 + 4 },
      );
    } else if (cityId === 'hamburg' && sceneId === 'town') {
      this.interactables.push(
        { type: 'sign', x: 14 * 16, y: 14 * 16 - 4, text: 'Hafen', textDe: 'Willkommen im Hamburger Hafen!', textEs: '¡Bienvenido al puerto de Hamburgo!' },
        { type: 'sign', x: 35 * 16, y: 14 * 16 - 4, text: 'Elbe', textDe: 'Die Elbe - wichtiger Handelsweg', textEs: 'El Elba - ruta comercial importante' },
        { type: 'sign', x: 65 * 16, y: 14 * 16 - 4, text: 'Speicherstadt', textDe: 'Speicherstadt - UNESCO Weltkulturerbe', textEs: 'Ciudad de almacenes - Patrimonio UNESCO' },
        { type: 'bench', x: 25 * 16, y: 15 * 16 + 4 },
        { type: 'bench', x: 55 * 16, y: 15 * 16 + 4 },
        { type: 'lamp', x: 8 * 16, y: 14 * 16 },
        { type: 'lamp', x: 45 * 16, y: 14 * 16 },
        { type: 'lamp', x: 75 * 16, y: 14 * 16 },
        { type: 'crate', x: 3 * 16, y: 15 * 16 - 4 },
        { type: 'crate', x: 78 * 16, y: 15 * 16 - 4 },
        { type: 'barrel', x: 80 * 16, y: 15 * 16 - 4 },
      );
    } else if (cityId === 'hamburg' && sceneId === 'beach') {
      this.interactables.push(
        { type: 'sign', x: 4 * 16, y: 15 * 16 - 4, text: 'Strand', textDe: 'Genieße die Nordsee!', textEs: '¡Disfruta del Mar del Norte!' },
        { type: 'sign', x: 60 * 16, y: 15 * 16 - 4, text: 'Vorsicht', textDe: 'Vorsicht - starke Strömung!', textEs: '¡Cuidado - corriente fuerte!' },
        { type: 'sign', x: 90 * 16, y: 15 * 16 - 4, text: 'Elbe', textDe: 'Die Elbe mündet in die Nordsee.', textEs: 'El Elba desemboca en el Mar del Norte.' },
        { type: 'bench', x: 30 * 16, y: 15 * 16 + 4 },
        { type: 'bench', x: 75 * 16, y: 15 * 16 + 4 },
      );
    } else if (cityId === 'frankfurt' && sceneId === 'town') {
      this.interactables.push(
        { type: 'sign', x: 6 * 16, y: 14 * 16 - 4, text: 'Bank', textDe: 'Frankfurter Börse - 1585 gegründet', textEs: 'Bolsa de Fráncfort - fundada en 1585' },
        { type: 'sign', x: 25 * 16, y: 14 * 16 - 4, text: 'Skyline', textDe: 'Mainhattan - Frankfurts Wolkenkratzer', textEs: 'Mainhattan - rascacielos de Fráncfort' },
        { type: 'sign', x: 55 * 16, y: 14 * 16 - 4, text: 'Main', textDe: 'Der Main - wichtiger Fluss', textEs: 'El Meno - río importante' },
        { type: 'sign', x: 85 * 16, y: 8 * 16 - 4, text: 'Messeturm', textDe: 'Messeturm - 256m hoch', textEs: 'Torre de la Feria - 256m de altura' },
        { type: 'bench', x: 18 * 16, y: 15 * 16 + 4 },
        { type: 'bench', x: 65 * 16, y: 15 * 16 + 4 },
        { type: 'lamp', x: 8 * 16, y: 14 * 16 },
        { type: 'lamp', x: 35 * 16, y: 14 * 16 },
        { type: 'lamp', x: 55 * 16, y: 14 * 16 },
        { type: 'lamp', x: 90 * 16, y: 14 * 16 },
        { type: 'atm', x: 20 * 16, y: 15 * 16 + 4 },
        { type: 'phone', x: 45 * 16, y: 15 * 16 + 4 },
      );
    } else if (cityId === 'munchen' && sceneId === 'town') {
      this.interactables.push(
        { type: 'sign', x: 4 * 16, y: 14 * 16 - 4, text: 'Rathaus', textDe: 'Neues Rathaus am Marienplatz', textEs: 'Nuevo Ayuntamiento en Marienplatz' },
        { type: 'sign', x: 50 * 16, y: 6 * 16 - 4, text: 'Dom', textDe: 'Frauenkirche - Zwiebelturm', textEs: 'Catedral - torre de cebolla' },
        { type: 'sign', x: 80 * 16, y: 14 * 16 - 4, text: 'Biergarten', textDe: 'Hofbräuhaus - weltberühmt', textEs: 'Hofbräuhaus - mundialmente famoso' },
        { type: 'sign', x: 30 * 16, y: 14 * 16 - 4, text: 'Isar', textDe: 'Die Isar fließt durch München', textEs: 'El Isar fluye por Múnich' },
        { type: 'bench', x: 18 * 16, y: 15 * 16 + 4 },
        { type: 'bench', x: 45 * 16, y: 15 * 16 + 4 },
        { type: 'bench', x: 88 * 16, y: 15 * 16 + 4 },
        { type: 'lamp', x: 10 * 16, y: 14 * 16 },
        { type: 'lamp', x: 35 * 16, y: 14 * 16 },
        { type: 'lamp', x: 55 * 16, y: 14 * 16 },
        { type: 'lamp', x: 92 * 16, y: 14 * 16 },
        { type: 'flower', x: 22 * 16, y: 15 * 16 + 4 },
        { type: 'flower', x: 75 * 16, y: 15 * 16 + 4 },
      );
    } else if (cityId === 'munchen' && sceneId === 'biergarten') {
      this.interactables.push(
        { type: 'table', x: 10 * 16, y: 15 * 16 + 4 },
        { type: 'table', x: 30 * 16, y: 15 * 16 + 4 },
        { type: 'table', x: 50 * 16, y: 15 * 16 + 4 },
        { type: 'table', x: 70 * 16, y: 15 * 16 + 4 },
        { type: 'table', x: 90 * 16, y: 15 * 16 + 4 },
        { type: 'beer', x: 18 * 16, y: 15 * 16 + 4 },
        { type: 'beer', x: 38 * 16, y: 15 * 16 + 4 },
        { type: 'beer', x: 58 * 16, y: 15 * 16 + 4 },
        { type: 'beer', x: 78 * 16, y: 15 * 16 + 4 },
        { type: 'pretzel', x: 25 * 16, y: 15 * 16 + 4 },
        { type: 'pretzel', x: 65 * 16, y: 15 * 16 + 4 },
      );
    } else if (cityId === 'munchen' && sceneId === 'rathaus') {
      this.interactables.push(
        { type: 'painting', x: 8 * 16, y: 6 * 16, text: 'Wappen', textDe: 'Münchner Kindl - das Wappen', textEs: 'Münchner Kindl - el escudo' },
        { type: 'painting', x: 28 * 16, y: 6 * 16, text: 'König', textDe: 'König Ludwig II. von Bayern', textEs: 'Rey Luis II de Baviera' },
        { type: 'painting', x: 50 * 16, y: 6 * 16, text: 'Fest', textDe: 'Fasching in München', textEs: 'Carnaval en Múnich' },
        { type: 'painting', x: 72 * 16, y: 6 * 16, text: 'Berge', textDe: 'Die Bayerischen Alpen', textEs: 'Los Alpes Bávaros' },
        { type: 'plant', x: 15 * 16, y: 15 * 16 + 4 },
        { type: 'plant', x: 45 * 16, y: 15 * 16 + 4 },
        { type: 'plant', x: 85 * 16, y: 15 * 16 + 4 },
      );
    } else if (cityId === 'frankfurt' && sceneId === 'bank') {
      this.interactables.push(
        { type: 'painting', x: 5 * 16, y: 6 * 16, text: 'Euro', textDe: 'Der Euro - Europas Währung', textEs: 'El Euro - moneda europea' },
        { type: 'painting', x: 22 * 16, y: 6 * 16, text: 'Bulle', textDe: 'Der Bulle symbolisiert steigende Kurse', textEs: 'El toro simboliza mercados alcistas' },
        { type: 'painting', x: 60 * 16, y: 6 * 16, text: 'Logo', textDe: 'Logo der Frankfurter Börse', textEs: 'Logo de la Bolsa de Fráncfort' },
        { type: 'plant', x: 10 * 16, y: 15 * 16 + 4 },
        { type: 'plant', x: 70 * 16, y: 15 * 16 + 4 },
        { type: 'plant', x: 85 * 16, y: 15 * 16 + 4 },
        { type: 'table', x: 25 * 16, y: 15 * 16 + 5 },
        { type: 'table', x: 65 * 16, y: 15 * 16 + 5 },
      );
    } else if (cityId === 'hamburg' && sceneId === 'lagerhaus') {
      this.interactables.push(
        { type: 'crate', x: 6 * 16, y: 15 * 16 - 4 },
        { type: 'crate', x: 6 * 16 + 8, y: 15 * 16 - 4 },
        { type: 'crate', x: 22 * 16, y: 15 * 16 - 4 },
        { type: 'crate', x: 50 * 16, y: 15 * 16 - 4 },
        { type: 'barrel', x: 8 * 16 + 8, y: 15 * 16 - 4 },
        { type: 'barrel', x: 60 * 16, y: 15 * 16 - 4 },
        { type: 'sign', x: 4 * 16, y: 6 * 16, text: 'Lager', textDe: 'Containerlager - Vorsicht!', textEs: 'Almacén de contenedores - ¡Cuidado!' },
        { type: 'sign', x: 90 * 16, y: 6 * 16, text: 'Verlassen', textDe: 'Notausgang links', textEs: 'Salida de emergencia a la izquierda' },
      );
    }

    this.interactables = this.interactables.map((d) => new InteractiveObject(d));
  }
}
