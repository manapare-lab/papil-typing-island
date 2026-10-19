/* パピルタクシー：クレイジータクシー風・知育ドライブゲーム */
(function () {
  const Q = window.TaxiQuestions;
  const canvas = document.getElementById("view");
  const ctx = canvas.getContext("2d");
  const $ = (id) => document.getElementById(id);

  /* ---- まちのデータ：道は格子状、ブロックはビル ---- */
  const PITCH = 500, ROAD = 140, BLOCKS = 6;
  const WORLD = BLOCKS * PITCH + ROAD;
  const roadC = (i) => ROAD / 2 + i * PITCH;
  const BLOCK_COLORS = ["#e9a8a0", "#a8c8e9", "#cfe3a0", "#e9d6a0", "#c7b3e6", "#a0e0d2"];
  const buildings = [];
  for (let i = 0; i < BLOCKS; i++) {
    for (let j = 0; j < BLOCKS; j++) {
      buildings.push({
        x: roadC(i) + ROAD / 2, y: roadC(j) + ROAD / 2, w: PITCH - ROAD, h: PITCH - ROAD,
        color: BLOCK_COLORS[(i * 7 + j * 3) % BLOCK_COLORS.length],
      });
    }
  }
  const intersections = [];
  for (let i = 0; i <= BLOCKS; i++) for (let j = 0; j <= BLOCKS; j++) intersections.push({ x: roadC(i), y: roadC(j) });

  /* ---- 入力 ---- */
  const keys = { up: false, down: false, left: false, right: false };
  const KEYMAP = { ArrowUp: "up", w: "up", W: "up", ArrowDown: "down", s: "down", S: "down",
    ArrowLeft: "left", a: "left", A: "left", ArrowRight: "right", d: "right", D: "right" };
  window.addEventListener("keydown", (e) => { const k = KEYMAP[e.key]; if (k) { keys[k] = true; e.preventDefault(); } });
  window.addEventListener("keyup", (e) => { const k = KEYMAP[e.key]; if (k) keys[k] = false; });
  document.querySelectorAll("#pad button").forEach((b) => {
    const k = b.dataset.key;
    const set = (v) => (e) => { e.preventDefault(); keys[k] = v; b.classList.toggle("on", v); };
    b.addEventListener("pointerdown", set(true));
    ["pointerup", "pointerleave", "pointercancel"].forEach((t) => b.addEventListener(t, set(false)));
  });
  window.addEventListener("blur", () => Object.keys(keys).forEach((k) => (keys[k] = false)));

  /* ---- 音（かんたんなビープ。最初の操作後に鳴る） ---- */
  let actx = null;
  function beep(freq, dur, type, vol) {
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      const o = actx.createOscillator(), g = actx.createGain();
      o.type = type || "square"; o.frequency.value = freq;
      g.gain.value = vol || 0.06;
      g.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + dur);
      o.connect(g); g.connect(actx.destination);
      o.start(); o.stop(actx.currentTime + dur);
    } catch (e) { /* 音が出なくても遊べる */ }
  }
  const sfx = {
    pickup: () => { beep(660, 0.1); setTimeout(() => beep(880, 0.15), 90); },
    ok: () => { [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => beep(f, 0.14, "triangle", 0.09), i * 80)); },
    ng: () => { beep(180, 0.3, "sawtooth", 0.08); },
    crash: () => { beep(90, 0.12, "sawtooth", 0.07); },
  };

  /* ---- ゲーム状態 ---- */
  let subject = "add";
  let G = null;
  let running = false;
  let last = 0;

  function bestKey(s) { return "papil-taxi-best-" + s; }
  function loadBest(s) { try { return Number(localStorage.getItem(bestKey(s))) || 0; } catch (e) { return 0; } }
  function saveBest(s, v) { try { localStorage.setItem(bestKey(s), String(v)); } catch (e) { /* ignore */ } }

  function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }

  function newGame() {
    const start = { x: roadC(3), y: roadC(3) };
    G = {
      car: { x: start.x, y: start.y, angle: 0, speed: 0 },
      time: 60, score: 0, combo: 0, correct: 0, wrong: 0,
      phase: "pickup", pickup: null, q: null, dests: [], rideT: 0, toastT: 0, shake: 0,
    };
    spawnPickup();
  }

  function farIntersections(from, minD, avoid) {
    return Q.shuffle(intersections).filter((p) => dist(p, from) >= minD && avoid.every((a) => dist(p, a) >= 400));
  }

  function spawnPickup() {
    G.phase = "pickup";
    G.pickup = farIntersections(G.car, 700, [])[0] || intersections[0];
    G.q = null; G.dests = [];
    setBanner("おきゃくさんを　むかえに　いこう！", "矢じるしのほうへ");
  }

  function startRide() {
    G.phase = "ride";
    G.rideT = 0;
    G.q = Q.makeQuestion(subject, Math.min(4, Math.floor(G.correct / 2)));
    const spots = [];
    for (let n = 0; n < G.q.choices.length; n++) {
      const p = farIntersections(G.car, 600, spots.concat([G.pickup]))[0] || intersections[n];
      spots.push(p);
    }
    G.dests = G.q.choices.map((label, n) => ({ x: spots[n].x, y: spots[n].y, label, correct: label === G.q.answer, dead: false }));
    setBanner(G.q.prompt, "こたえの　ばしょへ　ゴー！");
    sfx.pickup();
  }

  function setBanner(main, sub) { $("banner").innerHTML = main + "<small>" + sub + "</small>"; }

  let toastTimer = 0;
  function toast(text, color) {
    const t = $("toast");
    t.textContent = text; t.style.color = color || "#fff"; t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), 900);
  }

  /* ---- 更新 ---- */
  function collide(car) {
    const R = 16;
    for (const b of buildings) {
      const cx = Math.max(b.x, Math.min(car.x, b.x + b.w));
      const cy = Math.max(b.y, Math.min(car.y, b.y + b.h));
      let dx = car.x - cx, dy = car.y - cy;
      const d = Math.hypot(dx, dy);
      if (d < R) {
        if (d === 0) { dx = 1; dy = 0; } else { dx /= d; dy /= d; }
        car.x = cx + dx * R; car.y = cy + dy * R;
        if (Math.abs(car.speed) > 120) { sfx.crash(); G.shake = 0.15; }
        car.speed *= 0.4;
      }
    }
    const lo = R, hi = WORLD - R;
    if (car.x < lo || car.x > hi || car.y < lo || car.y > hi) {
      car.x = Math.max(lo, Math.min(hi, car.x)); car.y = Math.max(lo, Math.min(hi, car.y));
      car.speed *= 0.5;
    }
  }

  function update(dt) {
    const c = G.car;
    if (keys.up) c.speed += 560 * dt;
    else if (keys.down) c.speed -= (c.speed > 0 ? 1000 : 320) * dt;
    else c.speed *= Math.pow(0.45, dt);
    c.speed = Math.max(-170, Math.min(540, c.speed));
    const steer = (keys.right ? 1 : 0) - (keys.left ? 1 : 0);
    c.angle += steer * 2.7 * dt * Math.max(-1, Math.min(1, c.speed / 180));
    c.x += Math.cos(c.angle) * c.speed * dt;
    c.y += Math.sin(c.angle) * c.speed * dt;
    collide(c);

    G.time -= dt;
    G.shake = Math.max(0, G.shake - dt);
    if (G.phase === "ride") G.rideT += dt;

    if (G.phase === "pickup" && dist(c, G.pickup) < 60) {
      startRide();
    } else if (G.phase === "ride") {
      for (const d of G.dests) {
        if (d.dead || dist(c, d) > 70) continue;
        if (d.correct) arrive();
        else wrongAnswer(d);
        break;
      }
    }
    if (G.time <= 0) finish();
  }

  function arrive() {
    const speedBonus = Math.max(0, Math.round((25 - G.rideT) * 8));
    const fare = 100 + speedBonus + G.combo * 20;
    G.score += fare; G.correct++; G.combo++; G.time += 6;
    toast("せいかい！ +" + fare + "えん", "#ffe066");
    sfx.ok();
    spawnPickup();
  }

  function wrongAnswer(d) {
    d.dead = true; G.wrong++; G.combo = 0; G.time -= 3; G.shake = 0.3;
    toast("ちがうよ！ −3びょう", "#ff8fa3");
    sfx.ng();
  }

  function finish() {
    running = false;
    $("hud").hidden = true;
    const prev = loadBest(subject);
    const isBest = G.score > prev;
    if (isBest) saveBest(subject, G.score);
    $("r-subject").textContent = Q.SUBJECTS[subject].name;
    $("r-score").textContent = G.score;
    $("r-detail").textContent = "せいかい " + G.correct + "かい ／ まちがい " + G.wrong + "かい";
    $("r-best").textContent = isBest ? "🎉 じこベストこうしん！" : "ベスト " + prev + "えん";
    $("r-img").src = G.score >= 600 ? "../assets/char/cheer.png" : "../assets/char/idle.png";
    $("result").classList.add("on");
  }

  /* ---- 描画 ---- */
  let W = 0, H = 0, DPR = 1;
  function resize() {
    DPR = Math.min(2, window.devicePixelRatio || 1);
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = W * DPR; canvas.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  window.addEventListener("resize", resize);

  function drawWorld(camX, camY, s) {
    ctx.fillStyle = "#6cc46f"; ctx.fillRect(0, 0, WORLD, WORLD);
    ctx.fillStyle = "#4a4f5c"; ctx.fillRect(0, 0, WORLD, WORLD);
    // 道路のセンターライン
    ctx.strokeStyle = "#f4e9a8"; ctx.lineWidth = 4; ctx.setLineDash([26, 22]);
    for (let i = 0; i <= BLOCKS; i++) {
      ctx.beginPath(); ctx.moveTo(roadC(i), 0); ctx.lineTo(roadC(i), WORLD); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, roadC(i)); ctx.lineTo(WORLD, roadC(i)); ctx.stroke();
    }
    ctx.setLineDash([]);
    // ビル
    for (const b of buildings) {
      ctx.fillStyle = "#cfd3da"; ctx.fillRect(b.x - 8, b.y - 8, b.w + 16, b.h + 16);
      ctx.fillStyle = "#88c070"; ctx.fillRect(b.x, b.y, b.w, b.h);
      const half = (b.w - 30) / 2;
      for (let a = 0; a < 2; a++) for (let c2 = 0; c2 < 2; c2++) {
        const rx = b.x + 10 + a * (half + 10), ry = b.y + 10 + c2 * (half + 10);
        ctx.fillStyle = "rgba(0,0,0,.18)"; ctx.fillRect(rx + 6, ry + 6, half, half);
        ctx.fillStyle = b.color; ctx.fillRect(rx, ry, half, half);
        ctx.fillStyle = "rgba(255,255,255,.35)"; ctx.fillRect(rx + 10, ry + 10, half - 20, half - 20);
      }
    }
  }

  function drawCar(car) {
    ctx.save();
    ctx.translate(car.x, car.y); ctx.rotate(car.angle);
    ctx.fillStyle = "rgba(0,0,0,.3)"; ctx.fillRect(-20, -10, 46, 28);
    ctx.fillStyle = "#ffd23f"; roundRect(-22, -13, 46, 26, 7); ctx.fill();
    ctx.fillStyle = "#25324a"; roundRect(0, -10, 12, 20, 3); ctx.fill();   // フロントガラス
    ctx.fillStyle = "#fff"; ctx.fillRect(-12, -5, 10, 10);                 // 屋根のあんどん
    ctx.fillStyle = "#fff6b0"; ctx.fillRect(20, -11, 4, 6); ctx.fillRect(20, 5, 4, 6);
    ctx.restore();
  }
  function roundRect(x, y, w, h, r) {
    ctx.beginPath(); ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }

  function drawMarker(p, color, emoji, pulse) {
    const r = 46 + Math.sin(pulse * 6) * 6;
    ctx.fillStyle = color; ctx.globalAlpha = 0.35;
    ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1; ctx.lineWidth = 5; ctx.strokeStyle = color; ctx.stroke();
    if (emoji) { ctx.font = "34px sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(emoji, p.x, p.y); }
  }

  /* 画面外ならふちに矢じるし、画面内なら頭の上にラベルを出す */
  function drawLabel(p, label, color, camX, camY, s, dim) {
    const sx = (p.x - camX) * s + W / 2, sy = (p.y - camY) * s + H / 2;
    const m = 60;
    let lx = sx, ly = sy - 60 * s - 10, arrow = false;
    if (sx < m || sx > W - m || sy < m + 70 || sy > H - m) {
      arrow = true;
      const dx = sx - W / 2, dy = sy - H / 2;
      const k = Math.min((W / 2 - m) / Math.abs(dx || 1e-6), (H / 2 - m - 40) / Math.abs(dy || 1e-6));
      lx = W / 2 + dx * k; ly = H / 2 + dy * k + 20;
      ctx.save(); ctx.translate(lx, ly); ctx.rotate(Math.atan2(dy, dx));
      ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(34, 0); ctx.lineTo(8, -16); ctx.lineTo(8, 16); ctx.closePath(); ctx.fill();
      ctx.restore();
      lx -= Math.cos(Math.atan2(dy, dx)) * 40; ly -= Math.sin(Math.atan2(dy, dx)) * 40;
    }
    if (label) {
      ctx.save();
      ctx.font = "800 26px 'Hiragino Maru Gothic ProN', 'Yu Gothic', sans-serif";
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      const w = ctx.measureText(label).width + 28;
      ctx.globalAlpha = dim ? 0.4 : 1;
      ctx.fillStyle = "#fff"; roundRect(lx - w / 2, ly - 20, w, 40, 14); ctx.fill();
      ctx.lineWidth = 4; ctx.strokeStyle = color; ctx.stroke();
      ctx.fillStyle = "#25324a"; ctx.fillText(label, lx, ly + 1);
      ctx.restore();
    }
    return arrow;
  }

  function render(now) {
    const s = Math.max(0.55, Math.min(1.1, Math.min(W / 1000, H / 650)));
    const c = G.car;
    const sh = G.shake > 0 ? (Math.random() - 0.5) * 10 : 0;
    const camX = c.x + Math.cos(c.angle) * c.speed * 0.25, camY = c.y + Math.sin(c.angle) * c.speed * 0.25;
    ctx.fillStyle = "#6cc46f"; ctx.fillRect(0, 0, W, H);
    ctx.save();
    ctx.translate(W / 2 + sh, H / 2 + sh); ctx.scale(s, s); ctx.translate(-camX, -camY);
    drawWorld(camX, camY, s);
    const t = now / 1000;
    if (G.phase === "pickup") drawMarker(G.pickup, "#ff6b8b", "🙋", t);
    for (const d of G.dests) drawMarker(d, d.dead ? "#868e96" : "#3ddc97", d.dead ? "✖" : "🏁", t);
    drawCar(c);
    ctx.restore();
    if (G.phase === "pickup") drawLabel(G.pickup, "おきゃくさん", "#ff6b8b", camX, camY, s);
    for (const d of G.dests) drawLabel(d, d.label, d.dead ? "#868e96" : "#3ddc97", camX, camY, s, d.dead);

    $("h-time").textContent = Math.max(0, Math.ceil(G.time));
    $("h-score").textContent = G.score;
    $("h-combo").textContent = G.combo;
  }

  function loop(now) {
    if (!running) return;
    const dt = Math.min(0.05, (now - last) / 1000 || 0);
    last = now;
    update(dt);
    if (running) render(now);
    requestAnimationFrame(loop);
  }

  /* ---- 画面まわり ---- */
  function buildMenu() {
    const box = $("subjects");
    box.innerHTML = "";
    Object.keys(Q.SUBJECTS).forEach((key) => {
      const b = document.createElement("button");
      b.className = "subj";
      b.innerHTML = '<span class="ic">' + Q.SUBJECTS[key].icon + "</span>" + Q.SUBJECTS[key].name +
        "<small>ベスト " + loadBest(key) + "えん</small>";
      b.addEventListener("click", () => start(key));
      box.appendChild(b);
    });
  }

  function start(key) {
    subject = key;
    $("menu").classList.remove("on"); $("result").classList.remove("on");
    $("hud").hidden = false;
    newGame();
    running = true;
    last = performance.now();
    requestAnimationFrame(loop);
  }

  $("r-again").addEventListener("click", () => start(subject));
  $("r-menu").addEventListener("click", () => { $("result").classList.remove("on"); buildMenu(); $("menu").classList.add("on"); });

  resize();
  buildMenu();
  newGame();
  render(0);
})();
