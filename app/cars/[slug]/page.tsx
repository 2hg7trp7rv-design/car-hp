// app/cars/[slug]/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCarBySlug, getAllCars, type CarItem } from "@/lib/cars";
import { getLatestNews, type NewsItem } from "@/lib/news";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";

export const runtime = "edge";

type Props = {
  params: { slug: string };
};

function formatDateYear(year?: number | null) {
  if (!year) return "";
  return `${year}年頃のモデル`;
}

function buildTitle(car: CarItem): string {
  const base = car.name;
  if (car.grade) {
    return `${base} ${car.grade}`;
  }
  return base;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const car = await getCarBySlug(params.slug);

  if (!car) {
    return {
      title: "車種が見つかりません | CAR BOUTIQUE",
      description: "指定された車種ページは見つかりませんでした。",
    };
  }

  const title = buildTitle(car);
  const description =
    car.summaryLong ??
    car.summary ??
    "スペックだけでなく、性格や維持費感、トラブル傾向まで整理していく車種詳細ページです。";

  return {
    title: `${title} | CAR BOUTIQUE`,
    description,
    openGraph: {
      title: `${title} | CAR BOUTIQUE`,
      description,
      type: "article",
      url: `https://car-hp.vercel.app/cars/${encodeURIComponent(
        params.slug,
      )}`,
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | CAR BOUTIQUE`,
      description,
    },
  };
}

function formatNumber(value?: number | null, unit?: string) {
  if (value === undefined || value === null) return "";
  const v = value.toLocaleString("ja-JP");
  return unit ? `${v}${unit}` : v;
}

export default async function CarDetailPage({ params }: Props) {
  const car = await getCarBySlug(params.slug);

  if (!car) {
    notFound();
  }

  const title = buildTitle(car);
  const yearLabel = formatDateYear(car.releaseYear);

  // 関連CARS
  const allCars = await getAllCars();

  const relatedByMaker = car.maker
    ? allCars
        .filter(
          (c) =>
            c.id !== car.id &&
            c.maker === car.maker,
        )
        .slice(0, 4)
    : [];

  const relatedByBodyType = car.bodyType
    ? allCars
        .filter(
          (c) =>
            c.id !== car.id &&
            c.bodyType === car.bodyType &&
            (!car.maker || c.maker !== car.maker),
        )
        .slice(0, 4)
    : [];

  const hasRelatedCars =
    relatedByMaker.length > 0 || relatedByBodyType.length > 0;

  // 関連ニュース
  const latestNews = await getLatestNews(40);

  const relatedNewsByMaker: NewsItem[] = car.maker
    ? latestNews
        .filter((n) => n.maker === car.maker)
        .slice(0, 4)
    : [];

  const nameKeyword = car.name;
  const relatedNewsByName: NewsItem[] = nameKeyword
    ? latestNews
        .filter(
          (n) =>
            (!car.maker || n.maker !== car.maker) &&
            `${n.title} ${n.titleJa ?? ""}`
              .toLowerCase()
              .includes(nameKeyword.toLowerCase()),
        )
        .slice(0, 4)
    : [];

  const hasRelatedNews =
    relatedNewsByMaker.length > 0 || relatedNewsByName.length > 0;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 text-slate-900">
      <div className="mx-auto max-w-5xl px-4 pb-24 pt-24">
        {/* パンくず */}
        <nav className="mb-6 text-xs text-slate-500">
          <Link href="/" className="hover:text-slate-800">
            HOME
          </Link>
          <span className="mx-2">/</span>
          <Link href="/cars" className="hover:text-slate-800">
            CARS
          </Link>
          <span className="mx-2">/</span>
          <span className="text-slate-400">DETAIL</span>
        </nav>

        {/* ヘッダー: メタ＋タイトル */}
        <header className="mb-10 space-y-4">
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
            {car.maker && (
              <span className="rounded-full border border-slate-200 bg-white/80 px-3 py-1">
                {car.maker}
              </span>
            )}
            {car.bodyType && (
              <span className="rounded-full border border-slate-200 bg-white/80 px-3 py-1">
                {car.bodyType}
              </span>
            )}
            {car.segment && (
              <span className="rounded-full border border-slate-200 bg-white/80 px-3 py-1">
                {car.segment}
              </span>
            )}
            {car.difficulty && (
              <span className="rounded-full border border-slate-200 bg-white/80 px-3 py-1">
                難易度{car.difficulty}
              </span>
            )}
            {yearLabel && (
              <span className="ml-auto text-[10px] tracking-[0.18em] text-slate-400">
                {yearLabel}
              </span>
            )}
          </div>

          <div className="space-y-2">
            <h1 className="text-balance text-2xl font-semibold tracking-[0.08em] text-slate-900 md:text-3xl">
              {title}
            </h1>
            {car.summary && (
              <p className="max-w-2xl text-sm leading-relaxed text-text-sub">
                {car.summary}
              </p>
            )}
          </div>
        </header>

        {/* メイン2カラム: 性格＋スペック */}
        <div className="mb-12 grid gap-8 md:grid-cols-[minmax(0,3fr)_minmax(0,2.3fr)]">
          {/* 性格・オーナーのイメージ */}
          <GlassCard padding="lg" className="h-full">
            <div className="space-y-4">
              <p className="text-[11px] font-medium tracking-[0.2em] text-slate-500">
                CHARACTER & OVERVIEW
              </p>
              <h2 className="text-sm font-semibold tracking-[0.08em] text-slate-900 md:text-[15px]">
                このクルマの「性格」と付き合い方のイメージ
              </h2>
              <p className="text-sm leading-relaxed text-slate-800">
                {car.summaryLong ??
                  "この車種の詳細情報は、順次アップデートしていきます。走りのキャラクターや得意なシーン、日常での取り回しなど、オーナー目線での解説を追加していく予定です。"}
              </p>

              <div className="grid gap-3 text-[11px] text-text-sub md:grid-cols-2">
                {car.difficulty && (
                  <div className="rounded-2xl bg-slate-50/90 p-3">
                    <p className="text-[10px] tracking-[0.18em] text-slate-500">
                      OWNERSHIP LEVEL
                    </p>
                    <p className="mt-1 font-medium text-slate-900">
                      難易度{car.difficulty}
                    </p>
                    <p className="mt-1 leading-relaxed">
                      維持費やトラブルリスク、運転のクセなどを総合した
                      「付き合いやすさ」の目安です。今後、具体的な解説を追加予定です。
                    </p>
                  </div>
                )}

                {car.segment && (
                  <div className="rounded-2xl bg-slate-50/90 p-3">
                    <p className="text-[10px] tracking-[0.18em] text-slate-500">
                      POSITION
                    </p>
                    <p className="mt-1 font-medium text-slate-900">
                      {car.segment}
                    </p>
                    <p className="mt-1 leading-relaxed">
                      ボディサイズや価格帯、ライバル車との関係性など、
                      クラスの中での立ち位置を整理していく予定です。
                    </p>
                  </div>
                )}
              </div>
            </div>
          </GlassCard>

          {/* 基本スペックカード */}
          <GlassCard padding="lg" className="h-full">
            <p className="text-[11px] font-medium tracking-[0.2em] text-slate-500">
              BASIC SPEC
            </p>
            <dl className="mt-3 space-y-2 text-xs text-slate-800">
              {car.engine && (
                <div className="flex">
                  <dt className="w-24 shrink-0 text-slate-400">エンジン</dt>
                  <dd>{car.engine}</dd>
                </div>
              )}
              {(car.powerPs || car.torqueNm) && (
                <div className="flex">
                  <dt className="w-24 shrink-0 text-slate-400">出力/トルク</dt>
                  <dd>
                    {car.powerPs && `${formatNumber(car.powerPs, "ps")}`}
                    {car.powerPs && car.torqueNm && " / "}
                    {car.torqueNm && `${formatNumber(car.torqueNm, "Nm")}`}
                  </dd>
                </div>
              )}
              {car.drive && (
                <div className="flex">
                  <dt className="w-24 shrink-0 text-slate-400">駆動方式</dt>
                  <dd>{car.drive}</dd>
                </div>
              )}
              {car.transmission && (
                <div className="flex">
                  <dt className="w-24 shrink-0 text-slate-400">トランスミッション</dt>
                  <dd>{car.transmission}</dd>
                </div>
              )}
              {car.fuel && (
                <div className="flex">
                  <dt className="w-24 shrink-0 text-slate-400">燃料種別</dt>
                  <dd>{car.fuel}</dd>
                </div>
              )}

              {(car.lengthMm ||
                car.widthMm ||
                car.heightMm ||
                car.wheelbaseMm) && (
                <div className="flex">
                  <dt className="w-24 shrink-0 text-slate-400">サイズ</dt>
                  <dd className="space-y-1">
                    {car.lengthMm && (
                      <p>全長{formatNumber(car.lengthMm, "mm")}</p>
                    )}
                    {car.widthMm && (
                      <p>全幅{formatNumber(car.widthMm, "mm")}</p>
                    )}
                    {car.heightMm && (
                      <p>全高{formatNumber(car.heightMm, "mm")}</p>
                    )}
                    {car.wheelbaseMm && (
                      <p>ホイールベース{formatNumber(car.wheelbaseMm, "mm")}</p>
                    )}
                  </dd>
                </div>
              )}

              {car.weightKg && (
                <div className="flex">
                  <dt className="w-24 shrink-0 text-slate-400">車両重量</dt>
                  <dd>{formatNumber(car.weightKg, "kg")}</dd>
                </div>
              )}

              {(car.tiresFront || car.tiresRear) && (
                <div className="flex">
                  <dt className="w-24 shrink-0 text-slate-400">タイヤサイズ</dt>
                  <dd className="space-y-1">
                    {car.tiresFront && <p>フロント{car.tiresFront}</p>}
                    {car.tiresRear && <p>リア{car.tiresRear}</p>}
                  </dd>
                </div>
              )}
            </dl>

            <p className="mt-4 rounded-2xl bg-slate-50/90 p-3 text-[11px] leading-relaxed text-text-sub">
              グレードや年式によってスペックは変わる場合があります。
              実際の購入検討時には、必ず販売店やメーカー公式情報で最新の仕様をご確認ください。
            </p>
          </GlassCard>
        </div>

        {/* 関連NEWSブロック */}
        {hasRelatedNews && (
          <section className="mb-12 space-y-4">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="text-xs font-semibold tracking-[0.18em] text-slate-700 sm:text-sm">
                この車種に関連するニュース
              </h2>
              <Link
                href={
                  car.maker
                    ? `/news?maker=${encodeURIComponent(car.maker)}`
                    : "/news"
                }
                className="text-[11px] tracking-[0.16em] text-text-sub underline-offset-4 hover:underline sm:text-xs"
              >
                NEWS一覧で詳しく見る
              </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {relatedNewsByMaker.length > 0 && (
                <GlassCard padding="lg" className="h-full">
                  <p className="text-[10px] font-semibold tracking-[0.26em] text-text-sub">
                    メーカー単位での動き
                  </p>
                  <ul className="mt-3 space-y-2 text-[11px] text-text-sub">
                    {relatedNewsByMaker.map((n) => (
                      <li key={n.id}>
                        <Link
                          href={`/news/${n.id}`}
                          className="group block"
                        >
                          <p className="line-clamp-2 font-semibold text-slate-900 group-hover:underline">
                            {n.titleJa || n.title}
                          </p>
                          <p className="mt-0.5 line-clamp-2 text-[10px] text-slate-500">
                            {n.excerpt ??
                              "詳細は記事ページと元記事にてご確認ください。"}
                          </p>
                          <p className="mt-0.5 text-[10px] text-slate-400">
                            {formatDate(n.publishedAt)}
                          </p>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </GlassCard>
              )}

              {relatedNewsByName.length > 0 && (
                <GlassCard padding="lg" className="h-full">
                  <p className="text-[10px] font-semibold tracking-[0.26em] text-text-sub">
                    車名でひっかかるトピック
                  </p>
                  <ul className="mt-3 space-y-2 text-[11px] text-text-sub">
                    {relatedNewsByName.map((n) => (
                      <li key={n.id}>
                        <Link
                          href={`/news/${n.id}`}
                          className="group block"
                        >
                          <p className="line-clamp-2 font-semibold text-slate-900 group-hover:underline">
                            {n.titleJa || n.title}
                          </p>
                          <p className="mt-0.5 line-clamp-2 text-[10px] text-slate-500">
                            {n.excerpt ??
                              "詳細は記事ページと元記事にてご確認ください。"}
                          </p>
                          <p className="mt-0.5 text-[10px] text-slate-400">
                            {formatDate(n.publishedAt)}
                          </p>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </GlassCard>
              )}
            </div>
          </section>
        )}

        {/* 関連CARSブロック */}
        {hasRelatedCars && (
          <section className="mb-12 space-y-4">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="text-xs font-semibold tracking-[0.18em] text-slate-700 sm:text-sm">
                近いキャラクターのCARS
              </h2>
              <Link
                href="/cars"
                className="text-[11px] tracking-[0.16em] text-text-sub underline-offset-4 hover:underline sm:text-xs"
              >
                すべてのCARS一覧へ
              </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {relatedByMaker.length > 0 && (
                <GlassCard padding="lg" className="h-full">
                  <p className="text-[10px] font-semibold tracking-[0.26em] text-text-sub">
                    同じメーカーで検討したい候補
                  </p>
                  <ul className="mt-3 space-y-2 text-[11px] text-text-sub">
                    {relatedByMaker.map((c) => (
                      <li key={c.id}>
                        <Link
                          href={`/cars/${c.slug}`}
                          className="group block"
                        >
                            <p className="font-semibold text-slate-900 group-hover:underline">
                              {c.name}
                            </p>
                            <p className="mt-0.5 text-[10px] text-slate-500">
                              {c.grade ?? c.segment ?? c.bodyType}
                            </p>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </GlassCard>
              )}

              {relatedByBodyType.length > 0 && (
                <GlassCard padding="lg" className="h-full">
                  <p className="text-[10px] font-semibold tracking-[0.26em] text-text-sub">
                    ボディタイプやキャラクターが近い車種
                  </p>
                  <ul className="mt-3 space-y-2 text-[11px] text-text-sub">
                    {relatedByBodyType.map((c) => (
                      <li key={c.id}>
                        <Link
                          href={`/cars/${c.slug}`}
                          className="group block"
                        >
                          <p className="font-semibold text-slate-900 group-hover:underline">
                            {c.name}
                          </p>
                          <p className="mt-0.5 text-[10px] text-slate-500">
                            {c.maker}／{c.grade ?? c.segment ?? c.bodyType}
                          </p>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </GlassCard>
              )}
            </div>
          </section>
        )}

        {/* 回遊導線: HERITAGE / GUIDE */}
        <section className="mb-12 grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white/90 p-5 text-xs shadow-sm">
            <p className="text-[10px] font-semibold tracking-[0.28em] text-slate-600">
              HERITAGE
            </p>
            <h2 className="mt-2 text-sm font-semibold text-slate-900">
              世代違いのモデルや、ブランドの系譜もあわせてチェック
            </h2>
            <p className="mt-2 leading-relaxed text-text-sub">
              同じ系譜の過去世代や、兄弟車との関係などはHERITAGEセクションで
              少しずつ整理していく予定です。歴代モデルの流れもあわせて眺めると、
              このクルマの立ち位置がより立体的に見えてきます。
            </p>
            <div className="mt-3">
              <Link href="/heritage">
                <Button size="sm" variant="outline">
                  HERITAGEページへ
                </Button>
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-tiffany-100 bg-gradient-to-br from-white via-sky-50/40 to-white p-5 text-xs shadow-sm">
            <p className="text-[10px] font-semibold tracking-[0.28em] text-tiffany-700">
              GUIDE
            </p>
            <h2 className="mt-2 text-sm font-semibold text-slate-900">
              維持費やローン、「直すか手放すか」の判断はGUIDEで整理
            </h2>
            <p className="mt-2 leading-relaxed text-text-sub">
              「このクルマを持ち続けて大丈夫か」「修理にどこまでかけていいか」
              といった悩みはGUIDEセクションで実用的に整理していきます。
              ニュースやコラムと組み合わせて、現実的な判断材料にしていくイメージです。
            </p>
            <div className="mt-3">
              <Link href="/guide">
                <Button size="sm" variant="secondary">
                  GUIDEページへ
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* 戻るリンク */}
        <div className="mt-6 flex justify-between border-t border-slate-200 pt-6 text-xs">
          <Link
            href="/cars"
            className="inline-flex items-center gap-2 text-slate-500 transition hover:text-slate-900"
          >
            <span className="text-[10px]">←</span>
            <span className="tracking-[0.18em]">CARS一覧に戻る</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
