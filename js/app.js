(function () {
  const SAVE_KEY = "papil-typing-island-v1";
  const PAPIL = {
    idle: "assets/char/idle.png",
    teach: "assets/char/teach.png",
    think: "assets/char/think.png",
    oops: "assets/char/oops.png",
    cheer: "assets/char/cheer.png",
  };

  const state = {
    screen: "title",
    save: load(),
    tutIndex: 0,
    tutEngine: null,
    tutSeq: [],
    tutPos: 0,
    play: null,
    lastStageId: null,
    kbMounted: { tutorial: false, play: false, zukan: false },
    imeTimer: null,
    flowTimer: null,
  };

  function defaultSave() {
    return {
      name: "",
      tutorialDone: false,
      tutorialStep: 0,
      stars: {},
      sfx: true,
      bgm: true,
      demo: true,
    };
  }
  function load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return defaultSave();
      return Object.assign(defaultSave(), JSON.parse(raw));
    } catch (e) {
      return defaultSave();
    }
  }
  function persist() {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state.save));
  }

  function $(id) { return document.getElementById(id); }
  function show(id) {
    if (state.screen !== id && state.flowTimer) {
      clearTimeout(state.flowTimer);
      state.flowTimer = null;
    }
    document.querySelectorAll(".screen").forEach((s) => s.classList.toggle("on", s.id === id));
    state.screen = id;
  }
  function setPapil(img, mood) {
    if (!img) return;
    img.src = PAPIL[mood] || PAPIL.idle;
    img.classList.remove("oops", "cheer");
    if (mood === "oops") img.classList.add("oops");
    if (mood === "cheer") img.classList.add("cheer");
  }

  function starsEarned() {
    return Object.values(state.save.stars).reduce((a, b) => a + b, 0);
  }
  function clearedCount() {
    return Object.keys(state.save.stars).length;
  }

  /* ---------- screens ---------- */
  function goTitle() { show("title"); }
  function goHub() {
    show("hub");
    $("hub-name").textContent = state.save.name || "ゆうしゃ";
    $("hub-stars").textContent = starsEarned();
    $("hub-say").textContent = state.save.tutorialDone
      ? "マップのステージを　えらんでね。ゆびずかんで　いつでも　みなおせるよ。"
      : "はじめてなら　まずは　チュートリアルだよ。ゆびのいえを　おぼえよう！";
    renderMap();
  }
  function renderMap() {
    const box = $("map-stages");
    box.innerHTML = "";
    DATA.STAGES.forEach((st, i) => {
      const cleared = clearedCount();
      const locked = cleared < st.unlock && !(i === 0 && state.save.tutorialDone) && !(st.unlock === 0);
      const needTut = !state.save.tutorialDone && i > 0;
      const isLocked = locked || needTut;
      const stars = state.save.stars[st.id] || 0;
      const b = document.createElement("button");
      b.className = "stage-node" + (isLocked ? " locked" : "");
      b.innerHTML = `<div class="ic">${isLocked ? "🔒" : st.icon}</div>
        <div class="nm">${st.name}</div>
        <div class="st">${"★".repeat(stars)}${"☆".repeat(3 - stars)}</div>`;
      b.title = st.blurb;
      b.addEventListener("click", () => {
        if (isLocked) {
          $("hub-say").textContent = needTut
            ? "そのまえに　チュートリアルを　クリアしてね！"
            : "まえのステージを　クリアすると　ひらくよ。";
          Sfx.click();
          return;
        }
        startStage(st);
      });
      box.appendChild(b);
    });
  }

  function askName(then) {
    const modal = $("name-modal");
    modal.classList.add("on");
    $("name-input").value = state.save.name || "";
    $("name-input").focus();
    const done = () => {
      const n = $("name-input").value.trim() || "ゆうしゃ";
      state.save.name = n.slice(0, 12);
      persist();
      modal.classList.remove("on");
      then && then();
    };
    $("name-ok").onclick = done;
    $("name-input").onkeydown = (e) => { if (e.key === "Enter") done(); };
  }

  /* ---------- keyboard mounts ---------- */
  function mountKb(which) {
    if (state.kbMounted[which]) return;
    const root = $(which === "tutorial" ? "tut-kb-stage" : which === "play" ? "play-kb-stage" : "zukan-kb-stage");
    KB.mount(root);
    KB.demoOn = state.save.demo;
    state.kbMounted[which] = true;
    state.kbMounted._current = which;
  }
  function useKb(which) {
    mountKb(which);
    const root = $(which === "tutorial" ? "tut-kb-stage" : which === "play" ? "play-kb-stage" : "zukan-kb-stage");
    KB.el = root.querySelector(".kb");
    KB.handsEl = root.querySelector(".hands");
    KB.labelEl = root.querySelector(".finger-label");
    KB.lineEl = root.querySelector(".guide-line");
    if (!KB.el.querySelector(".key")) KB.renderKeys();
    if (!KB.handsEl.querySelector(".finger")) KB.renderHands();
    KB.demoOn = state.save.demo;
    state.kbMounted._current = which;
  }

  /* ---------- tutorial ---------- */
  function startTutorial(from) {
    state.tutIndex = typeof from === "number" ? from : (state.save.tutorialDone ? 0 : state.save.tutorialStep || 0);
    if (state.tutIndex >= DATA.TUTORIAL.length) state.tutIndex = 0;
    show("tutorial");
    useKb("tutorial");
    renderTutorial();
  }

  function renderTutorial() {
    const step = DATA.TUTORIAL[state.tutIndex];
    if (!step) { finishTutorial(); return; }
    state.save.tutorialStep = state.tutIndex;
    persist();
    $("tut-title").textContent = step.title;
    $("tut-step").textContent = (state.tutIndex + 1) + " / " + DATA.TUTORIAL.length;
    $("tut-say").textContent = step.say;
    setPapil($("tut-papil"), step.papil || "teach");
    KB.stopDemo();
    KB.clear();
    const extra = $("tut-extra");
    extra.innerHTML = "";
    extra.className = "";
    $("tut-kb-stage").classList.remove("hidden");
    $("tut-next").classList.remove("hidden");
    $("tut-next").disabled = false;
    $("tut-next").textContent = state.tutIndex === DATA.TUTORIAL.length - 1 ? "ぼうけんへ！" : "つぎへ";
    state.tutEngine = null;
    state.tutSeq = [];
    state.tutPos = 0;

    if (step.kind === "talk") {
      if (step.waitAlpha) {
        $("tut-next").disabled = true;
        KB.setTargets("abcdefghijklmnopqrstuvwxyz".split(""), { noDemo: true });
        state.tutEngine = { type: "any-alpha" };
      }
    } else if (step.kind === "posture") {
      $("tut-kb-stage").classList.add("hidden");
      extra.innerHTML = `<div class="posture-box">
        <img src="assets/posture.jpg" alt="すわりかた" />
        <div class="points">${step.points.map((p) => `<div class="point"><b>${p.t}</b><span>${p.d}</span></div>`).join("")}</div>
      </div>`;
    } else if (step.kind === "home") {
      KB.highlightHomes();
    } else if (step.kind === "colors") {
      extra.innerHTML = `<div class="color-row"></div>`;
      const row = extra.querySelector(".color-row");
      Object.entries(KB.allFingers || FINGER_MAP.FINGER).forEach(([id, f]) => {
        const b = document.createElement("button");
        b.className = "color-pill";
        b.style.background = f.color;
        b.textContent = f.name;
        b.addEventListener("click", () => {
          Sfx.teach();
          KB.highlightFinger(id, true);
          $("tut-say").textContent = f.name + " のキーが　ひかっているよ。じぶんのゆびと　くらべてみて！";
        });
        row.appendChild(b);
      });
      KB.highlightFinger("LI", true);
    } else if (step.kind === "romaji-intro") {
      extra.innerHTML = `<div class="roma-ex">${step.examples.map((e) =>
        `<div class="roma-card"><div class="k">${e.kana}</div><div class="r">${e.roma}</div><div class="n">${e.note}</div></div>`
      ).join("")}</div>`;
      KB.setTargets(["a", "k", "s", "n"], { noDemo: true });
    } else if (step.kind === "drill") {
      $("tut-next").disabled = true;
      $("tut-next").textContent = "ぜんぶうてたら　すすめるよ";
      const seq = Array.isArray(step.sequence) ? step.sequence.slice() : [step.sequence];
      state.tutSeq = seq;
      state.tutPos = 0;
      extra.innerHTML = `<div class="prompt-board" style="min-height:110px;margin-bottom:8px">
        <div class="kana-line" id="tut-kana"></div>
        <div class="roma-line" id="tut-roma"></div>
      </div>`;
      loadTutItem();
    }
    Sfx.teach();
  }

  function loadTutItem() {
    const step = DATA.TUTORIAL[state.tutIndex];
    const item = state.tutSeq[state.tutPos];
    if (item == null) {
      $("tut-next").disabled = false;
      $("tut-next").textContent = "つぎへ";
      setPapil($("tut-papil"), "cheer");
      $("tut-say").textContent = "できた！　つぎへ　すすもう。";
      KB.clear();
      Sfx.star();
      return;
    }
    if (step.mode === "romaji") {
      state.tutEngine = new Romaji.RomajiEngine(item);
    } else {
      state.tutEngine = new Romaji.AlphaEngine(item);
    }
    state.tutEngine._mode = step.mode;
    updateTutPrompt();
    KB.setTargets(state.tutEngine.nextKeys());
  }

  function updateTutPrompt() {
    const eng = state.tutEngine;
    const item = state.tutSeq[state.tutPos] || "";
    const kanaEl = $("tut-kana");
    const romaEl = $("tut-roma");
    if (!kanaEl) return;
    if (eng._mode === "romaji") {
      const doneK = item.slice(0, eng.pos);
      const restK = item.slice(eng.pos);
      kanaEl.innerHTML = `<span class="done">${esc(doneK)}</span><span class="now">${esc(restK[0] || "")}</span><span class="wait">${esc(restK.slice(1))}</span>`;
      romaEl.innerHTML = `<span class="done">${esc(eng.typedDisplay())}</span><span class="rest">${esc(eng.hint())}</span>`;
    } else {
      const t = String(item);
      const i = eng.i || 0;
      kanaEl.innerHTML = t.split("").map((ch, idx) => {
        const show = ch === " " ? "␣" : ch.toUpperCase();
        const cls = idx < i ? "done" : idx === i ? "now" : "wait";
        return `<span class="${cls}">${esc(show)}</span>`;
      }).join("");
      romaEl.innerHTML = "";
    }
  }

  function finishTutorial() {
    state.save.tutorialDone = true;
    persist();
    Sfx.fanfare();
    Fx.confetti();
    goHub();
    $("hub-say").textContent = "チュートリアル　かんりょう！　ホームむらから　ぼうけんスタートだよ。";
    setPapil($("hub-papil"), "cheer");
  }

  /* ---------- play ---------- */
  function startStage(stage, free) {
    const items = [];
    if (stage.kind === "alpha") {
      const s = DATA.buildAlpha(stage.chars, stage.len);
      items.push({ mode: "alpha", text: s, display: s });
    } else {
      DATA.buildPool(stage.pool, stage.len).forEach((w) => items.push({ mode: "romaji", text: w, display: w }));
    }
    state.play = {
      stage,
      free: !!free,
      items,
      index: 0,
      ok: 0,
      miss: 0,
      combo: 0,
      maxCombo: 0,
      start: Date.now(),
      engine: null,
    };
    state.lastStageId = stage.id;
    show("play");
    useKb("play");
    $("play-title").textContent = stage.name;
    $("play-say").textContent = stage.blurb + "　／　ひかるキーを、おなじいろのゆびで！";
    setPapil($("play-papil"), "think");
    loadPlayItem();
    updatePlayStats();
  }

  function loadPlayItem() {
    const p = state.play;
    if (p.index >= p.items.length) { finishPlay(); return; }
    const item = p.items[p.index];
    p.engine = item.mode === "romaji" ? new Romaji.RomajiEngine(item.text) : new Romaji.AlphaEngine(item.text);
    p.engine._mode = item.mode;
    p.engine._src = item.text;
    updatePlayPrompt();
    KB.setTargets(p.engine.nextKeys());
    updatePlayStats();
  }

  function updatePlayPrompt() {
    const p = state.play;
    const eng = p.engine;
    const src = eng._src;
    if (eng._mode === "romaji") {
      const doneK = src.slice(0, eng.pos);
      const restK = src.slice(eng.pos);
      $("kana-line").innerHTML = `<span class="done">${esc(doneK)}</span><span class="now">${esc(restK[0] || "")}</span><span class="wait">${esc(restK.slice(1))}</span>`;
      $("roma-line").innerHTML = `<span class="done">${esc(eng.typedDisplay())}</span><span class="rest">${esc(eng.hint())}</span>`;
      const pct = ((p.index + (src.length ? eng.pos / src.length : 1)) / p.items.length) * 100;
      $("prog").style.width = pct + "%";
    } else {
      const t = String(src);
      const i = eng.i || 0;
      $("kana-line").innerHTML = t.split("").map((ch, idx) => {
        const show = ch === " " ? "␣" : ch.toUpperCase();
        const cls = idx < i ? "done" : idx === i ? "now" : "wait";
        return `<span class="${cls}">${esc(show)}</span>`;
      }).join("");
      $("roma-line").innerHTML = `<span class="rest">ひかっているキーを、おなじいろのゆびで</span>`;
      $("prog").style.width = (t.length ? (i / t.length) * 100 : 0) + "%";
    }
  }

  function updatePlayStats() {
    const p = state.play;
    const total = p.ok + p.miss;
    const acc = total ? Math.round((p.ok / total) * 100) : 100;
    $("st-acc").textContent = acc;
    $("st-combo").textContent = p.combo;
    const left = p.engine && p.engine._mode === "alpha"
      ? Math.max(0, (p.engine.text || "").length - (p.engine.i || 0))
      : p.items.length - p.index;
    $("st-left").textContent = left;
  }

  function finishPlay() {
    KB.stopDemo();
    Fx.floats = [];
    const p = state.play;
    const total = p.ok + p.miss;
    const acc = total ? p.ok / total : 1;
    const sec = Math.max(1, (Date.now() - p.start) / 1000);
    const cpm = Math.round((p.ok / sec) * 60);
    let stars = 1;
    if (acc >= 0.9) stars = 2;
    if (acc >= 0.96 && p.maxCombo >= 8) stars = 3;
    if (acc >= 0.99 && cpm >= 80) stars = 3;
    if (!p.free) {
      const prev = state.save.stars[p.stage.id] || 0;
      state.save.stars[p.stage.id] = Math.max(prev, stars);
      persist();
    }
    show("result");
    $("res-title").textContent = p.free ? "れんしゅう　おわり！" : stars >= 3 ? "パーフェクト！" : "クリア！";
    $("res-stars").textContent = "★".repeat(stars) + "☆".repeat(3 - stars);
    $("res-acc").textContent = Math.round(acc * 100) + "%";
    $("res-spd").textContent = cpm + " キー/分";
    $("res-combo").textContent = p.maxCombo;
    setPapil($("res-papil"), stars >= 2 ? "cheer" : "idle");
    if (stars >= 2) { Sfx.fanfare(); Fx.confetti(); }
    else Sfx.star();
    const idx = DATA.STAGES.findIndex((s) => s.id === p.stage.id);
    $("res-next").classList.toggle("hidden", p.free || idx < 0 || idx >= DATA.STAGES.length - 1);
  }

  /* ---------- zukan / free / settings ---------- */
  function goZukan() {
    show("zukan");
    useKb("zukan");
    KB.onKeyClick = (ch) => {
      const fid = KB.fingerOf(ch);
      if (fid) pickZukan(fid);
    };
    const grid = $("zukan-grid");
    grid.innerHTML = "";
    Object.entries(FINGER_MAP.FINGER).forEach(([id, f]) => {
      const b = document.createElement("button");
      b.className = "zukan-f";
      b.style.background = f.color;
      b.textContent = f.name;
      b.addEventListener("click", () => pickZukan(id));
      grid.appendChild(b);
    });
    pickZukan("LI");
  }
  function pickZukan(id) {
    Sfx.teach();
    KB.highlightFinger(id, true);
    const f = FINGER_MAP.FINGER[id];
    const keys = Object.entries(FINGER_MAP.KEY_FINGER)
      .filter(([, v]) => v === id)
      .map(([k]) => (k === " " ? "スペース" : k.toUpperCase()));
    $("zukan-say").textContent = f.name + " のキーは　" + keys.join("  ") + "。ホームは　" +
      (FINGER_MAP.HOME[id] === " " ? "スペース" : String(FINGER_MAP.HOME[id]).toUpperCase()) + " だよ。";
  }

  function goFree() {
    show("free");
    const box = $("free-list");
    box.innerHTML = "";
    DATA.FREE_DRILLS.forEach((d) => {
      const b = document.createElement("button");
      b.className = "mode-btn";
      b.innerHTML = `<span class="ic">✨</span>${d.name}`;
      b.addEventListener("click", () => startStage(d, true));
      box.appendChild(b);
    });
  }

  function goSettings() {
    show("settings");
    $("tog-bgm").classList.toggle("on", state.save.bgm);
    $("tog-sfx").classList.toggle("on", state.save.sfx);
    $("tog-demo").classList.toggle("on", state.save.demo);
  }

  /* ---------- input ---------- */
  function showIme(on) {
    ["tut-ime", "play-ime"].forEach((id) => {
      const el = $(id);
      if (el) el.classList.toggle("on", !!on);
    });
    if (on) {
      clearTimeout(state.imeTimer);
      state.imeTimer = setTimeout(() => showIme(false), 2600);
    }
  }

  function handleChar(ch, ev) {
    if (state.screen === "tutorial") return feedTutorial(ch, ev);
    if (state.screen === "play") return feedPlay(ch, ev);
  }

  function feedTutorial(ch, ev) {
    const step = DATA.TUTORIAL[state.tutIndex];
    if (!state.tutEngine) return;
    if (state.tutEngine.type === "any-alpha") {
      if (/^[a-z]$/.test(ch)) {
        ev && ev.preventDefault();
        Sfx.correct();
        KB.press(ch);
        Fx.spark(innerWidth / 2, 220);
        $("tut-next").disabled = false;
        $("tut-say").textContent = "うん、えいすうだね！　つぎへ　すすもう。";
        setPapil($("tut-papil"), "cheer");
        state.tutEngine = null;
      }
      return;
    }
    if (!step || step.kind !== "drill") return;
    ev && ev.preventDefault();
    const r = state.tutEngine.feed(ch);
    if (r.ok) {
      Sfx.tap();
      KB.press(ch);
      const keyEl = KB.keyEl(ch);
      if (keyEl) {
        const rec = keyEl.getBoundingClientRect();
        Fx.spark(rec.left + rec.width / 2, rec.top);
      }
      if (r.moraComplete) Sfx.correct();
      updateTutPrompt();
      if (r.done) {
        state.tutPos++;
        clearTimeout(state.flowTimer);
        state.flowTimer = setTimeout(() => {
          state.flowTimer = null;
          if (state.screen === "tutorial") loadTutItem();
        }, 180);
      } else {
        KB.setTargets(state.tutEngine.nextKeys());
      }
    } else {
      Sfx.miss();
      KB.wrong(ch);
      setPapil($("tut-papil"), "oops");
      Fx.shake(7);
    }
  }

  function feedPlay(ch, ev) {
    const p = state.play;
    if (!p || !p.engine) return;
    ev && ev.preventDefault();
    const r = p.engine.feed(ch);
    if (r.ok) {
      Sfx.tap();
      KB.press(ch);
      const keyEl = KB.keyEl(ch);
      if (keyEl) {
        const rec = keyEl.getBoundingClientRect();
        Fx.spark(rec.left + rec.width / 2, rec.top);
      }
      p.ok++;
      if (r.moraComplete) {
        p.combo++;
        p.maxCombo = Math.max(p.maxCombo, p.combo);
        Sfx.correct();
        const hit = DATA.COMBO_WORDS.filter((c) => c.n === p.combo).pop();
        if (hit) {
          Sfx.combo(p.combo);
          const pop = $("combo-pop");
          pop.textContent = hit.t;
          pop.classList.remove("show");
          void pop.offsetWidth;
          pop.classList.add("show");
          Fx.floatText(hit.t, innerWidth * 0.58, 180, "#ffe566");
        }
        if (p.combo && p.combo % 10 === 0) {
          setPapil($("play-papil"), "cheer");
          Fx.burst(innerWidth * 0.55, 200, "#ffe566", 28);
        } else if (p.combo === 1) {
          setPapil($("play-papil"), "think");
        }
      }
      updatePlayPrompt();
      updatePlayStats();
      if (r.done) {
        p.index++;
        $("prog").style.width = (p.index / p.items.length) * 100 + "%";
        clearTimeout(state.flowTimer);
        state.flowTimer = setTimeout(() => {
          state.flowTimer = null;
          if (state.screen === "play" && state.play === p) loadPlayItem();
        }, 160);
      } else {
        KB.setTargets(p.engine.nextKeys());
      }
    } else {
      p.miss++;
      p.combo = 0;
      Sfx.miss();
      KB.wrong(ch);
      setPapil($("play-papil"), "oops");
      Fx.shake(8);
      updatePlayStats();
    }
  }

  function mapKey(e) {
    if (e.key === " ") return " ";
    if (e.key.length === 1) return e.key.toLowerCase();
    return null;
  }

  window.addEventListener("keydown", (e) => {
    if (e.repeat && (state.screen === "play" || state.screen === "tutorial")) {
      e.preventDefault();
      return;
    }
    if (e.isComposing || e.keyCode === 229) {
      showIme(true);
      return;
    }
    const ch = mapKey(e);
    if (ch != null && (state.screen === "play" || state.screen === "tutorial")) {
      if (e.key === " ") e.preventDefault();
      handleChar(ch, e);
    }
    if (e.key === "Escape") {
      if (state.screen === "play" || state.screen === "tutorial" || state.screen === "zukan" || state.screen === "free" || state.screen === "settings" || state.screen === "result") {
        KB.stopDemo();
        goHub();
      } else if (state.screen === "hub") goTitle();
    }
  });
  window.addEventListener("compositionstart", () => showIme(true));

  /* ---------- wiring ---------- */
  function bootAudio() {
    Sfx.unlock();
    Sfx.setSfx(state.save.sfx);
    Sfx.setBgm(state.save.bgm);
    if (state.save.bgm) Sfx.startBgm();
  }

  $("btn-start").addEventListener("click", () => {
    bootAudio();
    Sfx.click();
    const go = () => {
      if (!state.save.tutorialDone) startTutorial(0);
      else goHub();
    };
    if (!state.save.name) askName(go);
    else go();
  });
  $("btn-continue").addEventListener("click", () => {
    bootAudio();
    Sfx.click();
    if (!state.save.name) askName(goHub);
    else goHub();
  });
  $("btn-howto").addEventListener("click", () => {
    bootAudio();
    Sfx.click();
    startTutorial(0);
  });
  $("hub-back").addEventListener("click", goTitle);
  $("tut-back").addEventListener("click", () => { KB.stopDemo(); goHub(); });
  $("play-back").addEventListener("click", () => { KB.stopDemo(); goHub(); });
  $("zukan-back").addEventListener("click", () => { KB.onKeyClick = null; KB.stopDemo(); goHub(); });
  $("free-back").addEventListener("click", goHub);
  $("set-back").addEventListener("click", goHub);
  document.querySelectorAll(".mode-btn[data-go]").forEach((b) => {
    b.addEventListener("click", () => {
      Sfx.click();
      const go = b.dataset.go;
      if (go === "tutorial") startTutorial(0);
      if (go === "zukan") goZukan();
      if (go === "free") goFree();
      if (go === "settings") goSettings();
    });
  });
  $("tut-next").addEventListener("click", () => {
    Sfx.click();
    Sfx.whoosh();
    const step = DATA.TUTORIAL[state.tutIndex];
    if (step && step.nextSay && $("tut-say").textContent === step.say) {
      $("tut-say").textContent = step.nextSay;
      return;
    }
    state.tutIndex++;
    if (state.tutIndex >= DATA.TUTORIAL.length) finishTutorial();
    else renderTutorial();
  });
  $("tut-skip").addEventListener("click", () => {
    Sfx.click();
    state.tutIndex++;
    if (state.tutIndex >= DATA.TUTORIAL.length) finishTutorial();
    else renderTutorial();
  });
  $("res-hub").addEventListener("click", goHub);
  $("res-retry").addEventListener("click", () => {
    const st = state.play && state.play.stage;
    if (st) startStage(st, state.play.free);
  });
  $("res-next").addEventListener("click", () => {
    const id = state.play && state.play.stage && state.play.stage.id;
    const idx = DATA.STAGES.findIndex((s) => s.id === id);
    if (idx >= 0 && DATA.STAGES[idx + 1]) startStage(DATA.STAGES[idx + 1]);
    else goHub();
  });
  $("tog-bgm").addEventListener("click", () => {
    state.save.bgm = !state.save.bgm;
    persist();
    Sfx.setBgm(state.save.bgm);
    $("tog-bgm").classList.toggle("on", state.save.bgm);
  });
  $("tog-sfx").addEventListener("click", () => {
    state.save.sfx = !state.save.sfx;
    persist();
    Sfx.setSfx(state.save.sfx);
    $("tog-sfx").classList.toggle("on", state.save.sfx);
    Sfx.click();
  });
  $("tog-demo").addEventListener("click", () => {
    state.save.demo = !state.save.demo;
    persist();
    KB.demoOn = state.save.demo;
    $("tog-demo").classList.toggle("on", state.save.demo);
    Sfx.click();
  });
  $("btn-rename").addEventListener("click", () => askName(() => {}));
  $("btn-reset").addEventListener("click", () => {
    if (confirm("ほんとうに　データをけす？　スターも　なまえも　もどるよ。")) {
      state.save = defaultSave();
      persist();
      goTitle();
    }
  });

  function esc(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/ /g, "␣");
  }

  Fx.mount($("fx"));
  $("btn-continue").style.display = state.save.name || state.save.tutorialDone ? "" : "none";
})();
