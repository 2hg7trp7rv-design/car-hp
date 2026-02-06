"use client";

import { useMemo, useState } from "react";
import { Reveal } from "@/components/animation/Reveal";
import { GlassCard } from "@/components/GlassCard";
import type { CanonicalGuideCategoryKey } from "@/lib/guides/canonical";

type KitBlock = {
  title: string;
  description: string;
  content: string;
};

type Props = {
  categoryKey: CanonicalGuideCategoryKey;
  guideTitle: string;
  tags?: string[];
};

function normalize(text: string): string {
  return text.replace(/\r\n/g, "\n").replace(/[ \t]+\n/g, "\n").trim();
}

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (typeof navigator === "undefined") return false;
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    // fallback
    const el = document.createElement("textarea");
    el.value = text;
    el.style.position = "fixed";
    el.style.top = "-9999px";
    document.body.appendChild(el);
    el.focus();
    el.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(el);
    return ok;
  } catch {
    return false;
  }
}

function buildSellKit(title: string): KitBlock[] {
  const memo = normalize(`【査定比較メモ（コピペ用）】
車名：
年式：
走行距離：
グレード：
修復歴：
装備/オプション：
傷・凹み（ある/なし）：
車検残：
保管状況（屋内/屋外）：
付属品（スペアキー/取説/整備記録）：
希望の連絡方法（電話/メール）：
希望の売却時期（今月/来月/未定）：`);

  const decline = normalize(`【断り方テンプレ（コピペ用）】
今回は見送ります。ご提案ありがとうございました。
（理由を聞かれたら）条件が合わなかったためです。失礼します。`);

  const conditions = normalize(`【比較条件の固定（メモ）】
・同じ日/同じ条件で見積もりを取る
・減点ポイント（傷/修復/車検残）を先に共有する
・最終的に「入金日」「名義変更」「キャンセル可否」まで確認する`);

  return [
    {
      title: "査定比較メモ",
      description: "比較の条件を揃えるだけで、判断が早くなります。",
      content: memo,
    },
    {
      title: "断り方テンプレ",
      description: "迷ったら、短く・丁寧に。理由は深掘りしないのが楽です。",
      content: decline,
    },
    {
      title: "比較条件の固定",
      description: "“数字”を同じ土俵に乗せるためのチェックです。",
      content: conditions,
    },
  ];
}

function buildInsuranceKit(): KitBlock[] {
  const memo = normalize(`【見積もり条件メモ（コピペ用）】
車種：
主な使用目的（通勤/レジャー/業務）：
年間走行距離（目安）：
運転者の範囲（本人のみ/家族/限定なし）：
年齢条件：
等級：
車両保険（あり/なし）：
免許証の色：
必要な補償（対人/対物/人身傷害/弁護士費用 など）：
特約（必要/不要）：`);

  const checklist = normalize(`【見直しチェック（3つ）】
・運転者範囲と年齢条件が実態に合っているか
・車両保険は「必要な期間だけ」にできないか
・特約は“使う可能性があるもの”に絞れているか`);

  return [
    {
      title: "見積もり条件メモ",
      description: "条件を揃えると、比較が一気に楽になります。",
      content: memo,
    },
    {
      title: "見直しチェック",
      description: "下げすぎて不安になる前に、ここだけ確認。",
      content: checklist,
    },
  ];
}

function buildMoneyKit(): KitBlock[] {
  const budget = normalize(`【月の予算表（テンプレ）】
固定費：
・ローン/リース：
・保険：
・駐車場：
・税金/車検の積立：
変動費：
・燃料：
・高速/駐車：
・洗車/消耗品：
予備費（修理・タイヤ等）：
合計（目安）：`);

  const rules = normalize(`【無理しないルール】
・ボーナス前提にしない
・「固定費」を先に決める（後から崩れない）
・予備費はゼロにしない（小さくても積む）`);

  return [
    {
      title: "月の予算表",
      description: "数字を“見える化”すると、判断がブレにくくなります。",
      content: budget,
    },
    {
      title: "無理しないルール",
      description: "背伸びの失敗を避けるための最低限です。",
      content: rules,
    },
  ];
}

function shouldShowFor(categoryKey: CanonicalGuideCategoryKey): boolean {
  return categoryKey === "SELL" || categoryKey === "INSURANCE" || categoryKey === "MONEY";
}

export function GuideTakeawayKit({ categoryKey, guideTitle, tags }: Props) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const blocks = useMemo<KitBlock[]>(() => {
    if (!shouldShowFor(categoryKey)) return [];
    if (categoryKey === "SELL") return buildSellKit(guideTitle);
    if (categoryKey === "INSURANCE") return buildInsuranceKit();
    if (categoryKey === "MONEY") return buildMoneyKit();
    return [];
  }, [categoryKey, guideTitle]);

  if (blocks.length === 0) return null;

  return (
    <div className="mt-8">
      <Reveal>
        <GlassCard className="p-6 md:p-7">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-[14px] font-semibold tracking-wide text-slate-200">
              持ち帰り（テンプレ）
            </h2>
            <p className="text-[12px] text-slate-400">
              コピペして使える形にまとめました
            </p>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {blocks.map((b, i) => {
              const key = `${categoryKey}_${i}`;
              return (
                <div
                  key={key}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-[13px] font-semibold text-slate-100">
                        {b.title}
                      </h3>
                      <p className="mt-1 text-[12px] leading-relaxed text-slate-400">
                        {b.description}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={async () => {
                        const ok = await copyToClipboard(b.content);
                        setCopiedKey(ok ? key : null);
                        if (ok) window.setTimeout(() => setCopiedKey(null), 1500);
                      }}
                      className="shrink-0 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[12px] text-slate-200 hover:bg-white/10"
                      aria-label="コピー"
                    >
                      {copiedKey === key ? "コピー済み" : "コピー"}
                    </button>
                  </div>

                  <pre className="mt-3 whitespace-pre-wrap rounded-xl bg-black/20 p-3 text-[12px] leading-relaxed text-slate-200">
                    {b.content}
                  </pre>
                </div>
              );
            })}
          </div>

          {tags && tags.length > 0 && (
            <p className="mt-5 text-[11px] text-slate-500">
              ※条件は状況で変わります。迷ったら「条件を揃える→数字を出す→最後に決める」の順で。
            </p>
          )}
        </GlassCard>
      </Reveal>
    </div>
  );
}
