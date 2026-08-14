/* Web Audio で効果音とBGMを合成。ファイル不要でオフラインでも鳴る */
(function (global) {
  const AudioEngine = {
    ctx: null,
    master: null,
    sfxGain: null,
    bgmGain: null,
    enabled: { sfx: true, bgm: true },
    bgmTimer: null,
    bgmStep: 0,
    started: false,

    isPageActive() {
      return typeof document === "undefined" || document.visibilityState !== "hidden";
    },

    unlock() {
      if (!this.isPageActive()) return;
      if (this.ctx) {
        if (this.ctx.state === "suspended") this.ctx.resume().catch(() => {});
        return;
      }
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      this.ctx = new Ctx();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.85;
      this.master.connect(this.ctx.destination);
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = 0.7;
      this.sfxGain.connect(this.master);
      this.bgmGain = this.ctx.createGain();
      this.bgmGain.gain.value = 0.22;
      this.bgmGain.connect(this.master);
      this.started = true;
    },

    setSfx(on) {
      this.enabled.sfx = on;
      if (this.sfxGain) this.sfxGain.gain.value = on ? 0.7 : 0;
    },
    setBgm(on) {
      this.enabled.bgm = on;
      if (this.bgmGain) this.bgmGain.gain.value = on ? 0.22 : 0;
      if (on) this.startBgm();
      else this.stopBgm();
    },

    tone(freq, dur, type, gain, dest, atk, slide) {
      if (!this.ctx || !this.isPageActive() || this.ctx.state !== "running") return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = type || "sine";
      osc.frequency.setValueAtTime(freq, t);
      if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(40, slide), t + dur);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(gain || 0.2, t + (atk || 0.01));
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      osc.connect(g);
      g.connect(dest || this.sfxGain);
      osc.start(t);
      osc.stop(t + dur + 0.02);
    },

    noise(dur, gain, hp) {
      if (!this.ctx || !this.isPageActive() || this.ctx.state !== "running") return;
      const t = this.ctx.currentTime;
      const n = this.ctx.createBuffer(1, this.ctx.sampleRate * dur, this.ctx.sampleRate);
      const d = n.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      const src = this.ctx.createBufferSource();
      src.buffer = n;
      const f = this.ctx.createBiquadFilter();
      f.type = "highpass";
      f.frequency.value = hp || 800;
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(gain || 0.08, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      src.connect(f);
      f.connect(g);
      g.connect(this.sfxGain);
      src.start(t);
      src.stop(t + dur);
    },

    tap() {
      if (!this.enabled.sfx) return;
      this.noise(0.035, 0.07, 1400);
      this.tone(880 + Math.random() * 80, 0.05, "triangle", 0.07);
    },
    correct() {
      if (!this.enabled.sfx) return;
      this.tone(784, 0.09, "sine", 0.12);
      this.tone(1175, 0.14, "triangle", 0.08);
    },
    miss() {
      if (!this.enabled.sfx) return;
      this.tone(196, 0.16, "square", 0.06, null, 0.005, 120);
      this.noise(0.08, 0.04, 300);
    },
    combo(n) {
      if (!this.enabled.sfx) return;
      const base = 523;
      this.tone(base, 0.08, "sine", 0.1);
      this.tone(base * 1.25, 0.1, "sine", 0.08);
      if (n >= 5) this.tone(base * 1.5, 0.16, "triangle", 0.08);
      if (n >= 10) this.tone(base * 2, 0.22, "triangle", 0.07);
    },
    star() {
      if (!this.enabled.sfx) return;
      [659, 784, 988, 1318].forEach((f, i) => {
        setTimeout(() => this.tone(f, 0.18, "sine", 0.1), i * 70);
      });
    },
    fanfare() {
      if (!this.enabled.sfx) return;
      const notes = [523, 659, 784, 1046, 784, 1046];
      notes.forEach((f, i) => setTimeout(() => this.tone(f, 0.22, "triangle", 0.12), i * 110));
    },
    whoosh() {
      if (!this.enabled.sfx) return;
      this.noise(0.18, 0.05, 400);
      this.tone(420, 0.2, "sine", 0.05, null, 0.01, 880);
    },
    click() {
      if (!this.enabled.sfx) return;
      this.tone(1200, 0.04, "square", 0.04);
    },
    teach() {
      if (!this.enabled.sfx) return;
      this.tone(660, 0.1, "sine", 0.08);
      this.tone(880, 0.16, "sine", 0.06);
    },

    startBgm() {
      if (!this.enabled.bgm || !this.isPageActive()) return;
      this.unlock();
      if (!this.enabled.bgm || !this.ctx) return;
      if (this.bgmTimer) return;
      if (this.ctx.state === "suspended") {
        this.ctx.resume()
          .then(() => {
            if (this.enabled.bgm && this.isPageActive()) this.startBgm();
          })
          .catch(() => {});
        return;
      }
      const bpm = 96;
      const stepMs = (60 / bpm) * 1000 / 2;
      const scale = [262, 294, 330, 392, 440, 523, 587, 659];
      const melody = [0, 2, 4, 2, 4, 5, 4, 2, 0, 2, 3, 2, 0, 4, 2, 0];
      const bass = [0, 0, 3, 3, 4, 4, 0, 0];
      this.bgmStep = 0;
      const tick = () => {
        if (!this.enabled.bgm || !this.ctx) return;
        const i = this.bgmStep;
        const m = scale[melody[i % melody.length]];
        const b = scale[bass[Math.floor(i / 2) % bass.length]] / 2;
        if (i % 2 === 0) this.tone(b, 0.28, "triangle", 0.09, this.bgmGain, 0.02);
        this.tone(m, 0.18, "sine", 0.07, this.bgmGain, 0.01);
        if (i % 8 === 4) this.tone(m * 2, 0.12, "sine", 0.03, this.bgmGain, 0.01);
        this.bgmStep++;
      };
      tick();
      this.bgmTimer = setInterval(tick, stepMs);
    },
    stopBgm() {
      if (this.bgmTimer) {
        clearInterval(this.bgmTimer);
        this.bgmTimer = null;
      }
    },

    pauseForBackground() {
      this.stopBgm();
      if (this.ctx && this.ctx.state === "running") {
        this.ctx.suspend().catch(() => {});
      }
    },

    resumeFromBackground() {
      if (!this.enabled.bgm || !this.ctx || !this.isPageActive()) return;
      if (this.ctx.state === "suspended") {
        this.ctx.resume()
          .then(() => {
            if (this.enabled.bgm && this.isPageActive()) this.startBgm();
          })
          .catch(() => {});
      } else {
        this.startBgm();
      }
    },
  };

  if (typeof document !== "undefined") {
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") AudioEngine.pauseForBackground();
      else AudioEngine.resumeFromBackground();
    });
  }
  if (typeof window !== "undefined") {
    window.addEventListener("pagehide", () => AudioEngine.pauseForBackground());
    window.addEventListener("pageshow", () => AudioEngine.resumeFromBackground());
  }

  global.Sfx = AudioEngine;
})(window);
