// lib/news-auto-ja.ts

/**
 * RSS/Atom で取得した英語(等)の NEWS を、
 * 画面表示向けに「日本語タイトル」「日本語の長め概要」に寄せるためのユーティリティ。
 *
 * 注意:
 * - 外部APIや翻訳サービスは使わない（無料・安定運用を優先）
 * - 事実の追加はしない（タイトル/要約/タグから推測できる範囲に留め、断定を避ける）
 * - 目的は「一覧で日本語が出る」「概要が薄くならない」こと
 */

export type AutoJaKind =
  | "RECALL"
  | "NEW_MODEL"
  | "UPDATE"
  | "BUSINESS"
  | "MOTORSPORT"
  | "EVENT"
  | "AWARD"
  | "TECH"
  | "OTHER";

type Extracted = {
  marketJa?: string;
  year?: string;
  model?: string;
  subject?: string; // 例: 5.7L HEMI V8
  powertrainHint?: string; // 例: EV / PHEV / HEV / V8
  techHint?: string; // 例: eTorque / OTA など
};

function hasJapanese(text: string): boolean {
  return /[ぁ-んァ-ン一-龥]/.test(text);
}

export function detectSourceLang(text: string): "ja" | "other" {
  if (!text) return "other";
  return hasJapanese(text) ? "ja" : "other";
}

