/* チュートリアル・ステージ・ことば帳 */
(function (global) {
  const WORDS = {
    a: ["あめ", "あお", "あさ", "あり"],
    i: ["いぬ", "いえ", "いし", "いけ"],
    u: ["うみ", "うた", "うし", "うで"],
    e: ["えき", "えだ", "えほん", "えがお"],
    o: ["おか", "おと", "おに", "おもちゃ"],
    ka: ["かさ", "かお", "かみ", "かに"],
    ki: ["きく", "きた", "きつね", "きもち"],
    ku: ["くるま", "くも", "くつ", "くま"],
    ke: ["けむし", "けしゴム", "けむり"],
    ko: ["こおり", "こえ", "こども", "こころ"],
    sa: ["さくら", "さかな", "さる", "さけ"],
    si: ["しお", "しか", "しま", "しるし"],
    su: ["すし", "すいか", "すな", "すず"],
    se: ["せんせい", "せかい", "せみ"],
    so: ["そら", "そらまめ", "そと"],
    ta: ["たこ", "たけ", "たまご", "たから"],
    ti: ["ちず", "ちから", "ちいさい"],
    tu: ["つき", "つめ", "つり"],
    te: ["てがみ", "てんき", "てつだう"],
    to: ["とけい", "とり", "ともだち"],
    na: ["なつ", "なまえ", "なかま", "なみ"],
    ni: ["にく", "にじ", "にわ", "にほん"],
    nu: ["ぬいぐるみ", "ぬの", "ぬま"],
    ne: ["ねこ", "ねつ", "ねがい"],
    no: ["のり", "のはら", "のうりん"],
    ha: ["はな", "はる", "はこ", "はし"],
    hi: ["ひこうき", "ひかり", "ひる"],
    hu: ["ふね", "ふゆ", "ふくろ"],
    he: ["へび", "へや", "へいわ"],
    ho: ["ほし", "ほん", "ほうせき"],
    ma: ["まど", "まち", "まほう", "まる"],
    mi: ["みず", "みみ", "みち", "みらい"],
    mu: ["むし", "むらさき", "むかし"],
    me: ["めだか", "めがね", "めざまし"],
    mo: ["もも", "もり", "ものがたり"],
    ya: ["やま", "やさい", "やくそく"],
    yu: ["ゆき", "ゆめ", "ゆうびん"],
    yo: ["よる", "よぞら", "よてい"],
    ra: ["らいおん", "らっぱ", "らいねん"],
    ri: ["りんご", "りす", "りぼん"],
    ru: ["るす", "るり"],
    re: ["れいぞうこ", "れんしゅう", "れっしゃ"],
    ro: ["ろうそく", "ロボット", "ろくおん"],
    wa: ["わに", "わた", "わくわく"],
    wo: ["を"],
    nn: ["えんぴつ", "りんご", "みんな", "せんせい"],
    daku: ["がっこう", "ぶどう", "かぞく", "でんしゃ", "かばん"],
    handaku: ["ぽすと", "ぴあの", "いっぱい", "きっぷ"],
    youon: ["きょう", "しゃしん", "ちゃわん", "にゃんこ", "りょうり"],
    sokuon: ["がっこう", "きって", "ざっし", "にっき"],
    easy: ["ねこ", "いぬ", "やま", "うみ", "そら", "はな", "つき", "ほし", "あめ", "かさ"],
    mid: ["おはよう", "ありがとう", "ともだち", "たんじょうび", "あそぼう", "まほう"],
    sent: ["こんにちは", "おはよう", "さようなら", "ありがとう", "がんばろう", "たのしいね"],
  };

  const TUTORIAL = [
    {
      id: "hello",
      title: "はじめまして",
      papil: "idle",
      kind: "talk",
      say: "こんにちは！　わたしは　まほうつかいの　キツネ、パピルだよ。\nこのしまでは、キーボードが　まほうのカギなんだ。",
      nextSay: "いっしょに　ゆびのつかいかたを　おぼえて、ローマ字のまほうを　つかえるようになろう！",
    },
    {
      id: "ime",
      title: "えいすうに　しよう",
      papil: "teach",
      kind: "talk",
      say: "まず　だいじなこと！　にほんごにゅうりょく（かな）だと　うまくうてないよ。\nキーボードの　「英数」　または　「半角/全角」　をおして、えいすうモードにしてね。",
      nextSay: "したの　キーが　A B C の　えいもじで　うてれば　OK！　どれか　1もじ　うってみて。",
      waitAlpha: true,
    },
    {
      id: "posture",
      title: "すわりかた",
      papil: "teach",
      kind: "posture",
      say: "はやくうつのに　いちばんたいせつなのは、じつは　すわりかた！\n4つのポイントを　みてみよう。",
      points: [
        { id: "back", t: "せすじ", d: "せなかを　しゃんと　のばす。いすのおくに　すわる。" },
        { id: "elbow", t: "ひじ", d: "ひじは　Lじに。かたは　ちからを　ぬく。" },
        { id: "feet", t: "あし", d: "両方の　あしのうらを　ゆかに　つける。" },
        { id: "eyes", t: "めせん", d: "がめんは　ちょっと　したむき。あごを　ひく。" },
      ],
    },
    {
      id: "home-intro",
      title: "ホームポジション",
      papil: "think",
      kind: "home",
      say: "ゆびの　いえが　ホームポジションだよ。\nひだりてを　ＡＳＤＦ、みぎてを　ＪＫＬ；　のうえに　おこう。",
      nextSay: "Ｆ と Ｊ には　ちいさな　でっぱり（ぼこぼこ）が　あるよ。ひとさしゆびで　さがしてみて！",
    },
    {
      id: "colors",
      title: "ゆびのいろ",
      papil: "teach",
      kind: "colors",
      say: "キーと　ゆびは　おなじいろ！　じぶんのゆびを　みて、おなじいろのキーを　おそう。",
      nextSay: "こゆびは　ピンク、くすりゆびは　みどり、なかゆびは　あお、ひとさしゆびは　オレンジとキイロ、おやゆびは　むらさき。",
    },
    {
      id: "f-key",
      title: "ひだり ひとさしゆび",
      papil: "think",
      kind: "drill",
      say: "まずは　ひだりの　ひとさしゆび。オレンジ色の　Ｆ をおしてね。\nほかのゆびは　ホームから　はなさないのが　コツ！",
      mode: "alpha",
      sequence: "fffff",
      demo: "f",
    },
    {
      id: "j-key",
      title: "みぎ ひとさしゆび",
      papil: "think",
      kind: "drill",
      say: "つぎは　みぎの　ひとさしゆび。キイロの　Ｊ だよ。\nＦ と Ｊ の　でっぱりを　よりどころにしよう。",
      mode: "alpha",
      sequence: "jjjjj",
      demo: "j",
    },
    {
      id: "dk",
      title: "なかゆび",
      papil: "think",
      kind: "drill",
      say: "あおいろは　なかゆび。ひだりが Ｄ、みぎが Ｋ。\nアニメのゆびを　よくみて、おなじゆびで　おそう！",
      mode: "alpha",
      sequence: "ddkkd",
    },
    {
      id: "sl",
      title: "くすりゆび",
      papil: "think",
      kind: "drill",
      say: "みどりは　くすりゆび。ひだりが Ｓ、みぎが Ｌ。\nよわいゆびだから、ゆっくりで　だいじょうぶ。",
      mode: "alpha",
      sequence: "sslls",
    },
    {
      id: "a-sc",
      title: "こゆび",
      papil: "think",
      kind: "drill",
      say: "ピンクは　こゆび。ひだりが Ａ、みぎが ； （セミコロン）。\nこゆびは　むずかしいけど、いちばんの　ヒーローだよ。",
      mode: "alpha",
      sequence: "aa;;;",
    },
    {
      id: "home-mix",
      title: "ホーム　ぜんぶ",
      papil: "idle",
      kind: "drill",
      say: "ホームのキーを　まぜて　うってみよう。\nひかっているキーと、おなじいろのゆびを　つかってね。",
      mode: "alpha",
      sequence: "asdfjkl;fjdksla;",
    },
    {
      id: "space",
      title: "スペースキー",
      papil: "teach",
      kind: "drill",
      say: "すきま（空白）は　おやゆび！　むらさきの　ながーいキーだよ。\nきりのよい　ほうの　おやゆびで　おそう。",
      mode: "alpha",
      sequence: "f j f j ",
    },
    {
      id: "reach-up",
      title: "うえのれつ",
      papil: "teach",
      kind: "talk",
      say: "ホームの　ひとつうえのキーも、おなじゆびの　たんとうだよ。\nたとえば　Ｆ のひとさしゆびは、Ｒ と Ｔ と Ｇ も　たんとう！",
      nextSay: "ゆびは　のばして　おしたら、すぐ　ホームに　かえそう。これが　はやくなるひけつ。",
    },
    {
      id: "reach-drill",
      title: "のばして　かえす",
      papil: "think",
      kind: "drill",
      say: "ホームから　うえへ　いって、すぐ　もどるれんしゅう。\nゆびのアニメを　よくみてね。",
      mode: "alpha",
      sequence: "frf juj dkd kik",
    },
    {
      id: "romaji-what",
      title: "ローマ字って　なに？",
      papil: "teach",
      kind: "romaji-intro",
      say: "にほんごを　パソコンでうつときは、ローマ字で　ひらがなを　つくるよ。\nあ　は　A、　か　は　K と A。",
      examples: [
        { kana: "あ", roma: "a", note: "ぼいん　1もじ" },
        { kana: "か", roma: "ka", note: "しいん + ぼいん" },
        { kana: "し", roma: "si / shi", note: "どっちでもOK" },
        { kana: "ねこ", roma: "neko", note: "ね + こ" },
      ],
    },
    {
      id: "aiueo",
      title: "あいうえお",
      papil: "think",
      kind: "drill",
      say: "ひらがなが　でてきたら、したのローマ字を　うとう。\nあ＝a　い＝i　う＝u　え＝e　お＝o",
      mode: "romaji",
      sequence: ["あ", "い", "う", "え", "お", "あ", "お", "う"],
    },
    {
      id: "ka-line",
      title: "かきくけこ",
      papil: "think",
      kind: "drill",
      say: "しいんの　K に　ぼいんを　くみあわせるよ。\nか＝ka　き＝ki　く＝ku　け＝ke　こ＝ko",
      mode: "romaji",
      sequence: ["か", "き", "く", "け", "こ", "かき", "くけこ"],
    },
    {
      id: "first-word",
      title: "はじめての　ことば",
      papil: "idle",
      kind: "drill",
      say: "ことばに　ちょうせん！　ねこ は n e k o。\n1もじずつ、ひかるキーを　おしてね。",
      mode: "romaji",
      sequence: ["ねこ", "いぬ", "そら"],
    },
    {
      id: "grad",
      title: "チュートリアル　クリア！",
      papil: "cheer",
      kind: "talk",
      say: "やったね！　ゆびのいえと、ローマ字のたねを　手にいれたよ。\nこれから　ぼうけんマップで、しまじゅうのステージに　ちょうせんしよう！",
      nextSay: "いつでも　「ゆびずかん」で　ゆびのつかいかたを　みかえせるよ。わからなくなったら　おいで。",
    },
  ];

  const STAGES = [
    { id: "w1s1", world: 1, name: "FとJの丘", blurb: "ひとさしゆびだけ", kind: "alpha", chars: "fj", len: 24, unlock: 0, icon: "👆" },
    { id: "w1s2", world: 1, name: "ホームむら", blurb: "ＡＳＤＦ　ＪＫＬ；", kind: "alpha", chars: "asdfjkl;", len: 28, unlock: 1, icon: "🏠" },
    { id: "w1s3", world: 1, name: "GとHのはし", blurb: "ひとさしを　すこし中へ", kind: "alpha", chars: "asdfghjkl;", len: 28, unlock: 2, icon: "🌉" },
    { id: "w2s1", world: 2, name: "うえの丘　ひだり", blurb: "Q W E R T", kind: "alpha", chars: "qwertasdfg", len: 28, unlock: 3, icon: "⛰" },
    { id: "w2s2", world: 2, name: "うえの丘　みぎ", blurb: "Y U I O P", kind: "alpha", chars: "yuiophjkl;", len: 28, unlock: 4, icon: "🌄" },
    { id: "w3s1", world: 3, name: "したの浜", blurb: "Z X C V B N M", kind: "alpha", chars: "zxcvbnm,.", len: 26, unlock: 5, icon: "🏖" },
    { id: "w3s2", world: 3, name: "ぜんぶのキー", blurb: "アルファベット全部", kind: "alpha", chars: "abcdefghijklmnopqrstuvwxyz", len: 32, unlock: 6, icon: "🎹" },
    { id: "w4s1", world: 4, name: "あいうえおの森", blurb: "ぼいん　a i u e o", kind: "romaji", pool: ["あ", "い", "う", "え", "お"], len: 16, unlock: 7, icon: "🌲" },
    { id: "w4s2", world: 4, name: "か行どうくつ", blurb: "ka ki ku ke ko", kind: "romaji", pool: ["か", "き", "く", "け", "こ", "かき", "くも"], len: 12, unlock: 8, icon: "🕳" },
    { id: "w4s3", world: 4, name: "さ行の川", blurb: "sa si/shi su se so", kind: "romaji", pool: ["さ", "し", "す", "せ", "そ", "すし", "そら"], len: 12, unlock: 9, icon: "🌊" },
    { id: "w4s4", world: 4, name: "た行のとう", blurb: "ta ti/chi tu/tsu te to", kind: "romaji", pool: ["た", "ち", "つ", "て", "と", "つき", "たこ"], len: 12, unlock: 10, icon: "🗼" },
    { id: "w5s1", world: 5, name: "な行のはたけ", blurb: "na ni nu ne no", kind: "romaji", pool: ["な", "に", "ぬ", "ね", "の", "ねこ", "なつ"], len: 12, unlock: 11, icon: "🌾" },
    { id: "w5s2", world: 5, name: "は行のそら", blurb: "ha hi hu/fu he ho", kind: "romaji", pool: ["は", "ひ", "ふ", "へ", "ほ", "はな", "ほし"], len: 12, unlock: 12, icon: "☁️" },
    { id: "w5s3", world: 5, name: "ま行のまち", blurb: "ma mi mu me mo", kind: "romaji", pool: ["ま", "み", "む", "め", "も", "まど", "もも"], len: 12, unlock: 13, icon: "🏘" },
    { id: "w6s1", world: 6, name: "や行のはし", blurb: "ya yu yo", kind: "romaji", pool: ["や", "ゆ", "よ", "やま", "ゆき", "よる"], len: 10, unlock: 14, icon: "🌙" },
    { id: "w6s2", world: 6, name: "ら行のにじ", blurb: "ra ri ru re ro", kind: "romaji", pool: ["ら", "り", "る", "れ", "ろ", "りんご", "らいおん"], len: 10, unlock: 15, icon: "🌈" },
    { id: "w6s3", world: 6, name: "わをんのみさき", blurb: "wa wo n / nn", kind: "romaji", pool: ["わ", "を", "ん", "わに", "えんぴつ"], len: 10, unlock: 16, icon: "🏝" },
    { id: "w7s1", world: 7, name: "だくおんかざん", blurb: "がざだばぱ行", kind: "romaji", pool: WORDS.daku.concat(WORDS.handaku), len: 10, unlock: 17, icon: "🌋" },
    { id: "w7s2", world: 7, name: "ようおんのほし", blurb: "きゃ　しゃ　ちょ", kind: "romaji", pool: WORDS.youon.concat(WORDS.sokuon), len: 10, unlock: 18, icon: "⭐" },
    { id: "w8s1", world: 8, name: "ことばのばらえん", blurb: "みじかいことば", kind: "romaji", pool: WORDS.easy, len: 10, unlock: 19, icon: "🌸" },
    { id: "w8s2", world: 8, name: "ことばのおしろ", blurb: "すこしながいことば", kind: "romaji", pool: WORDS.mid, len: 8, unlock: 20, icon: "🏰" },
    { id: "w8s3", world: 8, name: "まほうのカギ", blurb: "文しょうにちょうせん", kind: "romaji", pool: WORDS.sent, len: 6, unlock: 21, icon: "🔑" },
  ];

  const WORLDS = [
    { id: 1, name: "ホームのくに", color: "#ffb347" },
    { id: 2, name: "うえのれつのくに", color: "#4ec3ff" },
    { id: 3, name: "したのれつのくに", color: "#6dd36d" },
    { id: 4, name: "あかさたの森", color: "#ff6b9d" },
    { id: 5, name: "なはまの丘", color: "#c084fc" },
    { id: 6, name: "やるわの岬", color: "#ffd93d" },
    { id: 7, name: "応用の火山", color: "#ff8a5b" },
    { id: 8, name: "ことばのおしろ", color: "#7cf0ff" },
  ];

  const FREE_DRILLS = [
    { id: "home", name: "ホームだけ", kind: "alpha", chars: "asdfjkl;", len: 40 },
    { id: "left", name: "ひだりて", kind: "alpha", chars: "qwertasdfgzxcvb", len: 36 },
    { id: "right", name: "みぎて", kind: "alpha", chars: "yuiophjkl;nm,./", len: 36 },
    { id: "aiueo", name: "あいうえお", kind: "romaji", pool: ["あ", "い", "う", "え", "お"], len: 20 },
    { id: "gojuon", name: "五十音", kind: "romaji", pool: "あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん".split(""), len: 30 },
    { id: "words", name: "ことば", kind: "romaji", pool: WORDS.easy.concat(WORDS.mid), len: 16 },
  ];

  const COMBO_WORDS = [
    { n: 3, t: "いいね！" },
    { n: 5, t: "すばらしい！" },
    { n: 8, t: "れんぞく！" },
    { n: 12, t: "すごい！！" },
    { n: 18, t: "まほうだ！！" },
  ];

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = (Math.random() * (i + 1)) | 0;
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function buildAlpha(chars, len) {
    const bag = chars.split("");
    let s = "";
    let last = "";
    for (let i = 0; i < len; i++) {
      let ch = bag[(Math.random() * bag.length) | 0];
      if (ch === last && bag.length > 1) ch = bag[(Math.random() * bag.length) | 0];
      s += ch;
      last = ch;
    }
    return s;
  }

  function buildPool(pool, len) {
    const out = [];
    const src = pool.slice();
    while (out.length < len) {
      out.push(...shuffle(src));
    }
    return out.slice(0, len);
  }

  global.DATA = { WORDS, TUTORIAL, STAGES, WORLDS, FREE_DRILLS, COMBO_WORDS, shuffle, buildAlpha, buildPool };
})(window);
