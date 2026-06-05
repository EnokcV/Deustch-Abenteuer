import { LOCALIZATION, getT } from '../data/localization.js';

export class LocalizationManager {
  constructor() {
    this.lang = localStorage.getItem('deutsch_lang') || 'DE';
  }

  set(lang) {
    this.lang = lang;
    localStorage.setItem('deutsch_lang', lang);
  }

  t(key) {
    return getT(this.lang, key);
  }

  get langCode() { return this.lang; }
}
