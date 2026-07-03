import { ArticleHeader } from "@/components/articleDesignSystem/ArticleHeader";
import { ArticleFlow } from "@/components/articleDesignSystem/ArticleFlow";
import { BackToTop } from "@/components/articleDesignSystem/BackToTop";
import { ArticleBlockStack, Chapter, DialogueGroup, KeyPoints, RichParagraph } from "@/components/articleDesignSystem/ArticleContent";
import {
  ActionBox,
  ArticleFooter,
  AuthorCard,
  Checkpoints,
  FaqSection,
  RelatedSection,
  SourcesSection,
} from "@/components/articleDesignSystem/ArticleEndSections";
import { ArticleHero } from "@/components/articleDesignSystem/ArticleHero";
import type { GuideDetailBlock, GuideDetailSection } from "@/lib/content-types";
import type { ArticleDesignPageProps, ArticleViewModel } from "@/types/article-design-system";

import styles from "@/components/articleDesignSystem/article-design-system.module.css";

const DEFAULT_PALETTE = [
  "#FF8C42",
  "#8BC34A",
  "#F06292",
  "#42A5F5",
  "#FFCA28",
  "#AB47BC",
  "#26A69A",
  "#FF6B8A",
  "#5C6BC0",
  "#EF5350",
  "#7CB342",
  "#26C6DA",
];

const KIMI_V15_HIGHLIGHTS: Record<string, string[]> = {};

const INLINE_DETAIL_SUBHEADINGS = new Set([
  "空気の温度",
  "センサー周辺の空気の流れ",
  "水と汚れ",
  "サスペンションが動ける量",
  "タイヤの向きや角度",
  "タイヤや車体との干渉",
  "運転支援機能への影響",
  "車種への適合",
  "電源の取り方",
  "配線と固定",
  "車両信号への接続",
]);

function slugify(value?: string | null): string {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u3040-\u30ff\u4e00-\u9faf]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72);
}

function splitInlineSubheadingBlock(block: GuideDetailBlock): GuideDetailBlock[] {
  if (block.type !== "paragraph") return [block];

  const text = String(block.text ?? "").replace(/\r\n?/gu, "\n");
  const paragraphs = text
    .split(/\n{2,}/u)
    .map((part) => part.trim())
    .filter(Boolean);

  if (paragraphs.length !== 1) return [block];

  const lines = paragraphs[0]
    .split(/\n+/u)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) return [block];

  const [maybeTitle, ...bodyLines] = lines;
  if (!INLINE_DETAIL_SUBHEADINGS.has(maybeTitle)) return [block];

  const bodyText = bodyLines.join("\n").trim();
  if (!bodyText) return [block];

  const { text: _text, ...rest } = block;

  return [
    {
      type: "subheading",
      level: 4,
      title: maybeTitle,
    } satisfies GuideDetailBlock,
    {
      ...rest,
      type: "paragraph",
      text: bodyText,
    } satisfies GuideDetailBlock,
  ];
}

function normalizeSections(article: ArticleViewModel): Array<GuideDetailSection & { id: string; displayTitle: string }> {
  const source: GuideDetailSection[] = article.sections?.length
    ? article.sections
    : String(article.body ?? "")
        .split(/\n{2,}/u)
        .map((text) => text.trim())
        .filter(Boolean)
        .map((text, index) => ({
          id: `article-body-${index + 1}`,
          title: index === 0 ? "本文" : `本文 ${index + 1}`,
          blocks: [{ type: "paragraph", text } satisfies GuideDetailBlock],
        }));

  return source.map((section, index) => {
    const displayTitle = section.displayTitle?.trim() || section.title.trim() || `セクション ${index + 1}`;
    const blocks = section.blocks.flatMap((block) => {
      const highlights = block.type === "paragraph" ? KIMI_V15_HIGHLIGHTS[block.text] : undefined;
      const normalizedBlock = highlights ? { ...block, highlights } : block;
      return splitInlineSubheadingBlock(normalizedBlock);
    });
    return {
      ...section,
      blocks,
      id: section.id?.trim() || slugify(displayTitle) || `section-${index + 1}`,
      displayTitle,
    };
  });
}

export function CbjWorldArticlePage({ article, labels, linkIndex }: ArticleDesignPageProps) {
  const sections = normalizeSections(article);
  const kind = labels.footerListHref.startsWith("/column") ? "COLUMN" : "GUIDE";
  const palette = article.articleDesign?.sectionPalette?.length ? article.articleDesign.sectionPalette : DEFAULT_PALETTE;
  const isKimiMock = article.articleDesign?.layoutPreset === "column-renewal-v1";
  const flowItems = sections.map((section, index) => ({
    id: section.id,
    number: String(index + 1).padStart(2, "0"),
    title: isKimiMock ? section.displayTitle.replace(/[「」\n]/gu, "") : section.displayTitle,
    color: palette[index % palette.length],
  }));

  return (
    <main className={`${styles.page} ${isKimiMock ? `${styles.pageKimiMock} cbj-kimi-v15` : ""}`} id="cb-main" data-cbj-world-article>
      <ArticleHeader />
      <ArticleHero article={article} kind={kind} />
      <div className={styles.contentColumn}>
        <section className={styles.introSection}>
          <DialogueGroup items={article.articleDesign?.introDialogue} />
          {article.lead ? (
            <RichParagraph text={article.lead} linkIndex={linkIndex} className={styles.introText} lineMode="natural" />
          ) : null}
          <KeyPoints points={article.keyPoints} linkIndex={linkIndex} />
        </section>
        <ArticleFlow items={flowItems} />
        <article className={styles.articleBody}>
          {sections.map((section, index) => (
            <Chapter
              key={section.id}
              section={section}
              index={index}
              color={palette[index % palette.length]}
              dialogue={article.articleDesign?.sectionDialogues?.[section.id]}
              linkIndex={linkIndex}
            />
          ))}
        </article>
        <DialogueGroup items={article.articleDesign?.closingDialogue} />
        <ArticleBlockStack blocks={article.articleDesign?.closingBlocks} linkIndex={linkIndex} />
        <Checkpoints items={article.checkpoints} />
        <ActionBox article={article} />
        <AuthorCard article={article} />
        <RelatedSection article={article} labels={labels} />
        <FaqSection article={article} />
        <SourcesSection article={article} labels={labels} />
      </div>
      <ArticleFooter labels={labels} />
      <BackToTop />
    </main>
  );
}
