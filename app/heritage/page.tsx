// app/heritage/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { GlassCard } from "@/components/GlassCard";

export const metadata: Metadata = {
  title: "HERITAGE | 物語と系譜 | CAR BOUTIQUE",
  description:
    "ブランドやモデルの歴史、世代ごとの変遷などをゆっくり眺めるためのHERITAGEエリアです。",
};

const heritageItems = [
  {
    id: "bmw-5-series-history",
    label: "BMW",
    title: "5シリーズの系譜と、G30の立ち位置",
    summary:
      "E39からG30まで。ビジネスセダンとしての役割と、世代ごとのキャラクターの変化をざっくり振り返ります。",
    href: "#",
    pill: "セダンの王道",
  },
  {
    id: "jdm-heritage-gtr",
    label: "NISSAN",
    title: "スカイラインGT-Rが残したもの",
    summary:
      "BNR32・BCNR33・BNR34と続くGT-Rの歴史を、モータースポーツとの関係とともに整理していきます。",
    href: "#",
    pill: "JDMスポーツ",
  },
  {
    id: "suv-luxury-lineage",
    label: "SUV",
    title: "ラグジュアリーSUVというジャンルの誕生",
    summary:
      "ハリアーやX5といった初期のモデルから、今のラグジュアリーSUV群に至るまでの流れを俯瞰します。",
    href: "#",
    pill: "ラグジュアリーSUV",
  },
];

export default function HeritagePage() {
  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 pb-16 pt-20 sm:px-6 sm:pt-24 lg:px-8">
      <header className="mb-8 space-y-2">
        <p className="text-[10px] font-semibold tracking-[0.32em] text-text-sub">
          HERITAGE
        </p>
        <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
          物語と系譜
        </h1>
        <p className="max-w-2xl text-xs leading-relaxed text-text-sub sm:text-[13px]">
          クルマやブランドの背景にあるストーリーを、
          世代ごとの変遷や時代の空気と一緒に振り返るエリアです。
          スペックや価格だけでなく、「なぜこのクルマが愛されてきたのか」をゆっくり眺めていきます。
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        {heritageItems.map((item) => (
          <GlassCard
            key={item.id}
            as="article"
            interactive
            className="flex h-full flex-col p-4 sm:p-5"
          >
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between gap-3 text-[11px] text-text-sub">
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1 text-[10px] font-medium tracking-[0.18em] text-white">
                  <span className="h-1.5 w-1.5 rounded-full bg-tiffany-300" />
                  {item.label}
                </span>
                <span className="rounded-full bg-white/80 px-3 py-1">
                  {item.pill}
                </span>
              </div>

              <h2 className="mt-3 text-base font-semibold leading-snug text-slate-900 sm:text-[17px]">
                {item.title}
              </h2>

              <p className="mt-2 flex-1 text-xs leading-relaxed text-text-sub">
                {item.summary}
              </p>

              <div className="mt-4">
                <Link
                  href={item.href}
                  className="text-[11px] font-medium text-tiffany-700 underline-offset-4 hover:underline"
                >
                  詳細コンテンツは順次公開予定です
                </Link>
              </div>
            </div>
          </GlassCard>
        ))}
      </section>

      <section className="mt-10">
        <GlassCard className="p-4 sm:p-5">
          <p className="text-[10px] font-semibold tracking-[0.3em] text-text-sub">
            NOTE
          </p>
          <p className="mt-2 text-xs leading-relaxed text-text-sub sm:text-[13px]">
            HERITAGEの内容は、CARSページやCOLUMN、GUIDEと相互リンクしながら、
            「1台のクルマを色々な角度から眺められる」形に少しずつ整えていきます。
          </p>
        </GlassCard>
      </section>
    </main>
  );
}
