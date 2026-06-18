import { VisualArticlePage } from "@/components/editorialArticle/VisualArticlePage";
import { VisualJsonArticlePage } from "@/components/editorialArticle/VisualJsonArticlePage";
import articleData from "@/data/article-layouts/modern-car-custom-regret-reason-column.visual.json";
import type { EditorialArticleLabels, EditorialArticleViewModel } from "@/components/editorialArticle/EditorialArticlePage";
import type { InternalLinkMeta } from "@/lib/content/internal-link-index";
import type { VisualArticleData } from "@/types/visual-article";

type KintoArticle = EditorialArticleViewModel & {
  slug?: string | null;
  layoutId?: string | null;
};

type KintoJsonArticlePageProps = {
  article: KintoArticle;
  labels: EditorialArticleLabels;
  linkIndex: Record<string, InternalLinkMeta>;
};

const visualArticleSlug = "modern-car-custom-regret-reason-column";
const visualArticleData = articleData as unknown as VisualArticleData;

const visualArticleFinalTuningCss = `
[data-cbj-visual-json-article] [class*="riskHeader"],
[data-cbj-visual-json-article] [class*="checkHeader"] {
  display: grid !important;
  grid-template-columns: 34px minmax(0, 1fr) !important;
  gap: 14px !important;
  align-items: center !important;
  margin-bottom: 18px !important;
}
[data-cbj-visual-json-article] [class*="riskHeader"] > [class*="riskIcon"],
[data-cbj-visual-json-article] [class*="checkHeader"] > [class*="checkIcon"] {
  display: none !important;
}
[data-cbj-visual-json-article] [class*="riskTitleWrap"],
[data-cbj-visual-json-article] [class*="checkTitleWrap"] {
  min-width: 0 !important;
}
[data-cbj-visual-json-article] [class*="riskHeader"]::before {
  content: "✕" !important;
  color: #DA7E73 !important;
  font-size: 28px !important;
  line-height: 1 !important;
  font-weight: 700 !important;
  display: block !important;
  align-self: center !important;
  text-align: center !important;
}
[data-cbj-visual-json-article] [class*="checkHeader"]::before {
  content: "◯" !important;
  color: #5EC8C2 !important;
  font-size: 28px !important;
  line-height: 1 !important;
  font-weight: 700 !important;
  display: block !important;
  align-self: center !important;
  text-align: center !important;
}
[data-cbj-visual-json-article] [class*="riskTitle"],
[data-cbj-visual-json-article] [class*="checkTitle"] {
  white-space: normal !important;
  overflow-wrap: normal !important;
  word-break: keep-all !important;
  writing-mode: horizontal-tb !important;
  font-size: 22px !important;
  line-height: 1.35 !important;
}
[data-cbj-visual-json-article] [class*="riskSubtitle"],
[data-cbj-visual-json-article] [class*="checkSubtitle"] {
  white-space: normal !important;
  word-break: normal !important;
  font-size: 10px !important;
  letter-spacing: .22em !important;
}
[data-cbj-visual-json-article] [class*="riskList"],
[data-cbj-visual-json-article] [class*="checkList"] {
  padding: 18px 20px !important;
  border-radius: 20px !important;
}
[data-cbj-visual-json-article] [class*="riskCard"],
[data-cbj-visual-json-article] [class*="checkItem"] {
  grid-template-columns: 28px minmax(0, 1fr) !important;
  gap: 12px !important;
  padding-bottom: 16px !important;
}
[data-cbj-visual-json-article] [class*="riskCard"]:not(:first-child),
[data-cbj-visual-json-article] [class*="checkItem"]:not(:first-child) {
  padding-top: 16px !important;
}
[data-cbj-visual-json-article] [class*="riskCardMark"] {
  font-size: 24px !important;
}
[data-cbj-visual-json-article] [class*="checkBox"]::before {
  font-size: 24px !important;
}
[data-cbj-visual-json-article] [class*="riskCardTitle"],
[data-cbj-visual-json-article] [class*="checkItemTitle"] {
  font-size: 16px !important;
  line-height: 1.5 !important;
}
[data-cbj-visual-json-article] [class*="riskCardDesc"],
[data-cbj-visual-json-article] [class*="checkItemDesc"] {
  font-size: 13px !important;
  line-height: 1.85 !important;
}
[data-cbj-visual-json-article] [class*="stepsList"]::before {
  bottom: 38px !important;
}
[data-cbj-visual-json-article] [class*="finalSummaryTitle"] {
  font-size: clamp(32px, 8vw, 50px) !important;
  line-height: 1.14 !important;
}
[data-cbj-visual-json-article] [class*="finalSummaryList"] {
  margin-top: 28px !important;
  gap: 16px !important;
}
[data-cbj-visual-json-article] [class*="finalSummaryItem"] {
  grid-template-columns: 58px minmax(0, 1fr) !important;
  gap: 16px !important;
  padding: 18px 20px !important;
  border-radius: 18px !important;
}
[data-cbj-visual-json-article] [class*="finalSummaryNum"] {
  font-size: 30px !important;
}
[data-cbj-visual-json-article] [class*="finalSummaryItemTitle"] {
  font-size: 19px !important;
}
[data-cbj-visual-json-article] [class*="standaloneCheck"] {
  padding-bottom: 48px !important;
}
[data-cbj-visual-json-article] [class*="standaloneCheckTags"] {
  gap: 12px !important;
}
@media (max-width: 560px) {
  [data-cbj-visual-json-article] [class*="riskHeader"],
  [data-cbj-visual-json-article] [class*="checkHeader"] {
    grid-template-columns: 30px minmax(0, 1fr) !important;
    gap: 10px !important;
  }
  [data-cbj-visual-json-article] [class*="riskHeader"]::before,
  [data-cbj-visual-json-article] [class*="checkHeader"]::before {
    font-size: 24px !important;
  }
  [data-cbj-visual-json-article] [class*="riskTitle"],
  [data-cbj-visual-json-article] [class*="checkTitle"] {
    font-size: 20px !important;
  }
  [data-cbj-visual-json-article] [class*="finalSummaryTitle"] {
    font-size: 32px !important;
  }
}
`;

export function KintoJsonArticlePage(props: KintoJsonArticlePageProps) {
  if (props.article.slug === visualArticleSlug || props.article.layoutId === visualArticleSlug) {
    return (
      <>
        <VisualJsonArticlePage data={visualArticleData} article={props.article} labels={props.labels} />
        <style dangerouslySetInnerHTML={{ __html: visualArticleFinalTuningCss }} />
      </>
    );
  }

  return <VisualArticlePage {...props} />;
}
