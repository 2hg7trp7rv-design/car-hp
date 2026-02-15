// lib/news-longform.ts

/**
 * NEWSの文字量(=可読性/網羅性)を増やしつつ、事実を捏造しないための
 * “編集部メモ(読み解きガイド)”を自動生成するユーティリティ。
 *
 * 方針:
 * - 公式ソース本文の内容を「言い切らない」。あくまで確認観点と行動手順を提示。
 * - 可能な範囲で、ニュース固有のキーワード(タイトル/概要/タグ)を織り込んで、
 *   コピペ感の強い定型文だけにならないようにする。
 */

import type { NewsItem } from "@/lib/content-types";

export type NewsLongformSection = {
  id: string;
  title: string;
  paragraphs?: string[];
  bullets?: string[];
};

type InferredKind = "RECALL" | "NEW_MODEL" | "UPDATE" | "BUSINESS" | "TECH" | "OTHER";

function hashStringToInt(input: string): number {
  // 小さくて十分な deterministic hash
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  // unsigned 32bit
  return h >>> 0;
}

function pickVariant<T>(variants: T[], seed: number): T {
  if (variants.length === 0) {
    throw new Error("variants must not be empty");
  }
  return variants[seed % variants.length];
}

function normalizeSpaces(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function safeText(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function matchAll(text: string, re: RegExp): string[] {
  // text.match() は RegExpMatchArray | null を返す。
  // 戻り値を明示的に string[] に統一し、空配列が never[] 推論される事故を防ぐ。
  return text.match(re) ?? [];
}

function inferKind(news: NewsItem): InferredKind {
  const cat = safeText(news.category).toUpperCase();
  const tags = (news.tags ?? []).map((t) => String(t).toLowerCase());

  const has = (needle: string) => tags.includes(needle.toLowerCase());

  if (cat.includes("RECALL") || has("リコール") || has("サービスキャンペーン")) return "RECALL";
  if (cat.includes("NEW") || cat.includes("LAUNCH") || has("新型") || has("発表")) return "NEW_MODEL";
  if (cat.includes("UPDATE") || cat.includes("MODEL") || has("改良") || has("アップデート")) return "UPDATE";
  if (cat.includes("TECH") || has("技術")) return "TECH";
  if (cat.includes("BUSINESS") || has("業績") || has("販売")) return "BUSINESS";

  return "OTHER";
}

function extractKeywords(news: NewsItem): string[] {
  const title = safeText(news.titleJa ?? news.title);
  const excerpt = safeText(news.excerpt);
  const tags = (news.tags ?? []).map((t) => String(t).trim()).filter(Boolean);

  const text = normalizeSpaces(`${title} ${excerpt}`);

  // 1) まずはタグ（ただしメーカー名が重複しやすいので上限）
  const base: string[] = [];
  for (const t of tags) {
    if (t.length <= 1) continue;
    // ハッシュタグ用語や英数略語は優先
    base.push(t);
  }

  // 2) 英数字の型式/略語っぽいもの
  const alphaNum = Array.from(
    new Set(
      matchAll(text, /\b[A-Z]{1,3}\d{1,4}[A-Z]?\b/g)
        .concat(matchAll(text, /\b[A-Z]{2,6}\b/g))
        .map((v) => v.trim())
        .filter((v) => v.length >= 2 && v.length <= 10),
    ),
  );

  // 3) 日本語キーワード（漢字2〜6文字程度）
  const kanji = Array.from(
    new Set(
      matchAll(text, /[一-龥]{2,6}/g)
        .map((v) => v.trim())
        .filter((v) => v.length >= 2 && v.length <= 6),
    ),
  );

  // ストップワード
  const stop = new Set([
    "公式",
    "発表",
    "ニュース",
    "記事",
    "一覧",
    "最新",
    "更新",
    "公開",
    "編集部",
    "要点",
    "確認",
    "対象",
    "追加",
    "変更",
    "新型",
    "改良",
    "安全",
    "技術",
  ]);

  const merged = [...base, ...alphaNum, ...kanji]
    .map((v) => v.replace(/^#/, "").trim())
    .filter((v) => v.length > 1)
    .filter((v) => !stop.has(v))
    .filter((v, i, arr) => arr.indexOf(v) === i);

  // 先頭はタグ優先。最大10個。
  return merged.slice(0, 10);
}

function explainKeyword(keyword: string): string {
  const key = keyword.toUpperCase();
  const map: Record<string, string> = {
    EV: "電気自動車。充電方式・航続距離・補助金/優遇の条件が判断材料になります。",
    PHEV: "プラグインハイブリッド。充電環境と日常走行距離に合わせてメリットが変わります。",
    HEV: "ハイブリッド。燃費だけでなく、走り/静粛性/整備性も比較ポイント。",
    AWD: "四輪駆動。雪道/雨天/牽引など用途があるなら優先度が上がります。",
    "4WD": "四輪駆動。用途（雪・悪路・牽引）とタイヤ/足回りの組み合わせで体感が変わります。",
    OTA: "ソフトウェア更新。入庫が必要か/自宅で完結するか、更新対象の範囲を確認。",
    VIN: "車台番号。リコールやキャンペーンの対象確認に使われます。",
    LCI: "年次改良/フェイスリフトの文脈で使われることが多いキーワード。適用年式を要確認。",
    "リコール": "安全や不具合に関する対応。対象範囲（年式/型式/VIN）と対応内容が最優先。",
    "サービスキャンペーン": "リコールに準じる無償対応のことが多い。対象条件の確認が重要。",
    "改良": "年次改良/仕様変更。対象年式と装備差分がポイントになります。",
    "アップデート": "仕様やソフトの更新。費用/入庫要否/適用条件を確認。",
    "価格": "価格改定の可能性。『適用日』『対象グレード』『オプション』の3点で読むとブレにくい。",
  };

  return (
    map[key] ??
    map[keyword] ??
    "記事内のキーワードです。公式本文では『対象範囲』『条件』『時期』と一緒に確認すると判断が速い。"
  );
}

function buildIntro(news: NewsItem, seed: number): string[] {
  const maker = safeText(news.maker);
  const category = safeText(news.category);
  const title = safeText(news.titleJa ?? news.title);

  const intro1 = pickVariant(
    [
      "このページは、メーカー公式の一次情報（出典リンク）を起点に、読む前に押さえておくポイントを編集部メモとして整理したものです。",
      "以下は公式発表を読むための“前提整理”です。要点と確認観点を先にまとめています。",
      "公式ニュースは情報量が多いので、まずは判断に直結する確認ポイントを先に並べてから読むのがおすすめです。",
    ],
    seed,
  );

  const intro2 = maker
    ? `対象ブランド: ${maker}。${category ? `分類: ${category}。` : ""}本文の詳細（対象範囲・条件・適用日）は必ず公式ページ側で確認してください。`
    : `${category ? `分類: ${category}。` : ""}本文の詳細（対象範囲・条件・適用日）は必ず公式ページ側で確認してください。`;

  const intro3 = title
    ? `ニュースタイトルは「${title}」。このあとに続くガイドは“断定”ではなく、読み解きの視点と行動手順です。`
    : "このあとに続くガイドは“断定”ではなく、読み解きの視点と行動手順です。";

  return [intro1, intro2, intro3];
}

function buildSectionsByKind(kind: InferredKind, keywords: string[], seed: number): NewsLongformSection[] {
  const keywordLine = keywords.length > 0 ? `キーワード: ${keywords.slice(0, 6).join(" / ")}` : "キーワード: （タグ/タイトルから抽出）";

  // 共通: 最初に押さえる枠
  const commonFirst: NewsLongformSection = {
    id: "how-to-read",
    title: "まず押さえる（読む順番）",
    paragraphs: [
      "公式ニュースを効率よく読むコツは、(1) 対象範囲 → (2) 変更/対応内容 → (3) 時期 → (4) 手続き/費用 の順にチェックすることです。",
      "同じタイトルでも、国・地域仕様や年式で条件が分かれることがあります。『自分に関係する範囲』を先に切り出すと迷いが減ります。",
      keywordLine,
    ],
  };

  // kind別
  if (kind === "RECALL") {
    return [
      commonFirst,
      {
        id: "recall-check",
        title: "リコール/サービスキャンペーンで最優先の確認項目",
        bullets: [
          "対象車両: 年式・型式・車台番号(VIN)の範囲（国/地域の違いも含む）",
          "症状/リスク: 安全に関わるか、走行継続の可否",
          "対応内容: 無償/有償、部品交換 or ソフト更新、所要時間、代車の有無",
          "連絡/予約: どこへ連絡するか（ディーラー/窓口/オンライン）",
        ],
      },
      {
        id: "recall-action",
        title: "オーナー向け：すぐできるチェックリスト",
        bullets: [
          "車検証で『型式』『初度登録年』『車台番号』を確認",
          "メーカーの対象照会ページがある場合は VIN で該当確認",
          "入庫予約の際に『警告灯の有無』『現象の有無』を伝える",
          "対応後の書類（改善対策済み等）は保管しておく",
        ],
      },
      {
        id: "recall-note",
        title: "読み方の注意",
        paragraphs: [
          "“リコール”と“サービスキャンペーン”は、扱い（告知方法や対象の表現）が異なる場合があります。まずは対象範囲を数字（VIN範囲など）で確認してください。",
          "中古で購入した車両でも対象になることが一般的ですが、手続き方法はブランド/地域で差が出ます。公式リンク先の案内を優先してください。",
        ],
      },
    ];
  }

  if (kind === "NEW_MODEL") {
    const angle = pickVariant(
      [
        "新型/発表ニュースは『スペック』よりも『発売時期・グレード・価格帯』の3点を先に押さえると比較がラクです。",
        "新型の公式発表は情報が段階的に出ます。まずは“確定情報”と“今後公開予定”を切り分けて読むのがコツです。",
        "新型ニュースは“競合比較”を先に決めると判断が早い。ボディタイプ/用途/予算を固定してから読むと迷いが減ります。",
      ],
      seed,
    );
    return [
      commonFirst,
      {
        id: "newmodel-focus",
        title: "新型/発表ニュースの読みどころ",
        paragraphs: [
          angle,
          "同名モデルでも地域仕様で装備やパワートレーンが異なることがあります。公式ページ内の“対象市場”や“仕様表”の表記を優先してください。",
        ],
      },
      {
        id: "newmodel-check",
        title: "購入検討者向け：比較のためのチェック項目",
        bullets: [
          "発売時期/受注開始/デリバリー（先行予約の条件）",
          "グレード構成・パワートレーン・駆動方式",
          "価格帯（オプション含むか）と主要装備の差",
          "先代からの変更点（サイズ/装備/安全支援/電動化）",
          "競合と比較する場合は、同条件（価格帯・用途・ボディ）で揃える",
        ],
      },
      {
        id: "newmodel-next",
        title: "次のアクション（迷ったときの順番）",
        bullets: [
          "まずはグレード表と主要装備の差分を確認",
          "納期・値引き環境は“時期”で変わるので、見積もりは早めに一度取っておく",
          "乗り換えなら、下取り（相場）と納期を同時に押さえる",
        ],
      },
    ];
  }

  if (kind === "UPDATE") {
    return [
      commonFirst,
      {
        id: "update-scope",
        title: "仕様変更/アップデートの『影響範囲』を切り分ける",
        bullets: [
          "対象年式/モデルイヤー（同じ車名でも年度で差が出る）",
          "対象グレード/オプション（装備パッケージで差が出る）",
          "OTA等のソフト更新があるか（入庫が必要か）",
          "価格改定・装備追加・仕様変更のどれに該当するか",
        ],
      },
      {
        id: "update-owner",
        title: "オーナー向け：確認ポイント",
        paragraphs: [
          "すでに所有している車に関係する場合は、適用条件（対象車台番号/ソフトウェアバージョン/入庫要否）を先に確認すると無駄がありません。",
          "“改良”は良いニュースに見えますが、年式境界で装備差が大きくなることがあります。中古検討の方は“いつから適用か”を特に重視してください。",
        ],
      },
    ];
  }

  if (kind === "TECH") {
    return [
      commonFirst,
      {
        id: "tech-focus",
        title: "技術ニュースの読みどころ",
        bullets: [
          "“どの車種/地域/年式”に適用される技術か",
          "ユーザーにとってのメリット（安全/快適/燃費/充電/維持費）",
          "前提条件（充電環境・走行距離・使い方）でメリットが変わる点",
          "導入時期（今すぐか、次期モデルからか）",
        ],
      },
      {
        id: "tech-note",
        title: "注意",
        paragraphs: [
          "技術発表は“将来の計画”が混ざりやすいので、公式ページ内の『開始時期』『対象モデル』の表現をそのまま確認するのが安全です。",
        ],
      },
    ];
  }

  if (kind === "BUSINESS") {
    return [
      commonFirst,
      {
        id: "biz-focus",
        title: "事業/販売/生産のニュースはここを見る",
        bullets: [
          "納期（供給）に影響するか",
          "価格改定の予告があるか（適用日が明記されているか）",
          "保証・サービス・キャンペーンなど、ユーザー条件に直結する情報があるか",
        ],
      },
      {
        id: "biz-next",
        title: "買う/売るの判断に使うなら",
        paragraphs: [
          "“生産/供給”のニュースは、在庫状況や値引き環境に影響することがあります。短期の相場観よりも『数か月後の条件』を読む材料として使うのが安定です。",
        ],
      },
    ];
  }

  // OTHER
  return [
    commonFirst,
    {
      id: "other-note",
      title: "読み解きのヒント",
      paragraphs: [
        "公式ニュースは情報が“企業目線”で書かれることが多いので、読む側は『自分への影響（費用/時期/対象範囲）』に翻訳して捉えるのがコツです。",
        "不明点が残る場合は、公式リンク先のFAQや問い合わせ窓口の記載を確認してください。",
      ],
    },
  ];
}

function buildKeywordsSection(keywords: string[]): NewsLongformSection | null {
  if (!keywords || keywords.length === 0) return null;

  // キーワードは最大8個。説明を付けて文章量も増やす。
  const limited = keywords.slice(0, 8);
  const bullets = limited.map((k) => `「${k}」: ${explainKeyword(k)}`);

  return {
    id: "keywords",
    title: "用語・キーワード（読み解きメモ）",
    bullets,
  };
}

function buildFaq(kind: InferredKind, seed: number): NewsLongformSection {
  const common = [
    {
      q: "どこまでが“確定情報”ですか？",
      a: "公式ページ内で、対象範囲（年式/地域/VIN等）や適用日が明記されている部分が確定情報です。『予定』『今後』の表現は続報前提で扱うのが安全です。",
    },
    {
      q: "自分の車が対象かどうか、最短で確認するには？",
      a: "リコールやキャンペーンは VIN（車台番号）照会が最短です。仕様変更は“モデルイヤー/年式”と“装備パッケージ”で切り分けると早いです。",
    },
  ];

  const byKind: Record<InferredKind, { q: string; a: string }[]> = {
    RECALL: [
      {
        q: "すぐに乗るのをやめるべき？",
        a: "危険度は内容によります。公式ページに『走行を控える』等の案内がある場合はそれに従ってください。不明ならまずディーラー/窓口に確認が安全です。",
      },
    ],
    NEW_MODEL: [
      {
        q: "発売時期が曖昧なとき、何を見ればいい？",
        a: "『受注開始』『デリバリー開始』『市場（国/地域）』の表記を分けて確認すると整理しやすいです。",
      },
    ],
    UPDATE: [
      {
        q: "仕様変更は中古相場に影響しますか？",
        a: "装備差が大きい場合は影響しやすいです。年式境界（いつから適用か）を押さえて、比較対象を揃えるのがポイントです。",
      },
    ],
    BUSINESS: [
      {
        q: "価格改定の情報はどう読むのが安全？",
        a: "『適用日』『対象グレード』『オプション扱い』の3点が揃っているかを確認してください。揃っていない場合は続報待ちが安全です。",
      },
    ],
    TECH: [
      {
        q: "技術発表はいつ自分に関係しますか？",
        a: "“対象モデル”と“導入時期”が明記されているかが重要です。『将来的に』の表現はロードマップとして捉え、確定情報とは分けて扱うのが安全です。",
      },
    ],
    OTHER: [
      {
        q: "要点だけ拾いたい場合は？",
        a: "対象範囲・時期・費用（有償/無償）・手続き（予約/申込）を先に拾うと、判断が早くなります。",
      },
    ],
  };

  const pick1 = pickVariant(common, seed);
  const pick2 = pickVariant(common.slice().reverse(), seed + 1);
  const kindPick = pickVariant(byKind[kind], seed + 2);

  const bullets = [
    `Q. ${pick1.q}\nA. ${pick1.a}`,
    `Q. ${kindPick.q}\nA. ${kindPick.a}`,
    `Q. ${pick2.q}\nA. ${pick2.a}`,
  ];

  return {
    id: "faq",
    title: "よくある質問（FAQ）",
    bullets,
  };
}

/**
 * NEWS用の“読み解きガイド”を生成。
 * 生成結果は画面側で section として描画する想定。
 */
export function buildNewsLongform(news: NewsItem): NewsLongformSection[] {
  const seed = hashStringToInt(`${news.id}:${news.slug}:${news.publishedAt ?? ""}`);

  const kind = inferKind(news);
  const keywords = extractKeywords(news);

  const sections: NewsLongformSection[] = [];

  // Intro（短い段落セット）
  sections.push({
    id: "intro",
    title: "編集部メモ（このNEWSの読み方）",
    paragraphs: buildIntro(news, seed),
  });

  // kind別の主要セクション
  sections.push(...buildSectionsByKind(kind, keywords, seed));

  // キーワード解説
  const keywordSection = buildKeywordsSection(keywords);
  if (keywordSection) sections.push(keywordSection);

  // FAQ（最後に置く）
  sections.push(buildFaq(kind, seed));

  return sections;
}
