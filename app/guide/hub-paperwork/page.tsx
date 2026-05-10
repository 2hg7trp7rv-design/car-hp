import type { Metadata } from "next";
import Link from "next/link";

import { ScrollDepthTracker } from "@/components/analytics/ScrollDepthTracker";
import { GlassCard } from "@/components/GlassCard";
import { Reveal } from "@/components/animation/Reveal";
import { HubEntryShelf } from "@/components/hub/HubEntryShelf";
import { HubRelatedGuidesGrid } from "@/components/hub/HubRelatedGuidesGrid";
import { HubReadingPath } from "@/components/hub/HubReadingPath";
import { HubNextReadShelf } from "@/components/hub/HubNextReadShelf";
import { StickyConclusionCard } from "@/components/hub/StickyConclusionCard";
import { HubUpdateLog } from "@/components/hub/HubUpdateLog";
import { FaqList } from "@/components/guide/FaqList";

import { getIndexCars } from "@/lib/cars";
import { getAllGuides, type GuideItem } from "@/lib/guides";
import { DetailFixedBackground } from "@/components/layout/DetailFixedBackground";

export const metadata: Metadata = {
  title: "名義変更・必要書類｜手続きで詰まらないために",
  description:
    "名義変更（移転登録）や住所変更、車庫証明など“書類で止まりやすい所”を先に整理するハブ。売却・譲渡・乗り換え前の準備に。",

  alternates: { canonical: "/guide/hub-paperwork" },
};


function pickPaperworkGuides(all: GuideItem[]): GuideItem[] {
  // NOTE: Hub は「新着順 + キーワード」で並ぶが、
  // サイト初期は更新日が同日に揃って並びが不安定になりやすい。
  // ここでは“まず読ませたい柱”を先頭に固定する。
  const pinnedSlugs: string[] = [
    "meigi-henko-hitsuyou-shorui-futsuu",
    "meigi-henko-hitsuyou-shorui-kei",
    "jyuusho-henkou-shaken-shou",
    "shako-shoumei-torikata",
    "number-change-kibou-number-guide",
  ];

  const bySlug = new Map(all.map((g) => [g.slug, g] as const));
  const pinned = pinnedSlugs
    .map((s) => bySlug.get(s))
    .filter(Boolean) as GuideItem[];

  const keywords = [
    "名義",
    "名義変更",
    "必要書類",
    "書類",
    "住所変更",
    "車庫証明",
    "委任状",
    "譲渡",
    "移転登録",
    "抹消",
    "ナンバー",
    "自動車税",
    "軽自動車税",
    "納税",
    "納付",
    "納付書",
    "納税証明",
    "納税証明書",
    "再発行",
    "再交付",
    "紛失",
    "車検用",
    "延滞",
    "払い忘れ",
    "支払い方法",
    "スマホ決済",
    "クレジットカード",
    "コンビニ",
    "eL-QR",
    "地方税お支払サイト",
    "口座振替",
    "口座引落し",
    "自動引き落とし",
    "振替済通知書",
    "通帳記帳",
    "送付先変更",
    "引っ越し",
    "転居",
    "使用の本拠",
    "車検切れ",
    "一時抹消",
    "永久抹消",
    "一時使用中止",
    "旧所有者",
    "新所有者",
    "売却",
    "下取り",
    "税止め",
    "所有権留保",
    "払ったのに",
    "反映",
    "反映待ち",
    "確認できない",
    "状況照会",
    "多重納付",
    "OSS",
    "JNKS",
    "軽JNKS",
    "二重払い",
    "二重納付",
    "重複納付",
    "過誤納",
    "返金",
    "還付通知",
    "還付充当",
    "口座指定",
    "督促状",
    "期限切れ納付書",
    "納付書取扱期限",
    "再送付",
    "納付書再発行",
    "所有者",
    "使用者",
    "所有者欄",
    "使用者欄",
    "家族名義",
    "ローン中",
    "信販会社",
    "納税義務者",
    "所有権解除",
    "ローン完済",
    "完済",
    "信販",
    "残クレ",
    "譲渡証明書",
    "旧都道府県",
    "旧市区町村",
    "自動車税申告書",
    "軽自動車税申告書",
    "課税が続く",
    "4月1日",
    "3月31日",
    "賦課期日",
    "年度末",
    "年度内",
    "年度またぎ",
    "取得",
    "取得日",
    "買った年",
    "購入",
    "買い替え",
    "新規登録",
    "再登録",
    "中古車購入",
    "月割課税",
    "納税義務なし",
    "払えない",
    "納税相談",
    "徴収猶予",
    "換価の猶予",
    "分割納付",
    "分納",
    "差押え",
    "滞納処分",
    "催告書",
    "納付指定期限",
    "督促手数料",
    "行き違い",
    "延滞金のみ",
    "延滞金だけ",
    "延滞金納付書",
    "差額延滞金",
    "不足分",
    "1000円未満",
    "端数切り捨て",
    "差押予告",
    "差押予告書",
    "差押予告通知",
    "財産調査",
    "タイヤロック",
    "公売",
    "換価",
  ];

  const rest = all
    .filter((g) => {
      if (pinnedSlugs.includes(g.slug)) return false;
      const title = g.title ?? "";
      const summary = g.summary ?? "";
      const tags = g.tags ?? [];

      if (keywords.some((k) => title.includes(k))) return true;
      if (keywords.some((k) => summary.includes(k))) return true;
      if (tags.some((t) => keywords.some((k) => t.includes(k)))) return true;

      return false;
    })

  return [...pinned, ...rest].slice(0, 12);
}

