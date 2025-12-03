// app/cars/[slug]/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { GlassCard } from "@/components/GlassCard";
import { Reveal } from "@/components/animation/Reveal";
import { CarRotator } from "@/components/car/CarRotator";
import CompareSlider from "@/components/car/CompareSlider";
import {
  getAllCars,
  getCarBySlug,
  type CarItem,
} from "@/lib/cars";
import { getLatestNews, type NewsItem } from "@/lib/news";
import { getAllColumns, type ColumnItem } from "@/lib/columns";
import { Button } from "@/components/ui/button";

export const runtime = "edge";

type PageProps = {
  params: { slug: string };
};

/**
 * CarItem を 04_data-models-types の指針に沿って拡張したローカル型。
 * lib/cars.ts の実装と段階的に寄せていく前提で、ここでは intersection で扱う。
 */
type ExtendedCarItem = CarItem & {
  mainImage?: string;
  heroImage?: string;
};

export async function generateStaticParams() {
  const cars = await getAllCars();
  return cars.map((car) => ({ slug: car.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const car = (await getCarBySlug(params.slug)) as ExtendedCarItem | null;

  if (!car) {
    return {
      title: "車種が見つかりません | CAR BOUTIQUE",
      description: "指定された車種が見つかりませんでした。",
    };
  }

  const title = `${car.name} | CAR BOUTIQUE`;
  const description =
    car.summaryLong ??
    car.summary ??
    "スペック、長所・短所、トラブル傾向、関連ニュースやコラムをまとめた車種ページです。";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      url: `https://car-hp.vercel.app/cars/${encodeURIComponent(
        car.slug,
      )}`,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

function formatNumber(value?: number | null) {
  if (value == null) return "";
  return value.toLocaleString("ja-JP");
}

function formatDate(iso?: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// 関連NEWS/COLUMN 用のキーワード
function buildKeywords(car: ExtendedCarItem): string[] {
  const tags = (car as CarItem & { tags?: string[] }).tags ?? [];
  const nameParts = car.name.split(/\s+/);
  const extra = [car.segment, car.bodyType, car.slug];
  return [car.maker, ...nameParts, ...extra, ...tags]
    .filter(Boolean)
    .map((v) => String(v));
}

// 一覧ページと揃えた難易度ラベル
function mapDifficultyLabel(
  difficulty: CarItem["difficulty"] | undefined,
): string {
  switch (difficulty) {
    case "basic":
      return "やさしい";
    case "intermediate":
      return "標準的";
    case "advanced":
      return "気を使う";
    default:
      return "未設定";
  }
}

// 難易度バッジ用の色
function difficultyBadgeClass(
  difficulty: CarItem["difficulty"] | undefined,
): string {
  switch (difficulty) {
    case "basic":
      return "border-emerald-100 bg-emerald-50/90 text-emerald-800";
    case "intermediate":
      return "border-amber-100 bg-amber-50/90 text-amber-800";
    case "advanced":
      return "border-rose-100 bg-rose-50/90 text-rose-800";
    default:
      return "border-slate-200 bg-slate-50/90 text-slate-700";
  }
}

async function getRelatedCars(
  current: ExtendedCarItem,
): Promise<CarItem[]> {
  const allCars = await getAllCars();

  const relatedCars = allCars
    .filter(
      (c) =>
        c.slug !== current.slug &&
        (c.maker === current.maker ||
          (c.segment && c.segment === current.segment)),
    )
    .slice(0, 3);

  return relatedCars;
}

async function getRelatedNewsAndColumns(car: ExtendedCarItem) {
  const [news, columns] = await Promise.all([
    getLatestNews(80),
    getAllColumns(),
  ]);

  const keywords = new Set(buildKeywords(car));

  const relatedNews: NewsItem[] = news
    .filter((item) => {
      if (item.maker && item.maker === car.maker) return true;

      const tags = item.tags ?? [];
      if (tags.some((tag) => keywords.has(tag))) return true;

      const title = `${item.titleJa ?? ""} ${item.title}`.toUpperCase();
      return Array.from(keywords).some(
        (kw) => kw && title.includes(String(kw).toUpperCase()),
      );
    })
    .slice(0, 5);

  const relatedColumns: ColumnItem[] = columns
    .filter((c) => {
      // ColumnItem 側の relatedCarSlugs を優先的に利用
      const relatedCarSlugs = c.relatedCarSlugs ?? [];
      if (relatedCarSlugs.includes(car.slug)) {
        return true;
      }

      const title = `${c.title} ${c.summary}`.toUpperCase();
      return Array.from(keywords).some(
        (kw) => kw && title.includes(String(kw).toUpperCase()),
      );
    })
    .slice(0, 5);

  return { relatedNews, relatedColumns };
}

export default async function CarDetailPage({ params }: PageProps) {
  const car = (await getCarBySlug(params.slug)) as ExtendedCarItem | null;

  if (!car) {
    notFound();
  }

  const strengths = car.strengths ?? [];
  const weaknesses = car.weaknesses ?? [];
  const troubleTrends = car.troubleTrends ?? [];
  const costImpression = car.costImpression;

  const [relatedCars, { relatedNews, relatedColumns }] = await Promise.all([
    getRelatedCars(car),
    getRelatedNewsAndColumns(car),
  ]);

  const mainImage =
    car.mainImage ??
    car.heroImage ??
    (car as CarItem & { imageUrl?: string }).imageUrl ??
    "";

  const relatedNewsCount = relatedNews.length;
  const relatedColumnsCount = relatedColumns.length;
  const relatedCarsCount = relatedCars.length;

  const isBMW530iG30 =
    car.slug === "bmw-530i-g30" || car.id === "bmw-530i-g30";

  // BMW 530i (G30) 用の「理想テンプレ」ドライブメモ
  const driveScenes = isBMW530iG30
    ? [
        {
          id: "city",
          label: "街乗り（短距離〜日常の足）",
          body: (
            <>
              見た目のサイズ感からは「取り回しが大変そう」に見えますが、実際に走らせると
              ステアリングは軽く、視界も悪くありません。2.0Lターボは低回転からトルクが立ち上がり、
              2000rpm 前後でスッと流れに乗ってくれるので、幹線道路やバイパス中心の生活ならストレスは少なめ。
              ただし「自宅〜コンビニ」のような超短距離メインだと、正直オーバースペック気味です。
            </>
          ),
        },
        {
          id: "highway",
          label: "高速道路（通勤・出張）",
          body: (
            <>
              G30 の真価は高速巡航で実感できます。100km/h 付近ではエンジン音はほとんど聞こえず、
              風切り音とロードノイズもよく抑えられています。アクティブクルーズコントロールや
              レーンキープ機能と組み合わせると、「移動」ではなく「運ばれている」感覚に近い滑らかさ。
              国産ミドルセダンから乗り換えると、長距離後の疲労感が一段階下がったと感じるはずです。
            </>
          ),
        },
        {
          id: "longtrip",
          label: "ロングツーリング（500〜800km クラス）",
          body: (
            <>
              シートの出来と足まわりのしなやかさが効いてくるのが、このあたりの距離。
              ランフラットタイヤ特有のコツコツ感はあるものの、うねりをしっかりいなしてくれるので、
              同乗者の評判も上々です。トランクはゴルフバッグ 2 個＋スーツケース程度なら余裕で積める容量があり、
              「大人 4 人＋荷物」での旅行にも十分対応できます。
            </>
          ),
        },
        {
          id: "cost",
          label: "日常の維持費イメージ",
          body: (
            <>
              ハイオク仕様ではあるものの、実用燃費は 9〜13km/L 程度。排気量のわりに「思ったより飲まない」
              という印象になることが多いです。一方で、タイヤ・ブレーキ・オイルなどの消耗品は
              国産セダンより 1 段高めの価格帯。車検や定期メンテナンスをすべてディーラー任せにすると、
              毎回の請求書にドキッとする場面も出てきます。
            </>
          ),
        },
      ]
    : [
        {
          id: "city",
          label: "街乗りでのフィーリング",
          body: (
            <>
              ストップ＆ゴーの多い街中での乗り味や、取り回しやすさのイメージをここにまとめます。
              実際のオーナー目線で「どのくらいストレスなく扱えるか」を書いておくゾーンです。
            </>
          ),
        },
        {
          id: "highway",
          label: "高速道路・バイパスでの安心感",
          body: (
            <>
              高速域での安定感や静粛性、運転支援機能の使い勝手など、「遠くへ行きたくなるかどうか」の
              視点でコメントを入れておくと、この車種のキャラクターが伝わりやすくなります。
            </>
          ),
        },
        {
          id: "longtrip",
          label: "ロングツーリングの相棒として",
          body: (
            <>
              500km 前後のドライブを想定して、シート・乗り心地・荷物の積載性など、旅行向きかどうかを整理する場所です。
            </>
          ),
        },
        {
          id: "cost",
          label: "日常の維持費ざっくり感",
          body: (
            <>
              燃費やガソリン種別、タイヤ／ブレーキなどの消耗品コスト感を一言でまとめておきます。
            </>
          ),
        },
      ];

  const annualCostParagraph = isBMW530iG30 ? (
    <>
      自動車税（2.0L）で年およそ 4.5 万円、自賠責・任意保険で 10〜15 万円前後、
      車検・点検の積立として年 10〜15 万円程度、タイヤやオイルなどの消耗品で
      年 8〜15 万円程度を見ておくと、トータルのランニングコストは
      <span className="font-semibold"> 年 35〜55 万円前後</span>
      のイメージになります。
    </>
  ) : (
    <>
      このセクションでは「税金」「保険」「車検・点検」「消耗品」に分けて、
      年あたりいくらくらいを見ておくと安心か、ざっくりとレンジで示しておきます。
      金額はあくまで目安なので、実際の見積もりと比較するときの“感覚合わせ”に使うイメージです。
    </>
  );

  const ctaTitle = isBMW530iG30
    ? "修理費がかさんできたら、“査定してから次の一手”を考えるのもアリです。"
    : "「乗り続けるか、手放すか」を考えはじめたときの次の一手。";

  const ctaBody = isBMW530iG30 ? (
    <>
      G30 530i は、まだまだ十分に商品力のあるモデルです。
      まとまった修理費がかかるタイミングで、一度現在の査定額をチェックしておくと、
      「直して乗る」「乗り換える」の判断がしやすくなります。
    </>
  ) : (
    <>
      まとまった修理費や次回車検の見積もりが出たタイミングで、
      一度「今いくらで売れるのか」を知っておくと、乗り換えも含めた選択肢が広がります。
    </>
  );

  return (
    <main className="min-h-screen bg-site text-text-main">
      <div className="mx-auto max-w-6xl px-4 pb-28 pt-24 sm:px-6 lg:px-8">
        {/* パンくず */}
        <nav
          aria-label="パンくずリスト"
          className="mb-6 text-xs text-slate-500"
        >
          <Link href="/" className="hover:text-slate-800">
            HOME
          </Link>
          <span className="mx-2">/</span>
          <Link href="/cars" className="hover:text-slate-800">
            CARS
          </Link>
          <span className="mx-2">/</span>
          <span className="text-slate-400">{car.name}</span>
        </nav>

        {/* ヘッダー ＋ 上部インデックス */}
        <Reveal>
          <header className="mb-8 rounded-3xl border border-slate-200/70 bg-white/90 p-5 shadow-soft lg:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="space-y-3">
                <p className="text-[10px] font-semibold tracking-[0.32em] text-tiffany-700">
                  CAR PROFILE
                </p>
                <div className="space-y-1">
                  <h1 className="serif-heading text-2xl font-medium tracking-tight text-slate-900 sm:text-3xl">
                    {car.name}
                  </h1>
                  <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">
                    {car.maker}
                    {car.releaseYear && <> / {car.releaseYear}</>}
                    {car.segment && <> · {car.segment}</>}
                  </p>
                </div>

                {(car.summaryLong || car.summary) && (
                  <p className="max-w-3xl text-[12px] leading-relaxed text-slate-600">
                    {car.summaryLong ?? car.summary}
                  </p>
                )}
              </div>

              {/* インデックスチップ群 */}
              <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-700 sm:grid-cols-3 lg:w-[340px]">
                <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-3 py-2">
                  <p className="text-[9px] tracking-[0.2em] text-slate-400">
                    維持の難易度
                  </p>
                  <p
                    className={[
                      "mt-1 inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold",
                      difficultyBadgeClass(car.difficulty),
                    ].join(" ")}
                  >
                    {mapDifficultyLabel(car.difficulty)}
                  </p>
                </div>

                {car.bodyType && (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-3 py-2">
                    <p className="text-[9px] tracking-[0.2em] text-slate-400">
                      BODY TYPE
                    </p>
                    <p className="mt-1 text-xs font-semibold text-slate-900">
                      {car.bodyType}
                    </p>
                  </div>
                )}

                {costImpression && (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-3 py-2">
                    <p className="text-[9px] tracking-[0.2em] text-slate-400">
                      COST IMPRESSION
                    </p>
                    <p className="mt-1 text-[11px] leading-relaxed text-slate-800">
                      {costImpression}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* CAR BRIEFING（関連数などの“ひと目サマリー”） */}
            <div className="mt-4 flex flex-wrap items-center gap-2 rounded-2xl bg-slate-50/80 px-3 py-2 text-[10px] text-slate-500">
              <span className="rounded-full bg-white px-2 py-0.5 text-[9px] tracking-[0.18em] text-slate-400">
                CAR BRIEFING
              </span>
              <span className="flex items-center gap-1">
                <span className="h-1 w-1 rounded-full bg-emerald-400" />
                <span className="tracking-[0.12em]">
                  関連 CARS{" "}
                  <span className="font-semibold text-slate-700">
                    {relatedCarsCount}
                  </span>
                </span>
              </span>
              <span className="flex items-center gap-1">
                <span className="h-1 w-1 rounded-full bg-tiffany-400" />
                <span className="tracking-[0.12em]">
                  NEWS{" "}
                  <span className="font-semibold text-slate-700">
                    {relatedNewsCount}
                  </span>
                </span>
              </span>
              <span className="flex items-center gap-1">
                <span className="h-1 w-1 rounded-full bg-slate-500" />
                <span className="tracking-[0.12em]">
                  COLUMNS{" "}
                  <span className="font-semibold text-slate-700">
                    {relatedColumnsCount}
                  </span>
                </span>
              </span>
            </div>

            {/* ページ内ナビ */}
            <div className="mt-5 flex flex-wrap gap-2 text-[10px] text-slate-500">
              <span className="rounded-full bg-slate-50 px-2 py-0.5 text-slate-400">
                QUICK NAV
              </span>
              <a
                href="#visual-spec"
                className="rounded-full bg-white px-3 py-1 tracking-[0.16em] hover:text-tiffany-700"
              >
                VISUAL &amp; SPEC
              </a>
              {(strengths.length > 0 ||
                weaknesses.length > 0 ||
                troubleTrends.length > 0) && (
                <a
                  href="#ownership-notes"
                  className="rounded-full bg-white px-3 py-1 tracking-[0.16em] hover:text-tiffany-700"
                >
                  OWNERSHIP NOTES
                </a>
              )}
              <a
                href="#drive-and-cost"
                className="rounded-full bg-white px-3 py-1 tracking-[0.16em] hover:text-tiffany-700"
              >
                DRIVE &amp; COST
              </a>
              <a
                href="#visual-comparison"
                className="rounded-full bg-white px-3 py-1 tracking-[0.16em] hover:text-tiffany-700"
              >
                VISUAL COMPARISON
              </a>
              <a
                href="#related-section"
                className="rounded-full bg-white px-3 py-1 tracking-[0.16em] hover:text-tiffany-700"
              >
                RELATED NEWS / COLUMN
              </a>
            </div>
          </header>
        </Reveal>

        {/* VISUAL + SPEC */}
        <section id="visual-spec" className="mb-10">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
            {/* メインビジュアル */}
            <Reveal className="h-full">
              <GlassCard
                padding="none"
                variant="dim"
                interactive
                className="relative h-full min-h-[260px] overflow-hidden"
              >
                {/* 背景の光 */}
                <div className="pointer-events-none absolute inset-0">
                  <div className="absolute -left-24 -top-24 h-52 w-52 rounded-full bg-[radial-gradient(circle_at_center,_rgba(10,186,181,0.25),_transparent_70%)] blur-3xl" />
                  <div className="absolute -right-24 bottom-[-30%] h-64 w-64 rounded-full bg-[radial-gradient(circle_at_center,_rgba(15,23,42,0.22),_transparent_75%)] blur-3xl" />
                </div>

                <div className="relative z-10 h-full">
                  {mainImage ? (
                    <CarRotator imageUrl={mainImage} />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-slate-200/60">
                      <span className="text-xs tracking-[0.18em] text-slate-500">
                        IMAGE COMING SOON
                      </span>
                    </div>
                  )}
                </div>
              </GlassCard>
            </Reveal>

            {/* スペックカード */}
            <Reveal className="h-full">
              <GlassCard
                as="section"
                padding="lg"
                className="relative h-full border border-slate-200/80 bg-white/92 shadow-soft-card"
              >
                {/* 上部ラベル＋ミニボタン */}
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xs font-semibold tracking-[0.2em] text-slate-500">
                      BASIC SPEC
                    </h2>
                    <p className="mt-1 text-[11px] text-text-sub">
                      試乗前に押さえておきたい、パワートレインや駆動方式などの基本情報です。
                    </p>
                  </div>
                  <Link href="/guide?category=MAINTENANCE_COST">
                    <Button
                      variant="subtle"
                      size="xs"
                      className="rounded-full px-3 py-1 text-[9px] tracking-[0.18em]"
                    >
                      維持費の考え方
                    </Button>
                  </Link>
                </div>

                <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2 text-[11px] text-slate-700">
                  {car.engine && (
                    <>
                      <dt className="text-slate-400">エンジン</dt>
                      <dd>{car.engine}</dd>
                    </>
                  )}
                  {car.powerPs && (
                    <>
                      <dt className="text-slate-400">最高出力</dt>
                      <dd>{formatNumber(car.powerPs)} ps</dd>
                    </>
                  )}
                  {car.torqueNm && (
                    <>
                      <dt className="text-slate-400">最大トルク</dt>
                      <dd>{formatNumber(car.torqueNm)} Nm</dd>
                    </>
                  )}
                  {car.transmission && (
                    <>
                      <dt className="text-slate-400">トランスミッション</dt>
                      <dd>{car.transmission}</dd>
                    </>
                  )}
                  {car.drive && (
                    <>
                      <dt className="text-slate-400">駆動方式</dt>
                      <dd>{car.drive}</dd>
                    </>
                  )}
                  {car.fuel && (
                    <>
                      <dt className="text-slate-400">燃料</dt>
                      <dd>{car.fuel}</dd>
                    </>
                  )}
                  {car.bodyType && (
                    <>
                      <dt className="text-slate-400">ボディタイプ</dt>
                      <dd>{car.bodyType}</dd>
                    </>
                  )}
                  {car.segment && (
                    <>
                      <dt className="text-slate-400">セグメント</dt>
                      <dd>{car.segment}</dd>
                    </>
                  )}
                </dl>

                {/* 軽い“スペックメーター風”視覚情報（数値があるときだけ） */}
                {(car.powerPs || car.torqueNm) && (
                  <div className="mt-4 space-y-2 text-[10px] text-slate-500">
                    {car.powerPs && (
                      <div>
                        <div className="mb-1 flex items-center justify-between">
                          <span className="tracking-[0.16em]">
                            POWER BALANCE
                          </span>
                          <span className="text-[9px] text-slate-400">
                            {formatNumber(car.powerPs)} ps
                          </span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                          <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-tiffany-300 via-tiffany-400 to-slate-500" />
                        </div>
                      </div>
                    )}
                    {car.torqueNm && (
                      <div>
                        <div className="mb-1 flex items-center justify-between">
                          <span className="tracking-[0.16em]">
                            TORQUE FEEL
                          </span>
                          <span className="text-[9px] text-slate-400">
                            {formatNumber(car.torqueNm)} Nm
                          </span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                          <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-slate-400 via-tiffany-400 to-tiffany-200" />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ちいさな注意書き */}
                <p className="mt-4 text-[10px] leading-relaxed text-slate-400">
                  数値は代表グレード相当の目安値です。実際の購入時は、年式・仕様・グレードごとの
                  スペックを販売店公式情報などであらためてご確認ください。
                </p>
              </GlassCard>
            </Reveal>
          </div>
        </section>

        {/* OWNERSHIP NOTES: 長所 / 短所・トラブル傾向 */}
        {(strengths.length > 0 ||
          weaknesses.length > 0 ||
          troubleTrends.length > 0) && (
          <section id="ownership-notes" className="mb-12">
            <Reveal>
              <div className="mb-4 flex items-baseline justify-between gap-3">
                <h2 className="text-xs font-semibold tracking-[0.2em] text-slate-600">
                  OWNERSHIP NOTES
                </h2>
                <p className="text-[11px] text-slate-400">
                  カタログスペックでは分かりにくい「付き合い方」のイメージを、
                  ポジティブ・ネガティブ・注意したい傾向の三つに分けて整理しています。
                </p>
              </div>
            </Reveal>

            <div className="grid gap-6 md:grid-cols-3">
              {strengths.length > 0 && (
                <Reveal>
                  <GlassCard
                    as="section"
                    padding="lg"
                    className="h-full border border-emerald-100/80 bg-white/90"
                  >
                    <h3 className="text-xs font-semibold tracking-[0.2em] text-emerald-700">
                      STRENGTHS
                    </h3>
                    <ul className="mt-3 space-y-2 text-[12px] leading-relaxed text-slate-700">
                      {strengths.map((item) => (
                        <li key={item} className="flex gap-2">
                          <span className="mt-[5px] h-1 w-3 rounded-full bg-emerald-400" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </GlassCard>
                </Reveal>
              )}

              {weaknesses.length > 0 && (
                <Reveal>
                  <GlassCard
                    as="section"
                    padding="lg"
                    className="h-full border border-amber-100/80 bg-white/90"
                  >
                    <h3 className="text-xs font-semibold tracking-[0.2em] text-amber-700">
                      WEAK POINTS
                    </h3>
                    <ul className="mt-3 space-y-2 text-[12px] leading-relaxed text-slate-700">
                      {weaknesses.map((item) => (
                        <li key={item} className="flex gap-2">
                          <span className="mt-[5px] h-1 w-3 rounded-full bg-amber-400" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </GlassCard>
                </Reveal>
              )}

              {troubleTrends.length > 0 && (
                <Reveal>
                  <GlassCard
                    as="section"
                    padding="lg"
                    className="h-full border border-rose-100/80 bg-white/90"
                  >
                    <h3 className="text-xs font-semibold tracking-[0.2em] text-rose-700">
                      TROUBLE TRENDS
                    </h3>
                    <ul className="mt-3 space-y-2 text-[12px] leading-relaxed text-slate-700">
                      {troubleTrends.map((item) => (
                        <li key={item} className="flex gap-2">
                          <span className="mt-[5px] h-1 w-3 rounded-full bg-rose-400" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="mt-3 text-[10px] leading-relaxed text-rose-700/80">
                      「必ず起きる」という意味ではなく、同世代のクルマと比べて、
                      少し気に留めておきたいポイントのメモに近いイメージです。
                    </p>
                  </GlassCard>
                </Reveal>
              )}
            </div>
          </section>
        )}

        {/* DRIVE IMPRESSIONS & COST SIMULATION */}
        <section id="drive-and-cost" className="mb-12 space-y-6">
          <Reveal>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className="text-xs font-semibold tracking-[0.2em] text-slate-600">
                  DRIVE IMPRESSIONS &amp; COST
                </h2>
                <p className="mt-1 max-w-xl text-[11px] text-slate-500">
                  「街乗り／高速／ロングツーリング／お財布」の 4
                  つの視点から、このクルマとの日常をイメージしてもらうためのゾーンです。
                </p>
              </div>
              <p className="max-w-sm text-[10px] text-slate-400">
                ここは CARS ページの中でもっとも“オーナー目線”が出るブロックです。
                他車種でも同じ構成で揃えると、比較検討がしやすくなります。
              </p>
            </div>
          </Reveal>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
            {/* DRIVE IMPRESSIONS */}
            <Reveal>
              <GlassCard
                as="section"
                padding="lg"
                className="h-full border border-slate-200/80 bg-white/92"
              >
                <h3 className="text-[11px] font-semibold tracking-[0.2em] text-slate-500">
                  DRIVE IMPRESSIONS BY SCENE
                </h3>
                <div className="mt-3 space-y-3 text-[12px] leading-relaxed text-slate-700">
                  {driveScenes.map((scene) => (
                    <div
                      key={scene.id}
                      className="rounded-2xl bg-slate-50/80 px-3 py-2.5"
                    >
                      <p className="text-[10px] font-semibold tracking-[0.18em] text-slate-500">
                        {scene.label}
                      </p>
                      <p className="mt-1 text-[12px] leading-relaxed text-slate-700">
                        {scene.body}
                      </p>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </Reveal>

            {/* COST SIMULATION */}
            <Reveal>
              <GlassCard
                as="section"
                padding="lg"
                className="h-full border border-slate-200/80 bg-white/92"
              >
                <h3 className="text-[11px] font-semibold tracking-[0.2em] text-slate-500">
                  MAINTENANCE &amp; COST SIMULATION
                </h3>
                <p className="mt-2 text-[11px] leading-relaxed text-slate-600">
                  年間 1 万 km 前後走るオーナーを想定した、
                  税金・保険・車検・消耗品を含めた「ざっくり維持費イメージ」です。
                  実際の見積もりは条件により大きく変わるので、あくまで目安としてご覧ください。
                </p>

                <dl className="mt-3 space-y-1.5 text-[11px] text-slate-700">
                  <div className="flex items-baseline justify-between gap-3">
                    <dt className="text-slate-400">自動車税（年）</dt>
                    <dd className="font-medium">
                      {isBMW530iG30 ? "約 4.5 万円（2.0L クラス）" : "排気量クラスに応じた目安額"}
                    </dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-3">
                    <dt className="text-slate-400">自賠責＋任意保険（年）</dt>
                    <dd className="font-medium">
                      {isBMW530iG30 ? "約 10〜15 万円" : "等級・条件により大きく変動"}
                    </dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-3">
                    <dt className="text-slate-400">車検・法定点検積立（年換算）</dt>
                    <dd className="font-medium">
                      {isBMW530iG30 ? "約 10〜15 万円" : "次回車検見積もりから年割りで算出"}
                    </dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-3">
                    <dt className="text-slate-400">
                      タイヤ・オイルなど消耗品（年）
                    </dt>
                    <dd className="font-medium">
                      {isBMW530iG30 ? "約 8〜15 万円" : "走行距離と履歴に応じて変動"}
                    </dd>
                  </div>
                </dl>

                <p className="mt-3 text-[11px] leading-relaxed text-slate-700">
                  {annualCostParagraph}
                </p>
                <p className="mt-2 text-[10px] leading-relaxed text-slate-400">
                  ここで挙げている金額はあくまで編集部の試算であり、実際の金額を保証するものではありません。
                  正確な金額はディーラーや整備工場、保険会社の見積もりをご確認ください。
                </p>

                <div className="mt-4 rounded-2xl bg-slate-50/80 px-3 py-3 text-[11px]">
                  <p className="text-[10px] font-semibold tracking-[0.2em] text-slate-500">
                    関連ガイド
                  </p>
                  <div className="mt-1 space-y-1.5">
                    <Link
                      href="/guide/import-car-shaken-cost"
                      className="block text-tiffany-700 underline-offset-2 hover:underline"
                    >
                      ・輸入車の車検費用を抑える 3 つの考え方
                    </Link>
                    <Link
                      href="/guide/buy-used-bmw-checkpoints"
                      className="block text-tiffany-700 underline-offset-2 hover:underline"
                    >
                      ・中古 BMW を選ぶときに絶対見ておきたいポイント
                    </Link>
                  </div>
                </div>
              </GlassCard>
            </Reveal>
          </div>
        </section>

        {/* VISUAL COMPARISON */}
        <section id="visual-comparison" className="mb-12">
          <Reveal>
            <GlassCard
              as="section"
              padding="lg"
              className="border border-slate-200/80 bg-white/92"
            >
              <div className="flex flex-col gap-6 md:flex-row md:items-center">
                <div className="flex-1 space-y-2">
                  <h2 className="text-xs font-semibold tracking-[0.2em] text-slate-500">
                    VISUAL COMPARISON
                  </h2>
                  <p className="text-[12px] leading-relaxed text-slate-600">
                    年次改良前後の違いや、標準グレードとスポーツグレードの雰囲気の差などを、
                    スライダーで直感的に見比べるためのスペースです。
                    実際の画像が揃い次第、ここに本番用の比較写真を配置していきます。
                  </p>
                  <p className="text-[10px] leading-relaxed text-slate-400">
                    いまは同じ画像を左右に表示していますが、「ホイールのデザイン違い」や
                    「バンパー形状の違い」などが分かるようなビジュアルを将来的に差し込む前提です。
                  </p>
                </div>
                <div className="flex-1">
                  <CompareSlider
                    leftImage={mainImage}
                    rightImage={mainImage}
                    leftAlt={`${car.name} (before)`}
                    rightAlt={`${car.name} (after)`}
                  />
                </div>
              </div>
            </GlassCard>
          </Reveal>
        </section>

        {/* RELATED CARS / NEWS / COLUMN */}
        <section
          id="related-section"
          className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]"
        >
          {/* 関連CARS */}
          <div className="space-y-3">
            <Reveal>
              <div className="flex items-baseline justify-between">
                <h2 className="text-xs font-semibold tracking-[0.2em] text-slate-500">
                  RELATED CARS
                </h2>
                <Link
                  href="/cars"
                  className="text-[10px] tracking-[0.16em] text-tiffany-700 hover:underline"
                >
                  CARS 一覧へ
                </Link>
              </div>
            </Reveal>
            <div className="space-y-3">
              {relatedCars.length === 0 && (
                <p className="text-[11px] text-slate-400">
                  関連する車種はまだ登録されていません。
                </p>
              )}
              {relatedCars.map((rc) => (
                <Reveal key={rc.slug}>
                  <Link href={`/cars/${encodeURIComponent(rc.slug)}`}>
                    <GlassCard
                      as="article"
                      padding="md"
                      interactive
                      className="border border-slate-200/80 bg-white/92"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-[10px] tracking-[0.22em] text-slate-400">
                            {rc.maker}
                          </p>
                          <h3 className="text-[12px] font-semibold text-slate-900">
                            {rc.name}
                          </h3>
                          <p className="mt-1 line-clamp-2 text-[11px] text-slate-500">
                            {rc.summary}
                          </p>
                        </div>
                      </div>
                    </GlassCard>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>

          {/* 関連 NEWS / COLUMN */}
          <div className="space-y-8">
            {/* NEWS */}
            <div className="space-y-3">
              <Reveal>
                <div className="flex items-baseline justify-between gap-2">
                  <h2 className="text-xs font-semibold tracking-[0.2em] text-slate-500">
                    RELATED NEWS
                  </h2>
                  <Link
                    href="/news"
                    className="text-[10px] tracking-[0.16em] text-tiffany-700 hover:underline"
                  >
                    NEWS 一覧へ
                  </Link>
                </div>
              </Reveal>
              <div className="space-y-2">
                {relatedNews.length === 0 && (
                  <p className="text-[11px] text-slate-400">
                    この車種に紐づくニュースはまだ登録されていません。
                  </p>
                )}
                {relatedNews.map((item) => {
                  const dateLabel =
                    item.publishedAtJa ??
                    formatDate(item.publishedAt ?? item.createdAt);
                  return (
                    <Reveal key={item.id}>
                      <Link
                        href={`/news/${encodeURIComponent(item.id)}`}
                        className="block"
                      >
                        <article className="group rounded-xl border border-slate-200/70 bg-white/80 px-4 py-2.5 text-[11px] shadow-sm transition hover:-translate-y-[1px] hover:shadow-md">
                          <p className="line-clamp-2 font-medium tracking-[0.06em] text-slate-900">
                            {item.titleJa ?? item.title}
                          </p>
                          <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] text-slate-400">
                            {item.sourceName && (
                              <span className="tracking-[0.16em]">
                                {item.sourceName}
                              </span>
                            )}
                            {dateLabel && (
                              <span className="tracking-[0.16em]">
                                {dateLabel}
                              </span>
                            )}
                          </div>
                        </article>
                      </Link>
                    </Reveal>
                  );
                })}
              </div>
            </div>

            {/* COLUMN */}
            <div className="space-y-3">
              <Reveal>
                <div className="flex items-baseline justify-between gap-2">
                  <h2 className="text-xs font-semibold tracking-[0.2em] text-slate-500">
                    RELATED COLUMNS
                  </h2>
                  <Link
                    href="/column"
                    className="text-[10px] tracking-[0.16em] text-tiffany-700 hover:underline"
                  >
                    COLUMN 一覧へ
                  </Link>
                </div>
              </Reveal>
              <div className="space-y-2">
                {relatedColumns.length === 0 && (
                  <p className="text-[11px] text-slate-400">
                    この車種に紐づくコラムはまだ登録されていません。
                  </p>
                )}
                {relatedColumns.map((col) => (
                  <Reveal key={col.slug}>
                    <Link
                      href={`/column/${encodeURIComponent(col.slug)}`}
                      className="block"
                    >
                      <article className="rounded-xl border border-slate-200/70 bg-white/80 px-4 py-2.5 text-[11px] shadow-sm transition hover:-translate-y-[1px] hover:shadow-md">
                        <p className="font-semibold tracking-[0.06em] text-slate-900">
                          {col.title}
                        </p>
                        <p className="mt-1 line-clamp-2 text-[11px] text-slate-500">
                          {col.summary}
                        </p>
                        {col.tags && col.tags.length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-1 text-[10px] text-slate-400">
                            {col.tags.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="rounded-full bg-slate-50 px-2 py-0.5"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </article>
                    </Link>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA：査定・ガイドへの導線（アフィ設置想定ゾーン） */}
        <section className="mt-10">
          <Reveal>
            <GlassCard
              as="section"
              padding="lg"
              className="border border-slate-200/80 bg-white/92"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="max-w-xl">
                  <p className="text-[10px] font-semibold tracking-[0.2em] text-slate-500">
                    NEXT STEP
                  </p>
                  <h2 className="mt-1 text-[13px] font-semibold tracking-[0.08em] text-slate-900">
                    {ctaTitle}
                  </h2>
                  <p className="mt-2 text-[11px] leading-relaxed text-slate-600">
                    {ctaBody}
                  </p>
                </div>
                <div className="flex flex-col gap-2 text-[11px]">
                  <Link href="/guide/sell-car-compare-options">
                    <Button
                      size="sm"
                      className="w-full rounded-full px-5 text-[10px] tracking-[0.18em]"
                    >
                      売るときの選択肢を整理する
                    </Button>
                  </Link>
                  <Link href="/guide?category=MAINTENANCE_COST">
                    <button className="w-full rounded-full border border-slate-300 px-5 py-2 text-[10px] tracking-[0.18em] text-slate-600 hover:border-tiffany-400 hover:text-tiffany-700">
                      維持費ガイドをもっと見る
                    </button>
                  </Link>
                </div>
              </div>
              <p className="mt-3 text-[10px] leading-relaxed text-slate-400">
                将来的にはここに「一括査定」「車検予約」「保険見直し」などの外部サービスボタンを
                設置する想定です。CARS / COLUMN / GUIDE いずれのページでも、
                ページ末尾に 1 つだけ“次の一手”を置くことで、世界観を保ちながらアフィ導線を作ります。
              </p>
            </GlassCard>
          </Reveal>
        </section>

        {/* モバイル向けの戻る導線 */}
        <div className="mt-10 border-t border-slate-100 pt-4 lg:hidden">
          <Link
            href="/cars"
            className="inline-flex items-center gap-2 text-xs font-medium tracking-[0.18em] text-slate-500 hover:text-tiffany-600"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200">
              ←
            </span>
            CARS 一覧へ戻る
          </Link>
        </div>
      </div>
    </main>
  );
}
