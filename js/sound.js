/**
 * AEGISONE Procedural Audio Engine
 * Web Audio API tones — no external files needed
 */
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this._init();
  }

  _init() {
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch(e) {
      this.enabled = false;
    }
  }

  _resume() {
    if (this.ctx?.state === 'suspended') this.ctx.resume();
  }

  _tone(freq, type = 'sine', duration = 0.08, vol = 0.06, delay = 0) {
    if (!this.enabled || !this.ctx) return;
    this._resume();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain); gain.connect(this.ctx.destination);
    osc.type = type; osc.frequency.value = freq;
    const now = this.ctx.currentTime + delay;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(vol, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    osc.start(now); osc.stop(now + duration + 0.02);
  }

  playClick() { this._tone(1200, 'sine', 0.04, 0.04); }

  playEngineStep() {
    this._tone(440, 'triangle', 0.06, 0.05, 0);
    this._tone(880, 'sine', 0.07, 0.03, 0.07);
  }

  playDiodeLock() {
    [440, 587, 880, 1174].forEach((f, i) => this._tone(f, 'sine', 0.12, 0.06, i * 0.11));
  }

  playAlert(severity) {
    if (severity === 'critical') {
      this._tone(880, 'sawtooth', 0.08, 0.07, 0);
      this._tone(660, 'sawtooth', 0.08, 0.07, 0.1);
      this._tone(880, 'sawtooth', 0.08, 0.07, 0.2);
    } else {
      this._tone(660, 'triangle', 0.1, 0.05, 0);
      this._tone(880, 'triangle', 0.1, 0.04, 0.12);
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }
}

export const sounds = new SoundEngine();
