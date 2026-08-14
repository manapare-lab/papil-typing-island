/* カラーキーボードと、押す指が動く図解 */
(function (global) {
  const FINGER = {
    LP: { name: "ひだり こゆび", short: "こゆび", hand: "left", color: "#ff6b9d" },
    LR: { name: "ひだり くすりゆび", short: "くすりゆび", hand: "left", color: "#6dd36d" },
    LM: { name: "ひだり なかゆび", short: "なかゆび", hand: "left", color: "#4ec3ff" },
    LI: { name: "ひだり ひとさしゆび", short: "ひとさしゆび", hand: "left", color: "#ffb347" },
    TH: { name: "おやゆび", short: "おやゆび", hand: "both", color: "#c084fc" },
    RI: { name: "みぎ ひとさしゆび", short: "ひとさしゆび", hand: "right", color: "#ffd93d" },
    RM: { name: "みぎ なかゆび", short: "なかゆび", hand: "right", color: "#4ec3ff" },
    RR: { name: "みぎ くすりゆび", short: "くすりゆび", hand: "right", color: "#6dd36d" },
    RP: { name: "みぎ こゆび", short: "こゆび", hand: "right", color: "#ff6b9d" },
  };

  const KEY_FINGER = {};
  const assign = (keys, id) => keys.forEach((k) => (KEY_FINGER[k] = id));
  assign(["1", "q", "a", "z"], "LP");
  assign(["2", "w", "s", "x"], "LR");
  assign(["3", "e", "d", "c"], "LM");
  assign(["4", "5", "r", "t", "f", "g", "v", "b"], "LI");
  assign([" "], "TH");
  assign(["6", "7", "y", "u", "h", "j", "n", "m"], "RI");
  assign(["8", "i", "k", ","], "RM");
  assign(["9", "o", "l", "."], "RR");
  assign(["0", "-", "=", "p", "[", "]", ";", "'", "/"], "RP");

  const HOME = { LP: "a", LR: "s", LM: "d", LI: "f", RI: "j", RM: "k", RR: "l", RP: ";", TH: " " };

  const ROWS = [
    [
      ["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"],
      ["6", "6"], ["7", "7"], ["8", "8"], ["9", "9"], ["0", "0"],
      ["-", "-"], ["=", "="],
    ],
    [
      ["q", "Q"], ["w", "W"], ["e", "E"], ["r", "R"], ["t", "T"],
      ["y", "Y"], ["u", "U"], ["i", "I"], ["o", "O"], ["p", "P"],
      ["[", "["], ["]", "]"],
    ],
    [
      ["a", "A"], ["s", "S"], ["d", "D"], ["f", "F"], ["g", "G"],
      ["h", "H"], ["j", "J"], ["k", "K"], ["l", "L"], [";", ";"],
      ["'", "'"],
    ],
    [
      ["z", "Z"], ["x", "X"], ["c", "C"], ["v", "V"], ["b", "B"],
      ["n", "N"], ["m", "M"], [",", ","], [".", "."], ["/", "/"],
    ],
  ];

  const KeyboardView = {
    el: null,
    handsEl: null,
    labelEl: null,
    lineEl: null,
    targets: [],
    demoTimer: null,
    demoOn: true,
    onKeyClick: null,

    mount(root) {
      this.el = root.querySelector(".kb");
      this.handsEl = root.querySelector(".hands");
      this.labelEl = root.querySelector(".finger-label");
      this.lineEl = root.querySelector(".guide-line");
      this.renderKeys();
      this.renderHands();
      this.el.addEventListener("click", (e) => {
        const key = e.target.closest("[data-key]");
        if (!key) return;
        if (this.onKeyClick) this.onKeyClick(key.dataset.key);
      });
      window.addEventListener("resize", () => this.layoutHands());
    },

    renderKeys() {
      this.el.innerHTML = "";
      ROWS.forEach((row, ri) => {
        const rowEl = document.createElement("div");
        rowEl.className = "kb-row";
        rowEl.style.setProperty("--indent", [0, 1.2, 1.8, 2.6][ri] + "em");
        row.forEach(([id, label]) => {
          const k = document.createElement("button");
          k.type = "button";
          k.className = "key";
          k.dataset.key = id;
          const fid = KEY_FINGER[id];
          if (fid) {
            k.dataset.finger = fid;
            k.style.setProperty("--kc", FINGER[fid].color);
          }
          if (HOME[fid] === id) k.classList.add("home");
          if ("asdfjkl;".includes(id)) k.classList.add("home-key");
          k.innerHTML = `<span>${label}</span>${id === "f" || id === "j" ? '<i class="bump"></i>' : ""}`;
          rowEl.appendChild(k);
        });
        this.el.appendChild(rowEl);
      });
      const spaceRow = document.createElement("div");
      spaceRow.className = "kb-row space-row";
      const space = document.createElement("button");
      space.type = "button";
      space.className = "key space";
      space.dataset.key = " ";
      space.dataset.finger = "TH";
      space.style.setProperty("--kc", FINGER.TH.color);
      space.innerHTML = "<span>スペース</span>";
      spaceRow.appendChild(space);
      this.el.appendChild(spaceRow);
    },

    renderHands() {
      const gid = "hg-" + Math.random().toString(36).slice(2, 7);
      this.handsEl.innerHTML = `
        <svg class="hands-svg" viewBox="0 0 900 220" aria-hidden="true">
          <defs>
            <filter id="${gid}" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="3.5" result="b"/>
              <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>
          <g class="hand-left hand" data-glow="${gid}"></g>
          <g class="hand-right hand" data-glow="${gid}"></g>
        </svg>
      `;
      const stage = this.el.closest(".kb-stage");
      if (stage && !stage.querySelector(":scope > .guide-svg")) {
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("class", "guide-svg");
        svg.setAttribute("aria-hidden", "true");
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("class", "guide-line");
        path.setAttribute("fill", "none");
        path.setAttribute("stroke-linecap", "round");
        svg.appendChild(path);
        stage.appendChild(svg);
      }
      this.lineEl = stage ? stage.querySelector(":scope > .guide-svg .guide-line") : null;
      this.buildHand("left", 230, 18);
      this.buildHand("right", 670, 18);
      this.layoutHands();
    },

    buildHand(side, cx, cy) {
      const g = this.handsEl.querySelector(side === "left" ? ".hand-left" : ".hand-right");
      const dir = side === "left" ? 1 : -1;
      const layout = side === "left"
        ? [
            { id: "LP", x: -72, y: 42, h: 70, w: 26 },
            { id: "LR", x: -38, y: 18, h: 90, w: 28 },
            { id: "LM", x: -2, y: 8, h: 102, w: 28 },
            { id: "LI", x: 34, y: 22, h: 86, w: 28 },
            { id: "TH", x: 58, y: 122, h: 48, w: 28, thumb: true, rot: 32 },
          ]
        : [
            { id: "TH", x: -58, y: 122, h: 48, w: 28, thumb: true, rot: -32 },
            { id: "RI", x: -34, y: 22, h: 86, w: 28 },
            { id: "RM", x: 2, y: 8, h: 102, w: 28 },
            { id: "RR", x: 38, y: 18, h: 90, w: 28 },
            { id: "RP", x: 72, y: 42, h: 70, w: 26 },
          ];

      let html = `<g transform="translate(${cx},${cy})">`;
      const fingerSvg = (f) => {
        const col = FINGER[f.id].color;
        const rot = f.rot || 0;
        return `<g class="finger" data-finger="${f.id}" data-side="${side}"
          style="--fc:${col}"
          transform="translate(${f.x},${f.y}) rotate(${rot})">
          <g class="finger-motion">
            <rect class="digit" x="${-f.w / 2}" y="0" width="${f.w}" height="${f.h}" rx="${f.w / 2}"/>
            <ellipse class="tip" cx="0" cy="11" rx="${f.w / 2 + 1}" ry="13"/>
            <ellipse class="nail" cx="0" cy="10" rx="${f.w / 2 - 7}" ry="6"/>
          </g>
        </g>`;
      };
      layout.filter((f) => !f.thumb).forEach((f) => { html += fingerSvg(f); });
      html += `<g class="palm">
        <path d="M -80 112
                 C -88 86, -78 68, -54 66
                 L 54 66
                 C 78 68, 88 86, 80 112
                 C 76 142, 36 162, 10 166
                 L -10 166
                 C -36 162, -76 142, -80 112 Z"/>
        <ellipse class="palm-shine" cx="${-14 * dir}" cy="104" rx="26" ry="15"/>
        <text class="hand-tag" y="132">${side === "left" ? "ひだりて" : "みぎて"}</text>
      </g>`;
      layout.filter((f) => f.thumb).forEach((f) => { html += fingerSvg(f); });
      html += `</g>`;
      g.innerHTML = html;
    },

    keyEl(ch) {
      return this.el.querySelector(`[data-key="${cssEscape(ch)}"]`);
    },

    clear() {
      this.el.querySelectorAll(".key").forEach((k) => {
        k.classList.remove("target", "pressed", "ghost", "wrong");
      });
      this.handsEl.querySelectorAll(".finger").forEach((f) => {
        f.classList.remove("ready", "press", "dim");
        const mot = f.querySelector(".finger-motion");
        if (mot) mot.style.transform = "";
      });
      if (this.labelEl) this.labelEl.innerHTML = "";
      if (this.lineEl) this.lineEl.setAttribute("d", "");
      this.targets = [];
    },

    setTargets(chars, opts) {
      opts = opts || {};
      this.clear();
      this.targets = (chars || []).filter(Boolean);
      if (!this.targets.length) return;
      this.targets.forEach((ch) => {
        const el = this.keyEl(ch);
        if (el) el.classList.add("target");
      });
      const primary = this.targets[0];
      const fid = KEY_FINGER[primary];
      this.handsEl.querySelectorAll(".finger").forEach((f) => {
        if (this.targets.some((ch) => KEY_FINGER[ch] === f.dataset.finger)) {
          f.classList.add("ready");
        } else {
          f.classList.add("dim");
        }
      });
      this.reachToward(primary);
      this.updateLabel(this.targets);
      this.updateGuide(primary);
      if (this.demoOn && !opts.noDemo) this.startDemo(primary);
    },

    reachToward() {
      /* 指は手のつけねから上下するだけ。位置をずらすと手が分解して見える */
    },

    updateLabel(chars) {
      if (!this.labelEl) return;
      const bits = [];
      const seen = new Set();
      chars.forEach((ch) => {
        const fid = KEY_FINGER[ch];
        if (!fid || seen.has(fid)) return;
        seen.add(fid);
        const f = FINGER[fid];
        const pretty = ch === " " ? "スペース" : ch.toUpperCase();
        bits.push(
          `<span class="fl-chip" style="--kc:${f.color}">
            <b>${pretty}</b> は <em>${f.name}</em>
          </span>`
        );
      });
      this.labelEl.innerHTML = bits.join("");
    },

    updateGuide(ch) {
      const stage = this.el && this.el.closest(".kb-stage");
      const svg = stage && stage.querySelector(":scope > .guide-svg");
      const line = svg && svg.querySelector(".guide-line");
      if (!line || !svg) return;
      const key = this.keyEl(ch);
      const fid = KEY_FINGER[ch];
      const finger = this.handsEl.querySelector(`.finger[data-finger="${fid}"] .tip`);
      if (!key || !finger) {
        line.setAttribute("d", "");
        return;
      }
      const wrap = stage.getBoundingClientRect();
      const kr = key.getBoundingClientRect();
      const fr = finger.getBoundingClientRect();
      const x1 = fr.left + fr.width / 2 - wrap.left;
      const y1 = fr.top + fr.height / 2 - wrap.top;
      const x2 = kr.left + kr.width / 2 - wrap.left;
      const y2 = kr.top + kr.height / 2 - wrap.top;
      svg.setAttribute("viewBox", `0 0 ${wrap.width} ${wrap.height}`);
      const mx = (x1 + x2) / 2;
      const my = Math.min(y1, y2) - 28;
      line.setAttribute("d", `M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`);
      line.setAttribute("stroke", FINGER[fid].color);
    },

    startDemo(ch) {
      this.stopDemo();
      const fid = KEY_FINGER[ch];
      const fingers = this.handsEl.querySelectorAll(`.finger[data-finger="${fid}"]`);
      const key = this.keyEl(ch);
      if (!fingers.length || !key) return;
      const beat = () => {
        fingers.forEach((finger) => finger.classList.remove("press"));
        key.classList.remove("ghost");
        fingers.forEach((finger) => void finger.offsetWidth);
        fingers.forEach((finger) => finger.classList.add("press"));
        key.classList.add("ghost");
        setTimeout(() => {
          fingers.forEach((finger) => finger.classList.remove("press"));
          key.classList.remove("ghost");
        }, 280);
      };
      beat();
      this.demoTimer = setInterval(beat, 1100);
    },

    stopDemo() {
      if (this.demoTimer) {
        clearInterval(this.demoTimer);
        this.demoTimer = null;
      }
    },

    press(ch) {
      const key = this.keyEl(ch);
      const fid = KEY_FINGER[ch];
      const fingers = fid ? this.handsEl.querySelectorAll(`.finger[data-finger="${fid}"]`) : [];
      if (key) {
        key.classList.add("pressed");
        setTimeout(() => key.classList.remove("pressed", "ghost"), 160);
      }
      fingers.forEach((finger) => {
        finger.classList.add("press");
        setTimeout(() => finger.classList.remove("press"), 180);
      });
    },

    wrong(ch) {
      const key = this.keyEl(ch);
      if (key) {
        key.classList.add("wrong");
        setTimeout(() => key.classList.remove("wrong"), 280);
      }
    },

    highlightFinger(fid, alsoKeys) {
      this.clear();
      this.handsEl.querySelectorAll(".finger").forEach((f) => {
        if (f.dataset.finger === fid) f.classList.add("ready");
        else f.classList.add("dim");
      });
      if (alsoKeys) {
        this.el.querySelectorAll(".key").forEach((k) => {
          if (k.dataset.finger === fid) k.classList.add("target");
          else k.classList.add("dim");
        });
      }
      if (this.labelEl && FINGER[fid]) {
        this.labelEl.innerHTML = `<span class="fl-chip" style="--kc:${FINGER[fid].color}"><em>${FINGER[fid].name}</em></span>`;
      }
    },

    highlightHomes() {
      this.clear();
      "asdfjkl;".split("").forEach((ch) => {
        const el = this.keyEl(ch);
        if (el) el.classList.add("target");
        const fid = KEY_FINGER[ch];
        const f = this.handsEl.querySelector(`.finger[data-finger="${fid}"]`);
        if (f) f.classList.add("ready");
      });
      this.handsEl.querySelectorAll(".finger").forEach((f) => {
        if (!f.classList.contains("ready")) f.classList.add("dim");
      });
      if (this.labelEl) {
        this.labelEl.innerHTML = `<span class="fl-chip" style="--kc:#ffd93d"><em>ホームポジション　ＡＳＤＦ　ＪＫＬ；</em></span>`;
      }
    },

    layoutHands() {
      if (this.targets[0]) this.updateGuide(this.targets[0]);
    },

    fingerOf: (ch) => KEY_FINGER[ch] || null,
    infoOf: (id) => FINGER[id],
    allFingers: FINGER,
  };

  function cssEscape(ch) {
    if (ch === '"') return '\\"';
    if (ch === "\\") return "\\\\";
    return ch;
  }

  global.KB = KeyboardView;
  global.FINGER_MAP = { FINGER, KEY_FINGER, HOME };
})(window);