export default async function HubPaperworkPage() {
  const allGuides = await getAllGuides();
  const guides = pickPaperworkGuides(allGuides);
  const reading = guides.slice(0, 6);
  const steps = [
    {
      id: "flow",
      label: "まずは流れ（何が必要？）",
      description: "書類は“順番”で決まります。全体像を先に掴むと迷いません。",
      guides: reading.slice(0, 2),
    },
    {
      id: "forms",
      label: "次に書類（どれを書けばいい？）",
      description: "必要な書類を特定して、詰まりやすいポイントだけ潰します。",
      guides: reading.slice(2, 4),
    },
    {
      id: "submit",
      label: "最後に提出（窓口/オンライン）",
      description: "提出先と期限を固定して、やり直しを避けます。",
      guides: reading.slice(4, 6),
    },
  ].filter((s) => s.guides.length > 0);
  const cars = (await getIndexCars()).slice(0, 6);

  const base = "hub_paperwork";

  return (
    <main className="relative min-h-screen bg-[var(--bg-stage)] text-[var(--text-primary)] pt-24 pb-20">
      <DetailFixedBackground />
      <ScrollDepthTracker />

      <div className="container mx-auto px-4 md:max-w-4xl">
        <div className="porcelain porcelain-panel rounded-[20px] border border-[var(--border-default)] bg-[rgba(251,248,243,0.92)] text-[var(--text-primary)] shadow-soft-card backdrop-blur p-6 sm:p-8">

        <Reveal>
          <header className="mb-10">
            <p className="text-[10px] font-semibold tracking-[0.3em] text-[var(--accent-slate)]">
              
            </p>
            <h1 className="serif-heading mt-2 text-3xl text-[var(--text-primary)]">
              名義変更・必要書類
            </h1>
            <p className="mt-3 text-[12px] leading-relaxed text-[rgba(76,69,61,0.82)]">
              手続きを始める前に、「必要書類」「管轄」「いつ・どこで手続きするか」を先に整理。
              書類で止まらないだけで、売却も譲渡もスムーズになります。
            </p>
          </header>
        </Reveal>

        <StickyConclusionCard
          title="書類は“順番”が9割。流れを先に固定するとミスが減る"
          bullets={[
            "まず全体像（どこに何を出す？）",
            "次に必要書類（詰まりポイントだけ潰す）",
            "最後に提出（期限と窓口を固定）",
            "迷ったら“必要書類の確定”に戻る",
          ]}
          note="手続きで迷いやすい順番を整理するページです。"
        />

        {/* 1) 最初にやること */}
        <section className="mb-12">
          <Reveal>
            <h2 className="serif-heading text-xl text-[var(--text-primary)]">最初にやること</h2>
            <p className="mt-2 text-[12px] leading-relaxed text-[rgba(76,69,61,0.82)]">
              まずは“詰まりやすい所”だけ先に潰す。準備が整ったら、比較や見積もりに進みます。
            </p>

            <HubEntryShelf
              experimentId="hub_paperwork_entry"
              contentId="hub-paperwork"
              primaryA={{
                monetizeKey: "sell_prepare",
                position: "hub_top",
                ctaId: `${base}_hub_top_sell_prepare_A`,
              }}
              primaryB={{
                monetizeKey: "sell_basic_checklist",
                position: "hub_top",
                ctaId: `${base}_hub_top_sell_basic_checklist_B`,
              }}
              secondary={[
                {
                  monetizeKey: "sell_price_check",
                  position: "hub_secondary",
                  ctaId: `${base}_hub_secondary_sell_price_check`,
                },
                {
                  monetizeKey: "insurance_compare_core",
                  position: "hub_secondary",
                  ctaId: `${base}_hub_secondary_insurance_compare_core`,
                },
              ]}
            />
          </Reveal>
        </section>

        <HubReadingPath
          steps={steps}
          fromIdOverride="hub-paperwork"
          theme="light"
          shelfIdPrefix="hub_paperwork_reading"
        />

        {/* 2) 関連ガイド */}
        <section className="mb-12">
          <Reveal>
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold tracking-[0.3em] text-[rgba(107,101,93,0.88)]">
                  ガイド
                </p>
                <h2 className="serif-heading mt-2 text-xl text-[var(--text-primary)]">
                  書類で止まらないための整理
                </h2>
                <p className="mt-2 text-[12px] leading-relaxed text-[rgba(76,69,61,0.82)]">
                  名義変更・住所変更・車庫証明など、主な手続きをまとめて確認します。
                </p>
              </div>
              <Link
                href="/guide"
                className="text-[10px] font-medium tracking-[0.18em] text-[rgba(107,101,93,0.88)] hover:text-[var(--accent-strong)]"
              >
                ガイド一覧 →
              </Link>
            </div>

            <div className="mt-4">
              <HubRelatedGuidesGrid guides={guides.slice(0, 9)} fromIdOverride="hub-paperwork" />
            </div>
          </Reveal>
        </section>

        <FaqList
          title="手続きのよくある質問"
          description="詰まりやすいポイントだけ先に潰します。"
          items={[
            {
              q: "何から手を付ければいい？",
              a: "まず“提出先と期限”を確定します。次に必要書類を洗い出し、最後に記入・提出。順番を守るだけでミスが減ります。",
            },
            {
              q: "印鑑や住民票は毎回必要？",
              a: "手続きの種類で変わります。迷ったら“必要書類の確定”に戻って、要件を先に固定します。",
            },
            {
              q: "書類が足りないとどうなる？",
              a: "基本は差し戻しで時間が伸びます。先に必要書類を確定し、提出前にチェックリスト化するのが安全です。",
            },
          ]}
        />

        {/* 3) 次に読む */}
        <HubUpdateLog hubId="hub-paperwork" />


        <HubNextReadShelf guides={guides.slice(0, 6)} cars={cars} fromIdOverride="hub-paperwork" />

        <div className="mt-10">
          <Reveal>
            <GlassCard className="border border-[var(--border-default)] bg-[rgba(228,219,207,0.42)] p-6" padding="none">
              <p className="text-[11px] leading-relaxed text-[rgba(76,69,61,0.82)]">
                ※ 書類や必要手続きは「普通車/軽」「所有者/使用者」「住所変更の有無」などで変わります。
                不明点がある場合は、管轄の運輸支局・軽自動車検査協会・自治体の案内も合わせて確認してください。
              </p>
            </GlassCard>
          </Reveal>
        </div>
        </div>

      </div>
    </main>
  );
}
