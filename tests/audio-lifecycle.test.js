const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

function loadAudio() {
  const documentListeners = {};
  const windowListeners = {};
  let intervalCount = 0;

  class FakeAudioContext {
    constructor() {
      this.state = "running";
      this.currentTime = 0;
      this.sampleRate = 44100;
      this.destination = {};
    }
    createGain() {
      return {
        gain: {
          value: 0,
          setValueAtTime() {},
          exponentialRampToValueAtTime() {},
        },
        connect() {},
      };
    }
    createOscillator() {
      return {
        type: "sine",
        frequency: {
          setValueAtTime() {},
          exponentialRampToValueAtTime() {},
        },
        connect() {},
        start() {},
        stop() {},
      };
    }
    createBuffer() {
      return { getChannelData: () => new Float32Array(1) };
    }
    createBufferSource() {
      return { connect() {}, start() {}, stop() {}, buffer: null };
    }
    createBiquadFilter() {
      return { connect() {}, type: "", frequency: { value: 0 } };
    }
    suspend() {
      this.state = "suspended";
      return Promise.resolve();
    }
    resume() {
      this.state = "running";
      return Promise.resolve();
    }
  }

  const document = {
    visibilityState: "visible",
    addEventListener(type, fn) { documentListeners[type] = fn; },
  };
  const window = {
    AudioContext: FakeAudioContext,
    addEventListener(type, fn) { windowListeners[type] = fn; },
  };
  const context = {
    window,
    document,
    setTimeout,
    clearTimeout,
    setInterval() { intervalCount++; return intervalCount; },
    clearInterval() {},
    Math,
    Float32Array,
  };
  vm.createContext(context);
  const source = fs.readFileSync(path.join(__dirname, "..", "js", "audio.js"), "utf8");
  vm.runInContext(source, context);
  return { Sfx: window.Sfx, document, documentListeners, windowListeners, intervalCount: () => intervalCount };
}

test("BGM stops while hidden and resumes once when visible", async () => {
  const env = loadAudio();
  env.Sfx.unlock();
  env.Sfx.startBgm();
  assert.ok(env.Sfx.bgmTimer);
  assert.equal(env.intervalCount(), 1);

  env.document.visibilityState = "hidden";
  env.documentListeners.visibilitychange();
  await Promise.resolve();
  assert.equal(env.Sfx.bgmTimer, null);
  assert.equal(env.Sfx.ctx.state, "suspended");

  env.Sfx.startBgm();
  assert.equal(env.Sfx.bgmTimer, null);

  env.document.visibilityState = "visible";
  env.documentListeners.visibilitychange();
  await Promise.resolve();
  await Promise.resolve();
  assert.ok(env.Sfx.bgmTimer);
  assert.equal(env.intervalCount(), 2);

  env.Sfx.startBgm();
  assert.equal(env.intervalCount(), 2);
});

test("BGM stays stopped after the user turns it off", async () => {
  const env = loadAudio();
  env.Sfx.unlock();
  env.Sfx.setBgm(false);
  env.document.visibilityState = "hidden";
  env.documentListeners.visibilitychange();
  env.document.visibilityState = "visible";
  env.documentListeners.visibilitychange();
  await Promise.resolve();
  assert.equal(env.Sfx.bgmTimer, null);
});
