// app/guide/page.tsx
// ────────────────────────────────────────────
// GUIDE 一覧ページ（実用系コンテンツのハブ）
//
// 役割:
//  - 「買い方・維持費・売却」などお金/段取り系ガイドの一覧ページ
//  - 上部は “世界観＋ガイドの位置づけ” を伝えるヒーロー＆ナビ
//  - 中央はテーマ別のBentoグリッド（静的な「入口」）
//  - 下部は実データから生成されるガイド一覧（検索/絞り込み/ソート対応）
//  - NEWS/COLUMN/CARS との役割分担を明示し、回遊の起点にする
//
// 今後の拡張前提:
//  - guideSections は手動定義→将来的に guides.json 側のメタ情報で自動生成してもよい
//  - GuideItem に level / isFeatured などを生やしたら、下部一覧の表示スタイルを変える想定
//  - NEWS/COLUMN/CARS とのクロスリンクを増やすときは、一番下のCTAブロックを拡張
// ────────────────────────────────────────────

import type { Metadata } from "next";
import Link from "next/link";

import { GlassCard } from "@/components/GlassCard";
import { Reveal } from "@/components/animation/Reveal";
import { GuideHubShortcutShelf } from "@/components/guide/GuideHubShortcutShelf";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/seo/JsonLd";
import { getSiteUrl } from "@/lib/site";
import { hasMeaningfulSearchParams } from "@/lib/seo/search-params";
import { NOINDEX_ROBOTS } from "@/lib/seo/robots";
import { GuideFilterForm, type GuideCategoryOption } from "@/components/guide/GuideFilterForm";
import { getAllGuides, type GuideItem } from "@/lib/guides";
import type { CanonicalGuideCategoryKey } from "@/lib/guides/canonical";


