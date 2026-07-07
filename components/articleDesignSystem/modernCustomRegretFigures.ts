import type { GuideDetailBlock, GuideDetailSection } from "@/lib/content-types";

const TARGET_SLUG = "modern-car-custom-regret-reason-column";
type FigureBlock = Extract<GuideDetailBlock, { type: "image" }>;

type FigureInsert = {
  sectionId: string;
  anchorTitle?: string;
  figure: FigureBlock;
};

const FIGURE_INSERTS: FigureInsert[] = [
  {
    sectionId: "section-01",
    anchorTitle: "カスタム前に考える3つ",
    figure: {
      type: "image",
      src: "/images/cbj/article-system/content/modern-car-custom-regret-reason-column/custom-decision-axis.png",
      alt: "カスタム前に考える3つの軸の図解",
      label: "カスタム前は、目的・影響範囲・純正戻しの3軸で判断する。",
      fit: "articleWide",
      width: 1536,
      height: 864,
      presentation: { width: "bleed", motion: "fade-up" },
    },
  },
  {
    sectionId: "section-02",
    anchorTitle: "純正吸気系は、フィルターだけでできていない",
    figure: {
      type: "image",
      src: "/images/cbj/article-system/content/modern-car-custom-regret-reason-column/custom-intake-system.png",
      alt: "純正吸気系の構成を示す図解",
      label: "吸気系は、外気の入口からエンジンまでのつながりで見る。",
      fit: "articleWide",
      width: 1536,
      height: 864,
      presentation: { width: "bleed", motion: "fade-up" },
    },
  },
  {
    sectionId: "section-03",
    anchorTitle: "足回りも3つの視点で考える",
    figure: {
      type: "image",
      src: "/images/cbj/article-system/content/modern-car-custom-regret-reason-column/custom-lowered-checkpoints.png",
      alt: "車高変更時の確認点を示す図解",
      label: "車高を下げる時は、見た目だけでなく安全性・快適性・機能性まで確認する。",
      fit: "articleWide",
      width: 1536,
      height: 864,
      presentation: { width: "bleed", motion: "fade-up" },
    },
  },
  {
    sectionId: "section-04",
    figure: {
      type: "image",
      src: "/images/cbj/article-system/content/modern-car-custom-regret-reason-column/custom-electronics-risk.png",
      alt: "電装品の接続先ごとの注意点を示す図解",
      label: "電装品は、どこに接続するかで必要な注意が変わる。",
      fit: "articleWide",
      width: 1536,
      height: 864,
      presentation: { width: "bleed", motion: "fade-up" },
    },
  },
];

function findInsertIndex(blocks: GuideDetailBlock[], anchorTitle?: string): number {
  if (anchorTitle) {
    const anchorIndex = blocks.findIndex(
      (block) => block.type === "subheading" && String(block.title ?? "").includes(anchorTitle),
    );
    if (anchorIndex >= 0) return anchorIndex + 1;
  }

  let index = 0;
  while (index < blocks.length && blocks[index]?.type === "dialogue") {
    index += 1;
  }
  return index;
}

export function enhanceModernCustomRegretColumnFigures(
  slug: string,
  sections?: GuideDetailSection[] | null,
): GuideDetailSection[] | null | undefined {
  if (slug !== TARGET_SLUG || !sections?.length) return sections;

  return sections.map((section) => {
    const insert = FIGURE_INSERTS.find((item) => item.sectionId === section.id);
    if (!insert) return section;

    const blocks = section.blocks ?? [];
    if (blocks.some((block) => block.type === "image" && block.src === insert.figure.src)) {
      return section;
    }

    const insertIndex = findInsertIndex(blocks, insert.anchorTitle);
    return {
      ...section,
      blocks: [
        ...blocks.slice(0, insertIndex),
        insert.figure,
        ...blocks.slice(insertIndex),
      ],
    };
  });
}
