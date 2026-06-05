import { TILE } from '../core/Config.js';

export function buildBerlinTown(map) {
  for (let x = 0; x < map.MAP_W; x++) for (let y = 16; y < 19; y++) map.setTile(x, y, TILE.GROUND);
  for (let x = 25; x <= 35; x++) { map.setTile(x, 16, TILE.WATER); map.setTile(x, 17, TILE.WATER); }
  for (let x = 28; x <= 32; x++) map.setTile(x, 15, TILE.GROUND);
  for (let x = 39; x <= 43; x++) { map.setTile(x, 8, TILE.GROUND); map.setTile(x, 11, TILE.GROUND); }
  for (let y = 9; y <= 10; y++) { map.setTile(40, y, 0); map.setTile(41, y, 0); map.setTile(42, y, 0); }

  const buildings = [
    [5, 10, 15], [2, 12, 4], [45, 11, 55], [57, 13, 65], [38, 8, 44],
  ];
  buildings.forEach(([x1, y1, x2]) => {
    for (let y = y1; y <= 18; y++) {
      for (let x = x1; x <= x2; x++) {
        if (y === y1) map.setTile(x, y, TILE.ROOF);
        else map.setTile(x, y, TILE.WALL);
      }
    }
  });
  map.setTile(40, 9, 0); map.setTile(41, 9, 0); map.setTile(42, 9, 0);
  map.setTile(40, 10, 0); map.setTile(41, 10, 0); map.setTile(42, 10, 0);

  for (const [x, y] of [[20, 10], [50, 10], [15, 13], [55, 13], [25, 7], [48, 7]]) {
    map.setTile(x, y, TILE.PLATFORM);
    map.setTile(x + 1, y, TILE.PLATFORM);
    map.setTile(x + 2, y, TILE.PLATFORM);
  }

  for (const [x, y1, y2] of [
    [20, 11, 15], [50, 12, 15], [15, 14, 15], [55, 14, 15], [25, 8, 9], [48, 8, 9],
    [12, 16, 18], [50, 16, 18], [3, 13, 18], [65, 13, 18],
  ]) {
    for (let y = y1; y <= y2; y++) map.setTile(x, y, TILE.LADDER);
  }

  for (const [x, y] of [[3, 15], [18, 15], [36, 15], [56, 15], [68, 15], [75, 15]]) {
    map.setTile(x, y, TILE.DECORATION);
    map.setTile(x + 1, y, TILE.DECORATION);
    map.setTile(x, y - 1, TILE.DECORATION);
    map.setTile(x + 1, y - 1, TILE.DECORATION);
  }

  for (let x = 10; x <= 25; x++) { map.setTile(x, 19, 0); map.setTile(x, 18, TILE.GROUND); }
  for (let x = 45; x <= 60; x++) { map.setTile(x, 19, 0); map.setTile(x, 18, TILE.GROUND); }
}

export function buildHamburgPort(map) {
  for (let x = 0; x < map.MAP_W; x++) for (let y = 16; y < 19; y++) map.setTile(x, y, TILE.GROUND);
  for (let x = 40; x < map.MAP_W; x++) {
    map.setTile(x, 14, TILE.WATER);
    map.setTile(x, 15, TILE.WATER);
    map.setTile(x, 16, TILE.WATER);
    map.setTile(x, 17, TILE.WATER);
  }
  for (let x = 37; x <= 39; x++) map.setTile(x, 15, TILE.GROUND);

  for (const [x1, y1, x2, y2] of [
    [5, 8, 18, 15], [20, 9, 32, 15], [2, 11, 4, 18], [70, 11, 82, 18], [50, 8, 65, 15],
  ]) {
    for (let y = y1; y <= y2; y++) for (let x = x1; x <= x2; x++) {
      if (y === y1) map.setTile(x, y, TILE.ROOF);
      else map.setTile(x, y, TILE.WALL);
    }
  }

  for (let x = 5; x <= 18; x++) map.setTile(x, 7, TILE.GROUND);
  for (let x = 20; x <= 32; x++) map.setTile(x, 8, TILE.GROUND);

  for (const [x, y] of [[12, 5], [12, 3], [25, 10], [55, 13]]) {
    map.setTile(x, y, TILE.PLATFORM);
    if (y === 5) map.setTile(x + 1, y, TILE.PLATFORM);
  }

  for (const [x, y1, y2] of [
    [12, 4, 7], [25, 9, 11], [55, 12, 15], [15, 16, 18], [75, 16, 18], [20, 15, 18],
  ]) {
    for (let y = y1; y <= y2; y++) map.setTile(x, y, TILE.LADDER);
  }

  for (const [x, y] of [[20, 15], [33, 15]]) {
    map.setTile(x, y, TILE.DECORATION);
    map.setTile(x + 1, y, TILE.DECORATION);
    map.setTile(x, y - 1, TILE.DECORATION);
    map.setTile(x + 1, y - 1, TILE.DECORATION);
  }
}