export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const title = "GUIDE｜買い方・維持費・保険・税金・売却の実用ガイド";
  const description =
    "買い方・売り方・維持費・保険・税金まで、迷わない順番で結論と手順を整理する実用ガイド集。比較表・チェックリスト・次の一手（申込/見積）まで繋げます。";
  const canonical = `${getSiteUrl()}/guide`;

  const hasParams = hasMeaningfulSearchParams(searchParams as any);

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "website",
      images: [`${getSiteUrl()}/ogp-default.jpg`],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${getSiteUrl()}/ogp-default.jpg`],
    },
    // NOTE: app/layout.tsx で `robots.googleBot` を指定しているため、
    // noindex は googleBot も明示的に noindex にする。
    robots: hasParams ? NOINDEX_ROBOTS : undefined,
  };
}


const PER_PAGE = 10;

// ────────────────────────────────────────────
// UI用の静的セクション定義（テーマ別入口）
// ────────────────────────────────────────────

type GuideTopic = {
  id: string;
  title: string;
  description: string;
  link?: string; // 紐づく実ガイドがある場合のみ
};

type GuideSection = {
  id: string;
  label: string;
  subLabel: string;
  description: string;
  icon: string;
  accent?: "default" | "tiffany" | "obsidian" | "glass";
  gridArea?: string;
  topics: GuideTopic[];
};

// 実ガイド記事へのリンク付きセクション（お金/売却/カー用品などのテーマ別入口）
const guideSections: GuideSection[] = [
  {
    id: "hubs",
    icon: "HUB",
    label: "まずはここから",
    subLabel: "HUB GUIDES",
    description:
      "収益導線の入口となるハブガイド（売却/保険/リース/カー用品）。該当テーマのGUIDEへまとめてアクセスできます。",
    accent: "tiffany",
    gridArea: "md:col-span-12 lg:col-span-12",
    topics: [
      {
        id: "hub-sell-price",
        title: "売却相場を把握する（まず見る数字）",
        description: "査定前に“相場”を掴んで判断を早くする",
        link: "/guide/hub-sell-price",
      },
      {
        id: "hub-sell-prepare",
        title: "査定前の準備（後悔しない段取り）",
        description: "比較前に整えるポイントと落とし穴",
        link: "/guide/hub-sell-prepare",
      },

{
  id: "hub-sell-compare",
  title: "比較の使い方（電話・条件・断り方）",
  description: "一括査定/買取比較で詰まらないための整理",
  link: "/guide/hub-sell-compare",
},
{
  id: "hub-sell-loan",
  title: "残債ありの手放し（名義・所有権）",
  description: "ローン/所有権で止まる所を先に片付ける",
  link: "/guide/hub-sell-loan",
},
{
  id: "hub-sell",
  title: "売却HUB（全体像から）",
  description: "迷いを減らすために、全体像と落とし穴を整理",
  link: "/guide/hub-sell",
},

      {
        id: "hub-insurance",
        title: "自動車保険の見直し（比較の前に）",
        description:
          "補償条件を揃えてから比較するための最短チェックリスト",
        link: "/guide/insurance",
      },
      {
        id: "hub-lease",
        title: "定額カーリースの選び方（条件の読み方）",
        description: "月額だけで選ばないための比較ポイント",
        link: "/guide/lease",
      },
      {
        id: "hub-maintenance",
        title: "メンテ用品の選び方（まず揃える定番）",
        description: "車内/洗車/冬の備えを“順番”で揃える",
        link: "/guide/maintenance",
      },
      {
        id: "hub-shaken",
        title: "車検（費用と流れ）",
        description: "相場・当日の流れ・落とし穴をまとめて把握する",
        link: "/guide/hub-shaken",
      },
      {
        id: "hub-consumables",
        title: "消耗品（タイヤ・バッテリー等）",
        description: "交換の目安と費用感を先に押さえて無駄を減らす",
        link: "/guide/hub-consumables",
      },
      {
        id: "hub-paperwork",
        title: "名義変更・必要書類",
        description: "書類で止まりやすい所を先に整理してスムーズに進める",
        link: "/guide/hub-paperwork",
      },
      {
        id: "hub-import-trouble",
        title: "輸入車（メンテ・故障の不安）",
        description: "症状別の優先順位と費用感の当たりを作る",
        link: "/guide/hub-import-trouble",
      },
      {
        id: "hub-sell",
        title: "売却・乗り換えの進め方（全体の流れ）",
        description: "下取り/買取/一括査定を比較する前に整理する",
        link: "/guide/hub-sell",
      },
    ],
  },
  {
    id: "featured",
    icon: "TOP10",
    label: "困ったときの基本10本",
    subLabel: "START HERE",
    description:
      "サイト初期は“まず10本”を強くするのが最短です。手続き/トラブル/消耗品で、詰まりやすい所から順に読むための入口。",
    accent: "tiffany",
    gridArea: "md:col-span-12 lg:col-span-12",
    topics: [
      {
        id: "featured-paperwork-futsuu",
        title: "【普通車】名義変更（移転登録）の必要書類",
        description: "売却・譲渡で止まらないための、順番つきチェックリスト",
        link: "/guide/meigi-henko-hitsuyou-shorui-futsuu",
      },
      {
        id: "featured-paperwork-kei",
        title: "【軽自動車】名義変更の必要書類",
        description: "軽自動車検査協会で詰まりやすい所だけ先に潰す",
        link: "/guide/meigi-henko-hitsuyou-shorui-kei",
      },
      {
        id: "featured-address",
        title: "住所変更したら何をする？（車検証/ナンバー）",
        description: "引越し後に放置すると増える“追加書類”を先に整理",
        link: "/guide/jyuusho-henkou-shaken-shou",
      },
      {
        id: "featured-shako",
        title: "車庫証明の取り方（最短の順番）",
        description: "止まりやすいのは“使用承諾”。先に取ってから動く",
        link: "/guide/shako-shoumei-torikata",
      },
      {
        id: "featured-number",
        title: "ナンバー変更・希望ナンバーの流れ",
        description: "予約→交付→取付の段取り。抽選の有無で日数が変わる",
        link: "/guide/number-change-kibou-number-guide",
      },
      {
        id: "featured-engine",
        title: "エンジン警告灯が点灯したときの初動",
        description: "点滅は止める。点灯でも症状があるなら無理しない",
        link: "/guide/engine-check-light-first-response",
      },
      {
        id: "featured-overheat",
        title: "オーバーヒート・冷却水漏れの初動",
        description: "水を足す前に確認すべきこと。無理に走らない判断基準",
        link: "/guide/overheat-coolant-leak-guide",
      },
      {
        id: "featured-oil-leak",
        title: "オイル漏れの初動（見分け方と危険度）",
        description: "漏れた場所と量で危険度が変わる。写真を撮って判断材料に",
        link: "/guide/oil-leak-first-response",
      },
      {
        id: "featured-tire-cost",
        title: "タイヤ交換費用の相場と内訳",
        description: "価格差の理由は“サイズ/銘柄/工賃”。先に外せない条件を決める",
        link: "/guide/tire-replacement-cost-guide",
      },
      {
        id: "featured-oil-change",
        title: "オイル交換の頻度の目安（距離/期間/乗り方）",
        description: "乗り方で変わる。短距離・渋滞が多いほど早めが安全",
        link: "/guide/oil-change-frequency-guide",
      },
    ],
  },
  {
    id: "money",
    icon: "COST",
    label: "お金と維持費のこと",
    subLabel: "FINANCE & COST",
    description:
      "ローン 残価設定ローン 保険 税金など クルマにかかる費用の全体像を整理するためのガイド",
    accent: "tiffany",
    gridArea: "md:col-span-7 lg:col-span-7 lg:row-span-2",
    topics: [
      {
        id: "loan-or-lump-sum",
        title: "ローン or 一括 どちらが良いか考えるときの基準",
        description:
          "金利 返済期間 売却タイミングを比較しながら判断するときの基本チェックポイント",
        link: "/guide/loan-or-lump-sum",
      },
      {
        id: "maintenance-cost-simulation",
        title: "維持費シミュレーションの基本",
        description:
          "税金 保険 車検 タイヤなどを 月いくら の目安で把握するためのシンプルな考え方",
        link: "/guide/maintenance-cost-simulation",
      },
    ],
  },
  {
    id: "sell",
    icon: "SELL",
    label: "手放すときのポイント",
    subLabel: "SELLING",
    description:
      "乗り換えや売却を検討するときに確認しておきたい 査定 買取 下取りの違いや注意点を整理",
    accent: "obsidian",
    gridArea: "md:col-span-5 lg:col-span-5 lg:row-span-2",
    topics: [
      {
        id: "selling-without-rush",
        title: "急がず売るための段取り",
        description:
          "下取り 買取 個人売買の特徴とメリット デメリットを整理し スケジュールに余裕を持たせるための基本手順",
        link: "/guide/selling-without-rush",
      },
    ],
  },
  {
    id: "goods",
    icon: "GOODS",
    label: "カー用品・グッズの選び方",
    subLabel: "CAR GOODS & AMAZON",
    description:
      "ドラレコ チャイルドシート 洗車グッズなど 「最低限ここを見ておくと失敗しにくい」ポイントを整理したカー用品向けガイド",
    accent: "glass",
    gridArea: "md:col-span-12 lg:col-span-12",
    topics: [
      {
        id: "dashcam-basic",
        title: "ドラレコを選ぶときに外したくない3つのポイント",
        description:
          "前後カメラ 録画画質 取付方法 など ドラレコ選びで最低限チェックしておきたいポイントの整理",
        link: "/guide/drive-recorder-erabikata-amazon",
      },
      {
        id: "childseat-basic",
        title: "チャイルドシート選びの「安全＋使いやすさ」チェック",
        description:
          "適合年齢 ISOFIXの有無 取付けやすさ など 日常の使い勝手と安全性を両立させるための基本",
        link: "/guide/child-seat-erabikata-amazon",
      },
      {
        id: "washgoods-basic",
        title: "洗車グッズは何から揃える？最低限セットの考え方",
        description:
          "シャンプー クロス コーティング剤 など 「これだけあれば困らない」スタートセットの組み方",
        link: "/guide/sensha-coating-erabikata-amazon",
      },
    ],
  },
];

// 赤枠のカードは一覧から非表示（カードごと削除）
const hiddenGuideSectionIds = new Set(["hubs", "featured", "money", "sell", "goods"]);
const visibleGuideSections = guideSections.filter(
  (section) => !hiddenGuideSectionIds.has(section.id),
);

// ────────────────────────────────────────────
// searchParams / フィルタ関連ユーティリティ
// ────────────────────────────────────────────

type SearchParams = {
  q?: string | string[];
  category?: string | string[];
  tag?: string | string[];
  sort?: string | string[];
  page?: string | string[];
};

type PageProps = {
  searchParams?: SearchParams;
};

function formatDate(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${y}/${m}/${day}`;
}

