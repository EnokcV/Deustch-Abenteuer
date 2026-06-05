export class AudioManager {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.musicGain = null;
    this.sfxGain = null;
    this.currentMusic = null;
    this.isMusicPlaying = false;
    this.musicVol = parseFloat(localStorage.getItem('deutsch_music_vol') || '0.5');
    this.sfxVol = parseFloat(localStorage.getItem('deutsch_sfx_vol') || '0.5');
    this.erikaTimeout = null;
    this.erikaIndex = 0;
    this.bgmTimeout = null;
    this.bgmIndex = 0;
    this.currentBGM = null;
  }

  init() {
    if (this.ctx) return;
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = this.musicVol;
    this.masterGain.connect(this.ctx.destination);

    this.musicGain = this.ctx.createGain();
    this.musicGain.gain.value = this.musicVol;
    this.musicGain.connect(this.masterGain);

    this.sfxGain = this.ctx.createGain();
    this.sfxGain.gain.value = this.sfxVol;
    this.sfxGain.connect(this.masterGain);
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  }

  noteFreq(n) {
    return 440 * Math.pow(2, (n - 69) / 12);
  }

  createOsc(type, freq, vol, dur, dest) {
    if (!this.ctx) return null;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.value = vol;
    osc.connect(gain);
    gain.connect(dest || this.sfxGain);
    osc.start(this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + dur);
    osc.stop(this.ctx.currentTime + dur);
    return osc;
  }

  playSFX(name) {
    if (!this.ctx || !this.sfxGain) return;
    const v = 0.12;
    switch (name) {
      case 'step':
        this.createOsc('square', 200, v, 0.05);
        break;
      case 'blip':
        this.createOsc('square', 800, v, 0.06);
        break;
      case 'select':
        this.createOsc('triangle', 600, v, 0.08);
        break;
      case 'correct':
        this.createOsc('triangle', 523, v * 1.5, 0.1);
        setTimeout(() => this.createOsc('triangle', 659, v * 1.5, 0.1), 100);
        setTimeout(() => this.createOsc('triangle', 784, v * 1.5, 0.15), 200);
        break;
      case 'wrong':
        this.createOsc('sawtooth', 150, v * 2, 0.3);
        break;
      case 'fanfare':
        [523, 659, 784, 1047].forEach((f, i) => {
          setTimeout(() => this.createOsc('square', f, v, 0.2), i * 120);
        });
        break;
      case 'coin':
        this.createOsc('square', 988, v, 0.08);
        setTimeout(() => this.createOsc('square', 1319, v, 0.12), 80);
        break;
      case 'open':
        this.createOsc('square', 440, v, 0.08);
        setTimeout(() => this.createOsc('square', 660, v, 0.1), 60);
        break;
    }
  }

  stopMusic() {
    if (this.erikaTimeout) { clearTimeout(this.erikaTimeout); this.erikaTimeout = null; }
    if (this.bgmTimeout) { clearTimeout(this.bgmTimeout); this.bgmTimeout = null; }
    this.isMusicPlaying = false;
    this.currentMusic = null;
    this.currentBGM = null;
  }

  playErika() {
    this.stopMusic();
    this.currentMusic = 'erika';
    this.isMusicPlaying = true;
    this.erikaIndex = 0;
    this._scheduleErika();
  }

  _scheduleErika() {
    if (!this.isMusicPlaying || !this.ctx) return;
    const MELODY = AudioManager.ERIKA_MELODY;
    const note = MELODY[this.erikaIndex % MELODY.length];
    const f = this.noteFreq(note[0]);
    this.createOsc('square', f, 0.06, note[1] * 0.9, this.musicGain);
    this.createOsc('triangle', f / 2, 0.04, note[1] * 0.9, this.musicGain);
    this.erikaIndex++;
    this.erikaTimeout = setTimeout(() => this._scheduleErika(), note[1] * 1000);
  }

  playCityBGM(city) {
    if (this.currentMusic === 'city_' + city) return;
    this.stopMusic();
    this.currentMusic = 'city_' + city;
    this.isMusicPlaying = true;
    this.bgmIndex = 0;
    const map = {
      berlin: AudioManager.BERLIN_BGM,
      hamburg: AudioManager.HAMBURG_BGM,
      frankfurt: AudioManager.FRANKFURT_BGM,
      munchen: AudioManager.MUNCHEN_BGM,
    };
    this.currentBGM = map[city] || AudioManager.BERLIN_BGM;
    this._scheduleBGM();
  }

  _scheduleBGM() {
    if (!this.isMusicPlaying || !this.ctx || !this.currentBGM) return;
    const note = this.currentBGM[this.bgmIndex % this.currentBGM.length];
    const f = this.noteFreq(note[0]);
    this.createOsc('sawtooth', f, 0.03, note[1] * 0.8, this.musicGain);
    this.createOsc('square', f * 2, 0.02, note[1] * 0.8, this.musicGain);
    this.bgmIndex++;
    this.bgmTimeout = setTimeout(() => this._scheduleBGM(), note[1] * 1000);
  }

  setMusicVol(v) {
    this.musicVol = v;
    localStorage.setItem('deutsch_music_vol', v);
    if (this.masterGain) this.masterGain.gain.value = v;
  }

  setSfxVol(v) {
    this.sfxVol = v;
    localStorage.setItem('deutsch_sfx_vol', v);
    if (this.sfxGain) this.sfxGain.gain.value = v;
  }
}

