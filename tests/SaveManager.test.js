import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { SaveManager } from '../src/core/SaveManager.js';

describe('SaveManager', () => {
  let save;

  beforeEach(() => {
    localStorage.clear();
    save = new SaveManager('test_');
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('crea partida nueva con valores por defecto', () => {
    const data = save.newData('Enoc', 'max');
    expect(data.name).toBe('Enoc');
    expect(data.avatar).toBe('max');
    expect(data.unlocked).toContain('berlin');
    expect(data.stars.berlin).toBe(0);
    expect(data.totalStars).toBe(0);
    expect(data.sprintUnlocked).toBe(false);
  });

  it('trimea el nombre y limita longitud', () => {
    const data = save.newData('   Enoc   ', 'enoc');
    expect(data.name).toBe('Enoc');
  });

  it('usa "Spieler" si el nombre está vacío o no es string', () => {
    expect(save.newData('', 'enoc').name).toBe('Spieler');
    expect(save.newData(null, 'enoc').name).toBe('Spieler');
    expect(save.newData(undefined, 'enoc').name).toBe('Spieler');
  });

  it('guarda y recupera una partida', () => {
    const data = save.newData('Enoc', 'leo');
    const ok = save.set(0, data);
    expect(ok).toBe(true);
    const loaded = save.get(0);
    expect(loaded).not.toBeNull();
    expect(loaded.name).toBe('Enoc');
    expect(loaded.avatar).toBe('leo');
  });

  it('devuelve null para slot vacío', () => {
    expect(save.get(0)).toBeNull();
    expect(save.get(1)).toBeNull();
    expect(save.get(2)).toBeNull();
  });

  it('borra una partida', () => {
    save.set(0, save.newData('X', 'enoc'));
    expect(save.get(0)).not.toBeNull();
    save.delete(0);
    expect(save.get(0)).toBeNull();
  });

  it('rechaza datos inválidos sin lanzar', () => {
    expect(save.set(0, null)).toBe(false);
    expect(save.set(0, undefined)).toBe(false);
    expect(save.set(0, 'string')).toBe(false);
  });

  it('rechaza slots fuera de rango sin lanzar', () => {
    expect(() => save.set(-1, save.newData('A', 'enoc'))).not.toThrow();
    expect(() => save.set(99, save.newData('A', 'enoc'))).not.toThrow();
  });

  it('hace fallback a sessionStorage si localStorage falla', () => {
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
    setItemSpy.mockImplementationOnce(() => {
      throw new Error('QuotaExceeded');
    });
    const ok = save.set(0, save.newData('Enoc', 'enoc'));
    expect(ok).toBe(true);
    setItemSpy.mockRestore();
  });

  it('persiste el último slot', () => {
    save.setLastSlot(2);
    expect(save.getLastSlot()).toBe(2);
  });

  it('lista los 3 slots', () => {
    save.set(0, save.newData('A', 'enoc'));
    const list = save.list();
    expect(list).toHaveLength(3);
    expect(list[0].name).toBe('A');
    expect(list[1]).toBeNull();
    expect(list[2]).toBeNull();
  });

  it('totalStars suma correctamente', () => {
    const data = save.newData('A', 'enoc');
    data.stars.berlin = 2;
    data.stars.hamburg = 1;
    expect(save.totalStars(data)).toBe(3);
  });

  it('totalStars devuelve 0 para save null o sin stars', () => {
    expect(save.totalStars(null)).toBe(0);
    expect(save.totalStars({})).toBe(0);
  });
});