const CATEGORY_ORDER: CanonicalGuideCategoryKey[] = [
  "MONEY",
  "BUY",
  "SELL",
  "INSURANCE",
  "LEASE",
  "GOODS",
  "MAINTENANCE",
  "TROUBLE",
  "DRIVING",
  "LIFE",
  "OTHER",
];

function mapGuideCategoryLabel(key: CanonicalGuideCategoryKey): string {
  switch (key) {
    case "MONEY":
      return "お金・維持費";
    case "BUY":
      return "購入計画";
    case "SELL":
      return "売却・乗り換え";
    case "INSURANCE":
      return "保険・補償";
    case "LEASE":
      return "リース・残価";
    case "GOODS":
      return "カー用品・パーツ";
    case "MAINTENANCE":
      return "メンテナンス";
    case "TROUBLE":
      return "トラブル";
    case "DRIVING":
      return "運転・ドライブ";
    case "LIFE":
      return "維持・生活";
    default:
      return "その他";
  }
}

function normalizeCategoryRaw(category?: GuideItem["category"] | null): string {
  return (category ?? "").toString().trim();
}

function inferCategoryFromText(
  guide: GuideItem & { tags?: unknown; summary?: unknown },
): CanonicalGuideCategoryKey {
  const title = (guide.title ?? "").toString();
  const summary = (guide.summary ?? "").toString();
  const tags = Array.isArray((guide as any).tags) ? ((guide as any).tags as unknown[]) : [];
  const tagText = tags
    .filter((t): t is string => typeof t === "string")
    .map((t) => t.trim())
    .filter(Boolean)
    .join(" ");

  const text = `${title} ${summary} ${tagText}`;

  if (/保険|補償|等級|車両保険/.test(text)) return "INSURANCE";
  if (/リース|残価|サブスク/.test(text)) return "LEASE";
  if (/売却|査定|買取|下取り|手放|一括査定|名義変更|ローン残債/.test(text)) return "SELL";
  if (/ローン|金利|維持費|税金|車検|コスト|支払い|月々/.test(text)) return "MONEY";
  if (/ドラレコ|チャイルドシート|タイヤ|バッテリー|洗車|用品|コーティング|パーツ/.test(text))
    return "GOODS";
  if (/オイル|点検|整備|メンテ/.test(text)) return "MAINTENANCE";
  if (/故障|トラブル|警告灯|事故|修理/.test(text)) return "TROUBLE";
  if (/運転|ドライブ|高速|雪道|駐車/.test(text)) return "DRIVING";
  if (/維持|所有|家族|生活|駐車場/.test(text)) return "LIFE";
  if (/購入|買う|見積|値引|納期/.test(text)) return "BUY";

  return "OTHER";
}

