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
    playTimer: null,
    lessonPick: { lang: "ja", level: "e1", form: "word", advanced: false },
  };

  function defaultSave() {
    return {
      name: "",
      tutorialDone: false,
      tutorialStep: 0,
      stars: {},
      scoreTotal: 0,
      scoreBest: 0,
      bestById: {},
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
    if (state.screen !== id && id !== "play") stopPlayClock();
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
    return Object.keys(state.save.stars).filter((k) => k.indexOf("lesson-") !== 0).length;
  }

  function fmtScore(n) {
    return String(Math.max(0, n | 0)).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
  function fmtTime(sec) {
    const s = Math.max(0, Math.floor(sec));
    const m = Math.floor(s / 60);
    const r = s % 60;
    return m + ":" + String(r).padStart(2, "0");
  }

  /* せいかい・まちがい・タイムから共通スコア。じっくり正確なほど高い */
  function calcScore(p, sec) {
    const ok = p.ok | 0;
    const miss = p.miss | 0;
    const acc = ok + miss ? ok / (ok + miss) : 1;
    const base = ok * 10;
    const accBonus = Math.round(ok * 10 * acc * acc);
    const missPen = miss * 35;
    const expected = Math.max(5, ok * 0.55);
    let timePts = Math.round((expected - sec) * 10);
    timePts = Math.max(-ok * 3, Math.min(ok * 7, timePts));
    const perfect = miss === 0 && ok > 0 ? 400 + ok * 4 : 0;
    const combo = (p.maxCombo | 0) * 4;
    const total = Math.max(0, Math.round(base + accBonus + timePts + perfect + combo - missPen));
    return { total, base, accBonus, timePts, missPen, perfect, combo, acc, sec, ok, miss };
  }

  function applySharedScore(sc, stageId) {
    if (!state.save.bestById) state.save.bestById = {};
    state.save.scoreTotal = (state.save.scoreTotal || 0) + sc.total;
    const isBestRun = sc.total > (state.save.scoreBest || 0);
    if (isBestRun) state.save.scoreBest = sc.total;
    const prevPack = state.save.bestById[stageId] || 0;
    const isBestPack = sc.total > prevPack;
    if (isBestPack) state.save.bestById[stageId] = sc.total;
    persist();
    return { isBestRun, isBestPack, prevPack };
  }

  function liveScore() {
    const p = state.play;
    if (!p) return 0;
    return calcScore(p, Math.max(0.2, (Date.now() - p.start) / 1000)).total;
  }

  function stopPlayClock() {
    if (state.playTimer) {
      clearInterval(state.playTimer);
      state.playTimer = null;
    }
  }
  function startPlayClock() {
    stopPlayClock();
    state.playTimer = setInterval(() => {
      if (!state.play || state.screen !== "play") return;
      if ($("st-time")) $("st-time").textContent = fmtTime((Date.now() - state.play.start) / 1000);
      if ($("st-score")) $("st-score").textContent = fmtScore(liveScore());
    }, 200);
  }

  /* ---------- screens ---------- */
  function goTitle() { show("title"); }
  function goHub() {
    show("hub");
    $("hub-name").textContent = state.save.name || "ゆうしゃ";
    $("hub-score").textContent = fmtScore(state.save.scoreTotal || 0);
    $("hub-best").textContent = fmtScore(state.save.scoreBest || 0);
    $("hub-say").textContent = state.save.tutorialDone
      ? "マップで　だんだん　なれよう。点数を　ねらうなら　とことんハイスコアへ！"
      : "はじめてなら　まずは　「はじめて」のレッスンだよ。";
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
    if (stage.items) {
      stage.items.forEach((it) => items.push(it));
    } else if (stage.kind === "alpha") {
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
    startPlayClock();
    loadPlayItem();
    updatePlayStats();
  }

  function loadPlayItem() {
    const p = state.play;
    if (p.index >= p.items.length) { finishPlay(); return; }
    const item = p.items[p.index];
    p.engine = item.mode === "romaji"
      ? new Romaji.RomajiEngine(item.text, { punct: !!(p.stage && p.stage.advanced) })
      : new Romaji.AlphaEngine(item.text);
    p.engine._mode = item.mode;
    p.engine._src = item.text;
    p.engine._display = item.display || item.text;
    p.engine._meaning = item.meaning || "";
    updatePlayPrompt();
    KB.setTargets(p.engine.nextKeys());
    updatePlayStats();
  }

  function updatePlayPrompt() {
    const p = state.play;
    const eng = p.engine;
    const src = eng._src;
    const disp = eng._display || "";
    const meaning = eng._meaning || "";
    const board = $("prompt-board");
    if (board) board.classList.toggle("long", !!(p.stage && p.stage.form === "long") || src.length > 28);
    const dEl = $("display-line");
    const mEl = $("meaning-line");
    if (dEl) {
      const showDisp = disp && disp.replace(/\s/g, "") !== String(src).replace(/\s/g, "") &&
        disp.toLowerCase().replace(/[.,!?'"]/g, "") !== String(src).toLowerCase().replace(/[.,!?'"]/g, "");
      dEl.textContent = showDisp ? disp : "";
    }
    if (mEl) mEl.textContent = meaning ? "いみ： " + meaning : "";
    if (eng._mode === "romaji") {
      const typedSrc = (typeof Romaji.cleanTypingKana === "function")
        ? Romaji.cleanTypingKana(src, !!(p.stage && p.stage.advanced))
        : src;
      const doneK = typedSrc.slice(0, eng.pos);
      const restK = typedSrc.slice(eng.pos);
      $("kana-line").innerHTML = `<span class="done">${esc(doneK)}</span><span class="now">${esc(restK[0] || "")}</span><span class="wait">${esc(restK.slice(1))}</span>`;
      $("roma-line").innerHTML = `<span class="done">${esc(eng.typedDisplay())}</span><span class="rest">${esc(eng.hint())}</span>`;
      const pct = ((p.index + (typedSrc.length ? eng.pos / typedSrc.length : 1)) / p.items.length) * 100;
      $("prog").style.width = pct + "%";
    } else {
      const t = String(src);
      const i = eng.i || 0;
      $("kana-line").innerHTML = t.split("").map((ch, idx) => {
        const show = ch === " " ? "␣" : ch.toUpperCase();
        const cls = idx < i ? "done" : idx === i ? "now" : "wait";
        return `<span class="${cls}">${esc(show)}</span>`;
      }).join("");
      $("roma-line").innerHTML = meaning
        ? `<span class="rest">えいごで　うとう</span>`
        : `<span class="rest">ひかっているキーを、おなじいろのゆびで</span>`;
      const itemPct = p.items.length > 1
        ? ((p.index + (t.length ? i / t.length : 1)) / p.items.length) * 100
        : (t.length ? (i / t.length) * 100 : 0);
      $("prog").style.width = itemPct + "%";
    }
  }

  function updatePlayStats() {
    const p = state.play;
    if ($("st-combo")) $("st-combo").textContent = p.combo;
    if ($("st-miss")) $("st-miss").textContent = p.miss;
    if ($("st-score")) $("st-score").textContent = fmtScore(liveScore());
    if ($("st-time")) $("st-time").textContent = fmtTime((Date.now() - p.start) / 1000);
  }

  function finishPlay() {
    KB.stopDemo();
    stopPlayClock();
    Fx.floats = [];
    const p = state.play;
    const total = p.ok + p.miss;
    const acc = total ? p.ok / total : 1;
    const sec = Math.max(0.4, (Date.now() - p.start) / 1000);
    const cpm = Math.round((p.ok / sec) * 60);
    const sc = calcScore(p, sec);
    let stars = 1;
    if (acc >= 0.9) stars = 2;
    if (acc >= 0.96 && p.maxCombo >= 8) stars = 3;
    if (acc >= 0.99 && cpm >= 80) stars = 3;
    if (sc.miss === 0 && sc.ok >= 12) stars = Math.max(stars, 3);
    let bestFlags = { isBestRun: false, isBestPack: false };
    if (!p.free || (p.stage && p.stage.trackStars)) {
      const prev = state.save.stars[p.stage.id] || 0;
      state.save.stars[p.stage.id] = Math.max(prev, stars);
      bestFlags = applySharedScore(sc, p.stage.id);
    }
    p.lastScore = sc;
    show("result");
    const isHi = p.stage && p.stage.kind === "lesson";
    $("res-title").textContent = p.free && !(p.stage && p.stage.trackStars)
      ? "れんしゅう　おわり！"
      : bestFlags.isBestRun ? "自己ベスト！！" : stars >= 3 ? "パーフェクト！" : "クリア！";
    $("res-score").textContent = fmtScore(sc.total);
    $("res-newbest").classList.toggle("hidden", !bestFlags.isBestPack);
    $("res-stars").textContent = "★".repeat(stars) + "☆".repeat(3 - stars);
    $("res-break").innerHTML =
      `<div class="plus">せいかい <b>+${fmtScore(sc.base + sc.accBonus)}</b></div>` +
      `<div class="${sc.timePts >= 0 ? "plus" : "minus"}">タイム <b>${sc.timePts >= 0 ? "+" : ""}${fmtScore(sc.timePts)}</b></div>` +
      `<div class="minus">まちがい <b>-${fmtScore(sc.missPen)}</b></div>` +
      `<div class="plus">れんぞく <b>+${fmtScore(sc.combo + sc.perfect)}</b></div>`;
    $("res-acc").textContent = Math.round(acc * 100) + "%";
    $("res-spd").textContent = cpm + " キー/分";
    $("res-total").textContent = fmtScore(state.save.scoreTotal || 0);
    setPapil($("res-papil"), stars >= 2 || bestFlags.isBestRun ? "cheer" : "idle");
    if (stars >= 2 || bestFlags.isBestRun) { Sfx.fanfare(); Fx.confetti(); }
    else Sfx.star();
    const hasNext = nextStageOf(p.stage);
    $("res-next").classList.toggle("hidden", !hasNext);
    $("res-next").textContent = isHi ? "つぎのコース" : "つぎのステージ";
    $("res-hub").textContent = isHi || (p.from === "lessons") ? "コースへ" : "マップへ";
  }

  function nextStageOf(stage) {
    if (!stage) return null;
    if (stage.kind === "lesson") {
      const n = LESSONS.nextPack(stage.lang, stage.level, stage.form);
      if (!n) return null;
      if (!isLevelOpen(n.lang, n.level)) return null;
      return n;
    }
    const idx = DATA.STAGES.findIndex((s) => s.id === stage.id);
    return idx >= 0 ? DATA.STAGES[idx + 1] || null : null;
  }

  function isLevelOpen(lang, levelId) {
    const idx = LESSONS.LEVELS.findIndex((l) => l.id === levelId);
    if (idx <= 0) return true;
    const prev = LESSONS.LEVELS[idx - 1];
    return LESSONS.FORMS.some((f) => packStars(lang, prev.id, f.id) >= 2);
  }

  function lessonStarTotal() {
    return Object.keys(state.save.stars)
      .filter((k) => k.indexOf("lesson-") === 0)
      .reduce((a, k) => a + (state.save.stars[k] || 0), 0);
  }

  function packStars(lang, level, form) {
    return Math.max(
      state.save.stars[LESSONS.packId(lang, level, form)] || 0,
      state.save.stars[LESSONS.packId(lang, level, form, true)] || 0
    );
  }

  function startLessonPack(lang, level, form, advanced) {
    if (advanced == null) advanced = !!(state.lessonPick && state.lessonPick.advanced);
    const meta = LESSONS.packMeta(lang, level, form);
    const pool = LESSONS.getItems(lang, level, form);
    const want = form === "word" ? 20 : form === "sentence" ? 8 : 4;
    const take = Math.min(want, pool.length);
    const picked = DATA.buildPool(pool, take);
    const stage = {
      id: LESSONS.packId(lang, level, form, advanced),
      name: meta.name + (advanced ? "　上級" : ""),
      blurb: advanced ? "句読点も　うとう" : meta.blurb,
      kind: "lesson",
      lang, level, form,
      advanced: !!advanced,
      trackStars: true,
      items: LESSONS.toPlayItems(lang, picked, form, advanced),
    };
    startStage(stage, false);
    if (state.play) state.play.from = "lessons";
    $("play-say").textContent = advanced
      ? (lang === "en"
        ? "上級！　ピリオドや　カンマも　うとう。"
        : "上級！　まる（.）と　てん（,）も　うとう。")
      : (lang === "en"
        ? "ハイスコアねらい！　いみをみながら、まちがいすくなく　うとう。"
        : "ハイスコアねらい！　ローマ字で　ていねいに　うとう。");
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

  function goLessons() {
    show("lessons");
    $("les-stars").textContent = fmtScore(state.save.scoreTotal || 0);
    if ($("les-best")) $("les-best").textContent = fmtScore(state.save.scoreBest || 0);
    renderLessonPick();
  }

  function renderLessonPick() {
    const pick = state.lessonPick;
    const langBox = $("pick-lang");
    const lvBox = $("pick-level");
    const formBox = $("pick-form");
    langBox.innerHTML = "";
    LESSONS.LANGS.forEach((lg) => {
      const b = document.createElement("button");
      b.className = "chip" + (pick.lang === lg.id ? " on" : "");
      b.innerHTML = lg.icon + " " + lg.name + `<span class="sub">${lg.blurb}</span>`;
      b.addEventListener("click", () => {
        Sfx.click();
        pick.lang = lg.id;
        if (!isLevelOpen(pick.lang, pick.level)) pick.level = "e1";
        renderLessonPick();
      });
      langBox.appendChild(b);
    });
    lvBox.innerHTML = "";
    LESSONS.LEVELS.forEach((lv) => {
      const open = isLevelOpen(pick.lang, lv.id);
      const best = Math.max.apply(null, LESSONS.FORMS.map((f) => state.save.stars[LESSONS.packId(pick.lang, lv.id, f.id)] || 0).concat([0]));
      const b = document.createElement("button");
      b.className = "chip" + (pick.level === lv.id ? " on" : "") + (open ? "" : " locked");
      b.innerHTML = (open ? "" : "🔒 ") + lv.short + `<span class="sub">${lv.name}${best ? "　★" + best : ""}</span>`;
      b.addEventListener("click", () => {
        Sfx.click();
        if (!open) {
          $("lesson-summary").innerHTML = "<h3>まだ　ひみつだよ</h3><p>ひとつまえのレベルで　★★　いじょうをとると　ひらくよ。</p>";
          return;
        }
        pick.level = lv.id;
        renderLessonPick();
      });
      lvBox.appendChild(b);
    });
    const diffBox = $("pick-diff");
    if (diffBox) {
      diffBox.innerHTML = "";
      [
        { id: false, name: "ふつう", sub: "スペース・句読点なし" },
        { id: true, name: "上級", sub: "、。？！ もうつ" },
      ].forEach((df) => {
        const b = document.createElement("button");
        b.className = "chip" + (!!pick.advanced === df.id ? " on" : "");
        b.innerHTML = df.name + `<span class="sub">${df.sub}</span>`;
        b.addEventListener("click", () => {
          Sfx.click();
          pick.advanced = df.id;
          renderLessonPick();
        });
        diffBox.appendChild(b);
      });
    }
    formBox.innerHTML = "";
    LESSONS.FORMS.forEach((f) => {
      const stars = state.save.stars[LESSONS.packId(pick.lang, pick.level, f.id)] || 0;
      const b = document.createElement("button");
      b.className = "chip" + (pick.form === f.id ? " on" : "");
      const packBest = (state.save.bestById && state.save.bestById[LESSONS.packId(pick.lang, pick.level, f.id, pick.advanced)]) || 0;
      b.innerHTML = f.icon + " " + f.name + `<span class="sub">${f.blurb}　ベスト ${fmtScore(packBest)}</span>`;
      b.addEventListener("click", () => {
        Sfx.click();
        pick.form = f.id;
        renderLessonPick();
      });
      formBox.appendChild(b);
    });
    const meta = LESSONS.packMeta(pick.lang, pick.level, pick.form);
    const stars = packStars(pick.lang, pick.level, pick.form);
    const packBest = (state.save.bestById && state.save.bestById[LESSONS.packId(pick.lang, pick.level, pick.form, pick.advanced)]) || 0;
    const take = meta.form === "word" ? Math.min(20, meta.count) : meta.form === "sentence" ? Math.min(8, meta.count) : Math.min(4, meta.count);
    $("lesson-summary").innerHTML =
      `<h3>${meta.name}</h3>
       <p>じっくり　うって　ハイスコアを　ねらおう。タイムと　まちがいから　点がつくよ。<br>
       ${take} もん　／　${pick.advanced ? "上級（句読点あり）" : "ふつう"}　／　ベスト <b>${fmtScore(packBest)}</b>　／　${"★".repeat(stars)}${"☆".repeat(3 - stars)}</p>`;
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
      if (state.screen === "play" || state.screen === "tutorial" || state.screen === "zukan" || state.screen === "free" || state.screen === "lessons" || state.screen === "settings" || state.screen === "result") {
        KB.stopDemo();
        if (state.screen === "play" && state.play && state.play.from === "lessons") goLessons();
        else if (state.screen === "result" && state.play && state.play.from === "lessons") goLessons();
        else if (state.screen === "lessons" || state.screen === "hajimete") goHub();
        else goHub();
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
  $("play-back").addEventListener("click", () => {
    KB.stopDemo();
    if (state.play && state.play.from === "lessons") goLessons();
    else goHub();
  });
  $("zukan-back").addEventListener("click", () => { KB.onKeyClick = null; KB.stopDemo(); goHub(); });
  $("free-back").addEventListener("click", goHub);
  $("les-back").addEventListener("click", goHub);
  $("haj-back").addEventListener("click", goHub);
  $("haj-tut").addEventListener("click", () => { Sfx.click(); startTutorial(0); });
  $("haj-zukan").addEventListener("click", () => { Sfx.click(); goZukan(); });
  $("set-back").addEventListener("click", goHub);
  document.querySelectorAll(".mode-btn[data-go]").forEach((b) => {
    b.addEventListener("click", () => {
      Sfx.click();
      const go = b.dataset.go;
      if (go === "tutorial") startTutorial(0);
      if (go === "zukan") goZukan();
      if (go === "free") goFree();
      if (go === "lessons") goLessons();
      if (go === "hajimete") { show("hajimete"); }
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
  $("res-hub").addEventListener("click", () => {
    if (state.play && state.play.from === "lessons") goLessons();
    else goHub();
  });
  $("res-retry").addEventListener("click", () => {
    const st = state.play && state.play.stage;
    if (!st) return;
    if (st.kind === "lesson") startLessonPack(st.lang, st.level, st.form, st.advanced);
    else startStage(st, state.play.free);
  });
  $("res-next").addEventListener("click", () => {
    const st = state.play && state.play.stage;
    const next = nextStageOf(st);
    if (st && st.kind === "lesson") {
      if (next) startLessonPack(next.lang, next.level, next.form, st.advanced);
      else goLessons();
      return;
    }
    if (next) startStage(next);
    else goHub();
  });
  $("les-start").addEventListener("click", () => {
    Sfx.click();
    const p = state.lessonPick;
    if (!isLevelOpen(p.lang, p.level)) return;
    startLessonPack(p.lang, p.level, p.form);
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
