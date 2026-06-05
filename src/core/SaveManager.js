export class SaveManager {
  constructor(prefix = 'deutsch_save_') {
    this.prefix = prefix;
    this.slots = 3;
  }

  get(n) {
    try {
      const raw = localStorage.getItem(this.prefix + n);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  set(n, data) {
    try {
      localStorage.setItem(this.prefix + n, JSON.stringify(data));
      return true;
    } catch (e) {
      return false;
    }
  }

  delete(n) {
    localStorage.removeItem(this.prefix + n);
  }

  list() {
    const out = [];
    for (let i = 0; i < this.slots; i++) {
      out.push(this.get(i));
    }
    return out;
  }

  newData(name, avatarId) {
    return {
      name: name || 'Spieler',
      avatar: avatarId || 'enoc',
      world: 'berlin',
      unlocked: ['berlin'],
      stars: { berlin: 0, hamburg: 0, frankfurt: 0, munchen: 0 },
      collectibles: { berlin: 0, hamburg: 0, frankfurt: 0, munchen: 0 },
      lastScene: 'town',
      lastCity: 'berlin',
      lastX: 4,
      lastY: 14,
      timestamp: Date.now(),
      totalStars: 0,
    };
  }

  totalStars(save) {
    if (!save) return 0;
    return Object.values(save.stars || {}).reduce((a, b) => a + b, 0);
  }
}
