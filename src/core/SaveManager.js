export class SaveManager {
  constructor(prefix = 'deutsch_save_') {
    this.prefix = prefix;
    this.slots = 3;
    this.lastSave = null;
  }

  _key(n) {
    if (typeof n !== 'number' || n < 0 || n >= this.slots || !Number.isFinite(n)) {
      console.warn('[SaveManager] Slot inválido:', n, '- usando 0');
      return this.prefix + '0';
    }
    return this.prefix + n;
  }

  get(n) {
    try {
      const raw = localStorage.getItem(this._key(n));
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return null;
      return parsed;
    } catch (e) {
      console.error('[SaveManager] Error leyendo slot', n, e);
      return null;
    }
  }

  set(n, data) {
    if (!data || typeof data !== 'object') {
      console.error('[SaveManager] set(): datos inválidos', data);
      return false;
    }
    try {
      localStorage.setItem(this._key(n), JSON.stringify(data));
      this.lastSave = data;
      console.log('[SaveManager] Slot', n, 'guardado OK. name=', data.name, 'avatar=', data.avatar);
      return true;
    } catch (e) {
      console.error('[SaveManager] No se pudo guardar el slot', n, e);
      try {
        sessionStorage.setItem(this._key(n), JSON.stringify(data));
        console.warn('[SaveManager] Guardado en sessionStorage como fallback.');
        this.lastSave = data;
        return true;
      } catch (e2) {
        console.error('[SaveManager] sessionStorage también falló:', e2);
        return false;
      }
    }
  }

  delete(n) {
    try {
      localStorage.removeItem(this._key(n));
      console.log('[SaveManager] Slot', n, 'borrado.');
    } catch (e) {
      console.error('[SaveManager] Error borrando slot', n, e);
    }
  }

  list() {
    const out = [];
    for (let i = 0; i < this.slots; i++) {
      out.push(this.get(i));
    }
    return out;
  }

  newData(name, avatarId) {
    const safeName = (typeof name === 'string' && name.trim().length > 0)
      ? name.trim().slice(0, 12)
      : 'Spieler';
    const safeAvatar = (typeof avatarId === 'string' && avatarId.length > 0)
      ? avatarId
      : 'enoc';
    return {
      name: safeName,
      avatar: safeAvatar,
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
      sprintUnlocked: false,
    };
  }

  totalStars(save) {
    if (!save || !save.stars) return 0;
    return Object.values(save.stars).reduce((a, b) => a + (b || 0), 0);
  }

  setLastSlot(n) {
    try {
      localStorage.setItem('deutsch_last_slot', String(n));
    } catch (e) {
      console.warn('[SaveManager] No se pudo persistir deutsch_last_slot:', e);
    }
  }

  getLastSlot() {
    try {
      const v = localStorage.getItem('deutsch_last_slot');
      return v === null ? null : parseInt(v, 10);
    } catch (e) {
      return null;
    }
  }
}
