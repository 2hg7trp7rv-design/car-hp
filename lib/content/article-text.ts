import type { GuideDetailBlock, GuideDetailSection, GuideFaqItem } from "@/lib/content-types";

/** Index visible editorial copy only; paths, presentation options and IDs are not prose. */
export function blockText(block: GuideDetailBlock): string {
  switch (block.type) {
    case "paragraph": return block.text;
    case "quote": return [block.text, block.caption].join(" ");
    case "subheading": return block.title;
    case "image": return block.alt;
    case "divider": return "";
    case "list": return block.items.join(" ");
    case "comparisonTable": return [block.title, ...block.headers, ...block.rows.flat(), block.note].join(" ");
    case "callout": return [block.title, block.body, ...(block.items ?? [])].join(" ");
    case "flow": return [block.title, ...block.steps.flatMap((step) => [step.label, step.title, step.body])].join(" ");
    case "timeline": return [block.title, ...block.items.flatMap((item) => [item.label, item.title, item.body, ...(item.items ?? [])])].join(" ");
    case "decisionCards": return [block.title, ...block.cards.flatMap((card) => [card.badge, card.title, card.body, ...(card.items ?? [])])].join(" ");
    case "caseStudy": return [block.title, ...block.cases.flatMap((item) => [item.title, item.intro, ...item.rows.flatMap((row) => [row.label, row.value, row.note])])].join(" ");
    case "editorialBoard": return [block.eyebrow, block.title, block.lead, ...block.items.flatMap((item) => [item.number, item.title, item.body, ...(item.items ?? [])]), block.note].join(" ");
    default: {
      const unsupported: never = block;
      throw new Error(`Unsupported article block: ${JSON.stringify(unsupported)}`);
    }
  }
}

export function articleText(article: {
  detailSections?: GuideDetailSection[] | null;
  body?: string | null;
  faq?: GuideFaqItem[] | null;
}): string {
  const sections = article.detailSections ?? [];
  return [
    sections.length
      ? sections.flatMap((section) => [section.displayTitle ?? section.title, section.deck, ...section.blocks.map(blockText)]).join(" ")
      : article.body,
    ...(article.faq ?? []).flatMap((faq) => [faq.question, faq.answer]),
  ].join(" ");
}
