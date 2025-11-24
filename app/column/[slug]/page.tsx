// app/column/[slug]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getColumnBySlug } from "@/lib/columns";

type Props = {
  params: {
    slug: string;
  };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const column = await getColumnBySlug(params.slug);

  if (!column) {
    return {
      title: "コラムが見つかりません | CAR BOUTIQUE",
    };
  }

  return {
    title: `${column.title} | CAR BOUTIQUE`,
    description: column.summary,
  };
}

// slug ごとの本文コンポーネント
function ColumnBody({ slug }: { slug: string }) {
  if (slug === "b48-vanos-longlife") {
    return (
      <article className="prose prose-slate prose-sm max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-li:marker:text-slate-400 prose-a:text-emerald-700">
        <p>
          「B48はロングライフオイルがダメ」「1万km無交換だとVANOSが死ぬ」――
          そんな話をSNSや動画で見たことがある人は多いと思います。
        </p>
        <p>
          しかし、実際の設計思想や作動原理を踏まえると、
          「ロングライフオイル＝即トラブル」ではありません。
          問題になりやすいのは、
          <strong>使い方とメンテナンスの組み合わせ</strong>
          です。
        </p>

        <h2>B48のVANOSまわりはどう動いているか</h2>
        <p>
          B48の可変バルブタイミング機構(VANOS)は、
          オイルポンプで加圧されたエンジンオイルをソレノイドバルブで制御し、
          カムスプロケット内部のベーンを油圧で動かすことで
          吸排気カムの位相を連続的に変化させています。
        </p>
        <ul>
          <li>オイルポンプで加圧されたオイルがVANOS系の油路へ流れる</li>
          <li>センターバルブ内のソレノイドが開閉し、カムスプロケット内部へ給排油</li>
          <li>ベーンが回転し、カム位相が進角/遅角する</li>
        </ul>
        <p>
          つまり
          <strong>「きれいで適正粘度のオイルが、必要な圧力で供給される」</strong>
          ことが前提条件になります。
          スラッジや粘度低下で油路が細くなったり、油圧が不安定になると、
          VANOSの動きも鈍くなり、エラーや警告につながります。
        </p>

        <h2>ロングライフオイルで起きがちなパターン</h2>
        <p>
          BMW純正のLL規格オイル自体は、長期使用を前提にした高性能オイルです。
          ただし、日本の使用環境と組み合わさると、次のような条件が重なりやすくなります。
        </p>
        <ul>
          <li>渋滞の多い都市部でアイドリング時間が長い</li>
          <li>エンジンが完全に温まりきらない短距離走行が多い</li>
          <li>外気温が高く、夏場は高温状態が続きやすい</li>
          <li>年1回点検のタイミングまでほとんどオイル交換をしない</li>
        </ul>
        <p>
          これらが重なった状態で1万〜2万km無交換になると、
          オイルの酸化や粘度低下、スラッジ増加が進み、
          VANOSやターボのオイルラインに負担が掛かりやすくなります。
        </p>

        <h2>よくある誤解と、実際に気を付けたいポイント</h2>
        <h3>「ロングライフ＝悪」ではなく「日本の使い方と合っていない」</h3>
        <p>
          欧州での高速巡航中心の使い方なら、
          エンジンは常に十分に温まり、回転もある程度高い領域を使います。
          この前提ならロングライフオイルは本来の性能を発揮しやすく、
          想定どおりの交換インターバルでも問題が出にくい設計です。
        </p>
        <p>
          一方で日本では
          <strong>「低回転・短距離・渋滞・高温」</strong>
          という、オイルにとって厳しい条件が重なりがちです。
          ここで欧州と同じインターバルをそのまま当てはめると、
          B48に限らず多くのエンジンでコンディションが悪化しやすくなります。
        </p>

        <h3>実用的な「折衷案」としての交換サイクル</h3>
        <p>
          ディーラー推奨のロングライフ前提サイクルより、
          <strong>「走行距離7,000〜8,000kmごと、もしくは1年ごと」</strong>
          を目安に交換するオーナーが多いのはこのためです。
        </p>
        <ul>
          <li>
            年間走行距離が少ない人：
            <strong>「1年ごと」</strong> を基本に、距離が伸びた年は早めに交換
          </li>
          <li>
            距離を走る人：
            <strong>「7,000km前後」</strong> を上限に、早め早めのサイクルで
          </li>
        </ul>
        <p>
          オイル自体もLL規格にこだわる必要はなく、
          BMW承認を取っている高品質な5W-30/0W-30などを
          信頼できるショップで交換していれば現実的には十分です。
        </p>

        <h2>B48のVANOSを長く安定させるためのチェックリスト</h2>
        <ol>
          <li>
            <strong>オイル量と状態を定期的に確認する</strong>
            <br />
            電子メーター上の油量チェックだけでなく、
            可能であれば実際にオイルの色や匂いも確認すると安心感が高まります。
          </li>
          <li>
            <strong>アイドリングだけの暖気を長時間続けない</strong>
            <br />
            始動直後は早めに走り出し、負荷を掛けすぎない範囲で
            エンジンを温める方がオイルにも優しい使い方です。
          </li>
          <li>
            <strong>たまに高速道路やバイパスでしっかり回す</strong>
            <br />
            ずっと低回転だけで使うよりも、
            たまに高めの回転域を使うことで内部の汚れが溜まりにくくなります。
          </li>
          <li>
            <strong>異音や警告が出たら「様子見」しない</strong>
            <br />
            カラカラ音やチェックランプは「まだ走れる」サインではなく、
            「今なら軽症で済むかもしれない」というサインと捉えるのが安全です。
          </li>
        </ol>

        <h2>ディーラー整備と専門店、それぞれの付き合い方</h2>
        <p>
          B48のような最新世代のエンジンは、
          <strong>ディーラーの診断機とアップデート情報</strong>
          が大きな武器になります。一方で、
          <strong>オイル交換や日常メンテナンスは専門店の方が柔軟</strong>
          であるケースも多く、両方を上手く使い分けるのがおすすめです。
        </p>
        <ul>
          <li>
            電子制御系の警告やリコール・サービスキャンペーン：
            ディーラーで最新情報を確認
          </li>
          <li>
            オイル交換や軽整備：
            BMWに詳しい専門店で、オーナーの使い方に合わせた提案を受ける
          </li>
        </ul>

        <h2>まとめ：B48と長く付き合うために</h2>
        <p>
          B48のVANOSトラブルは、決して「欠陥エンジンだから」ではありません。
          ロングライフオイルの思想と、日本の使用環境とのギャップを理解し、
          自分の走り方に合わせてメンテナンスを調整すれば、
          まだまだ長く付き合っていけるエンジンです。
        </p>
        <p>
          「ロングライフだから放置しても大丈夫」でも、
          「純正は全部ダメだから社外に変えればOK」でもなく、
          <strong>自分の使い方に合わせて、少しだけ丁寧にケアする</strong>
          ことが、B48と穏やかに付き合う一番の近道だと感じています。
        </p>
      </article>
    );
  }

  // それ以外の slug は暫定プレースホルダ
  return (
    <p className="mt-6 text-sm text-slate-600">
      この記事の本文は準備中です。公開まで少しお待ちください。
    </p>
  );
}

export default async function ColumnDetailPage({ params }: Props) {
  const column = await getColumnBySlug(params.slug);

  if (!column) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="text-xs font-semibold tracking-[0.18em] text-slate-500">
        COLUMN
      </div>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">
        {column.title}
      </h1>
      <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
          {column.tags.join(" / ")}
        </span>
        <span>公開日 {new Date(column.publishedAt).toLocaleDateString()}</span>
      </div>

      <p className="mt-5 text-sm leading-relaxed text-slate-700">
        {column.summary}
      </p>

      <div className="mt-8 border-t border-slate-200 pt-6">
        <ColumnBody slug={params.slug} />
      </div>

      <div className="mt-10 border-t border-slate-200 pt-6">
        <Link
          href="/column"
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-emerald-700"
        >
          ← コラム一覧へ戻る
        </Link>
      </div>
    </main>
  );
}