export function buildHamburgBeach(map) {
  for (let x = 0; x < map.MAP_W; x++) for (let y = 17; y < 20; y++) map.setTile(x, y, TILE.SAND);
  for (let x = 0; x < map.MAP_W; x++) { map.setTile(x, 16, TILE.GROUND); map.setTile(x, 15, TILE.GROUND); }
  for (let x = 0; x < map.MAP_W; x++) { map.setTile(x, 14, TILE.WATER); map.setTile(x, 13, TILE.WATER); }

  for (const [x1, y1, x2, y2] of [
    [5, 8, 12, 15], [15, 10, 20, 15], [60, 9, 68, 15], [70, 8, 78, 15],
  ]) {
    for (let y = y1; y <= y2; y++) for (let x = x1; x <= x2; x++) {
      if (y === y1) map.setTile(x, y, TILE.ROOF);
      else map.setTile(x, y, TILE.WALL);
    }
  }
  for (const [x, y] of [[5, 10], [65, 12]]) {
    map.setTile(x, y, TILE.PLATFORM);
    map.setTile(x + 1, y, TILE.PLATFORM);
  }
  for (const [x, y1, y2] of [[5, 11, 14], [65, 12, 15]]) {
    for (let y = y1; y <= y2; y++) map.setTile(x, y, TILE.LADDER);
  }
  for (const [x, y] of [[3, 15], [22, 15], [58, 15], [80, 15]]) {
    map.setTile(x, y, TILE.DECORATION);
    map.setTile(x + 1, y, TILE.DECORATION);
    map.setTile(x, y - 1, TILE.DECORATION);
    map.setTile(x + 1, y - 1, TILE.DECORATION);
  }
}

export function buildFrankfurtTown(map) {
  for (let x = 0; x < map.MAP_W; x++) for (let y = 16; y < 19; y++) map.setTile(x, y, TILE.GROUND);
  for (let x = 60; x <= 75; x++) map.setTile(x, 16, TILE.WATER);
  for (let x = 58; x <= 60; x++) map.setTile(x, 15, TILE.GROUND);

  for (const [x1, y1, x2, y2] of [
    [2, 8, 12, 18], [15, 10, 24, 18], [27, 5, 38, 18], [40, 8, 48, 18], [80, 9, 92, 18],
  ]) {
    for (let y = y1; y <= y2; y++) for (let x = x1; x <= x2; x++) {
      if (y === y1) map.setTile(x, y, TILE.ROOF);
      else map.setTile(x, y, TILE.WALL);
    }
  }
  for (let x = 27; x <= 38; x++) map.setTile(x, 4, TILE.GROUND);
  for (let x = 30; x <= 35; x++) map.setTile(x, 2, TILE.GROUND);
  for (let x = 80; x <= 92; x++) map.setTile(x, 8, TILE.GROUND);

  for (const [x, y] of [[15, 10], [42, 12], [85, 6]]) {
    map.setTile(x, y, TILE.PLATFORM);
    map.setTile(x + 1, y, TILE.PLATFORM);
  }
  for (const [x, y1, y2] of [
    [15, 11, 15], [42, 13, 15], [85, 7, 8], [30, 3, 5], [13, 15, 18], [50, 15, 18],
  ]) {
    for (let y = y1; y <= y2; y++) map.setTile(x, y, TILE.LADDER);
  }
  for (const [x, y] of [[13, 15], [50, 15], [78, 15]]) {
    map.setTile(x, y, TILE.DECORATION);
    map.setTile(x + 1, y, TILE.DECORATION);
    map.setTile(x, y - 1, TILE.DECORATION);
    map.setTile(x + 1, y - 1, TILE.DECORATION);
  }
  for (let x = 5; x <= 15; x++) map.setTile(x, 18, TILE.GROUND);
}

