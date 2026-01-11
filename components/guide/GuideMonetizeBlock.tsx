"use client";

import { useEffect, useMemo, useRef } from "react";
import Link from "next/link";

import { GlassCard } from "@/components/GlassCard";
import { Reveal } from "@/components/animation/Reveal";
import { Button } from "@/components/ui/button";

import {
  trackOutboundClick,
  trackCtaImpression,
  trackInternalNavClick,
  type PageType,
} from "@/lib/analytics/events";
import { usePageContext } from "@/lib/analytics/pageContext";
import { resolveAffiliateLinksForGuide } from "@/lib/affiliate";

// 既存の型定義を拡張して、ドット記法でアクセスできるようにする
type AffiliateLinksMap = Record<string, string> & {
  carSellIkkatsuUrl?: string;
  carSellImportUrl?: string;
  carSellLoanRemainUrl?: string;

  insuranceCompareUrl?: string;
  insuranceConsultUrl?: string;
  insuranceBizConsultUrl?: string;

  leaseSompoNoruUrl?: string;
  shakenRakutenUrl?: string;

  amazonDriveRecorderUrl?: string;
  amazonChildSeatUrl?: string;
  amazonCarWashUrl?: string;
  amazonInteriorCleanUrl?: string;
  amazonJumpStarterUrl?: string;

  // v1.2
  carSearchUrl?: string;
  loanCheckUrl?: string;
};

export type GuideMonetizeBlockProps = {
  monetizeKey?: string | null;
  affiliateLinks?: AffiliateLinksMap | null;

  // v1.2: 計測用
  position?: string; // 例: "guide_above_fold" / "guide_mid" / "guide_bottom"
  ctaId?: string; // 例: "guide_<slug>_<monetizeKey>_<position>"
  variant?: string; // ABテスト用など

  // v1.2: コンテキスト上書き（基本は usePageContext で自動）
  pageType?: PageType;
  contentId?: string;
};

type MonetizeConfig = {
  heading: string;
  body: string[];
  primaryCta: {
    label: string;
    href?: string;
  };
  partner?: string;
};

const AFFILIATE_ENV =
  (process.env.NEXT_PUBLIC_AFFILIATE_ENV ?? "demo").toLowerCase();
const IS_PROD = AFFILIATE_ENV === "prod";

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

/**
 * Amazon リンクにトラッキングIDが入っていなければ付与する
 */
