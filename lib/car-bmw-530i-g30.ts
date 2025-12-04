// lib/car-bmw-530i-g30.ts

// 走り方シーンごとの印象
export type G30UsageScene = {
  title: string;
  summary: string;
  pros?: string[];
  cons?: string[];
};

export type G30UsageImpressions = {
  city?: G30UsageScene;
  highway?: G30UsageScene;
  longTrip?: G30UsageScene;
  maintenance?: G30UsageScene;
};

// トラブル詳細 + 修理費レンジ
export type G30TroubleDetail = {
  title: string;
  symptoms?: string;
  when?: string;
  note?: string;
  cost?: string; // 「◯◯万円くらい〜」みたいなテキスト
};

// 維持費シミュレーション用の項目
export type G30MaintenanceItem = {
  label: string;
  perYear?: string;
  per2Years?: string;
  per3Years?: string;
  memo?: string;
};

export type G30MaintenanceSimulation = {
  note?: string;
  items: {
    tax: G30MaintenanceItem;
    insurance: G30MaintenanceItem;
    shaken: G30MaintenanceItem;
    tires: G30MaintenanceItem;
    brakes: G30MaintenanceItem;
    routine: G30MaintenanceItem;
  };
  yearlyRoughTotal?: string;
};

// ページで使う「G30拡張テンプレート」1台分
export type G30CarTemplate = {
  slug: string; // ★ cars.json の G30 の slug と合わせる
  usageImpressions?: G30UsageImpressions;
  troubleDetails?: G30TroubleDetail[];
  maintenanceSimulation?: G30MaintenanceSimulation;
};

// ---- ここから実データ ----

