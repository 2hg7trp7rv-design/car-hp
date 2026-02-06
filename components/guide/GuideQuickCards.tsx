import Link from "next/link";
import type { ReactNode } from "react";

import { GlassCard } from "@/components/GlassCard";

export type GuideQuickCard = {
  /** 対応する見出しへジャンプさせたい場合に使う */
  id?: string;
  /** 見出し（そのまま表示） */
  title: string;
  /** 箇条書き（最大4〜5個想定） */
  bullets: string[];
};

type CategoryKey =
  | "MONEY"
  | "BUY"
  | "SELL"
  | "INSURANCE"
  | "LEASE"
  | "GOODS"
  | "MAINTENANCE"
  | "TROUBLE"
  | "DRIVING"
  | "LIFE"
  | "OTHER";

type Props = {
  categoryKey: CategoryKey;
  /** ページ本文から抽出できた場合は、こちらを優先して表示 */
  cards?: GuideQuickCard[];
};

type Card = {
  label: string;
  points: string[];
};

function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/__(.+?)__/g, "$1")
    .replace(/`(.+?)`/g, "$1")
    .trim();
}

function renderBullet(text: string): ReactNode {
  const cleaned = stripMarkdown(text);

  // 例: "エンジン警告灯の初動：/guide/engine-check-light-first-response"
  const m = cleaned.match(/^(.+?)(?:：|:)\s*(\/(?:guide|cars|column|heritage)\/[\w\-./%]+)$/);
  if (m) {
    const label = m[1]?.trim() ?? cleaned;
    const href = m[2]?.trim() ?? "";
    return (
      <Link
        href={href}
        className="underline decoration-tiffany-400/80 underline-offset-2 hover:text-tiffany-700"
      >
        {label}
      </Link>
    );
  }

  return <span>{cleaned}</span>;
}

function buildCards(categoryKey: CategoryKey): Card[] {
  switch (categoryKey) {
    case "SELL":
      return [
        {
          label: "このガイドで決めること",
          points: [
            "売却（下取り / 買取 / 個人売買）の選び方",
            "動くタイミングの考え方",
            "査定前に揃える情報と準備",
          ],
        },
        {
          label: "まずやること",
          points: [
            "現状の相場をざっくり確認する",
            "必要書類が揃うか確認する",
            "候補を2〜3に絞って比較する",
          ],
        },
        {
          label: "よくある失敗",
          points: [
            "相場を知らずに1社だけで決める",
            "条件が揃っていない見積もりを比較する",
            "急いで決めてしまい、後で後悔する",
          ],
        },
      ];

    case "INSURANCE":
      return [
        {
          label: "このガイドで決めること",
          points: [
            "補償の土台（削らない範囲）",
            "比較するときの条件の揃え方",
            "見積もり結果の読み方",
          ],
        },
        {
          label: "まずやること",
          points: [
            "保険証券を手元に用意する",
            "運転者・使用目的を整理する",
            "同条件で相場を取って比較する",
          ],
        },
        {
          label: "よくある失敗",
          points: [
            "安さだけで決めて補償を削りすぎる",
            "条件が違う見積もりを並べて迷う",
            "更新直前に慌てて判断する",
          ],
        },
      ];

    case "LEASE":
      return [
        {
          label: "このガイドで決めること",
          points: [
            "月額の内訳（含まれる費用）",
            "契約年数と走行距離の前提",
            "途中解約・返却時の注意点",
          ],
        },
        {
          label: "まずやること",
          points: [
            "必要な車の使い方（距離/用途）を整理",
            "総支払額の目安も合わせて確認",
            "複数プランを同条件で比較",
          ],
        },
        {
          label: "よくある失敗",
          points: [
            "月額だけを見て判断する",
            "走行距離の前提が合わず追加負担",
            "返却時条件を見落とす",
          ],
        },
      ];

    case "GOODS":
      return [
        {
          label: "このガイドで決めること",
          points: [
            "最低限の条件（外したくない点）",
            "選び方の優先順位",
            "相場感と買い時",
          ],
        },
        {
          label: "まずやること",
          points: [
            "用途を1つに絞って要件を整理",
            "対応車種/取付可否を確認",
            "レビューは“欠点”中心に見る",
          ],
        },
        {
          label: "よくある失敗",
          points: [
            "機能を盛りすぎて高額化",
            "適合や取付方法の確認不足",
            "安さだけで選び直す",
          ],
        },
      ];

    default:
      return [
        {
          label: "このガイドで決めること",
          points: ["判断基準", "必要な手順", "次にやること"],
        },
        {
          label: "まずやること",
          points: ["現状を整理する", "条件を揃える", "候補を絞る"],
        },
        {
          label: "よくある失敗",
          points: ["情報を集めすぎて止まる", "条件が揃わないまま比較する", "急いで決める"],
        },
      ];
  }
}

export function GuideQuickCards({ categoryKey, cards }: Props) {
  const fallback = buildCards(categoryKey);

  const resolved: GuideQuickCard[] =
    cards && cards.length > 0
      ? cards
      : fallback.map((c) => ({
          title: c.label,
          bullets: c.points,
        }));

  return (
    <GlassCard
      variant="standard"
      magnetic={false}
      padding="none"
      className="border border-slate-200/70 bg-white/90 shadow-soft-card"
    >
      <div className="p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[10px] font-semibold tracking-[0.26em] text-slate-400">
            QUICK SUMMARY
          </p>
          <span className="hidden text-[10px] tracking-[0.18em] text-slate-400 sm:inline">
            迷わないための要点だけ
          </span>
        </div>

        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200/70 bg-slate-50/60">
          <div className="grid sm:grid-cols-3">
            {resolved.map((card, idx) => (
              <div
                key={`${card.title}-${idx}`}
                className={[
                  "p-4",
                  idx !== 0 ? "border-t border-slate-200/70 sm:border-l sm:border-t-0" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {(() => {
                  const parts = card.title.split(/[：:]/);
                  const hasSplit = parts.length >= 2 && (parts[0]?.trim().length ?? 0) <= 8;
                  const head = hasSplit ? (parts[0]?.trim() ?? card.title) : card.title;
                  const tail = hasSplit ? parts.slice(1).join(":").trim() : "";

                  const Title = (
                    <>
                      <span>{head}</span>
                      {tail ? (
                        <span className="mt-1 block text-[11px] font-normal tracking-normal text-slate-500">
                          {tail}
                        </span>
                      ) : null}
                    </>
                  );

                  return (
                    <h3 className="text-[12px] font-semibold tracking-[0.12em] text-slate-900">
                      {card.id ? (
                        <a
                          href={`#${card.id}`}
                          className="underline decoration-transparent underline-offset-4 hover:decoration-tiffany-400/80"
                        >
                          {Title}
                        </a>
                      ) : (
                        Title
                      )}
                    </h3>
                  );
                })()}
                <ul className="mt-2 space-y-1.5 text-[12px] leading-relaxed text-slate-700">
                  {card.bullets.map((p, i) => (
                    <li key={`${card.title}-${i}`} className="flex gap-2">
                      <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-tiffany-400" />
                      {renderBullet(p)}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