function getGuideCategoryKey(guide: GuideItem): CanonicalGuideCategoryKey {
  const raw = normalizeCategoryRaw(guide.category);
  if (!raw) return inferCategoryFromText(guide as any);

  // データ側の表記ゆれを “キー” に正規化
  switch (raw) {
    case "MONEY":
    case "MAINTENANCE_COST":
    case "維持費・コスト":
      return "MONEY";
    case "BUY":
    case "BUYING":
    case "購入ガイド":
      return "BUY";
    case "SELL":
    case "売却・査定":
      return "SELL";
    case "保険・補償":
      return "INSURANCE";
    case "カー用品・パーツ":
      return "GOODS";
    case "MAINTENANCE":
    case "メンテナンス":
      return "MAINTENANCE";
    case "TROUBLE":
      return "TROUBLE";
    case "DRIVING":
      return "DRIVING";
    case "LIFE":
    case "維持・所有":
      return "LIFE";
    default:
      // 未知カテゴリはテキストから推定して “その他” を減らす
      return inferCategoryFromText(guide as any);
  }
}

function parseCategoryParam(value: string): CanonicalGuideCategoryKey | "" {
  const v = (value ?? "").trim();
  if (!v) return "";
  const upper = v.toUpperCase();
  const direct = CATEGORY_ORDER.find((k) => k === upper);
  if (direct) return direct;

  // 旧URL互換（日本語カテゴリや古いキー）
  switch (v) {
    case "保険・補償":
      return "INSURANCE";
    case "売却・査定":
      return "SELL";
    case "カー用品・パーツ":
      return "GOODS";
    case "維持費・コスト":
      return "MONEY";
    case "購入ガイド":
      return "BUY";
    case "メンテナンス":
      return "MAINTENANCE";
    case "維持・所有":
      return "LIFE";
    default:
      return "OTHER";
  }
}

function normalize(value: string | undefined | null): string {
  return (value ?? "").trim().toLowerCase();
}

