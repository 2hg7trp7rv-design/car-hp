// app/tech/page.tsx
import Link from "next/link";

export default function TechPage() {
  return (
    <div className="relative min-h-screen bg-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(129,216,208,0.65) 0%, rgba(129,216,208,0.65) 70%, #ffffff 100%)",
        }}
      />

      <div className="relative z-10">
        <div className="mx-auto max-w-5xl px-4 pb-16 pt-10 sm:px-6 lg:px-8">
          <header className="border-b border-neutral-200 pb-6">
            <p className="text-[10px] uppercase tracking-[0.3em] text-sky-700">
              TECH FOCUS
            </p>
            <h1 className="mt-2 text-xl font-semibold tracking-tight text-neutral-900">
              技術解説
            </h1>
            <p className="mt-2 text-xs text-neutral-600">
              エンジン、電動化、シャシー、先進運転支援まで。難しい専門用語はなるべく抑えつつ、メカ好きも納得できる深さで解説するためのコーナーです。
            </p>
          </header>

          <main className="mt-8 space-y-4">
            <article className="rounded-2xl border border-neutral-200 bg-white/90 p-5 shadow-sm shadow-neutral-100">
              <h2 className="text-sm font-semibold tracking-tight text-neutral-900">
                解説記事の構成イメージ
              </h2>
              <ul className="mt-3 list-disc pl-5 text-xs leading-relaxed text-neutral-600">
                <li>1段落目で「何の技術か」「どこがポイントか」をざっくり説明</li>
                <li>次に仕組みを図解イメージとともにやわらかく説明</li>
                <li>最後に実際の走りや維持費との関係など、ユーザー目線のまとめ</li>
              </ul>
            </article>

            <article className="rounded-2xl border border-dashed border-neutral-300 bg-white/70 p-5 text-xs text-neutral-500">
              実際の技術解説記事は、ここに追加していきます。
              カテゴリーやタグを付けて、ニュース同様にフィルタリングする構成にも発展させられます。
            </article>
          </main>

          <div className="mt-8 text-[11px] text-neutral-500">
            <Link
              href="/"
              className="underline-offset-4 hover:text-neutral-700 hover:underline"
            >
              トップページへ戻る
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