const G30_TEMPLATES: G30CarTemplate[] = [
  {
    slug: "bmw-530i-g30", // ← cars.json の slug に合わせてね
    usageImpressions: {
      city: {
        title: "都内の日常使いでもサイズ慣れすれば快適",
        summary:
          "全幅はそれなりにあるけれど、ステアリングの取り回しと視界が良く、慣れてしまえば『大きいけど扱いやすいセダン』という印象に落ち着くイメージ。",
        pros: [
          "アイドリングストップやATのつながりが自然でギクシャク感が少ない",
          "ボディ剛性が高く、段差を越えたときのガタつきが少ない",
          "静粛性が高く、渋滞の中でも疲れにくい",
        ],
        cons: [
          "立体駐車場やコインパーキングはサイズ制限に注意が必要",
          "短距離のちょい乗りを繰り返すとバッテリーにはやや厳しめ",
        ],
      },
      highway: {
        title: "80〜120km/h あたりが一番気持ちよく流せるゾーン",
        summary:
          "G30 の良さが一番わかりやすいのが高速道路。直進安定性とエンジンの滑らかさが合わさって、距離の割に到着後の疲労感が少ない。",
        pros: [
          "追い越し加速は必要十分で、2.0Lターボでも不満の出にくいパワー感",
          "アダプティブクルーズコントロールとの相性が良く、巡航がとても楽",
          "風切り音・ロードノイズともにうまく抑えられている",
        ],
        cons: [
          "ランフラットタイヤ仕様だと舗装の荒れた路面でややゴツゴツ感が出る",
          "長距離前にはタイヤとオイルのコンディションを気にしておきたい",
        ],
      },
      longTrip: {
        title: "大人4人でロングツーリングしても疲れにくいキャラ",
        summary:
          "シートの出来と足回りのセッティングが良く、500〜600kmのロングドライブでも『もう一歩いけるな』と思えるタイプのクルマ。",
        pros: [
          "シート形状・クッションが良く、腰や首の疲れが出にくい",
          "トランク容量が大きく、旅行の荷物も積みやすい",
          "燃費もクラスの割に安定しており、給油回数が抑えられる",
        ],
        cons: [
          "後席リクライニングはないので、後ろの人にとっては角度固定感はある",
          "高速代・ガソリン代はそれなりにかかるので、年間走行距離が多い人は試算したい",
        ],
      },
      maintenance: {
        title: "きちんと手当てすれば『手がかかりすぎる』まではいかない",
        summary:
          "定番の弱点に事前に手を入れておけば、いきなり大きな出費で驚くケースは減らせるイメージ。『国産と同じ感覚』ではなく『ちょっと気を使う相棒』として付き合う感じ。",
        pros: [
          "定番の弱点がある程度見えているので、事前対策がしやすい",
          "信頼できる専門ショップを見つければ、ディーラー一択より選択肢が増える",
        ],
        cons: [
          "電装系やセンサー類のトラブルが出ると、部品代・工賃ともに国産より高くつきがち",
          "車検や消耗品交換を先送りにすると、一度にドカっと費用が乗ってくる",
        ],
      },
    },

    troubleDetails: [
      {
        title: "バッテリー・電装系の要注意ゾーン",
        symptoms:
          "メーターパネルに警告灯が一時的に点いたり消えたりする、iDrive の起動が遅い、エンジン始動が少し重く感じる…といった軽いサインから始まることが多い。",
        when: "短距離メインの使い方が続いたタイミング / 5〜7年目あたり",
        note: "早めにテスター診断と容量チェックをしておくと安心。",
        cost: "5〜15万円前後（バッテリー単体か、周辺部品も含めるかで変動）",
      },
      {
        title: "サスペンションまわりのブッシュ・ショック類",
        symptoms:
          "段差を越えたときのコトコト音、以前よりもフワつきや揺り返しを感じる、タイヤの片減りが目立つ…といった変化が出ることがある。",
        when: "走行距離 6〜8万km 前後 / 年式10年手前あたり",
        note: "アライメント調整とセットで考えると、結果的にタイヤも長持ちしやすい。",
        cost: "10〜40万円前後（交換範囲と使う部品グレード次第）",
      },
      {
        title: "冷却系ホース・樹脂パーツの経年劣化",
        symptoms:
          "駐車場にうっすらとクーラントのにじみ跡、ボンネットを開けると甘い匂いがする、冷却水警告が一度だけ点灯する…といった軽いサインから始まるケースも。",
        when: "年式・距離ともに進んできたタイミング（7〜10年目以降）",
        note: "一部だけでなく、周辺の樹脂パーツもセットで予防交換すると安心度が高い。",
        cost: "8〜25万円前後（どこまで一緒に交換するかで大きく変動）",
      },
    ],

    maintenanceSimulation: {
      note: "首都圏在住・年間走行距離8,000〜10,000km・一般的な保険条件を想定した、あくまで『ざっくりの目安』です。",
      items: {
        tax: {
          label: "自動車税・重量税",
          perYear: "約5〜6万円前後",
          memo: "排気量クラスに応じた自動車税＋車検時の重量税をならして年間換算したイメージ。",
        },
        insurance: {
          label: "任意保険",
          perYear: "約7〜12万円前後",
          memo: "等級・年齢条件・補償内容で大きく変動。初オーナーならやや高めに見ておくと安心。",
        },
        shaken: {
          label: "車検基本費用",
          per2Years: "約15〜25万円前後",
          memo: "法定費用＋基本整備。消耗品をどこまで同時にやるかで上下にブレる。",
        },
        tires: {
          label: "タイヤ交換",
          per3Years: "約12〜25万円前後",
          memo: "純正サイズのランフラットを想定。銘柄やショップ選びでかなり差が出るポイント。",
        },
        brakes: {
          label: "ブレーキ（パッド・ローター）",
          per3Years: "約10〜20万円前後",
          memo: "走り方次第で大きく変わるが、3〜4年に一度はある程度の予算を見ておきたいところ。",
        },
        routine: {
          label: "オイル・フィルター・その他消耗品",
          perYear: "約5〜10万円前後",
          memo: "オイル交換サイクルを短めに取るほど、エンジンのコンディション維持にはプラス。",
        },
      },
      yearlyRoughTotal: "年間 30〜50万円前後をざっくりイメージ",
    },
  },
];

// slug から G30 テンプレを取得するヘルパー
export function getG30TemplateBySlug(slug: string): G30CarTemplate | null {
  return G30_TEMPLATES.find((tpl) => tpl.slug === slug) ?? null;
}