function toSingle(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

function getGuideTimestamp(guide: GuideItem): number {
  if (guide.publishedAt) {
    const t = new Date(guide.publishedAt).getTime();
    if (!Number.isNaN(t)) return t;
  }
  if (guide.updatedAt) {
    const t = new Date(guide.updatedAt).getTime();
    if (!Number.isNaN(t)) return t;
  }
  return 0;
}

function getGuidePrimaryDate(guide: GuideItem): string | null {
  if (guide.publishedAt) return guide.publishedAt;
  if (guide.updatedAt) return guide.updatedAt;
  return null;
}

type QueryParams = {
  q?: string;
  category?: string;
  tag?: string;
  sort?: string;
  page?: string;
};

function buildQueryString(params: QueryParams) {
  const sp = new URLSearchParams();

  if (params.q) sp.set("q", params.q);
  if (params.category) sp.set("category", params.category);
  if (params.tag) sp.set("tag", params.tag);
  if (params.sort && params.sort !== "newest") sp.set("sort", params.sort);
  if (params.page && params.page !== "1") sp.set("page", params.page);

  const qs = sp.toString();
  return qs ? `?${qs}` : "";
}

type PaginationToken = number | "ellipsis";

function buildPaginationTokens(current: number, max: number): PaginationToken[] {
  if (max <= 1) return [1];

  // Mobile-friendly pagination:
  // - Always show 1 and max
  // - Show a small window around current
  // - Use ellipsis when there is a gap
  const delta = 1;
  const candidates: number[] = [];
  for (let p = 1; p <= max; p++) {
    if (p === 1 || p === max || (p >= current - delta && p <= current + delta)) {
      candidates.push(p);
    }
  }

  const tokens: PaginationToken[] = [];
  let last: number | null = null;
  for (const p of candidates) {
    if (last !== null) {
      const diff = p - last;
      if (diff === 2) {
        tokens.push(last + 1);
      } else if (diff > 2) {
        tokens.push("ellipsis");
      }
    }
    tokens.push(p);
    last = p;
  }

  return tokens;
}

// ────────────────────────────────────────────
// Page
// ────────────────────────────────────────────

export default async function GuidePage({ searchParams }: PageProps) {
  const allGuides = await getAllGuides();

  const rawQ = toSingle(searchParams?.q);
  const q = normalize(rawQ);
  const categoryKeyFilter = parseCategoryParam(toSingle(searchParams?.category));
  const tagFilter = toSingle(searchParams?.tag).trim();
  const sortKey = toSingle(searchParams?.sort).trim() || "newest";
  const rawPage = toSingle(searchParams?.page);

  const totalGuides = allGuides.length;

  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "HOME",
        item: getSiteUrl(),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "GUIDE",
        item: `${getSiteUrl()}/guide`,
      },
    ],
  };

  const categoryCounts = new Map<CanonicalGuideCategoryKey, number>();
  allGuides.forEach((g) => {
    const k = getGuideCategoryKey(g);
    categoryCounts.set(k, (categoryCounts.get(k) ?? 0) + 1);
  });

  const categories = CATEGORY_ORDER.filter((k) => (categoryCounts.get(k) ?? 0) > 0);
  const categoryOptions: GuideCategoryOption[] = categories.map((k) => ({
    key: k,
    label: mapGuideCategoryLabel(k),
    count: categoryCounts.get(k) ?? 0,
  }));

  const tags = Array.from(
    new Set(
      allGuides.flatMap((g) => {
        const meta = g as GuideItem & { tags?: unknown };
        const arr = Array.isArray(meta.tags) ? meta.tags : [];
        return arr.filter((t): t is string => typeof t === "string" && t.trim().length > 0);
      }),
    ),
  ).sort((a, b) => a.localeCompare(b, "ja"));

  const tagCounts = new Map<string, number>();
  allGuides.forEach((g) => {
    const meta = g as GuideItem & { tags?: unknown };
    const arr = Array.isArray(meta.tags) ? meta.tags : [];
    arr.forEach((t) => {
      if (typeof t !== "string") return;
      const k = t.trim();
      if (!k) return;
      tagCounts.set(k, (tagCounts.get(k) ?? 0) + 1);
    });
  });

  const popularTags = Array.from(tagCounts.entries())
    .sort((a, b) => (b[1] - a[1]) || a[0].localeCompare(b[0], "ja"))
    .slice(0, 8)
    .map(([tag]) => tag);

  const filteredGuides = allGuides.filter((guide) => {
    if (q) {
      const meta = guide as GuideItem & { tags?: string[] | null; body?: string | null };
      const haystack = [
        guide.title,
        guide.summary ?? "",
        meta.body ?? "",
        (meta.tags ?? []).join(" "),
        mapGuideCategoryLabel(getGuideCategoryKey(guide)),
      ]
        .join(" ")
        .toLowerCase();

      if (!haystack.includes(q)) return false;
    }

    if (categoryKeyFilter && getGuideCategoryKey(guide) !== categoryKeyFilter) return false;

    if (tagFilter) {
      const meta = guide as GuideItem & { tags?: string[] | null };
      if (!(meta.tags ?? []).includes(tagFilter)) return false;
    }

    return true;
  });

  const sortedGuides = [...filteredGuides].sort((a, b) => {
    if (sortKey === "oldest") return getGuideTimestamp(a) - getGuideTimestamp(b);
    if (sortKey === "title") return a.title.localeCompare(b.title, "ja");
    if (sortKey === "category") {
      const ca = mapGuideCategoryLabel(getGuideCategoryKey(a));
      const cb = mapGuideCategoryLabel(getGuideCategoryKey(b));
      const diff = ca.localeCompare(cb, "ja");
      if (diff !== 0) return diff;
      return getGuideTimestamp(b) - getGuideTimestamp(a);
    }
    return getGuideTimestamp(b) - getGuideTimestamp(a);
  });

  const filteredCount = sortedGuides.length;
  const hasFilter =
    Boolean(q) || Boolean(categoryKeyFilter) || Boolean(tagFilter) || sortKey !== "newest";

  const requestedPage = Number(rawPage || "1") || 1;
  const totalFiltered = filteredCount;
  const maxPage = totalFiltered === 0 ? 1 : Math.max(1, Math.ceil(totalFiltered / PER_PAGE));
  const currentPage =
    requestedPage < 1 ? 1 : requestedPage > maxPage ? maxPage : requestedPage;

  const startIndex = (currentPage - 1) * PER_PAGE;
  const pageGuides = sortedGuides.slice(startIndex, startIndex + PER_PAGE);

  const baseQuery: QueryParams = {
    q: rawQ || undefined,
    category: categoryKeyFilter || undefined,
    tag: tagFilter || undefined,
    sort: sortKey !== "newest" ? sortKey : undefined,
  };

  const paginationTokens = buildPaginationTokens(currentPage, maxPage);

  return (
    <main className="min-h-screen bg-site text-text-main">
      <JsonLd id="jsonld-guide-index-breadcrumb" data={breadcrumbData} />
      <div className="container relative max-w-7xl pb-28 pt-24">
        {/* パンくず */}
        <nav aria-label="パンくずリスト" className="mb-6 text-xs text-slate-500">
          <Link href="/" className="hover:text-slate-800">
            HOME
          </Link>
          <span className="mx-2">/</span>
          <span className="text-slate-400">GUIDE</span>
        </nav>

        {/* ── ページヘッダー ────────────────────────── */}
        <header className="mb-10 space-y-6 sm:mb-14 lg:mb-16">
          <Reveal>
            <div className="flex items-center gap-3">
              <span className="h-[1px] w-8 bg-tiffany-400" />
              <p className="text-[11px] font-bold uppercase tracking-[0.32em] text-tiffany-600">
                CAR BOUTIQUE GUIDE
              </p>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <h1 className="serif-heading text-4xl font-medium leading-[1.1] text-slate-900 sm:text-5xl lg:text-[3.25rem]">
              GUIDE
            </h1>
          </Reveal>

          <Reveal delay={200}>
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <p className="max-w-xl text-xs font-medium leading-loose text-text-sub sm:text-sm">
                迷いを減らすための判断基準と手順を、短く整理
              </p>

              <div className="flex flex-col items-start gap-3 text-[11px] sm:items-end">
                <Link
                  href="/column"
                  className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-2 text-[11px] font-semibold tracking-[0.2em] text-slate-800 shadow-sm transition hover:border-tiffany-200 hover:bg-tiffany-50 hover:text-tiffany-700"
                >
                  VIEW COLUMNS
                </Link>
                <p className="max-w-xs text-[11px] leading-relaxed text-slate-500">
                  実際のトラブル事例や ブランド 技術の背景は COLUMN セクション側で補足
                </p>
              </div>
            </div>
          </Reveal>

          {/* GUIDE内ナビ */}
          <Reveal delay={260}>
            <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-white/70 bg-white/80 px-4 py-3 shadow-soft sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div className="flex flex-col gap-1 text-[11px] text-slate-500 sm:flex-row sm:items-center sm:gap-3">
                <span className="rounded-full bg-slate-50 px-2 py-0.5 text-slate-400">
                  GUIDE NAV
                </span>
                <span className="tracking-[0.12em]">
                  全 {totalGuides} 本中{" "}
                  <span className="font-semibold text-slate-800">{filteredCount}</span>{" "}
                  本を表示中
                </span>
              </div>

              <div className="flex flex-wrap gap-2 text-[11px]">
                {visibleGuideSections.map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1 tracking-[0.16em] text-slate-700 transition hover:bg-white hover:text-tiffany-700 hover:shadow-soft"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-tiffany-400" />
                    <span>{section.subLabel}</span>
                    <span className="text-[11px] text-slate-400">({section.topics.length})</span>
                  </a>
                ))}
              </div>
            </div>
          </Reveal>
        </header>

        {/* ── 迷ったら、このHUBから ─────────────────── */}
        <section className="mb-12">
          <GuideHubShortcutShelf
            title="迷ったら、このHUBから（読む順番固定）"
            links={[
              {
                href: "/guide/hub-usedcar",
                label: "中古車購入",
                description: "候補選び→失敗回避→総額の見通し",
                tone: "tiffany",
              },
              {
                href: "/guide/hub-loan",
                label: "ローン/支払い",
                description: "月々上限と条件を揃えて比較",
                tone: "slate",
              },
              {
                href: "/guide/insurance",
                label: "保険",
                description: "補償設計→比較→事故時の動き",
                tone: "cyan",
              },
              {
                href: "/guide/hub-sell",
                label: "売却",
                description: "準備→同条件で比較→タイミング",
                tone: "rose",
              },
            ]}
          />
        </section>

        {/* ── フィルタフォーム ───────────────────────── */}
        <section className="mb-12">
          <GuideFilterForm
            initialQ={rawQ}
            initialSort={sortKey || "newest"}
            initialCategory={categoryKeyFilter || ""}
            initialTag={tagFilter || ""}
            categories={categoryOptions}
            tags={tags}
            popularTags={popularTags}
          />
        </section>

        {/* ── Bento Grid: テーマ別入口 ───────────────────── */}
        <section className="grid auto-rows-min grid-cols-1 gap-4 md:grid-cols-12 md:gap-6 lg:gap-8">
          {visibleGuideSections.map((section, index) => {
            const delay = 320 + index * 120;

            const accentStyles: Record<NonNullable<GuideSection["accent"]>, string> = {
              default: "bg-white/80 border-white/60",
              tiffany: "bg-gradient-to-br from-tiffany-50 to-white border-tiffany-100",
              obsidian: "bg-slate-900 border-slate-800 text-white",
              glass: "bg-white/40 backdrop-blur-md border-white/50",
            };

            const accent = section.accent ?? "default";
            const textMainColor = accent === "obsidian" ? "text-white" : "text-slate-900";
            const textSubColor = accent === "obsidian" ? "text-slate-300" : "text-text-sub";
            const iconText = (section.icon ?? "").toString().trim();
            const isWordIcon = iconText.length > 1;
            const iconClasses = isWordIcon
              ? "text-[72px] tracking-[0.18em] sm:text-[88px]"
              : "text-[120px] sm:text-[150px]";

            return (
              <div key={section.id} id={section.id} className={section.gridArea ?? "md:col-span-6"}>
                <Reveal delay={delay} className="h-full">
                  <GlassCard
                    as="article"
                    padding="none"
                    interactive
                    className={`group relative flex h-full flex-col justify-between overflow-hidden p-6 sm:p-8 transition-all duration-500 ${accentStyles[accent]}`}
                  >
                    <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                      <div className="absolute -right-24 -top-16 h-56 w-56 rounded-full bg-[radial-gradient(circle_at_center,_rgba(10,186,181,0.25),_transparent_65%)] blur-3xl" />
                    </div>

                    {iconText && (
                      <div
                        className={`pointer-events-none absolute -bottom-4 -right-4 select-none font-serif leading-none opacity-[0.05] ${iconClasses} ${textMainColor}`}
                      >
                        {iconText}
                      </div>
                    )}

                    <div className="relative z-10 space-y-4">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex flex-col">
                          <span
                            className={`text-[11px] font-bold uppercase tracking-[0.22em] ${
                              accent === "obsidian" ? "text-tiffany-300" : "text-tiffany-700"
                            }`}
                          >
                            {section.subLabel}
                          </span>
                          <h2 className={`mt-2 serif-heading text-xl font-medium sm:text-2xl ${textMainColor}`}>
                            {section.label}
                          </h2>
                        </div>

                        <span
                          className={`hidden rounded-full px-3 py-1 text-[11px] tracking-[0.16em] sm:inline-flex ${
                            accent === "obsidian" ? "bg-white/10 text-slate-100" : "bg-white/70 text-slate-600"
                          }`}
                        >
                          {section.topics.length} GUIDES
                        </span>
                      </div>

                      <p className={`max-w-md text-[11px] leading-relaxed ${textSubColor}`}>
                        {section.description}
                      </p>

                      {section.topics.length > 0 && (
                        <ul className="mt-4 space-y-3 text-[11px]">
                          {section.topics.map((topic, topicIndex) => (
                            <li key={topic.id} className="flex items-start gap-2">
                              <span
                                className={`mt-[7px] h-[3px] w-8 rounded-full ${
                                  accent === "obsidian" ? "bg-tiffany-400/80" : "bg-tiffany-300"
                                }`}
                              />
                              <div className="w-full">
                                {topic.link ? (
                                  <Link href={topic.link} className="group/link block">
                                    <div className="space-y-1">
                                      <div className="flex items-center gap-2">
                                        <span className="text-[11px] tracking-[0.18em] text-slate-400">
                                          STEP {topicIndex + 1}
                                        </span>
                                        <span
                                          className={`text-[11px] ${
                                            accent === "obsidian" ? "text-tiffany-300" : "text-tiffany-500"
                                          }`}
                                        >
                                          → READ GUIDE
                                        </span>
                                      </div>

                                      <p
                                        className={`font-semibold ${
                                          accent === "obsidian" ? "text-slate-50" : "text-slate-800"
                                        }`}
                                      >
                                        {topic.title}
                                      </p>

                                      <p
                                        className={`text-[11px] leading-relaxed ${
                                          accent === "obsidian" ? "text-slate-300" : "text-text-sub"
                                        }`}
                                      >
                                        {topic.description}
                                      </p>

                                      <div className="h-[1px] w-full origin-left scale-x-0 bg-tiffany-400 transition-transform duration-300 group-hover/link:scale-x-100" />
                                    </div>
                                  </Link>
                                ) : (
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <span className="text-[11px] tracking-[0.18em] text-slate-400">
                                        STEP {topicIndex + 1}
                                      </span>
                                    </div>
                                    <p
                                      className={`font-semibold ${
                                        accent === "obsidian" ? "text-slate-50" : "text-slate-800"
                                      }`}
                                    >
                                      {topic.title}
                                    </p>
                                    <p
                                      className={`text-[11px] leading-relaxed ${
                                        accent === "obsidian" ? "text-slate-300" : "text-text-sub"
                                      }`}
                                    >
                                      {topic.description}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </GlassCard>
                </Reveal>
              </div>
            );
          })}
        </section>

        {/* ── 実ガイド一覧 ─────────────────────────── */}
        <section className="mt-16 sm:mt-20">
          <Reveal delay={640}>
            <div className="mb-4 flex flex-wrap items-baseline justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold tracking-[0.22em] text-slate-500">GUIDE INDEX</p>
                <h2 className="serif-heading mt-2 text-lg text-slate-900 sm:text-xl">
                  すべての実用ガイド一覧
                </h2>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-500 sm:text-xs">
                公開日の新しい順に並んでいます 気になるテーマを選んでください
              </p>
            </div>
          </Reveal>

          {sortedGuides.length === 0 ? (
            <Reveal delay={680}>
              <div className="rounded-2xl border border-slate-100 bg-white/80 px-4 py-6 text-[11px] text-slate-500">
                現在公開中のガイドはなし 今後追加予定
              </div>
            </Reveal>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                {pageGuides.map((guide, index) => {
                  const primaryDate = getGuidePrimaryDate(guide);
                  return (
                    <Reveal key={guide.id} delay={680 + index * 40}>
                      <Link href={`/guide/${encodeURIComponent(guide.slug)}`}>
                        <GlassCard className="group h-full border border-slate-200/80 bg-gradient-to-br from-vapor/80 via-white/95 to-white/90 p-4 text-xs shadow-soft transition hover:-translate-y-[1px] hover:border-tiffany-100 hover:shadow-soft-card sm:p-5">
                          <div className="mb-2 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                            <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1">
                              {mapGuideCategoryLabel(getGuideCategoryKey(guide))}
                            </span>
                            {primaryDate && (
                              <span className="ml-auto text-[11px] text-slate-400">
                                {formatDate(primaryDate)}
                              </span>
                            )}
                          </div>

                          <h3 className="line-clamp-2 text-[14px] font-semibold leading-relaxed text-slate-900 group-hover:text-tiffany-700">
                            {guide.title}
                          </h3>

                          {guide.summary && (
                            <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-text-sub">
                              {guide.summary}
                            </p>
                          )}
                        </GlassCard>
                      </Link>
                    </Reveal>
                  );
                })}
              </div>

              {/* ページネーション */}
              {totalFiltered > 0 && maxPage > 1 && (
                <div className="mt-8 flex justify-center">
                  <nav
                    className="max-w-full overflow-x-auto inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/90 px-3 py-1.5 text-[11px] shadow-soft"
                    aria-label="GUIDE pagination"
                  >
                    <Link
                      href={`/guide${buildQueryString({
                        ...baseQuery,
                        page: String(currentPage > 1 ? currentPage - 1 : currentPage),
                      })}`}
                      rel="nofollow"
                      aria-disabled={currentPage === 1}
                      className={
                        currentPage === 1
                          ? "cursor-default rounded-full px-3 py-1 text-slate-400"
                          : "rounded-full px-3 py-1 text-slate-700 hover:bg-slate-50"
                      }
                    >
                      ← PREV
                    </Link>

                    {paginationTokens.map((token, idx) => {
                      if (token === "ellipsis") {
                        return (
                          <span
                            key={`ellipsis-${idx}`}
                            className="px-1 text-slate-400"
                            aria-hidden="true"
                          >
                            …
                          </span>
                        );
                      }

                      const page = token;
                      const isActive = page === currentPage;
                      return (
                        <Link
                          key={page}
                          href={`/guide${buildQueryString({ ...baseQuery, page: String(page) })}`}
                          rel="nofollow"
                          className={
                            isActive
                              ? "min-w-[32px] rounded-full bg-slate-900 px-2 py-1 text-center text-white"
                              : "min-w-[32px] rounded-full px-2 py-1 text-center text-slate-700 hover:bg-slate-50"
                          }
                        >
                          {page}
                        </Link>
                      );
                    })}

                    <Link
                      href={`/guide${buildQueryString({
                        ...baseQuery,
                        page: String(currentPage < maxPage ? currentPage + 1 : currentPage),
                      })}`}
                      rel="nofollow"
                      aria-disabled={currentPage === maxPage}
                      className={
                        currentPage === maxPage
                          ? "cursor-default rounded-full px-3 py-1 text-slate-400"
                          : "rounded-full px-3 py-1 text-slate-700 hover:bg-slate-50"
                      }
                    >
                      NEXT →
                    </Link>
                  </nav>
                </div>
              )}
            </>
          )}
        </section>

        {/* ── 下部CTA ─────────────────────────────── */}
        <section className="mt-24 lg:mt-28">
          <Reveal delay={800}>
            <div className="relative overflow-hidden rounded-3xl bg-slate-900 px-6 py-12 text-center shadow-soft sm:px-12 sm:py-16">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(10,186,181,0.36),_transparent_60%),radial-gradient(circle_at_bottom_left,_rgba(15,23,42,0.85),_transparent_65%)]" />
              <div className="absolute inset-0 bg-[url('/images/noise.png')] opacity-[0.04]" />

              <div className="relative z-10 flex flex-col items-center">
                <span className="mb-4 inline-block rounded-full bg-white/10 px-4 py-1.5 text-[11px] font-bold tracking-[0.2em] text-tiffany-300 backdrop-blur-sm">
                  INFORMATION
                </span>
                <h3 className="serif-heading mb-6 text-2xl text-white sm:text-3xl">
                  ガイドと COLUMN CARS の関係
                </h3>

                <div className="flex flex-wrap justify-center gap-4">
                  <Link
                    href="/cars"
                    className="inline-flex min-w-[160px] items-center justify-center rounded-full bg-white px-6 py-3 text-[11px] font-semibold tracking-[0.18em] text-slate-900 transition hover:bg-tiffany-50 hover:text-tiffany-800"
                  >
                    CAR DATABASE
                  </Link>

                  <Link
                    href="/column"
                    className="inline-flex min-w-[160px] items-center justify-center rounded-full border border-white/30 bg-white/5 px-6 py-3 text-[11px] font-semibold tracking-[0.18em] text-slate-100 backdrop-blur-sm transition hover:bg-white/10"
                  >
                    READ COLUMNS
                  </Link>

                </div>
              </div>
            </div>
          </Reveal>
        </section>
      </div>
    </main>
  );
}
