// app/cars/page.tsx
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "車種一覧 | CAR BOUTIQUE",
  description:
    "新型車の概要や変更点、長所・短所を整理した車種データの入り口ページです。BMW 530i G30など注目モデルから順次追加していきます。",
};

type Props = {
  searchParams?: {
    q?: string;
    maker?: string;
    depth?: string;
  };
};

type CarDepth = "ライト向け" | "マニアック寄り";

type Car = {
  slug: string;
  maker: string;
  year: number;
  name: string;
  summary: string;
  depth: CarDepth;
};

const cars: Car[] = [
  {
    slug: "bmw-530i-g30",
    maker: "BMW",
    year: 2018,
    name: "BMW 530i M Sport (G30)",
    summary:
      "「ビジネスアスリート」の異名を持つ、Dセグメントセダンのベンチマーク。静粛性とスポーツ性能のバランスが極めて高いレベルで融合している。",
    depth: "マニアック寄り",
  },
  {
    slug: "crown-sport",
    maker: "TOYOTA",
    year: 2023,
    name: "TOYOTA CROWN SPORT",
    summary:
      "新しいクラウン群の中でも最もエモーショナルなデザインを持つSUV。走りを楽しむためのクラウンとして位置づけられている。",
    depth: "ライト向け",
  },
];

function filterCars(all: Car[], params?: Props["searchParams"]) {
  const q = (params?.q ?? "").trim().toLowerCase();
  const maker = params?.maker ?? "all";
  const depth = params?.depth ?? "all";

  return all.filter((car) => {
    if (maker !== "all" && car.maker !== maker) return false;
    if (depth !== "all" && car.depth !== depth) return false;

    if (q) {
      const text = `${car.maker} ${car.year} ${car.name} ${car.summary}`.toLowerCase();
      if (!text.includes(q)) return false;
    }

    return true;
  });
}

export default function CarsPage({ searchParams }: Props) {
  const q = (searchParams?.q ?? "").trim();
  const maker = searchParams?.maker ?? "all";
  const depth = searchParams?.depth ?? "all";

  const filtered = filterCars(cars, searchParams);

  return (
    <main className="min-h-screen px-4 pt-24 pb-24 md:px-8">
      <section className="mx-auto flex max-w-5xl flex-col gap-10 md:gap-12">
        {/* ヘッダー */}
        <header className="max-w-3xl">
          <p className="text-xs font-semibold tracking-[0.35em] text-slate-500">
            CARS
          </p>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
            車種一覧
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-slate-700 md:text-base">
            新型車の概要と、過去モデルからの変更点・良くなった点／悪くなった点を整理していくページです。
            フィルターで気になる車だけを絞り込みながら、じっくり比較できるようにしていきます。
          </p>
        </header>

        {/* フィルター */}
        <form
          className="rounded-3xl bg-white/75 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.16)] backdrop-blur-md md:p-7"
          method="get"
        >
          <div className="grid gap-5 md:grid-cols-3 md:gap-6">
            <div className="md:col-span-3">
              <label
                htmlFor="q"
                className="text-xs font-semibold tracking-[0.18em] text-slate-500"
              >
                キーワード
              </label>
              <div className="mt-2">
                <input
                  id="q"
                  name="q"
                  type="search"
                  placeholder="例）BMW 5シリーズ / クラウン / セダン など"
                  defaultValue={q}
                  className="w-full rounded-full border border-white/60 bg-slate-50/70 px-4 py-2.5 text-sm text-slate-800 shadow-inner outline-none ring-0 placeholder:text-slate-400 focus:border-[#0ABAB5]/70 focus:bg-white focus:ring-2 focus:ring-[#0ABAB5]/20"
                />
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold tracking-[0.18em] text-slate-500">
                メーカー
              </span>
              <div className="mt-2">
                <select
                  name="maker"
                  defaultValue={maker}
                  className="w-full rounded-full border border-white/60 bg-slate-50/70 px-4 py-2.5 text-sm text-slate-800 shadow-inner outline-none ring-0 focus:border-[#0ABAB5]/70 focus:bg-white focus:ring-2 focus:ring-[#0ABAB5]/20"
                >
                  <option value="all">すべて</option>
                  <option value="BMW">BMW</option>
                  <option value="TOYOTA">TOYOTA</option>
                </select>
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold tracking-[0.18em] text-slate-500">
                解説の濃さ
              </span>
              <div className="mt-2">
                <select
                  name="depth"
                  defaultValue={depth}
                  className="w-full rounded-full border border-white/60 bg-slate-50/70 px-4 py-2.5 text-sm text-slate-800 shadow-inner outline-none ring-0 focus:border-[#0ABAB5]/70 focus:bg-white focus:ring-2 focus:ring-[#0ABAB5]/20"
                >
                  <option value="all">すべて</option>
                  <option value="ライト向け">ライト向け</option>
                  <option value="マニアック寄り">マニアック寄り</option>
                </select>
              </div>
            </div>

            <div className="md:flex md:flex-col md:items-end md:justify-end">
              <div className="mt-3 flex gap-3 md:mt-0">
                <button
                  type="submit"
                  className="inline-flex items-center rounded-full bg-slate-900 px-5 py-2 text-xs font-medium tracking-wide text-white hover:bg-slate-800"
                >
                  絞り込む
                </button>
                <Link
                  href="/cars"
                  className="inline-flex items-center rounded-full border border-[#0ABAB5]/40 bg-white/60 px-5 py-2 text-xs font-medium tracking-wide text-[#0ABAB5] hover:bg-white"
                >
                  クリア
                </Link>
              </div>
            </div>
          </div>
        </form>

        {/* リスト */}
        <section className="space-y-4 md:space-y-5">
          {filtered.length === 0 && (
            <p className="text-sm text-slate-600">
              条件に合う車種が見つかりませんでした。フィルターを緩めて再検索してみてください。
            </p>
          )}

          {filtered.map((car) => (
            <Link
              key={car.slug}
              href={`/cars/${car.slug}`}
              className="block rounded-3xl bg-white/80 p-5 shadow-[0_16px_40px_rgba(15,23,42,0.16)] backdrop-blur-md transition-transform hover:-translate-y-0.5 hover:shadow-[0_20px_55px_rgba(15,23,42,0.22)] md:p-6"
            >
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-slate-500">
                <span>{car.maker}</span>
                <span className="h-[1px] w-3 rounded-full bg-slate-300" />
                <span>{car.year}年</span>
              </div>

              <h2 className="mt-2 text-lg font-semibold tracking-tight text-slate-900 md:text-xl">
                {car.name}
              </h2>

              <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-slate-700">
                {car.summary}
              </p>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <div className="inline-flex items-center rounded-full bg-slate-100/90 px-3 py-1 text-[11px] font-medium text-slate-600">
                  {car.depth === "マニアック寄り"
                    ? "マニアック解説あり"
                    : "ライトな解説からスタート"}
                </div>

                <span className="text-xs font-medium text-[#0ABAB5]">
                  詳しく見る →
                </span>
              </div>
            </Link>
          ))}
        </section>

        <footer className="mt-4 text-xs text-slate-500">
          © 2025 CAR BOUTIQUE Driving Elegance for Car Enthusiasts
        </footer>
      </section>
    </main>
  );
}
