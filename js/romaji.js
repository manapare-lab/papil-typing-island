/* ローマ字判定。訓令式・ヘボン式の両方を受け付ける */
(function (global) {
  const MORA_ROMAJI = {
    あ: ["a"], い: ["i"], う: ["u", "wu"], え: ["e"], お: ["o"],
    か: ["ka", "ca"], き: ["ki"], く: ["ku", "cu", "qu"], け: ["ke"], こ: ["ko", "co"],
    さ: ["sa"], し: ["si", "shi", "ci"], す: ["su"], せ: ["se", "ce"], そ: ["so"],
    た: ["ta"], ち: ["ti", "chi"], つ: ["tu", "tsu"], て: ["te"], と: ["to"],
    な: ["na"], に: ["ni"], ぬ: ["nu"], ね: ["ne"], の: ["no"],
    は: ["ha"], ひ: ["hi"], ふ: ["hu", "fu"], へ: ["he"], ほ: ["ho"],
    ま: ["ma"], み: ["mi"], む: ["mu"], め: ["me"], も: ["mo"],
    や: ["ya"], ゆ: ["yu"], よ: ["yo"],
    ら: ["ra"], り: ["ri"], る: ["ru"], れ: ["re"], ろ: ["ro"],
    わ: ["wa"], を: ["wo", "o"], ん: ["n", "nn", "n'", "xn"],
    が: ["ga"], ぎ: ["gi"], ぐ: ["gu"], げ: ["ge"], ご: ["go"],
    ざ: ["za"], じ: ["zi", "ji"], ず: ["zu"], ぜ: ["ze"], ぞ: ["zo"],
    だ: ["da"], ぢ: ["di", "ji"], づ: ["du", "zu"], で: ["de"], ど: ["do"],
    ば: ["ba"], び: ["bi"], ぶ: ["bu"], べ: ["be"], ぼ: ["bo"],
    ぱ: ["pa"], ぴ: ["pi"], ぷ: ["pu"], ぺ: ["pe"], ぽ: ["po"],
    ぁ: ["la", "xa"], ぃ: ["li", "xi", "lyi", "xyi"], ぅ: ["lu", "xu"],
    ぇ: ["le", "xe", "lye", "xye"], ぉ: ["lo", "xo"],
    ゃ: ["lya", "xya"], ゅ: ["lyu", "xyu"], ょ: ["lyo", "xyo"],
    っ: ["xtu", "ltu", "xtsu", "ltsu"],
    ー: ["-"],
    きゃ: ["kya"], きゅ: ["kyu"], きょ: ["kyo"],
    しゃ: ["sya", "sha"], しゅ: ["syu", "shu"], しょ: ["syo", "sho"],
    ちゃ: ["tya", "cha", "cya"], ちゅ: ["tyu", "chu", "cyu"], ちょ: ["tyo", "cho", "cyo"],
    にゃ: ["nya"], にゅ: ["nyu"], にょ: ["nyo"],
    ひゃ: ["hya"], ひゅ: ["hyu"], ひょ: ["hyo"],
    みゃ: ["mya"], みゅ: ["myu"], みょ: ["myo"],
    りゃ: ["rya"], りゅ: ["ryu"], りょ: ["ryo"],
    ぎゃ: ["gya"], ぎゅ: ["gyu"], ぎょ: ["gyo"],
    じゃ: ["ja", "zya", "jya"], じゅ: ["ju", "zyu", "jyu"], じょ: ["jo", "zyo", "jyo"],
    びゃ: ["bya"], びゅ: ["byu"], びょ: ["byo"],
    ぴゃ: ["pya"], ぴゅ: ["pyu"], ぴょ: ["pyo"],
    ゔ: ["vu"],
  };

  const PREFERRED = {
    し: "shi", ち: "chi", つ: "tsu", ふ: "fu", じ: "ji", を: "wo",
    しゃ: "sha", しゅ: "shu", しょ: "sho",
    ちゃ: "cha", ちゅ: "chu", ちょ: "cho",
    じゃ: "ja", じゅ: "ju", じょ: "jo",
  };

  const MORA_ORDER = Object.keys(MORA_ROMAJI).sort((a, b) => b.length - a.length);

  const HIRA_FROM_KATA = (function () {
    const map = {};
    const h = "ぁあぃいぅうぇえぉおかがきぎくぐけげこごさざしじすずせぜそぞただちぢっつづてでとどなにぬねのはばぱひびぴふぶぷへべぺほぼぽまみむめもゃやゅゆょよらりるれろゎわゐゑをんゔー";
    const k = "ァアィイゥウェエォオカガキギクグケゲコゴサザシジスズセゼソゾタダチヂッツヅテデトドナニヌネノハバパヒビピフブプヘベペホボポマミムメモャヤュユョヨラリルレロヮワヰヱヲンヴー";
    for (let i = 0; i < h.length; i++) map[k[i]] = h[i];
    return map;
  })();

  function toHiragana(s) {
    return String(s).replace(/[\u30A1-\u30F6ー]/g, (ch) => HIRA_FROM_KATA[ch] || ch);
  }

  function cleanTypingKana(s, keepPunct) {
    let out = toHiragana(s).replace(/[\s　]+/g, "");
    if (keepPunct) {
      out = out.replace(/[・…「」『』（）()：:；;]/g, "");
      out = out.replace(/．/g, "。").replace(/，/g, "、");
      return out;
    }
    return out.replace(/[、。！？!?,.・…「」『』（）()：:；;]/g, "");
  }

  function nextMora(kana) {
    if (!kana) return null;
    for (const m of MORA_ORDER) {
      if (kana.startsWith(m)) return { text: m, consume: m.length };
    }
    return { text: kana[0], consume: 1 };
  }

  function romajis(mora) {
    return MORA_ROMAJI[mora] ? MORA_ROMAJI[mora].slice() : [mora];
  }

  function preferredOf(mora) {
    return PREFERRED[mora] || (MORA_ROMAJI[mora] ? MORA_ROMAJI[mora][0] : mora);
  }

  function leadingConsonant(roman) {
    const m = roman.match(/^(sh|ch|ts|th|[bcdfghjklmnpqrstvwxyz])/i);
    return m ? m[1] : "";
  }

  function firstMoraOptions(kana) {
    const out = [];
    if (!kana) return out;
    const head = kana[0];

    if (head === " " || head === "　") {
      out.push({ roman: " ", consume: 1 });
      return out;
    }
    if (head === "。" || head === "．" || head === ".") {
      out.push({ roman: ".", consume: 1 });
      return out;
    }
    if (head === "、" || head === "，" || head === ",") {
      out.push({ roman: ",", consume: 1 });
      return out;
    }
    if (head === "？" || head === "?") {
      out.push({ roman: "?", consume: 1 });
      return out;
    }
    if (head === "！" || head === "!") {
      out.push({ roman: "!", consume: 1 });
      return out;
    }

    if (head === "っ") {
      const rest = kana.slice(1);
      const nxt = nextMora(rest);
      if (nxt && nxt.text !== "っ") {
        for (const r of romajis(nxt.text)) {
          const cons = leadingConsonant(r);
          if (cons) out.push({ roman: cons + r, consume: 1 + nxt.consume });
        }
      }
      for (const s of ["xtu", "ltu", "xtsu", "ltsu"]) {
        out.push({ roman: s, consume: 1 });
      }
      return out;
    }

    if (head === "ん") {
      const rest = kana.slice(1);
      const nxt = nextMora(rest);
      let forms;
      if (!nxt) {
        forms = ["n", "nn", "n'", "xn"];
      } else {
        const first = (romajis(nxt.text)[0] || "x")[0];
        if ("aiueoy".includes(first) || nxt.text === "ん") forms = ["nn", "n'", "xn"];
        else if (first === "n") forms = ["n", "n'", "xn"];
        else if ("bmp".includes(first)) forms = ["n", "m", "nn", "n'"];
        else forms = ["n", "nn", "n'"];
      }
      for (const f of forms) out.push({ roman: f, consume: 1 });
      return out;
    }

    const mora = nextMora(kana);
    if (mora) {
      for (const r of romajis(mora.text)) out.push({ roman: r, consume: mora.consume });
    }
    return out;
  }

  function preferredRemaining(kana) {
    let rest = kana;
    let s = "";
    while (rest) {
      if (rest[0] === " " || rest[0] === "　") {
        s += " ";
        rest = rest.slice(1);
        continue;
      }
      if (rest[0] === "。" || rest[0] === "．" || rest[0] === ".") {
        s += ".";
        rest = rest.slice(1);
        continue;
      }
      if (rest[0] === "、" || rest[0] === "，" || rest[0] === ",") {
        s += ",";
        rest = rest.slice(1);
        continue;
      }
      if (rest[0] === "？" || rest[0] === "?") {
        s += "?";
        rest = rest.slice(1);
        continue;
      }
      if (rest[0] === "！" || rest[0] === "!") {
        s += "!";
        rest = rest.slice(1);
        continue;
      }
      if (rest[0] === "っ") {
        const nxt = nextMora(rest.slice(1));
        if (nxt) {
          const pref = preferredOf(nxt.text);
          const cons = leadingConsonant(pref);
          s += cons || "xtu";
          rest = rest.slice(1);
          continue;
        }
      }
      if (rest[0] === "ん") {
        const nxt = nextMora(rest.slice(1));
        const first = nxt ? (romajis(nxt.text)[0] || "x")[0] : "";
        s += !nxt ? "n" : ("aiueoy".includes(first) || nxt.text === "ん" ? "nn" : "n");
        rest = rest.slice(1);
        continue;
      }
      const mora = nextMora(rest);
      s += preferredOf(mora.text);
      rest = rest.slice(mora.consume);
    }
    return s;
  }

  class RomajiEngine {
    constructor(kana, opts) {
      this.source = String(kana);
      this.keepPunct = !!(opts && opts.punct);
      this.kana = cleanTypingKana(kana, this.keepPunct);
      this.pos = 0;
      this.buf = "";
      this.typedRoman = "";
    }

    remaining() {
      return this.kana.slice(this.pos);
    }

    options() {
      return firstMoraOptions(this.remaining());
    }

    nextKeys() {
      const set = new Set();
      const buf = this.buf;
      const opts = this.options();
      for (const opt of opts) {
        if (opt.roman.startsWith(buf) && opt.roman.length > buf.length) {
          set.add(opt.roman[buf.length]);
        }
      }
      if (set.size === 0) {
        const exact = opts.find((o) => o.roman === buf);
        if (exact) {
          const after = firstMoraOptions(this.kana.slice(this.pos + exact.consume));
          for (const o of after) if (o.roman) set.add(o.roman[0]);
        }
      }
      return [...set];
    }

    hint() {
      const rem = this.remaining();
      const full = preferredRemaining(rem);
      if (!this.buf) return full;
      const opts = this.options().filter((o) => o.roman.startsWith(this.buf));
      if (!opts.length) return full;
      const mora = nextMora(rem);
      const pref = mora ? preferredOf(mora.text) : "";
      const preferredHit = pref && pref.startsWith(this.buf) ? opts.find((o) => o.roman === pref) : null;
      const best = preferredHit || opts.slice().sort((a, b) => a.roman.length - b.roman.length)[0];
      const tail = preferredRemaining(this.kana.slice(this.pos + best.consume));
      return best.roman.slice(this.buf.length) + tail;
    }

    typedDisplay() {
      return this.typedRoman + this.buf;
    }

    feed(ch) {
      if (!ch) return { ok: false };
      ch = String(ch).toLowerCase();
      const tryBuf = this.buf + ch;
      const opts = this.options();
      const prefixHits = opts.filter((o) => o.roman.startsWith(tryBuf));

      if (prefixHits.length) {
        this.buf = tryBuf;
        const exacts = prefixHits.filter((o) => o.roman === tryBuf);
        const longer = prefixHits.some((o) => o.roman.length > tryBuf.length);
        const finishes = exacts.find((o) => this.pos + o.consume >= this.kana.length);
        if (exacts.length && (!longer || finishes)) {
          const hit = finishes || exacts[0];
          this.pos += hit.consume;
          this.typedRoman += this.buf;
          this.buf = "";
          return {
            ok: true,
            moraComplete: true,
            done: this.pos >= this.kana.length,
          };
        }
        return { ok: true, moraComplete: false, done: false };
      }

      const exactNow = opts.find((o) => o.roman === this.buf);
      if (exactNow) {
        this.pos += exactNow.consume;
        this.typedRoman += this.buf;
        this.buf = "";
        const inner = this.feed(ch);
        if (inner.ok) return { ok: true, moraComplete: true, done: inner.done };
        this.pos -= exactNow.consume;
        this.typedRoman = this.typedRoman.slice(0, this.typedRoman.length - exactNow.roman.length);
        this.buf = exactNow.roman;
        return { ok: false };
      }

      return { ok: false };
    }

    get done() {
      return this.pos >= this.kana.length && this.buf === "";
    }
  }

  class AlphaEngine {
    constructor(text) {
      this.text = String(text).toLowerCase();
      this.i = 0;
    }
    remaining() {
      return this.text.slice(this.i);
    }
    nextKeys() {
      return this.i < this.text.length ? [this.text[this.i]] : [];
    }
    hint() {
      return this.remaining();
    }
    typedDisplay() {
      return this.text.slice(0, this.i);
    }
    feed(ch) {
      ch = String(ch).toLowerCase();
      if (ch === this.text[this.i]) {
        this.i++;
        return { ok: true, moraComplete: true, done: this.i >= this.text.length };
      }
      return { ok: false };
    }
    get done() {
      return this.i >= this.text.length;
    }
  }

  function tokenizeMoras(kana) {
    const out = [];
    let rest = toHiragana(kana);
    while (rest) {
      const m = nextMora(rest);
      out.push(m.text);
      rest = rest.slice(m.consume);
    }
    return out;
  }

  global.Romaji = {
    RomajiEngine,
    AlphaEngine,
    preferredRemaining,
    preferredOf,
    romajis,
    nextMora,
    tokenizeMoras,
    toHiragana,
    cleanTypingKana,
    MORA_ROMAJI,
  };
})(window);
