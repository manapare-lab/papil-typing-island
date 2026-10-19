/* パピルタクシー：もんだい作り。教科ごとに「問い」「正解」「まちがい候補」を返す */
(function (global) {
  const rnd = (n) => Math.floor(Math.random() * n);
  const pick = (arr) => arr[rnd(arr.length)];

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = rnd(i + 1);
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  const KANJI = [
    ["山", "やま"], ["川", "かわ"], ["花", "はな"], ["空", "そら"], ["海", "うみ"],
    ["水", "みず"], ["火", "ひ"], ["木", "き"], ["月", "つき"], ["星", "ほし"],
    ["犬", "いぬ"], ["雨", "あめ"], ["雪", "ゆき"], ["森", "もり"], ["本", "ほん"],
    ["学校", "がっこう"], ["先生", "せんせい"], ["友だち", "ともだち"], ["電車", "でんしゃ"],
    ["図書館", "としょかん"], ["天気", "てんき"], ["朝", "あさ"], ["夜", "よる"],
    ["魚", "さかな"], ["音楽", "おんがく"],
  ];

  const ENGLISH = [
    ["dog", "いぬ"], ["cat", "ねこ"], ["apple", "りんご"], ["book", "ほん"], ["sun", "たいよう"],
    ["moon", "つき"], ["water", "みず"], ["fish", "さかな"], ["bird", "とり"], ["tree", "き"],
    ["school", "がっこう"], ["car", "くるま"], ["milk", "ぎゅうにゅう"], ["flower", "はな"],
    ["rain", "あめ"], ["red", "あか"], ["blue", "あお"], ["green", "みどり"], ["house", "いえ"],
    ["friend", "ともだち"],
  ];

  function numberChoices(answer, spread) {
    const set = new Set([answer]);
    let guard = 0;
    while (set.size < 3 && guard++ < 50) {
      const v = answer + (rnd(2) ? 1 : -1) * (1 + rnd(spread));
      if (v >= 0) set.add(v);
    }
    return [...set];
  }

  function wordChoices(answer, pool) {
    const wrong = shuffle(pool.filter((x) => x !== answer)).slice(0, 2);
    return [answer, ...wrong];
  }

  const SUBJECTS = {
    add: {
      name: "たしざん・ひきざん", icon: "➕",
      make(level) {
        const max = 5 + level * 5;
        let a = 1 + rnd(max), b = 1 + rnd(max), op = rnd(2) ? "+" : "-";
        if (op === "-" && b > a) [a, b] = [b, a];
        const answer = op === "+" ? a + b : a - b;
        return { prompt: `${a} ${op === "+" ? "＋" : "−"} ${b} ＝ ?`, answer: String(answer),
          choices: numberChoices(answer, 4).map(String) };
      },
    },
    mul: {
      name: "かけざん", icon: "✖️",
      make(level) {
        const a = 2 + rnd(Math.min(8, 2 + level)), b = 1 + rnd(9);
        const answer = a * b;
        return { prompt: `${a} × ${b} ＝ ?`, answer: String(answer),
          choices: numberChoices(answer, 6).map(String) };
      },
    },
    kanji: {
      name: "かんじのよみ", icon: "📖",
      make() {
        const [k, yomi] = pick(KANJI);
        return { prompt: `「${k}」のよみかたは？`, answer: yomi,
          choices: wordChoices(yomi, KANJI.map((x) => x[1])) };
      },
    },
    english: {
      name: "えいたんご", icon: "🔤",
      make() {
        const [en, ja] = pick(ENGLISH);
        return { prompt: `"${en}" ってどういういみ？`, answer: ja,
          choices: wordChoices(ja, ENGLISH.map((x) => x[1])) };
      },
    },
  };

  /* 3つの行き先をシャッフルして返す。levelは正解回数ベースで上がる */
  function makeQuestion(subject, level) {
    const q = SUBJECTS[subject].make(level || 0);
    q.choices = shuffle(q.choices);
    return q;
  }

  global.TaxiQuestions = { SUBJECTS, makeQuestion, shuffle };
})(typeof window !== "undefined" ? window : globalThis);
