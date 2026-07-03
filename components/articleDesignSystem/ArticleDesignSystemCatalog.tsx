import { ArticleFlow } from "@/components/articleDesignSystem/ArticleFlow";
import { ArticleHeader } from "@/components/articleDesignSystem/ArticleHeader";
import { Chapter, DialogueGroup, KeyPoints } from "@/components/articleDesignSystem/ArticleContent";
import { ArticleHero } from "@/components/articleDesignSystem/ArticleHero";
import { resolveArticleToyBox } from "@/components/articleDesignSystem/article-toybox";
import type { GuideDetailSection } from "@/lib/content-types";
import type { ArticleViewModel } from "@/types/article-design-system";

import styles from "@/components/articleDesignSystem/article-design-system.module.css";

const article: ArticleViewModel = {
  slug: "article-system-preview",
  title: "CBJ記事デザインシステム",
  eyebrowLabel: "INTERNAL PREVIEW",
  breadcrumbTrail: [],
  author: { name: "CAR BOUTIQUE JOURNAL 編集部", credential: "デザイン確認用" },
  lead: "記事内容に合わせて、会話・カード・図解・表・手順の種類、数、順番を選ぶための開発用カタログです。",
  readMinutes: 5,
  keyPoints: [
    "同じ世界観を維持しながら、記事ごとに必要な部品だけを選べる。",
    "COLUMNとGUIDEで構成を固定せず、意味に合わせて表示形式を変えられる。",
    "モーション、カードの強さ、本文幅を記事データから明示指定できる。",
  ],
  articleDesign: {
    version: "cbj-world-v1",
    layoutPreset: "cbj-shared-editorial-v1",
    lessonNumber: 0,
    difficulty: "開発用",
    heroTitle: "記事デザインの\n部品カタログ",
    heroLead: "文字だけを差し替える固定テンプレートではなく、意味に合うデザインを箱から選ぶ。",
    heroGradient: ["#FF6B8A", "#FF8E53"],
    introDialogue: [
      { character: "juna", text: "カードを使う場所も、会話の数も、記事ごとに変えていいんだよね。", variant: "lead", motion: "fade-left" },
      { character: "rina", text: "そう。内容の役割を先に決めて、その役割に合う部品を選ぶための一覧だよ。", variant: "bubble", motion: "fade-right" },
    ],
  },
};

