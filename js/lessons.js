/* 小学校・中学校の日本語／英単語・文章・長い文 */
(function (global) {
  const LEVELS = [
    { id: "e1", name: "小学1・2年", short: "小1-2", school: "小学校" },
    { id: "e2", name: "小学3・4年", short: "小3-4", school: "小学校" },
    { id: "e3", name: "小学5・6年", short: "小5-6", school: "小学校" },
    { id: "j1", name: "中学1年", short: "中1", school: "中学校" },
    { id: "j2", name: "中学2年", short: "中2", school: "中学校" },
    { id: "j3", name: "中学3年", short: "中3", school: "中学校" },
  ];

  const FORMS = [
    { id: "word", name: "単語", blurb: "みじかいことば", icon: "✏️", len: 12 },
    { id: "sentence", name: "文章", blurb: "ひとつの文", icon: "📝", len: 6 },
    { id: "long", name: "ながい文", blurb: "すこしながいぶんしょう", icon: "📖", len: 3 },
  ];

  const LANGS = [
    { id: "ja", name: "にほんご", blurb: "ローマ字でひらがなをうつ", icon: "🇯🇵" },
    { id: "en", name: "えいご", blurb: "小学校・中学校の英単語", icon: "🔤" },
  ];

  function W(t, d, m) { return { t: t, d: d || t, m: m || "" }; }

  const JA = {
    e1: {
      word: [
        W("あさ", "朝", "一日のはじまり"), W("ひる", "昼", "おひる"), W("よる", "夜", "ねるじかん"),
        W("がっこう", "学校", "まなぶところ"), W("せんせい", "先生", "おしえてくれるひと"),
        W("ともだち", "友だち", "なかのよいひと"), W("かぞく", "家族", "いっしょにくらすひと"),
        W("おかあさん", "お母さん", "かぞくのおかあさん"), W("おとうさん", "お父さん", "かぞくのおとうさん"),
        W("いぬ", "犬", "わんわん"), W("ねこ", "猫", "にゃんこ"), W("とり", "鳥", "そらをとぶ"),
        W("さかな", "魚", "みずのなか"), W("はな", "花", "きれいなさくもの"), W("き", "木", "もりにある"),
        W("やま", "山", "たかいところ"), W("かわ", "川", "みずがながれる"), W("うみ", "海", "ひろいみず"),
        W("そら", "空", "うえにある"), W("あめ", "雨", "そらからふる"), W("ゆき", "雪", "しろくてつめたい"),
        W("ほん", "本", "よむもの"), W("えんぴつ", "鉛筆", "かくどうぐ"), W("つくえ", "机", "べんきょうするところ"),
        W("いす", "いす", "すわるもの"), W("みず", "水", "のめる"), W("ごはん", "ごはん", "たべもの"),
        W("たまご", "卵", "とりのたまご"), W("あか", "赤", "りんごのいろ"), W("あお", "青", "そらのいろ"),
        W("きいろ", "黄色", "レモンのいろ"), W("しろ", "白", "ゆきのいろ"), W("くろ", "黒", "よるのいろ"),
        W("おおきい", "大きい", "サイズが大きい"), W("ちいさい", "小さい", "サイズが小さい"),
        W("おはよう", "おはよう", "朝のあいさつ"), W("ありがとう", "ありがとう", "お礼"),
        W("さようなら", "さようなら", "わかれのあいさつ"),
      ],
      sentence: [
        W("きょうは はれです", "きょうは はれです。", "天気がいいよ。"),
        W("わたしは がくせいです", "わたしは 学生です。", "学校でまなぶひと。"),
        W("いぬが すきです", "犬が すきです。", "ペットのいぬがだいすき。"),
        W("がっこうへ いきます", "学校へ いきます。", "まなびのばしょへ。"),
        W("あさごはんを たべます", "朝ごはんを たべます。", "朝の食事。"),
        W("ともだちと あそびます", "友だちと あそびます。", "なかよしといっしょ。"),
        W("はなを みます", "花を みます。", "きれいなお花。"),
        W("みずを のみます", "水を のみます。", "のどがかわいたら。"),
        W("ほんを よみます", "本を よみます。", "読書。"),
        W("おおきい やまです", "大きい 山です。", "たかい山。"),
        W("あめが ふります", "雨が ふります。", "かさをさそう。"),
        W("ありがとう ございます", "ありがとうございます。", "ていねいなお礼。"),
      ],
      long: [
        W("きょうは はれです こうえんへ いきます ともだちと あそびます",
          "きょうは晴れです。公園へ行きます。友だちと遊びます。",
          "天気がいいので、外であそぶよ。"),
        W("あさ おきて、かおを あらいます。ごはんを たべて がっこうへ いきます",
          "朝おきて、顔を洗います。ごはんを食べて、学校へ行きます。",
          "いちにちの はじまり。"),
        W("わたしの かぞくは よにんです おとうさんと おかあさんと いもうとが います",
          "わたしの家族は4人です。お父さんとお母さんと妹がいます。",
          "かぞくのしょうかい。"),
        W("いぬが すきです まいにち さんぽを します なまえは ぽちです",
          "犬がすきです。毎日さんぽをします。名前はポチです。",
          "ペットのしょうかい。"),
        W("きょうは たんじょうびです ケーキを たべます ともだちが きて くれます",
          "きょうは誕生日です。ケーキを食べます。友だちが来てくれます。",
          "おめでとう！"),
        W("よるに ほんを よみます おつきさまが きれいです おやすみなさい",
          "夜に本を読みます。お月さまがきれいです。おやすみなさい。",
          "ねるまえのいちまい。"),
      ],
    },
    e2: {
      word: [
        W("しゅくだい", "宿題", "homework"), W("たいいく", "体育", "PE"),
        W("りか", "理科", "science"), W("しゃかい", "社会", "social studies"),
        W("こくご", "国語", "Japanese class"), W("さんすう", "算数", "math"),
        W("おんがく", "音楽", "music"), W("ずこう", "図工", "art"),
        W("けんこう", "健康", "health"), W("しぜん", "自然", "nature"),
        W("どうぶつ", "動物", "animal"), W("しょくぶつ", "植物", "plant"),
        W("じてんしゃ", "自転車", "bicycle"), W("でんしゃ", "電車", "train"),
        W("びょういん", "病院", "hospital"), W("としょかん", "図書館", "library"),
        W("しょうぼうしゃ", "消防車", "fire engine"), W("こうさてん", "交差点", "crossing"),
        W("あんぜん", "安全", "safety"), W("きせつ", "季節", "season"),
        W("はる", "春", "spring"), W("なつ", "夏", "summer"),
        W("あき", "秋", "autumn"), W("ふゆ", "冬", "winter"),
        W("たいふう", "台風", "typhoon"), W("じしん", "地震", "earthquake"),
        W("リサイクル", "リサイクル", "recycle"), W("ごみ", "ごみ", "trash"),
        W("やくそく", "約束", "promise"), W("じかん", "時間", "time"),
        W("しゅみ", "趣味", "hobby"), W("うんどう", "運動", "exercise"),
      ],
      sentence: [
        W("しゅくだいを します", "宿題をします。", "家でやるべんきょう。"),
        W("としょかんで ほんを かります", "図書館で本を借ります。", "本をかりてよむ。"),
        W("じてんしゃに のります", "自転車に乗ります。", "ペダルをこぐ。"),
        W("なつは うみで およぎます", "夏は海で泳ぎます。", "なつのあそび。"),
        W("あきに もみじが きれいです", "秋に紅葉がきれいです。", "はがまっか。"),
        W("こうさてんは みぎを みます", "交差点は右を見ます。", "あんぜんかくにん。"),
        W("ごみを わけて だします", "ごみを分けて出します。", "リサイクル。"),
        W("まいにち はを みがきます", "毎日歯をみがきます。", "むしばよぼう。"),
        W("たいいくで サッカーを します", "体育でサッカーをします。", "体をうごかす。"),
        W("やくそくを まもります", "約束を守ります。", "いったことをやる。"),
      ],
      long: [
        W("はるに さくらが さきます かぞくで おはなみに いきます おべんとうを たべます",
          "春に桜が咲きます。家族でお花見に行きます。お弁当を食べます。",
          "春のたのしみ。"),
        W("がっこうから かえったら しゅくだいを します それから そとで あそびます",
          "学校から帰ったら宿題をします。それから外で遊びます。",
          "放課後のながれ。"),
        W("じてんしゃに のるときは ヘルメットを かぶります みぎひだりを よく みます",
          "自転車に乗るときはヘルメットをかぶります。右左をよく見ます。",
          "あんぜん第一。"),
        W("なつの あさ、はやく おきて ラジオたいそうを します。からだを うごかします",
          "夏の朝、早くおきてラジオ体操をします。体を動かします。",
          "なつやすみのあさ。"),
        W("としょかんは しずかです すきな ほんを さがします いえで ゆっくり よみます",
          "図書館は静かです。すきな本を探します。家でゆっくり読みます。",
          "読書のじかん。"),
      ],
    },
    e3: {
      word: [
        W("かんきょう", "環境", "environment"), W("せかい", "世界", "world"),
        W("れきし", "歴史", "history"), W("ちり", "地理", "geography"),
        W("じっけん", "実験", "experiment"), W("かんさつ", "観察", "observation"),
        W("ほうこく", "報告", "report"), W("はっぴょう", "発表", "presentation"),
        W("ぎじゅつ", "技術", "technology"), W("じょうほう", "情報", "information"),
        W("インターネット", "インターネット", "internet"), W("プログラミング", "プログラミング", "programming"),
        W("エネルギー", "エネルギー", "energy"), W("でんき", "電気", "electricity"),
        W("ちきゅう", "地球", "Earth"), W("うちゅう", "宇宙", "space"),
        W("せいぎ", "正義", "justice"), W("へいわ", "平和", "peace"),
        W("けんり", "権利", "rights"), W("ぎむ", "義務", "duty"),
        W("せんきょ", "選挙", "election"), W("ぎかい", "議会", "assembly"),
        W("ぼうえき", "貿易", "trade"), W("さんぎょう", "産業", "industry"),
        W("のうぎょう", "農業", "agriculture"), W("すいさん", "水産", "fishery"),
        W("きこう", "気候", "climate"), W("おんど", "温度", "temperature"),
        W("たいせき", "体積", "volume"), W("めんせき", "面積", "area"),
        W("ぶんすう", "分数", "fraction"), W("パーセント", "パーセント", "percent"),
      ],
      sentence: [
        W("ちきゅうの かんきょうを まもります", "地球の環境を守ります。", "We protect the Earth."),
        W("じっけんで おんどを はかります", "実験で温度を測ります。", "We measure temperature."),
        W("はっぴょうの じゅんびを します", "発表の準備をします。", "I prepare a presentation."),
        W("インターネットで しらべます", "インターネットで調べます。", "I look it up online."),
        W("へいわな せかいが たいせつです", "平和な世界が大切です。", "Peace is important."),
        W("みんなに せんきょけんが あります", "みんなに選挙権があります。", "Everyone has the right to vote."),
        W("ぶんすうを けいさんします", "分数を計算します。", "I calculate fractions."),
        W("うちゅうに きょうみが あります", "宇宙に興味があります。", "I am interested in space."),
        W("のうぎょうは しょくりょうを つくります", "農業は食料をつくります。", "Farming makes food."),
        W("じょうほうを ただしく つかいます", "情報を正しく使います。", "Use information wisely."),
      ],
      long: [
        W("わたしたちは ごみを へらします でんきを たいせつに つかいます ちきゅうを まもりたいです",
          "私たちはごみを減らします。電気を大切に使います。地球を守りたいです。",
          "かんきょうのためのやくそく。"),
        W("りかの じっけんで おんどを はかりました けっかを ノートに かいて はっぴょうします",
          "理科の実験で温度を測りました。結果をノートに書いて発表します。",
          "じっけんレポート。"),
        W("にほんの れきしを べんきょうします むかしの ひとびとの くらしを しることが できます",
          "日本の歴史を勉強します。昔の人々の暮らしを知ることができます。",
          "歴史のじゅぎょう。"),
        W("プログラミングで ゲームを つくりました ともだちに あそびかたを せつめいします",
          "プログラミングでゲームをつくりました。友だちに遊び方を説明します。",
          "そうさくのよろこび。"),
        W("せかいには いろいろな くにが あります ことばも ぶんかも ちがいます たがいに そんちょうします",
          "世界にはいろいろな国があります。言葉も文化も違います。互いに尊重します。",
          "せかいのつながり。"),
      ],
    },
    j1: {
      word: [
        W("じこしょうかい", "自己紹介", "self-introduction"), W("しゅっしん", "出身", "hometown"),
        W("ねんれい", "年齢", "age"), W("しんちょう", "身長", "height"),
        W("きょうみ", "興味", "interest"), W("もくひょう", "目標", "goal"),
        W("にちじょう", "日常", "daily life"), W("せいかつ", "生活", "life"),
        W("つうがく", "通学", "commuting to school"), W("ぶかつ", "部活", "club"),
        W("いいんかい", "委員会", "committee"), W("そうじ", "掃除", "cleaning"),
        W("きゅうしょく", "給食", "school lunch"), W("ほうかご", "放課後", "after school"),
        W("しゅくだい", "宿題", "homework"), W("てすと", "テスト", "test"),
        W("かんたん", "簡単", "easy"), W("ふくざつ", "複雑", "complex"),
        W("たいせつ", "大切", "important"), W("ひつよう", "必要", "necessary"),
        W("かいしゃ", "会社", "company"), W("しごと", "仕事", "job"),
        W("ゆめ", "夢", "dream"), W("しょうらい", "将来", "future"),
        W("しぜん", "自然", "nature"), W("まち", "町", "town"),
        W("でんしゃ", "電車", "train"), W("じかんわり", "時間割", "timetable"),
        W("きょうかしょ", "教科書", "textbook"), W("じしょ", "辞書", "dictionary"),
      ],
      sentence: [
        W("はじめまして。どうぞ よろしく おねがいします", "はじめまして。どうぞよろしくお願いします。", "Nice to meet you."),
        W("わたしの しゅみは どくしょです", "私の趣味は読書です。", "My hobby is reading."),
        W("まいにち でんしゃで つうがくします", "毎日電車で通学します。", "I go to school by train."),
        W("ほうかごは ぶかつが あります", "放課後は部活があります。", "I have club after school."),
        W("しゅくだいは たいせつです", "宿題は大切です。", "Homework is important."),
        W("しょうらいの ゆめは いしゃです", "将来の夢は医者です。", "I want to be a doctor."),
        W("じしょで ことばを しらべます", "辞書で言葉を調べます。", "I look up words in a dictionary."),
        W("あした てすとが あります", "あしたテストがあります。", "We have a test tomorrow."),
        W("にほんごで じこしょうかいを します", "日本語で自己紹介をします。", "I introduce myself in Japanese."),
        W("かぞくと しゅうまつに さんぽします", "家族と週末に散歩します。", "I walk with my family."),
      ],
      long: [
        W("わたしは ちゅうがくせいです まいにち しちじに おきて がっこうへ いきます ぶかつは サッカーぶです",
          "私は中学生です。毎日7時に起きて学校へ行きます。部活はサッカー部です。",
          "中1のいちにち。"),
        W("じこしょうかいを します しゅっしんは ふくおかです しゅみは おんがくを きくことです",
          "自己紹介をします。出身は福岡です。趣味は音楽を聞くことです。",
          "はじめてのあいさつ。"),
        W("あしたは こくごの てすとです きょうかしょを よんで じしょで ことばを おぼえます",
          "あしたは国語のテストです。教科書を読んで、辞書で言葉をおぼえます。",
          "テストべんきょう。"),
        W("ほうかご、ともだちと としょかんへ いきます。しゅくだいを おわらせてから かえります",
          "放課後、友だちと図書館へ行きます。宿題を終わらせてから帰ります。",
          "放課後のけいかく。"),
        W("しょうらいの ゆめは まだ はっきり しません いろいろな しごとに きょうみが あります",
          "将来の夢はまだはっきりしません。いろいろな仕事に興味があります。",
          "これからをかんがえる。"),
      ],
    },
    j2: {
      word: [
        W("いけん", "意見", "opinion"), W("りゆう", "理由", "reason"),
        W("けいけん", "経験", "experience"), W("かんそう", "感想", "impression"),
        W("ひかく", "比較", "comparison"), W("そうい", "相違", "difference"),
        W("もんだい", "問題", "problem"), W("かいけつ", "解決", "solution"),
        W("げんいん", "原因", "cause"), W("けっか", "結果", "result"),
        W("えいきょう", "影響", "influence"), W("かんきょう", "環境", "environment"),
        W("しゃかい", "社会", "society"), W("ぶんか", "文化", "culture"),
        W("でんとう", "伝統", "tradition"), W("ぎじゅつ", "技術", "technology"),
        W("かいはつ", "開発", "development"), W("ほご", "保護", "protection"),
        W("きょか", "許可", "permission"), W("きんし", "禁止", "prohibition"),
        W("ひつよう", "必要", "need"), W("ふよう", "不要", "unnecessary"),
        W("かのう", "可能", "possible"), W("ふかのう", "不可能", "impossible"),
        W("さんせい", "賛成", "agree"), W("はんたい", "反対", "disagree"),
        W("とうろん", "討論", "debate"), W("はっぴょう", "発表", "presentation"),
      ],
      sentence: [
        W("わたしの いけんを いいます", "私の意見を言います。", "I will give my opinion."),
        W("りゆうを せつめいしてください", "理由を説明してください。", "Please explain the reason."),
        W("この もんだいを かいけつしたいです", "この問題を解決したいです。", "I want to solve this."),
        W("かんきょうに えいきょうが あります", "環境に影響があります。", "It affects the environment."),
        W("でんとうと ぎじゅつを くらべます", "伝統と技術を比べます。", "We compare tradition and tech."),
        W("けいけんから まなびました", "経験から学びました。", "I learned from experience."),
        W("さんせいですか、はんたいですか", "賛成ですか、反対ですか。", "Do you agree or disagree?"),
        W("ほうこくの けっかを まとめます", "報告の結果をまとめます。", "I summarize the results."),
        W("ぶんかの ちがいは おもしろいです", "文化の違いはおもしろいです。", "Cultural differences are interesting."),
        W("かいけつさくを かんがえます", "解決策を考えます。", "I think of a solution."),
      ],
      long: [
        W("わたしは プラスチックを へらすべきだと おもいます うみの いきものが こまっているからです",
          "私はプラスチックを減らすべきだと思います。海の生き物が困っているからです。",
          "意見と理由。"),
        W("スマホは べんりですが、つかいすぎは よくありません。じかんを きめて つかいます",
          "スマホは便利ですが、使いすぎはよくありません。時間を決めて使います。",
          "つかいかたをかんがえる。"),
        W("グループで とうろんを しました いけんは わかれましたが おたがいに はなしを ききました",
          "グループで討論をしました。意見は分かれましたが、お互いに話を聞きました。",
          "話し合いのたいせつさ。"),
        W("りょこうの けいけんを はっぴょうします。みたもの、たべたもの、かんじたことを はなします",
          "旅行の経験を発表します。見たもの、食べたもの、感じたことを話します。",
          "経験を伝える。"),
        W("もんだいの げんいんを しらべて かいけつさくを かんがえます チームで やくわりを きめます",
          "問題の原因を調べて、解決策を考えます。チームで役割を決めます。",
          "課題にとりくむ。"),
      ],
    },
    j3: {
      word: [
        W("しょうらい", "将来", "future"), W("しんろ", "進路", "career path"),
        W("せんたく", "選択", "choice"), W("せきにん", "責任", "responsibility"),
        W("じりつ", "自立", "independence"), W("きょうりょく", "協力", "cooperation"),
        W("たようせい", "多様性", "diversity"), W("そんちょう", "尊重", "respect"),
        W("こくさい", "国際", "international"), W("ちいき", "地域", "community"),
        W("ボランティあ", "ボランティア", "volunteer"), W("きふ", "寄付", "donation"),
        W("じぞくかのう", "持続可能", "sustainable"), W("はってん", "発展", "development"),
        W("かがく", "科学", "science"), W("いがく", "医学", "medicine"),
        W("けいざい", "経済", "economy"), W("せいじ", "政治", "politics"),
        W("ほうりつ", "法律", "law"), W("けんぽう", "憲法", "constitution"),
        W("じんけん", "人権", "human rights"), W("びょうどう", "平等", "equality"),
        W("かんきょうもんだい", "環境問題", "environmental issue"),
        W("エネルギー", "エネルギー", "energy"), W("さいがい", "災害", "disaster"),
        W("ぼうさい", "防災", "disaster prevention"), W("ふっこう", "復興", "recovery"),
        W("きぼう", "希望", "hope"),
      ],
      sentence: [
        W("しんろに ついて かんがえています", "進路について考えています。", "I am thinking about my path."),
        W("じぶんの せんたくに せきにんを もちます", "自分の選択に責任を持ちます。", "I take responsibility."),
        W("たようせいを そんちょうします", "多様性を尊重します。", "We respect diversity."),
        W("ちいきの ボランティアに さんかします", "地域のボランティアに参加します。", "I join local volunteer work."),
        W("じぞくかのうな しゃかいを めざします", "持続可能な社会をめざします。", "We aim for a sustainable society."),
        W("じんけんは すべての ひとに あります", "人権はすべての人にあります。", "Everyone has human rights."),
        W("さいがいの とき たすけあいます", "災害のとき助けあいます。", "We help each other in disasters."),
        W("かがくは せいかつを かえました", "科学は生活を変えました。", "Science changed our lives."),
        W("きぼうを すてないことが たいせつです", "希望を捨てないことが大切です。", "Never give up hope."),
        W("こくさい りかいを ふかめたいです", "国際理解を深めたいです。", "I want deeper global understanding."),
      ],
      long: [
        W("わたしは しょうらい、いりょうの しごとに つきたいです。ひとの やくに たちたいからです",
          "私は将来、医療の仕事に就きたいです。人の役に立ちたいからです。",
          "進路のおもい。"),
        W("ちいきの ぼうさいくんれんに さんかしました にげみちと しゅうごうばしょを おぼえました",
          "地域の防災訓練に参加しました。逃げ道と集合場所をおぼえました。",
          "いのちをまもる。"),
        W("かんきょうもんだいは ひとりでは かいけつできません せかいの ひとたちと きょうりょくが ひつようです",
          "環境問題はひとりでは解決できません。世界の人たちと協力が必要です。",
          "地球規模の課題。"),
        W("じぶんと ちがう いけんも たいせつです はなしを よく きいて そんちょうすることが はじまりです",
          "自分と違う意見も大切です。話をよく聞いて尊重することが始まりです。",
          "多様性と対話。"),
        W("ちゅうがっこうせいかつで たくさんの けいけんを しました しっぱいも ありますが それが みらいの ちからです",
          "中学校生活でたくさんの経験をしました。失敗もありますが、それが未来の力です。",
          "そつぎょうをまえに。"),
      ],
    },
  };

  const EN = {
    e1: {
      word: [
        W("apple", "apple", "りんご"), W("dog", "dog", "いぬ"), W("cat", "cat", "ねこ"),
        W("fish", "fish", "さかな"), W("bird", "bird", "とり"), W("book", "book", "ほん"),
        W("pencil", "pencil", "えんぴつ"), W("red", "red", "あか"), W("blue", "blue", "あお"),
        W("yellow", "yellow", "きいろ"), W("green", "green", "みどり"), W("one", "one", "1"),
        W("two", "two", "2"), W("three", "three", "3"), W("hello", "hello", "こんにちは"),
        W("goodbye", "goodbye", "さようなら"), W("yes", "yes", "はい"), W("no", "no", "いいえ"),
        W("I", "I", "わたし"), W("you", "you", "あなた"), W("big", "big", "おおきい"),
        W("small", "small", "ちいさい"), W("happy", "happy", "うれしい"), W("sad", "sad", "かなしい"),
        W("school", "school", "がっこう"), W("friend", "friend", "ともだち"),
        W("milk", "milk", "ぎゅうにゅう"), W("egg", "egg", "たまご"),
        W("sun", "sun", "たいよう"), W("moon", "moon", "つき"),
      ],
      sentence: [
        W("i like dogs", "I like dogs.", "いぬがすきです。"),
        W("i like cats", "I like cats.", "ねこがすきです。"),
        W("this is a book", "This is a book.", "これは本です。"),
        W("i am happy", "I am happy.", "うれしいです。"),
        W("you are my friend", "You are my friend.", "あなたは友だちです。"),
        W("it is red", "It is red.", "それは赤いです。"),
        W("i have a pencil", "I have a pencil.", "えんぴつを持っています。"),
        W("hello everyone", "Hello, everyone.", "みんな、こんにちは。"),
        W("thank you", "Thank you.", "ありがとう。"),
        W("see you", "See you.", "またね。"),
      ],
      long: [
        W("i like apples and dogs i am happy",
          "I like apples and dogs. I am happy.",
          "りんごと犬がすき。うれしい。"),
        W("this is my school i have many friends",
          "This is my school. I have many friends.",
          "これがわたしの学校。友だちがたくさん。"),
        W("the sun is big the moon is white",
          "The sun is big. The moon is white.",
          "太陽は大きい。月は白い。"),
        W("hello i am ken i like blue",
          "Hello. I am Ken. I like blue.",
          "こんにちは。ケンです。青がすき。"),
        W("i have a cat the cat is small",
          "I have a cat. The cat is small.",
          "ねこを飼っています。そのねこは小さい。"),
      ],
    },
    e2: {
      word: [
        W("color", "color", "いろ"), W("animal", "animal", "どうぶつ"),
        W("food", "food", "たべもの"), W("sport", "sport", "スポーツ"),
        W("soccer", "soccer", "サッカー"), W("baseball", "baseball", "やきゅう"),
        W("swim", "swim", "およぐ"), W("run", "run", "はしる"),
        W("play", "play", "あそぶ"), W("sing", "sing", "うたう"),
        W("family", "family", "かぞく"), W("mother", "mother", "おかあさん"),
        W("father", "father", "おとうさん"), W("sister", "sister", "しまい"),
        W("brother", "brother", "きょうだい"), W("teacher", "teacher", "せんせい"),
        W("student", "student", "せいと"), W("classroom", "classroom", "きょうしつ"),
        W("library", "library", "としょかん"), W("park", "park", "こうえん"),
        W("morning", "morning", "あさ"), W("night", "night", "よる"),
        W("today", "today", "きょう"), W("tomorrow", "tomorrow", "あした"),
        W("weather", "weather", "てんき"), W("sunny", "sunny", "はれ"),
        W("rainy", "rainy", "あめ"), W("hot", "hot", "あつい"),
        W("cold", "cold", "さむい"), W("good", "good", "よい"),
        W("nice", "nice", "すてき"), W("please", "please", "どうぞ"),
      ],
      sentence: [
        W("i play soccer", "I play soccer.", "サッカーをします。"),
        W("she is my sister", "She is my sister.", "彼女はわたしの妹です。"),
        W("he is a teacher", "He is a teacher.", "彼は先生です。"),
        W("it is sunny today", "It is sunny today.", "きょうは晴れです。"),
        W("i go to the park", "I go to the park.", "公園へ行きます。"),
        W("we swim in summer", "We swim in summer.", "夏に泳ぎます。"),
        W("my favorite food is rice", "My favorite food is rice.", "好きな食べ物はごはんです。"),
        W("what color do you like", "What color do you like?", "何色がすきですか。"),
        W("i can run fast", "I can run fast.", "速く走れます。"),
        W("see you tomorrow", "See you tomorrow.", "またあした。"),
      ],
      long: [
        W("i play soccer after school i am happy",
          "I play soccer after school. I am happy.",
          "放課後サッカーをします。うれしいです。"),
        W("today is sunny we go to the park",
          "Today is sunny. We go to the park.",
          "きょうは晴れ。公園へ行きます。"),
        W("this is my family my father is a teacher",
          "This is my family. My father is a teacher.",
          "これが家族。お父さんは先生です。"),
        W("i like baseball and swimming they are fun",
          "I like baseball and swimming. They are fun.",
          "野球と水泳がすき。楽しいです。"),
        W("what do you like i like music",
          "What do you like? I like music.",
          "何がすき？ 音楽がすき。"),
      ],
    },
    e3: {
      word: [
        W("what", "what", "なに"), W("where", "where", "どこ"),
        W("when", "when", "いつ"), W("who", "who", "だれ"),
        W("why", "why", "なぜ"), W("how", "how", "どのように"),
        W("this", "this", "これ"), W("that", "that", "それ"),
        W("these", "these", "これら"), W("those", "those", "それら"),
        W("like", "like", "すき"), W("want", "want", "ほしい"),
        W("need", "need", "ひつよう"), W("have", "have", "もっている"),
        W("make", "make", "つくる"), W("help", "help", "たすける"),
        W("think", "think", "おもう"), W("know", "know", "しっている"),
        W("study", "study", "べんきょうする"), W("practice", "practice", "れんしゅう"),
        W("country", "country", "くに"), W("city", "city", "まち"),
        W("language", "language", "ことば"), W("english", "English", "英語"),
        W("japanese", "Japanese", "日本語"), W("culture", "culture", "ぶんか"),
        W("festival", "festival", "まつり"), W("trip", "trip", "りょこう"),
        W("hobby", "hobby", "しゅみ"), W("dream", "dream", "ゆめ"),
        W("important", "important", "たいせつ"), W("together", "together", "いっしょに"),
      ],
      sentence: [
        W("what is this", "What is this?", "これは何ですか。"),
        W("where do you live", "Where do you live?", "どこに住んでいますか。"),
        W("i want to be a doctor", "I want to be a doctor.", "医者になりたいです。"),
        W("we study english together", "We study English together.", "いっしょに英語を勉強します。"),
        W("this is important for me", "This is important for me.", "これは私に大切です。"),
        W("i can help you", "I can help you.", "てつだえます。"),
        W("my hobby is reading books", "My hobby is reading books.", "趣味は本を読むことです。"),
        W("how are you today", "How are you today?", "きょうの調子はどう？"),
        W("i think it is fun", "I think it is fun.", "それは楽しいとおもいます。"),
        W("let us go to japan", "Let us go to Japan.", "日本へ行きましょう。"),
      ],
      long: [
        W("i want to visit many countries i like japanese culture",
          "I want to visit many countries. I like Japanese culture.",
          "たくさんの国へ行きたい。日本の文化がすき。"),
        W("what do you want to be i want to be a teacher",
          "What do you want to be? I want to be a teacher.",
          "将来何になりたい？ 先生になりたい。"),
        W("we practice english every day it is important",
          "We practice English every day. It is important.",
          "毎日英語を練習します。大切です。"),
        W("this festival is fun we sing and dance together",
          "This festival is fun. We sing and dance together.",
          "このまつりは楽しい。歌って踊ります。"),
        W("i know this is not easy but i can do it",
          "I know this is not easy, but I can do it.",
          "簡単ではないとわかっている。でもできる。"),
      ],
    },
    j1: {
      word: [
        W("am", "am", "〜です（I）"), W("is", "is", "〜です"), W("are", "are", "〜です（複数）"),
        W("do", "do", "する"), W("does", "does", "する（三人称）"),
        W("have", "have", "もつ"), W("has", "has", "もつ（三人称）"),
        W("live", "live", "すむ"), W("come", "come", "くる"), W("go", "go", "いく"),
        W("eat", "eat", "たべる"), W("drink", "drink", "のむ"),
        W("speak", "speak", "はなす"), W("listen", "listen", "きく"),
        W("write", "write", "かく"), W("read", "read", "よむ"),
        W("usually", "usually", "ふつうは"), W("always", "always", "いつも"),
        W("sometimes", "sometimes", "ときどき"), W("never", "never", "けっして〜ない"),
        W("breakfast", "breakfast", "あさごはん"), W("lunch", "lunch", "ひるごはん"),
        W("dinner", "dinner", "ばんごはん"), W("weekday", "weekday", "へいじつ"),
        W("weekend", "weekend", "しゅうまつ"), W("club", "club", "ぶかつ"),
        W("subject", "subject", "かもく"), W("math", "math", "すうがく"),
        W("science", "science", "りか"), W("history", "history", "れきし"),
        W("from", "from", "〜から"), W("about", "about", "〜について"),
      ],
      sentence: [
        W("i am a junior high school student", "I am a junior high school student.", "私は中学生です。"),
        W("she lives in fukuoka", "She lives in Fukuoka.", "彼女は福岡に住んでいます。"),
        W("he plays tennis after school", "He plays tennis after school.", "彼は放課後テニスをします。"),
        W("do you like english", "Do you like English?", "英語はすきですか。"),
        W("i usually get up at seven", "I usually get up at seven.", "ふつう7時に起きます。"),
        W("we have math on monday", "We have math on Monday.", "月曜日に数学があります。"),
        W("my brother does not like carrots", "My brother does not like carrots.", "兄はにんじんがすきではありません。"),
        W("what time do you go to bed", "What time do you go to bed?", "何時に寝ますか。"),
        W("i come from japan", "I come from Japan.", "日本から来ました。"),
        W("please speak slowly", "Please speak slowly.", "ゆっくり話してください。"),
      ],
      long: [
        W("i am thirteen years old i live in japan i like music",
          "I am thirteen years old. I live in Japan. I like music.",
          "13歳です。日本に住んでいます。音楽がすき。"),
        W("i get up at seven i eat breakfast and go to school",
          "I get up at seven. I eat breakfast and go to school.",
          "7時に起きる。朝ごはんを食べて学校へ行く。"),
        W("do you have any clubs yes i am in the soccer club",
          "Do you have any clubs? Yes, I am in the soccer club.",
          "部活は？ はい、サッカー部です。"),
        W("she speaks english well i want to speak like her",
          "She speaks English well. I want to speak like her.",
          "彼女は英語が上手。あのように話したい。"),
        W("on weekends i read books and help my mother",
          "On weekends I read books and help my mother.",
          "週末は本を読み、母をてつだいます。"),
      ],
    },
    j2: {
      word: [
        W("was", "was", "〜だった"), W("were", "were", "〜だった（複数）"),
        W("did", "did", "した"), W("went", "went", "いった"),
        W("saw", "saw", "みた"), W("ate", "ate", "たべた"),
        W("made", "made", "つくった"), W("came", "came", "きた"),
        W("could", "could", "できた"), W("would", "would", "〜だろう"),
        W("because", "because", "なぜなら"), W("so", "so", "だから"),
        W("but", "but", "しかし"), W("if", "if", "もし"),
        W("more", "more", "もっと"), W("most", "most", "いちばん"),
        W("better", "better", "よりよい"), W("best", "best", "さいこう"),
        W("than", "than", "〜より"), W("as", "as", "〜のように"),
        W("must", "must", "しなければならない"), W("should", "should", "するべき"),
        W("may", "may", "かもしれない"), W("will", "will", "〜するつもり"),
        W("yesterday", "yesterday", "きのう"), W("ago", "ago", "〜まえ"),
        W("last", "last", "このまえの"), W("next", "next", "つぎの"),
        W("famous", "famous", "ゆうめい"), W("popular", "popular", "にんき"),
        W("difficult", "difficult", "むずかしい"), W("interesting", "interesting", "おもしろい"),
      ],
      sentence: [
        W("i went to kyoto last summer", "I went to Kyoto last summer.", "去年の夏、京都へ行きました。"),
        W("she was busy yesterday", "She was busy yesterday.", "彼女はきのう忙しかった。"),
        W("this book is more interesting than that", "This book is more interesting than that.", "この本はそれよりおもしろい。"),
        W("you should study harder", "You should study harder.", "もっと勉強した方がいい。"),
        W("i could swim when i was five", "I could swim when I was five.", "5歳のとき泳げました。"),
        W("we will visit tokyo next week", "We will visit Tokyo next week.", "来週東京を訪れます。"),
        W("he did not come to school", "He did not come to school.", "彼は学校に来ませんでした。"),
        W("if it rains we will stay home", "If it rains, we will stay home.", "雨なら家にいます。"),
        W("this is the best movie", "This is the best movie.", "これが一番いい映画です。"),
        W("i was happy because i saw you", "I was happy because I saw you.", "会えたからうれしかった。"),
      ],
      long: [
        W("i went to osaka last month i saw a famous castle it was beautiful",
          "I went to Osaka last month. I saw a famous castle. It was beautiful.",
          "先月大阪へ行った。有名なお城を見た。美しかった。"),
        W("english is difficult but it is interesting i will study more",
          "English is difficult, but it is interesting. I will study more.",
          "英語は難しい。でもおもしろい。もっと勉強する。"),
        W("you should sleep well if you are tired you cannot study",
          "You should sleep well. If you are tired, you cannot study.",
          "よく寝るべき。つかれていると勉強できない。"),
        W("she was the best player on the team everyone liked her",
          "She was the best player on the team. Everyone liked her.",
          "チームで一番の選手だった。みんな彼女がすきだった。"),
        W("we made a poster yesterday it was more difficult than we thought",
          "We made a poster yesterday. It was more difficult than we thought.",
          "きのうポスターを作った。思ったより難しかった。"),
      ],
    },
    j3: {
      word: [
        W("have been", "have been", "〜したことがある"),
        W("already", "already", "すでに"), W("yet", "yet", "まだ"),
        W("just", "just", "たったいま"), W("ever", "ever", "いままでに"),
        W("never", "never", "いちども〜ない"), W("since", "since", "〜以来"),
        W("for", "for", "〜のあいだ"), W("recently", "recently", "さいきん"),
        W("used to", "used to", "以前は〜だった"),
        W("be going to", "be going to", "〜する予定"),
        W("passive", "passive", "うけみ"),
        W("environment", "environment", "かんきょう"),
        W("global", "global", "せかいてき"), W("issue", "issue", "もんだい"),
        W("solution", "solution", "かいけつさく"), W("opinion", "opinion", "いけん"),
        W("agree", "agree", "さんせいする"), W("disagree", "disagree", "はんたいする"),
        W("believe", "believe", "しんじる"), W("realize", "realize", "さとる"),
        W("experience", "experience", "けいけん"), W("success", "success", "せいこう"),
        W("failure", "failure", "しっぱい"), W("effort", "effort", "どりょく"),
        W("future", "future", "みらい"), W("career", "career", "しんろ"),
        W("volunteer", "volunteer", "ボランティア"),
        W("respect", "respect", "そんけい"), W("peace", "peace", "へいわ"),
        W("human", "human", "にんげん"), W("rights", "rights", "けんり"),
      ],
      sentence: [
        W("i have already finished my homework", "I have already finished my homework.", "もう宿題を終えました。"),
        W("have you ever been to kyoto", "Have you ever been to Kyoto?", "京都へ行ったことがありますか。"),
        W("this problem has not been solved yet", "This problem has not been solved yet.", "この問題はまだ解決されていません。"),
        W("i have lived here for ten years", "I have lived here for ten years.", "ここに10年住んでいます。"),
        W("english is spoken in many countries", "English is spoken in many countries.", "英語は多くの国で話されます。"),
        W("i used to play the piano", "I used to play the piano.", "以前はピアノを弾いていました。"),
        W("we must protect the environment", "We must protect the environment.", "環境を守らなければなりません。"),
        W("i believe peace is important", "I believe peace is important.", "平和は大切だと信じます。"),
        W("failure can lead to success", "Failure can lead to success.", "失敗は成功につながることがある。"),
        W("i am going to think about my career", "I am going to think about my career.", "進路について考えます。"),
      ],
      long: [
        W("i have never been to another country i want to go abroad in the future",
          "I have never been to another country. I want to go abroad in the future.",
          "外国に行ったことがない。将来は行きたい。"),
        W("the environment is a global issue we must find a solution together",
          "The environment is a global issue. We must find a solution together.",
          "環境は世界の問題。いっしょに解決策を。"),
        W("i have studied english for three years it is not easy but i will not give up",
          "I have studied English for three years. It is not easy, but I will not give up.",
          "英語を3年勉強した。簡単ではない。でもあきらめない。"),
        W("many things are made in japan i am proud of our technology",
          "Many things are made in Japan. I am proud of our technology.",
          "多くのものが日本で作られる。技術が誇り。"),
        W("i respect people who never stop making an effort that is my goal too",
          "I respect people who never stop making an effort. That is my goal too.",
          "努力をやめない人を尊敬する。それが自分の目標でもある。"),
      ],
    },
  };

  function packId(lang, level, form, adv) {
    return "lesson-" + lang + "-" + level + "-" + form + (adv ? "-adv" : "");
  }

  function jaAdvancedText(t, d) {
    const src = String(t || "");
    const disp = String(d || "");
    const already = /[、。？！]/.test(src);
    const tokens = src.replace(/[。、？！]/g, (m) => " " + m + " ").trim().split(/\s+/).filter(Boolean);
    const letters = tokens.filter((x) => !/[、。？！]/.test(x));
    if (already) {
      let s = src.replace(/[\s　]+/g, "");
      if (!/[。？！]$/.test(s) && /[。．.？?！!]$/.test(disp)) {
        s += /[？?]$/.test(disp) ? "？" : /[！!]$/.test(disp) ? "！" : "。";
      }
      return s;
    }
    const stops = (disp.match(/[。]/g) || []).length;
    const commas = (disp.match(/、/g) || []).length;
    if (commas === 1 && letters.length === 2 && stops <= 1) {
      return letters[0] + "、" + letters[1] + (/[？?]$/.test(disp) ? "？" : "。");
    }
    if (stops >= 2 && letters.length >= stops && letters.length % stops === 0) {
      const per = letters.length / stops;
      let s = "";
      letters.forEach((w, i) => {
        s += w;
        if ((i + 1) % per === 0) s += "。";
      });
      return s;
    }
    let s = letters.join("");
    if (/[？?]$/.test(disp) || /ですか$/.test(s)) s += "？";
    else if (/[！!]$/.test(disp)) s += "！";
    else s += "。";
    return s;
  }

  function enAdvancedText(t, d) {
    const src = String(d || t || "").toLowerCase();
    return src.replace(/[\s　]+/g, "").replace(/[^a-z0-9.,!?']/g, "");
  }

  function getItems(lang, level, form) {
    const src = (lang === "en" ? EN : JA)[level];
    return src && src[form] ? src[form].slice() : [];
  }

  function toPlayItems(lang, list, form, advanced) {
    return list.map((it) => {
      let text = it.t;
      if (lang === "ja" && advanced && form && form !== "word") {
        text = jaAdvancedText(it.t, it.d);
      } else if (lang === "en" && form && form !== "word") {
        text = advanced ? enAdvancedText(it.t, it.d) : String(it.t).replace(/[\s　.,!?']/g, "");
      }
      return {
        mode: lang === "en" ? "alpha" : "romaji",
        text: text,
        display: it.d || it.t,
        meaning: it.m || "",
      };
    });
  }

  function packMeta(lang, level, form) {
    const L = LANGS.find((x) => x.id === lang);
    const V = LEVELS.find((x) => x.id === level);
    const F = FORMS.find((x) => x.id === form);
    const items = getItems(lang, level, form);
    return {
      id: packId(lang, level, form),
      lang, level, form,
      name: (L ? L.name : "") + "　" + (V ? V.short : "") + "　" + (F ? F.name : ""),
      blurb: (V ? V.name : "") + "の" + (F ? F.blurb : ""),
      count: items.length,
      take: F ? Math.min(F.len, items.length) : items.length,
    };
  }

  function orderedPacks(lang) {
    const out = [];
    LEVELS.forEach((lv) => {
      FORMS.forEach((f) => out.push(packMeta(lang, lv.id, f.id)));
    });
    return out;
  }

  function nextPack(lang, level, form) {
    const all = orderedPacks(lang);
    const i = all.findIndex((p) => p.level === level && p.form === form);
    return i >= 0 ? all[i + 1] || null : null;
  }

  global.LESSONS = {
    LEVELS, FORMS, LANGS,
    packId, getItems, toPlayItems, packMeta, orderedPacks, nextPack,
  };
})(window);
