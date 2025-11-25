// app/cars/[slug]/page.tsx
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getAllCars, getCarBySlug } from "@/lib/cars";
import type { CarItem } from "@/lib/types";
import { GlassCard } from "@/components/GlassCard";

type Props = {
  params: { slug: string };
};

// 静的生成用パラメータ
export async function generateStaticParams() {
  const cars = await getAllCars();
  return cars.map((car) => ({ slug: car.slug }));
}

// SEOメタデータ
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const car = await getCarBySlug(params.slug);

  if (!car) {
    return {
      title: "クルマ情報が見つかりません | CAR BOUTIQUE",
      description: "お探しのクルマ情報は見つかりませんでした。",
    };
  }

  const title = `${car.name} | クルマ詳細データ`;
  const description =
    car.summaryLong ??
    car.summary ??
    "スペック・長所短所・トラブル傾向・維持費感までまとめたクルマ詳細ページ。";

  return {
    title: `${title} | CAR BOUTIQUE`,
    description,
    openGraph: {
      title: `${title} | CAR BOUTIQUE`,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | CAR BOUTIQUE`,
      description,
    },
  };
}

function formatMaintenanceLevel(level: CarItem["maintenanceCostLevel"] | undefined) {
  if (!level) return "不明";
  switch (level) {
    case "low":
      return "維持費レベル: 低め（国産コンパクト〜軽クラス）";
    case "medium":
      return "維持費レベル: 中くらい（一般的なファミリーカー〜ミニバン）";
    case "high":
      return "維持費レベル: 高め（プレミアムカー・スポーツカー相当）";
    default:
      return "維持費レベル: 不明";
  }
}

export default async function CarDetailPage({ params }: Props) {
  const car = await getCarBySlug(params.slug);

  if (!car) {
    notFound();
  }

  const accentColor = car.accentColor ?? "#0fb8b3";

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#f5fbfb] to-white pb-16">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 pt-10 md:flex-row md:pt-14 lg:px-6">
        {/* 左側 カルーセル / ヒーロー情報 */}
        <section className="w-full md:w-7/12 md:pr-4 lg:pr-8">
          <div className="mb-4 flex items-center gap-2 text-xs text-muted-foreground">
            <Link href="/cars" className="underline-offset-2 hover:underline">
              CARS
            </Link>
            <span>/</span>
            <span>{car.maker}</span>
            <span>/</span>
            <span className="truncate">{car.name}</span>
          </div>

          <GlassCard className="relative overflow-hidden border border-white/60 bg-white/60 p-6 shadow-[0_18px_60px_rgba(15,184,179,0.12)] backdrop-blur-xl md:p-8">
            <div
              className="absolute inset-x-0 top-0 h-1"
              style={{ background: `linear-gradient(90deg, ${accentColor}, transparent)` }}
            />
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
                {car.name}
              </h1>
              {car.grade && (
                <span className="rounded-full border border-black/5 bg-black/5 px-3 py-0.5 text-xs font-medium tracking-wide">
                  {car.grade}
                </span>
              )}
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs md:text-[13px]">
              <span className="rounded-full bg-black/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
                {car.maker}
              </span>
              {car.bodyType && (
                <span className="rounded-full bg-black/5 px-3 py-1 text-[11px] font-medium">
                  {car.bodyType}
                </span>
              )}
              {car.segment && (
                <span className="rounded-full bg-black/5 px-3 py-1 text-[11px] font-medium">
                  {car.segment}
                </span>
              )}
              {car.releaseYear && (
                <span className="rounded-full bg-black/5 px-3 py-1 text-[11px] font-medium">
                  {car.releaseYear}年デビュー
                </span>
              )}
              {car.difficulty && (
                <span className="rounded-full border border-black/10 px-3 py-1 text-[11px] font-medium">
                  購入・維持難易度: {car.difficulty}
                </span>
              )}
            </div>

            {car.summary && (
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-[15px]">
                {car.summary}
              </p>
            )}

            {/* 主要スペックサマリー */}
            <div className="mt-6 grid grid-cols-2 gap-3 border-t border-dashed border-black/10 pt-4 text-[11px] md:grid-cols-3 md:text-xs">
              {car.engine && (
                <SpecItem label="エンジン" value={car.engine} />
              )}
              {car.powerPs != null && (
                <SpecItem label="最高出力" value={`${car.powerPs}ps`} />
              )}
              {car.torqueNm != null && (
                <SpecItem label="最大トルク" value={`${car.torqueNm}Nm`} />
              )}
              {car.drive && (
                <SpecItem label="駆動方式" value={car.drive} />
              )}
              {car.transmission && (
                <SpecItem label="トランスミッション" value={car.transmission} />
              )}
              {car.fuelEconomy && (
                <SpecItem label="燃費(目安)" value={car.fuelEconomy} />
              )}
            </div>
          </GlassCard>
        </section>

        {/* 右側 概要・スペックブロック */}
        <section className="w-full md:w-5/12 md:pl-1">
          <div className="flex flex-col gap-4">
            <GlassCard className="border border-white/70 bg-white/70 p-5 backdrop-blur-xl">
              <SectionTitle label="このクルマの性格" />
              {car.summaryLong ? (
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-[15px]">
                  {car.summaryLong}
                </p>
              ) : (
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  詳細なキャラクター情報は追って追加予定です。
                </p>
              )}
              {car.specHighlights && (
                <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                  <span className="font-semibold text-foreground">ハイライト: </span>
                  {car.specHighlights}
                </p>
              )}
            </GlassCard>

            <GlassCard className="border border-white/70 bg-white/70 p-5 backdrop-blur-xl">
              <SectionTitle label="ボディサイズ・スペック" />
              <div className="mt-3 grid grid-cols-2 gap-3 text-[11px] md:text-xs">
                {car.sizeMmLength && (
                  <SpecItem label="全長" value={`${car.sizeMmLength.toLocaleString()}mm`} />
                )}
                {car.sizeMmWidth && (
                  <SpecItem label="全幅" value={`${car.sizeMmWidth.toLocaleString()}mm`} />
                )}
                {car.sizeMmHeight && (
                  <SpecItem label="全高" value={`${car.sizeMmHeight.toLocaleString()}mm`} />
                )}
                {car.wheelbaseMm && (
                  <SpecItem
                    label="ホイールベース"
                    value={`${car.wheelbaseMm.toLocaleString()}mm`}
                  />
                )}
                {car.weightKg && (
                  <SpecItem label="車重(目安)" value={`${car.weightKg.toLocaleString()}kg`} />
                )}
              </div>
            </GlassCard>

            <GlassCard className="border border-white/70 bg-white/70 p-5 backdrop-blur-xl">
              <SectionTitle label="価格・維持費感" />
              <div className="mt-3 space-y-2 text-[12px] leading-relaxed text-muted-foreground">
                {car.costNewPriceRange && (
                  <p>
                    <span className="font-semibold text-foreground">新車価格帯: </span>
                    {car.costNewPriceRange}
                  </p>
                )}
                {car.costUsedPriceRange && (
                  <p>
                    <span className="font-semibold text-foreground">中古車相場感: </span>
                    {car.costUsedPriceRange}
                  </p>
                )}
                <p className="mt-1">{formatMaintenanceLevel(car.maintenanceCostLevel)}</p>
              </div>
            </GlassCard>
          </div>
        </section>
      </div>

      {/* 下段 セクション 3カラム構成 */}
      <div className="mx-auto mt-4 max-w-6xl px-4 lg:px-6">
        <div className="grid gap-5 lg:grid-cols-3">
          {/* 長所・短所 */}
          <GlassCard className="border border-white/70 bg-white/80 p-5 backdrop-blur-xl">
            <SectionTitle label="長所と短所" />

            <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted-foreground md:text-[15px]">
              <div>
                <p className="text-xs font-semibold tracking-[0.12em] text-foreground/70">
                  GOOD
                </p>
                {car.pros ? (
                  <p className="mt-1 whitespace-pre-line">{car.pros}</p>
                ) : (
                  <p className="mt-1">長所の詳細は順次追加予定です。</p>
                )}
              </div>
              <div className="border-t border-dashed border-black/10 pt-3">
                <p className="text-xs font-semibold tracking-[0.12em] text-foreground/70">
                  NOTE
                </p>
                {car.cons ? (
                  <p className="mt-1 whitespace-pre-line">{car.cons}</p>
                ) : (
                  <p className="mt-1">気になるポイントの詳細は順次追加予定です。</p>
                )}
              </div>
            </div>
          </GlassCard>

          {/* トラブル・メンテナンス */}
          <GlassCard className="border border-white/70 bg-white/80 p-5 backdrop-blur-xl">
            <SectionTitle label="トラブル傾向とメンテナンス" />

            <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted-foreground md:text-[15px]">
              <div>
                <p className="text-xs font-semibold tracking-[0.12em] text-foreground/70">
                  TROUBLE TRENDS
                </p>
                {car.troubleTrends ? (
                  <p className="mt-1 whitespace-pre-line">{car.troubleTrends}</p>
                ) : (
                  <p className="mt-1">
                    代表的なトラブルや故障傾向は、今後実オーナーの声や事例を元にアップデートしていきます。
                  </p>
                )}
              </div>
              <div className="border-t border-dashed border-black/10 pt-3">
                <p className="text-xs font-semibold tracking-[0.12em] text-foreground/70">
                  MAINTENANCE
                </p>
                {Array.isArray(car.maintenanceTips) ? (
                  <ul className="mt-1 list-disc space-y-1 pl-5 text-[13px]">
                    {car.maintenanceTips.map((tip, idx) => (
                      <li key={idx}>{tip}</li>
                    ))}
                  </ul>
                ) : car.maintenanceTips ? (
                  <p className="mt-1 whitespace-pre-line">{car.maintenanceTips as string}</p>
                ) : (
                  <p className="mt-1">
                    メンテナンスのコツや注意点は、実際の整備事例をもとに追記予定です。
                  </p>
                )}
              </div>
            </div>
          </GlassCard>

          {/* 向いている人／向かない人・モデル変遷 */}
          <GlassCard className="border border-white/70 bg-white/80 p-5 backdrop-blur-xl">
            <SectionTitle label="どんな人に向いているか" />

            <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted-foreground md:text-[15px]">
              <div>
                <p className="text-xs font-semibold tracking-[0.12em] text-foreground/70">
                  RECOMMENDED
                </p>
                {car.recommendFor ? (
                  <p className="mt-1 whitespace-pre-line">{car.recommendFor}</p>
                ) : (
                  <p className="mt-1">おすすめのユーザー像は順次追加予定です。</p>
                )}
              </div>
              <div className="border-t border-dashed border-black/10 pt-3">
                <p className="text-xs font-semibold tracking-[0.12em] text-foreground/70">
                  NOT RECOMMENDED
                </p>
                {car.notFor ? (
                  <p className="mt-1 whitespace-pre-line">{car.notFor}</p>
                ) : (
                  <p className="mt-1">あまり相性が良くない使い方の例も、今後追記していきます。</p>
                )}
              </div>
              {car.changeSummary && (
                <div className="border-t border-dashed border-black/10 pt-3">
                  <p className="text-xs font-semibold tracking-[0.12em] text-foreground/70">
                    MODEL CHANGES
                  </p>
                  <p className="mt-1 whitespace-pre-line">{car.changeSummary}</p>
                </div>
              )}
            </div>
          </GlassCard>
        </div>

        {/* 参考リンク */}
        {car.referenceUrl && (
          <div className="mt-6 text-right text-[11px] text-muted-foreground">
            公式情報:
            {" "}
            <Link
              href={car.referenceUrl}
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-2"
            >
              メーカー公式サイトを見る
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}

type SpecItemProps = {
  label: string;
  value: string;
};

function SpecItem({ label, value }: SpecItemProps) {
  return (
    <div>
      <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-0.5 text-[12px] font-medium text-foreground">{value}</p>
    </div>
  );
}

type SectionTitleProps = {
  label: string;
};

function SectionTitle({ label }: SectionTitleProps) {
  return (
    <h2 className="text-xs font-semibold tracking-[0.2em] text-muted-foreground">
      {label.toUpperCase()}
    </h2>
  );
}