function ensureAmazonTag(url: string): string {
  const TRACKING_ID = process.env.NEXT_PUBLIC_AMAZON_TAG ?? "carboutique-22";

  if (!url.includes("amazon.")) return url;
  if (url.includes("tag=")) return url;

  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}tag=${TRACKING_ID}`;
}

function isInternalHref(href: string): boolean {
  return href.startsWith("/") || href.startsWith("#");
}

export function GuideMonetizeBlock(props: GuideMonetizeBlockProps) {
  const {
    monetizeKey,
    affiliateLinks,
    position = "guide_article_body",
    ctaId,
    variant = "default",
    pageType,
    contentId,
  } = props;

  // 既定は pageContext から推定（hub/guide だけでなく全ページ型に対応）
  const ctx = usePageContext() as any;
  const page_type = (pageType ?? ctx.page_type ?? "other") as PageType;
  const content_id = String(contentId ?? ctx.content_id ?? "");

  // unknown / index / top を送らない（データ汚染回避）
  const canTrack =
    page_type !== "unknown" &&
    page_type !== "other" &&
    page_type !== "top" &&
    !!content_id &&
    content_id !== "unknown" &&
    content_id !== "index" &&
    content_id !== "top";

  if (!isNonEmptyString(monetizeKey)) {
    return null;
  }

  const mergedLinks = useMemo(() => {
    return (
      resolveAffiliateLinksForGuide({
        monetizeKey,
        affiliateLinks: (affiliateLinks ?? null) as any,
      }) ?? {}
    ) as AffiliateLinksMap;
  }, [monetizeKey, affiliateLinks]);

  const config = useMemo(() => {
    return resolveMonetizeConfig(monetizeKey, mergedLinks);
  }, [monetizeKey, mergedLinks]);

  const hrefRaw = config?.primaryCta?.href;
  if (!config || !isNonEmptyString(hrefRaw)) {
    return null;
  }

  const href = ensureAmazonTag(hrefRaw);

  const resolvedCtaId =
    isNonEmptyString(ctaId) ? ctaId : `${page_type}_${content_id}_${monetizeKey}_${position}`;

  // 外部リンク推奨 rel
  const rel = "nofollow sponsored noopener noreferrer";

  // Impression は「同一ページ×同一CTA」で1回だけ発火
  const impressedKeysRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    if (!canTrack) return;

    const key = `${content_id}::${page_type}::${resolvedCtaId}::${href}`;
    if (impressedKeysRef.current.has(key)) return;
    impressedKeysRef.current.add(key);

    trackCtaImpression({
      page_type,
      content_id,
      monetize_key: monetizeKey,
      cta_id: resolvedCtaId,
      position,
      variant,
    });
  }, [canTrack, content_id, page_type, monetizeKey, resolvedCtaId, href, position, variant]);

  const internal = isInternalHref(href);

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
            <span
              aria-label="PR"
              className="inline-flex w-fit rounded-full border border-slate-200 bg-white/70 px-2 py-0.5 text-[10px] tracking-wide text-slate-600"
            >
              PR
            </span>

            <div className="space-y-2.5 md:max-w-[70%]">
              <p className="text-[10px] font-semibold tracking-[0.22em] text-slate-400">
                NEXT ACTION
              </p>
              <h2 className="font-serif text-[15px] font-semibold tracking-tight text-slate-900 sm:text-[16px]">
                {config.heading}
              </h2>
              {config.body.map((paragraph, i) => (
                <p
                  key={i}
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
                asChild
                size="lg"
                className="mt-2 w-full rounded-xl text-[11px] font-semibold tracking-[0.12em] sm:w-auto"
              >
                <Link
                  href={href}
                  {...(!internal ? { target: "_blank", rel } : {})}
                  onClick={() => {
                    if (!canTrack) return;

                    if (internal) {
                      trackInternalNavClick({
                        from_type: page_type,
                        to_type: "hub",
                        from_id: content_id,
                        to_id: href,
                        cta_id: resolvedCtaId,
                        shelf_id: position,
                      });
                      return;
                    }

                    trackOutboundClick({
                      page_type,
                      content_id,
                      monetize_key: monetizeKey,
                      cta_id: resolvedCtaId,
                      position,
                      partner: config.partner,
                      url: href,
                      // 旧フィールド互換
                      cta_position: position,
                    });
                  }}
                >
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
    case "car_search_conditions":
      return {
        heading: "希望の条件で、まずは在庫があるかを確認する",
        body: [
          "欲しい車種が決まっていれば、まずは市場にどれくらいタマ数があるかを知るのが第一歩です。",
          "非公開在庫も含めて探せるサービスで、条件に合う個体が出てくるのを待つのも賢い手です。",
        ],
        primaryCta: {
          label: "条件を入力して在庫を確認する（無料）",
          href: links.carSearchUrl ?? links.carSellIkkatsuUrl,
        },
        partner: "car_search_general",
      };

    case "car_search_price":
      return {
        heading: "今の相場価格帯をチェックする",
        body: [
          "「安すぎる個体」には理由があります。まずは適正な相場を知ることで、失敗しない車選びができます。",
        ],
        primaryCta: {
          label: "現在の中古車相場を見る",
          href: links.carSearchUrl ?? links.carSellIkkatsuUrl,
        },
        partner: "car_search_general",
      };

    case "loan_estimate":
      return {
        heading: "月々の支払いイメージを具体的にする",
        body: [
          "金利や頭金によって、月々の支払額は大きく変わります。",
          "仮審査を通して「自分がいくらまで借りられるか」を知っておくと、車選びのブレがなくなります。",
        ],
        primaryCta: {
          label: "マイカーローンの仮審査・シミュレーション",
          href: links.loanCheckUrl ?? links.leaseSompoNoruUrl,
        },
        partner: "loan_general",
      };

    case "loan_precheck":
      return {
        heading: "マイカーローンの仮審査で予算を確定させる",
        body: [
          "欲しい車が見つかっても、ローンが通らなければ購入できません。",
          "先に仮審査を済ませておくと、いざという時にスムーズに購入手続きへ進めます。",
        ],
        primaryCta: {
          label: "マイカーローンの仮審査を申し込む",
          href: links.loanCheckUrl ?? links.leaseSompoNoruUrl,
        },
        partner: "loan_general",
      };

    case "sell_price_check":
      return {
        heading: "「今売ったらいくら？」相場だけ先に把握する",
        body: [
          "売るかどうか迷っている段階でも、今の価値を知っておくことは大切です。",
          "相場が分かれば、次の車への資金計画も立てやすくなります。",
        ],
        primaryCta: {
          label: "愛車の買取相場をチェックする",
          href: links.carSellIkkatsuUrl,
        },
        partner: "sell_ikkatsu",
      };

    case "sell_prepare":
      return {
        heading: "売却に必要な書類と手順を整理する",
        body: [
          "車を売るには印鑑証明書や納税証明書などが必要です。",
          "スムーズに手続きを進めるために、まずは買取店に相談して必要書類を確認しておきましょう。",
        ],
        primaryCta: {
          label: "買取店を比較して相談する",
          href: links.carSellIkkatsuUrl,
        },
        partner: "sell_ikkatsu",
      };

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
        partner: "sell_ikkatsu",
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
        partner: "sell_import",
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
        partner: "sell_ikkatsu",
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
        partner: "sell_loan",
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
        partner: "sell_ikkatsu",
      };

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
        partner: "insurance_compare",
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
        partner: "insurance_compare",
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
        partner: "insurance_consult",
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
        partner: "sompo_noru",
      };

    case "lease_enkilo":
      return {
        heading: "距離で支払うカーリース（エンキロ）を比較対象に入れる",
        body: [
          "走行距離が少ない人は、固定費を抑えやすい“距離連動”の発想が相性の良い場合があります。",
          "まずは料金体系と対象車種を確認し、普段の走り方で得かどうかを判断しましょう。",
        ],
        primaryCta: {
          label: "エンキロ（距離で支払うマイカーリース）を見てみる",
          href: links.leaseEnkiloUrl,
        },
        partner: "enkilo",
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
        partner: "shaken_rakuten",
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
        partner: "insurance_biz",
      };

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
        partner: "amazon",
      };

    case "goods_nagara_carwash":
      return {
        heading: "洗車が続く“道具”を揃える（ながら洗車）",
        body: [
          "洗車は“やり方”より、まず続けられる道具選びで差が出ます。",
          "自分の洗い方（時短 / こだわり）に合わせて、定番アイテムから揃えてみてください。",
        ],
        primaryCta: {
          label: "ながら洗車のアイテムを見る",
          href: links.goodsNagaraCarwashUrl,
        },
        partner: "nagara_carwash",
      };

    case "goods_carclub":
      return {
        heading: "カー用品をまとめて探す（CARCLUB）",
        body: [
          "ボディカバーや便利グッズは、用途に合う“ちょうどいい”を早く見つけた方が満足度が上がります。",
          "必要なものだけ、カテゴリで絞り込んで確認しましょう。",
        ],
        primaryCta: {
          label: "CARCLUBでカー用品を見る",
          href: links.goodsCarclubUrl,
        },
        partner: "carclub",
      };

    case "goods_hidya":
      return {
        heading: "LED/HIDライトは“適合”で失敗しない（HID屋）",
        body: [
          "ライト系はバルブ形状や年式差でミスしやすい分野です。",
          "まずは適合の考え方を押さえた上で、候補を比較して選びましょう。",
        ],
        primaryCta: {
          label: "HID屋でライト製品を見る",
          href: links.goodsHidyaUrl,
        },
        partner: "hidya",
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
        partner: "amazon",
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
        partner: "amazon",
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
        partner: "amazon",
      };

    case "goods_jump_starter":
    case "goods_jump_starter_beginner":
    case "goods_jump_starter_kei":
    case "goods_jump_starter_suv":
    case "goods_jump_starter_safety":
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
        partner: "amazon",
      };

    default:
      return null;
  }
}