AudioManager.ERIKA_MELODY = [
  [65, 0.3], [65, 0.3], [67, 0.3], [69, 0.3], [70, 0.3], [72, 0.3], [74, 0.3], [72, 0.3],
  [70, 0.3], [69, 0.3], [67, 0.3], [65, 0.3], [64, 0.3], [65, 0.3], [67, 0.3], [69, 0.3],
  [67, 0.3], [65, 0.3], [64, 0.3], [62, 0.3], [60, 0.6],
  [65, 0.3], [65, 0.3], [67, 0.3], [69, 0.3], [70, 0.3], [72, 0.3], [74, 0.3], [72, 0.3],
  [70, 0.3], [69, 0.3], [67, 0.3], [65, 0.3], [64, 0.3], [65, 0.3], [67, 0.3], [69, 0.3],
  [70, 0.3], [72, 0.3], [70, 0.3], [69, 0.3], [67, 0.6],
  [65, 0.15], [67, 0.15], [69, 0.3], [70, 0.15], [72, 0.15], [70, 0.3], [69, 0.3], [67, 0.3],
  [65, 0.3], [64, 0.3], [65, 0.3], [67, 0.3], [69, 0.3], [70, 0.15], [72, 0.15], [70, 0.3],
  [69, 0.3], [67, 0.3], [65, 0.3], [64, 0.3], [62, 0.3], [60, 0.6],
  [65, 0.3], [65, 0.3], [67, 0.3], [69, 0.3], [70, 0.3], [72, 0.3], [74, 0.3], [72, 0.3],
  [70, 0.3], [69, 0.3], [67, 0.3], [65, 0.3], [64, 0.3], [65, 0.3], [67, 0.3], [69, 0.3],
  [67, 0.3], [65, 0.3], [64, 0.3], [62, 0.3], [60, 0.6],
];

AudioManager.BERLIN_BGM = [
  [60, 0.2], [64, 0.2], [67, 0.2], [72, 0.2], [67, 0.2], [64, 0.2],
  [62, 0.2], [65, 0.2], [69, 0.2], [74, 0.2], [69, 0.2], [65, 0.2],
  [60, 0.2], [64, 0.2], [67, 0.2], [72, 0.2], [67, 0.2], [64, 0.2],
  [58, 0.2], [62, 0.2], [65, 0.2], [70, 0.2], [65, 0.2], [62, 0.2],
  [59, 0.2], [63, 0.2], [67, 0.2], [71, 0.2], [67, 0.2], [63, 0.2],
  [57, 0.2], [60, 0.2], [64, 0.2], [69, 0.2], [64, 0.2], [60, 0.2],
  [60, 0.2], [64, 0.2], [67, 0.2], [72, 0.2], [67, 0.2], [64, 0.2],
  [62, 0.2], [65, 0.2], [69, 0.2], [74, 0.2], [72, 0.3], [69, 0.3], [67, 0.6],
];

AudioManager.HAMBURG_BGM = [
  [55, 0.25], [58, 0.25], [62, 0.25], [65, 0.25], [62, 0.25], [58, 0.25],
  [57, 0.25], [60, 0.25], [64, 0.25], [67, 0.25], [64, 0.25], [60, 0.25],
  [55, 0.25], [59, 0.25], [62, 0.25], [65, 0.25], [62, 0.25], [59, 0.25],
  [53, 0.25], [57, 0.25], [60, 0.25], [64, 0.25], [60, 0.25], [57, 0.25],
  [55, 0.3], [58, 0.3], [62, 0.3], [65, 0.3], [67, 0.3], [64, 0.3],
  [60, 0.25], [64, 0.25], [67, 0.25], [72, 0.25], [67, 0.25], [64, 0.25],
  [58, 0.25], [62, 0.25], [65, 0.25], [70, 0.25], [65, 0.25], [62, 0.25],
  [55, 0.3], [60, 0.3], [64, 0.4], [55, 0.5],
];

AudioManager.FRANKFURT_BGM = [
  [67, 0.15], [72, 0.15], [75, 0.15], [79, 0.15], [75, 0.15], [72, 0.15],
  [69, 0.15], [74, 0.15], [77, 0.15], [81, 0.15], [77, 0.15], [74, 0.15],
  [67, 0.15], [70, 0.15], [74, 0.15], [77, 0.15], [74, 0.15], [70, 0.15],
  [65, 0.15], [69, 0.15], [72, 0.15], [77, 0.15], [72, 0.15], [69, 0.15],
  [67, 0.15], [72, 0.15], [75, 0.15], [79, 0.15], [75, 0.15], [72, 0.15],
  [70, 0.15], [74, 0.15], [77, 0.15], [82, 0.15], [77, 0.15], [74, 0.15],
  [67, 0.15], [72, 0.15], [75, 0.15], [79, 0.15], [75, 0.15], [72, 0.15],
  [65, 0.3], [72, 0.3], [75, 0.4], [67, 0.5],
];

AudioManager.MUNCHEN_BGM = [
  [60, 0.25], [64, 0.25], [67, 0.25], [64, 0.25], [60, 0.25], [55, 0.25],
  [57, 0.25], [60, 0.25], [64, 0.25], [60, 0.25], [57, 0.25], [52, 0.25],
  [55, 0.25], [59, 0.25], [62, 0.25], [59, 0.25], [55, 0.25], [50, 0.25],
  [53, 0.25], [57, 0.25], [60, 0.25], [57, 0.25], [53, 0.25], [48, 0.25],
  [60, 0.3], [64, 0.3], [67, 0.3], [64, 0.3], [60, 0.3], [55, 0.3],
  [57, 0.3], [60, 0.3], [64, 0.3], [60, 0.3], [57, 0.3], [52, 0.3],
  [55, 0.4], [59, 0.4], [62, 0.5], [60, 0.6],
];