const sections: Array<GuideDetailSection & { id: string; displayTitle: string }> = [
  {
    id: "catalog-dialogue",
    title: "会話と文章の強弱",
    displayTitle: "会話と文章の\n強弱を選ぶ",
    deck: "導入・補足・章の接続で、同じキャラクターを異なる密度で使います。",
    blocks: [
      {
        type: "paragraph",
        text: "章の最初に置く導入文は、通常本文より少し強く見せることができます。内容を要約し、その章で何を判断するのかを先に伝えるための表示です。",
        presentation: { variant: "lead", motion: "fade-up" },
      },
      {
        type: "subheading",
        title: "章の中を複数テーマに分ける見出し",
        presentation: { variant: "section", motion: "fade-up" },
      },
      {
        type: "paragraph",
        text: "通常本文は自然な段落として流し、**重要な判断軸**だけを強調します。文章を一文ごとに強制改行せず、読みやすいまとまりを保ちます。",
        highlights: ["重要な判断軸"],
      },
      {
        type: "callout",
        tone: "info",
        title: "POINT型",
        body: "読者が持ち帰る結論や、その章で最も重要な判断軸に使います。",
        presentation: { variant: "soft", motion: "scale-in" },
      },
      {
        type: "callout",
        tone: "warn",
        title: "CAUTION型",
        body: "誤解すると安全性・保証・費用に関わる内容へ使います。",
        presentation: { variant: "emphasis", motion: "scale-in" },
      },
    ],
  },
  {
    id: "catalog-comparison",
    title: "比較カードの選び方",
    displayTitle: "比較の意味で\nカードを選ぶ",
    deck: "同じ表データでも、NG／OK、確認リスト、数値表で見せ方を変えます。",
    blocks: [
      {
        type: "comparisonTable",
        title: "NGとOKを対比する",
        headers: ["判断", "内容"],
        rows: [
          ["NG", "見た目だけで選ぶ。\n戻し方を確認しない。"],
          ["OK", "適合と施工状態を確認する。\n純正部品と記録を残す。"],
        ],
        display: "contrast",
        presentation: { variant: "emphasis", motion: "fade-up" },
      },
      {
        type: "comparisonTable",
        title: "順番に確認する",
        headers: ["項目", "確認内容"],
        rows: [
          ["適合", "型式・年式・装備との適合を確認する。"],
          ["施工", "固定・配線・干渉を確認する。"],
          ["記録", "部品名、施工日、純正状態を残す。"],
        ],
        display: "checklist",
        presentation: { variant: "soft", motion: "fade-up" },
      },
      {
        type: "comparisonTable",
        title: "数値を横に比較する",
        headers: ["項目", "標準", "変更後"],
        rows: [
          ["車高", "純正", "-20mm"],
          ["確認", "基準値", "実測・再調整"],
        ],
        display: "table",
        presentation: { variant: "outline" },
      },
    ],
  },
  {
    id: "catalog-visual",
    title: "図解と手順",
    displayTitle: "図解と手順を\n役割で使い分ける",
    deck: "文章で理解しにくい関係性は図解、実行順序はステップとして見せます。",
    blocks: [
      {
        type: "image",
        src: "/images/cbj/article-system/custom-system-map-v2.svg",
        alt: "車両システムの関係を示すサンプル図解",
        label: "関係性を一目で理解させる横幅の広い図解",
        fit: "contain",
        presentation: { width: "wide", motion: "scale-in" },
      },
      {
        type: "flow",
        title: "安全に進める5ステップ",
        steps: [
          { label: "01", title: "目的を決める", body: "何を改善したいかを言葉にします。" },
          { label: "02", title: "適合を確認する", body: "車種、型式、年式、装備を確認します。" },
          { label: "03", title: "戻せる方法を選ぶ", body: "純正部品と施工記録を残します。" },
        ],
        presentation: { variant: "emphasis", motion: "fade-up" },
      },
    ],
  },
];

const flowItems = sections.map((section, index) => ({
  id: section.id,
  number: String(index + 1).padStart(2, "0"),
  title: section.displayTitle,
  color: ["#FF8C42", "#8BC34A", "#42A5F5"][index],
}));

const dialogues = {
  "catalog-dialogue": [
    { character: "juna" as const, text: "同じ吹き出しでも、導入と補足で大きさを変えられると使いやすいね。", variant: "compact" as const, motion: "fade-left" as const },
    { character: "rina" as const, text: "会話を入れること自体が目的にならないよう、理解を助ける場所だけに使うよ。", variant: "aside" as const, motion: "fade-right" as const },
  ],
};

export function ArticleDesignSystemCatalog() {
  const toyBox = resolveArticleToyBox(article.articleDesign);

  return (
    <main
      className={[styles.page, toyBox.enabled ? styles.pageKimiMock : "", toyBox.pageClassName].filter(Boolean).join(" ")}
      id="cb-main"
      data-cbj-world-article
      data-article-toybox={toyBox.id}
    >
      <ArticleHeader />
      <ArticleHero article={article} kind="COLUMN" />
      <div className={styles.contentColumn}>
        <section className={styles.introSection}>
          <DialogueGroup items={article.articleDesign?.introDialogue} />
          <p className={styles.introText}>{article.lead}</p>
          <KeyPoints points={article.keyPoints} linkIndex={{}} />
        </section>
        <ArticleFlow items={flowItems} />
        <article className={styles.articleBody}>
          {sections.map((section, index) => (
            <Chapter
              key={section.id}
              section={section}
              index={index}
              color={flowItems[index].color}
              dialogue={dialogues[section.id as keyof typeof dialogues]}
              linkIndex={{}}
            />
          ))}
        </article>
      </div>
    </main>
  );
}
