// components/guide/GuideMonetizeBlock.tsx
"use client";

import Link from "next/link";

import { GlassCard } from "@/components/GlassCard";
import { Reveal } from "@/components/animation/Reveal";
import { Button } from "@/components/ui/button";
import globalAffiliateLinks from "@/data/affiliateLinks.json";

type AffiliateLinksMap = Record<string, string>;

type GuideMonetizeBlockProps = {
  monetizeKey?: string | null;
  /**
   * guidesX.json 側で個別に上書きしたい場合の「論理名 → URL」マップ
   * ここに何も入っていない場合でも、globalAffiliateLinks 側が使われる
   */
  affiliateLinks?: AffiliateLinksMap | null;
};

type MonetizeConfig = {
  heading: string;
  body: string[];
  primaryCta: {
    label: string;
    href?: string;
  };
};

/**
 * Amazon リンクにトラッキングIDが入っていなければ付与する
 * - すでに tag= が入っている場合はそのまま
 * - そうでなければ ? / & を見て追記
 */
function ensureAmazonTag(url: string): string {
  const TRACKING_ID = "carboutique-22";

  if (!url.includes("amazon.")) {
    return url;
  }
  if (url.includes("tag=")) {
    return url;
  }

  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}tag=${TRACKING_ID}`;
}

/**
 * GUIDE 詳細ページ専用のマネタイズブロック。
 *
 * - guide.monetizeKey に応じて、見出し・本文・CTA ボタンを出し分ける
 * - globalAffiliateLinks(JSON) + guide.affiliateLinks をマージして URL を解決
 * - Amazon 商品リンクは足りなければここで tag=carboutique-22 を補完
 */
export function GuideMonetizeBlock(props: GuideMonetizeBlockProps) {
  const { monetizeKey, affiliateLinks } = props;

  if (!monetizeKey) {
    return null;
  }

  const mergedLinks: AffiliateLinksMap = {
    ...(globalAffiliateLinks as AffiliateLinksMap),
    ...(affiliateLinks ?? {}),
  };

  const config = resolveMonetizeConfig(monetizeKey, mergedLinks);

  if (!config || !config.primaryCta?.href) {
    return null;
  }

  return (
    <Reveal delay={80}>
      <section
        aria-label="このガイドに関連するサービス・アイテム案内"
        className="mt-10"
      >
        <GlassCard
          padding="lg"
          magnetic={false}
          className="border border-slate-100/80 bg-white/80 shadow-soft-card"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2.5 md:max-w-[70%]">
              <p className="text-[10px] font-semibold tracking-[0.22em] text-slate-400">
                NEXT ACTION
              </p>
              <h2 className="font-serif text-[15px] font-semibold tracking-tight text-slate-900 sm:text-[16px]">
                {config.heading}
              </h2>
              {config.body.map((paragraph) => (
                <p
                  key={paragraph}
                  className="text-[11px] leading-relaxed text-slate-600 sm:text-[13px]"
                >
                  {paragraph}
                </p>
              ))}
              <p className="pt-1 text-[10px] leading-relaxed text-slate-400">
                ※ リンク先は外部サイトです。条件や手数料・注意事項などの最新情報は、
                必ず各サービスの公式ページでご確認ください。
              </p>
            </div>

            <div className="shrink-0 md:text-right">
              <Button
                asChild
                size="lg"
                className="mt-2 w-full rounded-xl text-[11px] font-semibold tracking-[0.12em] sm:w-auto"
              >
                <Link href={config.primaryCta.href}>
                  {config.primaryCta.label}
                </Link>
              </Button>
            </div>
          </div>
        </GlassCard>
      </section>
    </Reveal>
  );
}

function resolveMonetizeConfig(
  monetizeKey: string,
  links: AffiliateLinksMap,
): MonetizeConfig | null {
  switch (monetizeKey) {
    // ─── Aピラー: 売却系 ────────────────────────────────
    case "sell_basic_checklist":
      return {
        heading: "車を高く・スムーズに売るための「サービス選び」の型",
        body: [
          "チェックリストで準備が見えてきたら、次は「どこに査定を出すか」です。ディーラー下取りだけで決めてしまうと、相場より安く手放してしまうケースも少なくありません。",
          "まずは一括査定でざっくり相場感をつかみつつ、条件の合う買取店や下取り条件を比べるのが、無理なく高く売るための現実的なやり方です。",
        ],
        primaryCta: {
          label: "一括査定サービスで買取相場をまとめて見る",
          href: links.carSellIkkatsuUrl,
        },
      };

    case "sell_import_highclass":
      return {
        heading: "輸入車・高級車に強い買取サービスをどう選ぶか",
        body: [
          "輸入車や高級車は、年式やグレード、オプション内容によって評価が大きく変わります。一般的な買取店だけで決めるより、輸入車やスポーツモデルに慣れた専門系サービスを混ぜて比較した方が、条件が伸びやすいジャンルです。",
          "複数の買取サービスに査定を出し、「輸入車に強いところ」「全国販路を持つところ」など特長の違いを見比べながら、納得感のある出口を選ぶのが安全です。",
        ],
        primaryCta: {
          label: "輸入車・高級車に強い買取サービスをまとめてチェック",
          href: links.carSellImportUrl,
        },
      };

    case "sell_timing":
      return {
        heading: "「売るか迷っている段階」で取っておきたい相場データ",
        body: [
          "タイミングを悩むときほど、机上のシミュレーションだけでなく「いま実際いくらで売れるか」の数字を一度取っておくと判断がしやすくなります。",
          "一括査定で相場を取っておけば、数ヶ月〜1年後に見直すときも「どれくらい価値が落ちたか」が見えやすくなり、乗り続けるか・手放すかの判断材料になります。",
        ],
        primaryCta: {
          label: "今の買取相場を一括査定でざっくり把握する",
          href: links.carSellIkkatsuUrl,
        },
      };

    case "sell_ikkatsu_phone":
      return {
        heading: "自分に合う“一括査定サービスのタイプ”を選ぶ",
        body: [
          "一括査定といっても、「少数社だけに送るタイプ」や「やり取りをメール中心にできるタイプ」など、サービスごとに性格が違います。",
          "電話の頻度を抑えたいなら、そのあたりの仕様を事前に確認したうえで、自分の許容度に合うサービスを選んで使うのが現実的です。",
        ],
        primaryCta: {
          label: "電話負担を抑えやすい一括査定サービスを比較する",
          href: links.carSellIkkatsuUrl,
        },
      };

    case "sell_loan_remain":
      return {
        heading: "ローン残債ありでも相談しやすい買取サービス",
        body: [
          "残債が残っている車でも、買取額と合わせて一括精算まで含めて手続きしてくれるサービスもあります。自分だけでローン会社とやり取りするより、慣れている窓口を通した方がスムーズに進むケースが多いです。",
          "「残クレ中だけど動けるのか」「追い金が必要になりそうか」など、この記事の内容を踏まえつつ、残債あり案件に慣れたサービスに一度相談してみると選択肢が整理しやすくなります。",
        ],
        primaryCta: {
          label: "ローン残債ありでも相談できる買取サービスを探す",
          href: links.carSellLoanRemainUrl,
        },
      };

    // ─── Bピラー: 保険・車検 ─────────────────────────
    case "insurance_compare_core":
      return {
        heading: "主要な自動車保険を一度に比較して「相場感」をつかむ",
        body: [
          "補償内容の型が決まったら、次は複数社の見積もりを横に並べて「いまの自分の条件だと、どのあたりが相場か」を確認するフェーズです。",
          "1社ずつ個別に見積もりを取るより、一括見積もりでざっと候補を出してから、気になる会社だけ詳しく比較していく方が、時間も手間も抑えやすくなります。",
        ],
        primaryCta: {
          label:
            "自動車保険を一括見積もりしてプランと保険料を比較する",
          href: links.insuranceCompareUrl,
        },
      };

    case "insurance_saving":
      return {
        heading: "補償を大きく削らずに「保険料だけ」を見直す第一歩",
        body: [
          "必要な補償ラインが整理できたら、その内容を前提に「同じような補償で、ほかの会社だといくらか」を比べるのが無理のないやり方です。",
          "一括見積もりなら、いまの補償条件をベースに複数社の見積もりを並べられるので、「どこを選べばバランスが良いか」が見えやすくなります。",
        ],
        primaryCta: {
          label: "今の補償内容のまま他社の保険料を一括比較する",
          href: links.insuranceCompareUrl,
        },
      };

    case "insurance_after_accident":
      return {
        heading: "事故後の保険見直しは「自己判断だけ」で決めない",
        body: [
          "一度事故を経験すると、次の更新で「補償を増やすべきか」「保険会社を変えるべきか」悩みがちです。ただ、ノウハウがない状態で一人で判断すると、過不足のある設計になりやすいのも事実です。",
          "事故対応や等級の影響も踏まえて、専門家に一度内容を見てもらったうえで、次の契約方針を決めると失敗しにくくなります。",
        ],
        primaryCta: {
          label:
            "事故後の補償内容や等級について専門家に相談してみる",
          href: links.insuranceConsultUrl,
        },
      };

    case "shaken_rakuten":
      return {
        heading: "楽天Car車検で「対応工場と概算費用」を先に押さえておく",
        body: [
          "この記事の内容を踏まえて、候補になる工場やディーラーが見えてきたら、実際に近くの対応店舗と概算費用を一度出してみると、具体的な比較がしやすくなります。",
          "楽天ポイント還元やクチコミも含めて見ておくと、「安さ重視」「安心重視」どちらの軸でも選びやすくなります。",
        ],
        primaryCta: {
          label: "楽天Car車検で近くの対応店舗と概算費用を確認する",
          href: links.shakenRakutenUrl,
        },
      };

    case "insurance_corporate":
      return {
        heading: "社用車・営業車の保険と車検をまとめて相談できる窓口",
        body: [
          "台数が増えてくると、1台ごとにバラバラの契約を続けるより、まとめて相談できる窓口を持っておいた方が、保険料と手間の両方を抑えやすくなります。",
          "フリート契約や法人向け特約など、個人契約とは違う選択肢も含めて提案してもらえると、「どこまでを社用車としてカバーするか」も整理しやすくなります。",
        ],
        primaryCta: {
          label:
            "法人・個人事業主向けの自動車保険を相談できる窓口を探す",
          href: links.insuranceBizConsultUrl,
        },
      };

    // ─── Cピラー: カー用品（Amazon想定） ────────────────
    case "goods_drive_recorder":
      return {
        heading: "用途別に絞り込んだドラレコ候補をチェックする",
        body: [
          "前後2カメラ・360度・ミラー型など、スペックだけ見ていると迷いやすいので、「自分の使い方」に合う候補をいくつかに絞ってから比較するのが現実的です。",
          "この記事で整理したポイントを踏まえて、日常使いに合いそうなモデルを中心に、実際のユーザーレビューもあわせて確認してみてください。",
        ],
        primaryCta: {
          label: "Amazonで前後2カメラなど人気ドラレコの候補を見る",
          href: ensureAmazonTag(links.amazonDriveRecorderUrl),
        },
      };

    case "goods_child_seat":
      return {
        heading: "年齢・車種別に合うチャイルドシート候補を確認する",
        body: [
          "年齢・身長・体重と、車側のシート形状の相性を踏まえて候補を絞ると、「届いたけど乗せづらい」「回転が使いにくい」といったミスマッチを減らせます。",
          "この記事で整理したタイプ別の考え方を前提に、対象年齢や取付方式（ISOFIX／シートベルト）を絞り込んで、具体的なモデルを比べてみてください。",
        ],
        primaryCta: {
          label: "Amazonで年齢別チャイルドシートの人気モデルをチェックする",
          href: ensureAmazonTag(links.amazonChildSeatUrl),
        },
      };

    case "goods_car_wash_coating":
      return {
        heading: "手洗い派向け「スターターセット」をまとめて選ぶ",
        body: [
          "中性シャンプー＋簡易コーティング＋クロス数枚という最低限のセットが揃っていると、「時間があるときにすぐ洗える」状態を作りやすくなります。",
          "この記事で整理した考え方をベースに、まずは扱いやすいアイテムから揃えて、無理なく続けられる組み合わせを見つけてみてください。",
        ],
        primaryCta: {
          label:
            "Amazonで洗車シャンプーと簡易コーティングのスターターセットを見る",
          href: ensureAmazonTag(links.amazonCarWashUrl),
        },
      };

    case "goods_interior_clean":
      return {
        heading: "布・レザー・樹脂に合う車内クリーナーをまとめて揃える",
        body: [
          "布シート・レザー・ダッシュボードなど、素材ごとに相性の良いクリーナーを一本ずつ持っておくと、「気になったときにすぐ簡単に掃除する」習慣を作りやすくなります。",
          "この記事で整理した素材別の考え方を踏まえて、日常使いしやすいクリーナーとブラシ・クロス類をまとめてチェックしてみてください。",
        ],
        primaryCta: {
          label:
            "Amazonで車内クリーナーと掃除グッズの定番セットを見る",
          href: ensureAmazonTag(links.amazonInteriorCleanUrl),
        },
      };

    case "goods_jump_starter":
      return {
        heading: "いざというときのジャンプスターター候補を1台決めておく",
        body: [
          "週末メインや青空駐車が多い使い方なら、バッテリー上がりに備えて1台ジャンプスターターを積んでおくと安心感が違います。",
          "この記事で整理した「対応排気量」「安全機能」などのポイントを前提に、自分の車に合う容量のモデルを候補から選んでみてください。",
        ],
        primaryCta: {
          label:
            "Amazonで対応排気量別ジャンプスターターの候補を見る",
          href: ensureAmazonTag(links.amazonJumpStarterUrl),
        },
      };

    default:
      return null;
  }
}