export function buildMunchenTown(map) {
  for (let x = 0; x < map.MAP_W; x++) for (let y = 16; y < 19; y++) map.setTile(x, y, TILE.GROUND);
  for (let x = 10; x <= 20; x++) map.setTile(x, 16, TILE.WATER);
  for (let x = 8; x <= 10; x++) map.setTile(x, 15, TILE.GROUND);

  for (const [x1, y1, x2, y2] of [
    [2, 9, 15, 18], [22, 10, 32, 18], [40, 8, 55, 18], [60, 11, 72, 18], [78, 9, 90, 18],
  ]) {
    for (let y = y1; y <= y2; y++) for (let x = x1; x <= x2; x++) {
      if (y === y1) map.setTile(x, y, TILE.ROOF);
      else map.setTile(x, y, TILE.WALL);
    }
  }
  for (let x = 40; x <= 55; x++) map.setTile(x, 7, TILE.GROUND);
  for (let x = 43; x <= 52; x++) map.setTile(x, 5, TILE.GROUND);
  for (let x = 46; x <= 49; x++) map.setTile(x, 3, TILE.GROUND);
  for (let x = 78; x <= 90; x++) map.setTile(x, 8, TILE.GROUND);

  for (const [x, y] of [[24, 10], [65, 12], [82, 9]]) {
    map.setTile(x, y, TILE.PLATFORM);
    map.setTile(x + 1, y, TILE.PLATFORM);
  }
  for (const [x, y1, y2] of [
    [24, 11, 15], [65, 12, 15], [82, 9, 15], [46, 4, 6], [49, 4, 6], [8, 15, 18],
  ]) {
    for (let y = y1; y <= y2; y++) map.setTile(x, y, TILE.LADDER);
  }
  for (const [x, y] of [[8, 15], [35, 15], [58, 15], [75, 15]]) {
    map.setTile(x, y, TILE.DECORATION);
    map.setTile(x + 1, y, TILE.DECORATION);
    map.setTile(x, y - 1, TILE.DECORATION);
    map.setTile(x + 1, y - 1, TILE.DECORATION);
  }
  for (let x = 18; x <= 22; x++) map.setTile(x, 18, TILE.GROUND);
  for (let x = 35; x <= 40; x++) map.setTile(x, 18, TILE.GROUND);
}

export function buildInterior(map, walls, floor) {
  for (let x = 0; x < map.MAP_W; x++) {
    map.setTile(x, 18, floor || TILE.WOOD_FLOOR);
    map.setTile(x, 17, floor || TILE.WOOD_FLOOR);
  }
  for (const [x1, y1, x2, y2] of walls || []) {
    for (let y = y1; y <= y2; y++) for (let x = x1; x <= x2; x++) {
      map.setTile(x, y, TILE.WALL);
    }
  }
  for (let y = 0; y < 20; y++) {
    map.setTile(0, y, TILE.WALL);
    map.setTile(1, y, TILE.WALL);
    map.setTile(2, y, TILE.WALL);
    map.setTile(3, y, TILE.WALL);
    map.setTile(map.MAP_W - 1, y, TILE.WALL);
    map.setTile(map.MAP_W - 2, y, TILE.WALL);
    map.setTile(map.MAP_W - 3, y, TILE.WALL);
    map.setTile(map.MAP_W - 4, y, TILE.WALL);
  }
  for (const [x, y1, y2] of [[1, 1, 17], [map.MAP_W - 2, 1, 17]]) {
    for (let y = y1; y <= y2; y++) map.setTile(x, y, TILE.LADDER);
  }
}