function normalizeSpaces(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function normalizeLitre(text: string): string {
  // 5.7 Litre / 5.7 Liter / 5.7L を 5.7L に寄せる
  let t = text;
  t = t.replace(/\b(\d(?:\.\d)?)\s*(?:litre|liter|l)\b/gi, "$1L");
  // "5.7 L" のような表記
  t = t.replace(/\b(\d(?:\.\d)?)\s*L\b/g, "$1L");
  return t;
}

function extractMarketJa(title: string): string | undefined {
  const t = title.toLowerCase();
  const patterns: Array<{ re: RegExp; ja: string }> = [
    { re: /\b(canada)\b/i, ja: "カナダ" },
    { re: /\b(japan)\b/i, ja: "日本" },
    { re: /\b(uk|united kingdom|britain)\b/i, ja: "英国" },
    { re: /\b(europe|eu)\b/i, ja: "欧州" },
    { re: /\b(u\.?s\.?a\.?|united states|u\.?s\.?)\b/i, ja: "米国" },
    { re: /\b(china)\b/i, ja: "中国" },
    { re: /\b(australia)\b/i, ja: "豪州" },
  ];

  for (const p of patterns) {
    if (p.re.test(t)) return p.ja;
  }
  return undefined;
}

function extractYear(text: string): string | undefined {
  const m = text.match(/\b(19\d{2}|20\d{2})\b/);
  return m?.[1];
}

function extractSubjectAndModelFromTitle(title: string): Pick<Extracted, "subject" | "model"> {
  const t = normalizeSpaces(title);
  // 例: "5.7 Litre HEMI V8 is Now Available for Order on 2026 Ram 1500 in Canada"
  const p1 = t.match(/^(.+?)\s+is\s+now\s+available\s+for\s+order\s+on\s+(.+?)(?:\s+in\s+.+)?$/i);
  if (p1) {
    return {
      subject: normalizeLitre(p1[1].trim()),
      model: p1[2].trim(),
    };
  }

  const p2 = t.match(/^(.+?)\s+is\s+now\s+available\s+on\s+(.+?)(?:\s+in\s+.+)?$/i);
  if (p2) {
    return {
      subject: normalizeLitre(p2[1].trim()),
      model: p2[2].trim(),
    };
  }

  const p3 = t.match(/^(.+?)\s+available\s+for\s+order\s+on\s+(.+?)(?:\s+in\s+.+)?$/i);
  if (p3) {
    return {
      subject: normalizeLitre(p3[1].trim()),
      model: p3[2].trim(),
    };
  }

  // 年 + 連続トークン（2026 Ram 1500 / 2025 BMW M5 など）
  const ym = t.match(/\b(19\d{2}|20\d{2})\s+([A-Z][A-Za-z0-9]+(?:\s+[A-Z0-9][A-Za-z0-9]+){0,3})/);
  if (ym) {
    return { model: `${ym[1]} ${ym[2]}` };
  }

  // 型式っぽい短い英数（M5, Q7, G30）
  const code = t.match(/\b[A-Z]{1,3}\d{1,4}[A-Z]?\b/);
  if (code) {
    return { model: code[0] };
  }

  return {};
}

function extractPowertrainHint(text: string): string | undefined {
  const t = text.toLowerCase();
  if (/\bev\b|electric/.test(t)) return "EV";
  if (/\bphev\b|plug-in/.test(t)) return "PHEV";
  if (/\bhev\b|hybrid/.test(t)) return "HEV";
  if (/\bv8\b/.test(t)) return "V8";
  if (/\bv6\b/.test(t)) return "V6";
  if (/\bi6\b|inline-?6/.test(t)) return "I6";
  return undefined;
}

function extractTechHint(text: string): string | undefined {
  const t = text.toLowerCase();
  if (t.includes("etorque")) return "eTorque";
  if (t.includes("ota")) return "OTA";
  if (t.includes("vin")) return "VIN";
  if (t.includes("mild hybrid")) return "マイルドハイブリッド";
  return undefined;
}

export function buildExtracted(title: string, summary: string | undefined): Extracted {
  const full = normalizeSpaces(`${title} ${summary ?? ""}`);
  const marketJa = extractMarketJa(full);
  const year = extractYear(full);
  const { subject, model } = extractSubjectAndModelFromTitle(title);
  const powertrainHint = extractPowertrainHint(full);
  const techHint = extractTechHint(full);

  return {
    marketJa,
    year,
    model: model ? normalizeSpaces(model) : undefined,
    subject: subject ? normalizeSpaces(subject) : undefined,
    powertrainHint,
    techHint,
  };
}

function kindPrefixJa(kind: AutoJaKind): string {
  switch (kind) {
    case "RECALL":
      return "【リコール】";
    case "NEW_MODEL":
      return "【新型】";
    case "UPDATE":
      return "【UPDATE】";
    case "TECH":
      return "【TECH】";
    case "BUSINESS":
      return "【BUSINESS】";
    default:
      return "【NEWS】";
  }
}

function marketPrefixJa(marketJa?: string): string {
  return marketJa ? `【${marketJa}】` : "";
}

function safeMaker(maker?: string | null): string {
  return (maker ?? "").trim();
}

/**
 * 一覧で“日本語として読める”タイトルを生成。
 * 逐語訳ではなく「日本語の要約タイトル」を優先する。
 */
export function generateTitleJa(args: {
  title: string;
  summary?: string;
  maker?: string | null;
  kind: AutoJaKind;
}): string {
  const title = normalizeSpaces(args.title);
  if (!title) return "";
  if (hasJapanese(title)) return title;

  const maker = safeMaker(args.maker);
  const ex = buildExtracted(title, args.summary);
  const market = marketPrefixJa(ex.marketJa);
  const prefix = kindPrefixJa(args.kind);

  // パターンが取れる場合は、それを優先（自然な語順になりやすい）
  if (ex.model && ex.subject) {
    // 例: 【カナダ】【UPDATE】2026 Ram 1500で5.7L HEMI V8が受注可能に
    return `${market}${prefix}${ex.model}で${ex.subject}が選択可能に`;
  }

  if (ex.model && ex.year && ex.model.startsWith(ex.year)) {
    // 例: 【米国】【新型】2026 XXXXXX の公式発表
    const pt = ex.powertrainHint ? `（${ex.powertrainHint}）` : "";
    return `${market}${prefix}${ex.model}${pt}の公式更新`;
  }

  if (ex.model) {
    const pt = ex.powertrainHint ? `（${ex.powertrainHint}）` : "";
    return `${market}${prefix}${ex.model}${pt}の公式更新`;
  }

  // 最後の手段: メーカー + カテゴリだけでも日本語で出す
  if (maker) {
    return `${market}${prefix}${maker}の公式アップデート`;
  }

  // どうしても情報が少ない場合は、原題を残しつつ“日本語枠”で包む
  return `${market}${prefix}公式発表（原題: ${title}）`;
}

function clamp(text: string, maxChars: number): string {
  const t = normalizeSpaces(text);
  if (!t) return "";
  if (t.length <= maxChars) return t;
  return `${t.slice(0, Math.max(0, maxChars - 1))}…`;
}

/**
 * 詳細ページの「ニュース概要」に入れる、日本語の長め本文を生成。
 * 事実の追加はしない代わりに、確認ポイント・読み方を増やして文字量を確保する。
 */
export function generateOverviewJa(args: {
  titleJa: string; // 既に日本語化したタイトル（生成済み）
  originalTitle: string;
  originalSummary?: string;
  maker?: string | null;
  kind: AutoJaKind;
}): string {
  const maker = safeMaker(args.maker);
  const originalTitle = normalizeSpaces(args.originalTitle);
  const originalSummary = normalizeSpaces(args.originalSummary ?? "");
  const ex = buildExtracted(originalTitle, originalSummary);

  const headline = args.titleJa ? args.titleJa : originalTitle;
  const marketText = ex.marketJa ? ex.marketJa : "";
  const modelText = ex.model ? ex.model : maker ? maker : "";
  const subjectText = ex.subject ? ex.subject : "";

  // kind別に“文体”を変える（断定はしない）
  const kindIntro: Record<AutoJaKind, string> = {
    RECALL:
      "本ニュースは、リコール/サービスキャンペーン等の安全対応に関するメーカー公式の更新です。対象範囲（年式・型式・VIN等）と対応内容、手続き方法の案内が中心になります。",
    NEW_MODEL:
      "本ニュースは、新型/発表に関するメーカー公式の更新です。情報は段階的に公開されることが多いので、確定情報と続報前提の情報を切り分けて読むのが安全です。",
    UPDATE:
      "本ニュースは、仕様変更/ラインアップ更新などのメーカー公式アップデートです。適用条件（年式/グレード/地域）で内容が分かれることがあるため、まず“自分に関係する範囲”を切り出して読むのがポイントです。",
    BUSINESS:
      "本ニュースは、生産/供給/販売/価格など事業面のメーカー公式更新です。納期や装備構成に影響する可能性があるため、適用日と対象範囲の書き方を優先して確認すると整理しやすい内容です。",
    MOTORSPORT:
      "本ニュースは、モータースポーツ関連の公式更新です。市販車への技術還元やブランド戦略の文脈で読むと理解しやすい内容です。",
    EVENT:
      "本ニュースは、イベント/ショー等でのメーカー公式更新です。写真・仕様表など一次情報に当たり、確定情報と続報前提の情報を切り分けて読むのがポイントです。",
    AWARD:
      "本ニュースは、受賞/評価に関するメーカー公式更新です。評価軸（安全/環境/デザイン等）と対象モデルを確認し、自分の条件に合うか判断しましょう。",
    TECH:
      "本ニュースは、技術/機能アップデートに関するメーカー公式更新です。メリットは前提条件（地域・装備・使い方）で変わるため、適用対象と導入時期を優先して確認してください。",
    OTHER:
      "本ニュースは、メーカー公式の更新情報です。対象範囲・時期・費用（有償/無償）・手続き（予約/申込）の4点を拾うと、判断が速くなります。",
  };

  // tech hint は “言い切らずに意味だけ補足” する
  const techLine = ex.techHint
    ? `また、本文に「${ex.techHint}」のようなキーワードが出てくる場合は、適用条件（対象グレード/地域）やユーザーへの影響（費用・手続き）を合わせて確認すると読み違いが減ります。`
    : "";

  const p1 = (() => {
    const parts: string[] = [];
    parts.push("メーカー公式の一次情報（出典リンク）を起点に、要点を日本語で整理したニュースです。");
    if (marketText) parts.push(`対象市場は${marketText}。`);
    if (modelText) parts.push(`対象は${modelText}。`);
    if (subjectText) parts.push(`今回のトピックは「${subjectText}」です。`);
    return parts.join("");
  })();

  const p2 = kindIntro[args.kind];

  const p2b =
    "確認ポイントは、(1) 対象範囲（市場/年式/グレード）、(2) いつから（受注開始/適用日）、(3) ユーザーへの影響（費用/入庫要否/手続き）の3点です。まずこの3つを押さえてから原文に当たると、情報量が多いニュースでも迷いにくくなります。";

  const p3 = (() => {
    // “読み物”としての厚みを出す（断定せず、確認観点に落とす）
    switch (args.kind) {
      case "RECALL":
        return "リコール/キャンペーンは、同じ車名でも年式や地域で対象が分かれることが多いです。まずは車台番号（VIN）などで“自分の個体が対象か”を確認し、対応内容（無償/有償、所要時間、入庫要否）を把握してから動くと迷いが減ります。";
      case "NEW_MODEL":
        return "新型/発表ニュースは、最初に出る情報が“全部”ではないことがあります。受注開始やデリバリー時期、グレード構成、価格表記（オプション込み/別）など、購入判断に直結する項目から先に拾っていくと比較がスムーズです。";
      case "UPDATE":
        return "仕様変更/アップデートは、モデルイヤー境界や装備パッケージ差で内容が分岐しやすい領域です。既存オーナーは“自分の車に適用されるのか”を、購入検討者は“どの年式から差が付くのか”を意識して読むと判断が早くなります。";
      case "BUSINESS":
        return "事業・供給・価格のニュースは、納期や装備構成、値引き環境に影響することがあります。短期の相場観よりも、数か月先の条件変化を読む材料として使うと、実務的に役に立ちます。";
      case "TECH":
        return "技術ニュースは、メリットが“前提条件”で変わることがあります。対象モデル/地域/導入時期と、ユーザー側に必要な条件（装備要件・通信要件など）が明記されているかを確認してから受け取ると安全です。";
      default:
        return "公式ニュースは企業目線の表現になりやすいので、読む側は『対象範囲』『時期』『費用』『手続き』に翻訳して受け取ると、迷いが減ります。";
    }
  })();

  const p4 = techLine ? techLine : "";

  const p5 =
    "最終的な条件（対象範囲・適用日・グレード/地域差）は公式リンク先が正です。気になる場合は、リンク先のFAQや問い合わせ窓口の案内も併せて確認してください。";

  // “概要”は読み物寄りにしたいので、原文サマリーの直接引用は基本しない（日本語ページ崩れ防止）
  return [p1, "", p2, "", p2b, "", p3, "", p4, p5]
    .filter((v) => v && v.trim().length > 0)
    .join("\n")
    .trim();
}

export function buildSeoDescriptionJa(overviewJa: string): string {
  // メタ向けに 140〜160字程度に収める
  const base = overviewJa.replace(/\s+/g, " ").trim();
  return clamp(base, 155);
}
