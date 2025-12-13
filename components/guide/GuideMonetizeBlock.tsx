"use client";

import Link from "next/link";

import { GlassCard } from "@/components/GlassCard";
import { Reveal } from "@/components/animation/Reveal";
import { Button } from "@/components/ui/button";
import { trackOutbound } from "@/lib/gtag";

import type { AffiliateLinksMap } from "@/lib/affiliate";

type GuideMonetizeBlockProps = {
  monetizeKey?: string | null;
  /**
   * 解決レイヤー（/lib/affiliate.ts）で生成した「論理名 → URL」マップ
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

const AFFILIATE_ENV =
  (process.env.NEXT_PUBLIC_AFFILIATE_ENV ?? "demo").toLowerCase();
const IS_PROD = AFFILIATE_ENV === "prod";

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

/**
 * Amazon リンクにトラッキングIDが入っていなければ付与する
 * - すでに tag= が入っている場合はそのまま
 * - そうでなければ ? / & を見て追記
 */
function ensureAmazonTag(url: string): string {
  const TRACKING_ID = process.env.NEXT_PUBLIC_AMAZON_TAG ?? "carboutique-22";

  if (!url.includes("amazon.")) return url;
  if (url.includes("tag=")) return url;

  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}tag=${TRACKING_ID}`;
}

export function GuideMonetizeBlock(props: GuideMonetizeBlockProps) {
  const { monetizeKey, affiliateLinks } = props;

  if (!isNonEmptyString(monetizeKey)) return null;

  const links = affiliateLinks ?? null;
  const config = links ? resolveMonetizeConfig(monetizeKey, links) : null;

  if (!config || !isNonEmptyString(config.primaryCta?.href)) return null;

  const rel = "nofollow sponsored noopener";

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
            <span aria-label="PR" className="inline-flex w-fit rounded-full border border-slate-200 bg-white/70 px-2 py-0.5 text-[10px] tracking-wide text-slate-600">PR</span>
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

              {!IS_PROD && (
                <p className="text-[10px] leading-relaxed text-slate-400">
                  ※ 現在はデモ用リンクが含まれる場合があります（本番切替は環境変数で制御）。
                </p>
              )}
            </div>

            <div className="shrink-0 md:text-right">
              <Button
                onClick={() => {
                  const href = config.primaryCta.href;
                  const partner =
                    monetizeKey === "lease_sompo_noru"
                      ? "sompo_noru"
                      : monetizeKey.startsWith("insurance_")
                        ? "insweb"
                        : monetizeKey.startsWith("goods_")
                          ? "amazon"
                          : "outbound";

                  trackOutbound({
                    event: "outbound_click",
                    partner,
                    href,
                    cta_position: "guide_monetize_block",
                  });
                }}
                asChild
                size="lg"
                className="mt-2 w-full rounded-xl text-[11px] font-semibold tracking-[0.12em] sm:w-auto"
              >
                <Link href={config.primaryCta.href} target="_blank" rel={rel}>
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
    // ─── Aピラー: 売却 ────────────────────────────────
    case "sell_basic_checklist":
      return {
        heading: "車を高く・スムーズに売るための「サービス選び」の型",
        body: [
          "準備が見えてきたら、次は「どこに査定を出すか」です。ディーラー下取りだけで決めると、相場より安く手放してしまうケースもあります。",
          "まずは一括査定で相場感をつかみ、条件の合う買取店を比較してから決めるのが現実的です。",
        ],
        primaryCta: {
          label: "一括査定で買取相場をまとめて見る",
          href: links.carSellIkkatsuUrl,
        },
      };

    case "sell_import_highclass":
      return {
        heading: "輸入車・高級車に強い買取サービスをどう選ぶか",
        body: [
          "輸入車はオプションや状態で評価が大きく変わります。専門性のある窓口を混ぜて比較する方が条件が伸びやすいジャンルです。",
          "全国販路や輸入車対応の強いサービスを含め、複数社で比較して納得できる出口を選ぶのが安全です。",
        ],
        primaryCta: {
          label: "輸入車に強い買取サービスをチェック",
          href: links.carSellImportUrl,
        },
      };

    case "sell_timing":
      return {
        heading: "「売るか迷っている段階」で取っておきたい相場データ",
        body: [
          "迷うときほど「今いくらで売れるか」の数字を一度取っておくと判断しやすくなります。",
          "一括査定で相場を取っておけば、後で見直すときも価値の変化が見えます。",
        ],
        primaryCta: {
          label: "今の買取相場を一括査定で把握する",
          href: links.carSellIkkatsuUrl,
        },
      };

    case "sell_loan_remain":
      return {
        heading: "ローン残債ありでも相談しやすい買取サービス",
        body: [
          "残債が残っていても、買取額と合わせて精算まで含めて対応してくれる窓口があります。",
          "残債案件に慣れたサービスに一度相談すると、手続きと選択肢が整理しやすくなります。",
        ],
        primaryCta: {
          label: "残債ありでも相談できる買取サービスを探す",
          href: links.carSellLoanRemainUrl,
        },
      };

    case "sell_ikkatsu_phone":
      return {
        heading: "電話を減らして、一括査定で相場を先に掴む",
        body: [
          "電話が気になる場合でも、まずは相場を把握してから次の動きを決めると判断が早くなります。",
          "一括査定で価格帯を押さえておけば、やり取りする相手を絞りやすくなります。",
        ],
        primaryCta: {
          label: "一括査定で買取相場をまとめて見る",
          href: links.carSellIkkatsuUrl,
        },
      };

    // ─── Bピラー: 保険・車検 ─────────────────────────
    case "insurance_compare_core":
      return {
        heading: "主要な自動車保険をまとめて比較して相場感をつかむ",
        body: [
          "補償の型が決まったら、複数社の見積もりを横並びにして相場を確認するのが次の段階です。",
          "一括見積もりで候補を出してから、気になる会社だけ詳しく比較していくと手間を抑えられます。",
        ],
        primaryCta: {
          label: "自動車保険を一括見積もりで比較する",
          href: links.insuranceCompareUrl,
        },
      };

    case "insurance_saving":
      return {
        heading: "補償を大きく削らずに保険料だけを見直す",
        body: [
          "必要な補償ラインを前提に「同等条件で他社はいくらか」を比べるのが無理のないやり方です。",
          "一括見積もりなら、条件を揃えた比較がしやすくなります。",
        ],
        primaryCta: {
          label: "同条件で他社保険料を一括比較する",
          href: links.insuranceCompareUrl,
        },
      };

    case "insurance_after_accident":
      return {
        heading: "事故後の保険見直しは一度相談して整理する",
        body: [
          "事故後は等級や補償の過不足で判断が難しくなりがちです。",
          "一度内容を見てもらい、次の契約方針を整理してから決めると失敗しにくくなります。",
        ],
        primaryCta: {
          label: "事故後の補償・等級について相談する",
          href: links.insuranceConsultUrl,
        },
      };

        case "lease_sompo_noru":
      return {
        heading: "月額で乗る選択肢を、いったん比較してみる",
        body: [
          "購入だけが正解ではありません。支出の見通しを立てるなら、月額定額のリースも比較対象に入れると判断がラクになります。",
          "まずは条件を見て、自分の生活コストに合うかどうかを確認してから検討しましょう。",
        ],
        primaryCta: {
          label: "SOMPOで乗ーる（定額カーリース）を見てみる",
          href: links.leaseSompoNoruUrl,
        },
      };

case "shaken_rakuten":
      return {
        heading: "楽天Car車検で対応店舗と概算費用を先に押さえる",
        body: [
          "候補が見えてきたら、対応店舗と概算費用を一度出すと比較が具体化します。",
          "ポイント還元やクチコミも含めて見ておくと選びやすくなります。",
        ],
        primaryCta: {
          label: "楽天Car車検で近くの店舗と費用を確認する",
          href: links.shakenRakutenUrl,
        },
      };

    case "insurance_corporate":
      return {
        heading: "社用車・営業車の保険をまとめて相談する",
        body: [
          "台数が増えるほど、まとめて相談できる窓口を持つと保険料と手間の両方を抑えやすくなります。",
          "法人向けの契約形態や特約も含めて整理してもらうと判断が早いです。",
        ],
        primaryCta: {
          label: "法人向け自動車保険を相談する",
          href: links.insuranceBizConsultUrl,
        },
      };

    // ─── Cピラー: カー用品（Amazon想定） ────────────────
    case "goods_drive_recorder":
      return {
        heading: "用途別に絞り込んだドラレコ候補をチェックする",
        body: [
          "前後2カメラ・360度・ミラー型など、使い方に合わせて候補を絞って比較するのが現実的です。",
          "レビューも含め、候補をざっと確認してみてください。",
        ],
        primaryCta: {
          label: "Amazonでドラレコ候補を見る",
          href: links.amazonDriveRecorderUrl
            ? ensureAmazonTag(links.amazonDriveRecorderUrl)
            : undefined,
        },
      };

    case "goods_child_seat":
      return {
        heading: "年齢・車種別に合うチャイルドシート候補を確認する",
        body: [
          "年齢と取付方式（ISOFIX等）で先に絞るとミスマッチを減らせます。",
          "対象年齢・方式を絞り込んで比較してみてください。",
        ],
        primaryCta: {
          label: "Amazonでチャイルドシート候補を見る",
          href: links.amazonChildSeatUrl
            ? ensureAmazonTag(links.amazonChildSeatUrl)
            : undefined,
        },
      };

    case "goods_car_wash_coating":
      return {
        heading: "手洗い派のスターターセットを揃える",
        body: [
          "中性シャンプー＋簡易コーティング＋クロス数枚の最低限があると続けやすいです。",
          "扱いやすいものから組み合わせを探してみてください。",
        ],
        primaryCta: {
          label: "Amazonで洗車・簡易コーティング候補を見る",
          href: links.amazonCarWashUrl
            ? ensureAmazonTag(links.amazonCarWashUrl)
            : undefined,
        },
      };

    case "goods_interior_clean":
      return {
        heading: "素材に合う車内クリーナーをまとめて揃える",
        body: [
          "布・レザー・樹脂で相性が違うので、日常使いしやすい定番を揃えると楽です。",
          "クリーナーとクロス類をまとめてチェックしてみてください。",
        ],
        primaryCta: {
          label: "Amazonで車内クリーナー候補を見る",
          href: links.amazonInteriorCleanUrl
            ? ensureAmazonTag(links.amazonInteriorCleanUrl)
            : undefined,
        },
      };

    case "goods_jump_starter":
      return {
        heading: "いざというときのジャンプスターターを1台決めておく",
        body: [
          "バッテリー上がり対策として、容量と安全機能を押さえて候補を絞るのがポイントです。",
          "自分の車に合う容量帯で比較してみてください。",
        ],
        primaryCta: {
          label: "Amazonでジャンプスターター候補を見る",
          href: links.amazonJumpStarterUrl
            ? ensureAmazonTag(links.amazonJumpStarterUrl)
            : undefined,
        },
      };

    default:
      return null;
  }
}
