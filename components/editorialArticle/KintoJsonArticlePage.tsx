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
  grid-template-columns: 30px minmax(0, 1fr) !important;
  gap: 12px !important;
  align-items: center !important;
  margin-bottom: 16px !important;
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
  font-size: 24px !important;
  line-height: 1 !important;
  font-weight: 700 !important;
  display: block !important;
  align-self: center !important;
  text-align: center !important;
}
[data-cbj-visual-json-article] [class*="checkHeader"]::before {
  content: "◯" !important;
  color: #5EC8C2 !important;
  font-size: 24px !important;
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
  font-size: 20px !important;
  line-height: 1.32 !important;
}
[data-cbj-visual-json-article] [class*="riskSubtitle"],
[data-cbj-visual-json-article] [class*="checkSubtitle"] {
  white-space: normal !important;
  word-break: normal !important;
  font-size: 10px !important;
  letter-spacing: .21em !important;
  margin-top: 4px !important;
}
[data-cbj-visual-json-article] [class*="riskList"],
[data-cbj-visual-json-article] [class*="checkList"] {
  padding: 16px 18px !important;
  border-radius: 18px !important;
}
[data-cbj-visual-json-article] [class*="riskCard"],
[data-cbj-visual-json-article] [class*="checkItem"] {
  grid-template-columns: 26px minmax(0, 1fr) !important;
  gap: 10px !important;
  padding-bottom: 14px !important;
  min-height: 0 !important;
}
[data-cbj-visual-json-article] [class*="riskCard"]:not(:first-child),
[data-cbj-visual-json-article] [class*="checkItem"]:not(:first-child) {
  padding-top: 14px !important;
}
[data-cbj-visual-json-article] [class*="riskCardMark"] {
  font-size: 22px !important;
}
[data-cbj-visual-json-article] [class*="checkBox"]::before {
  font-size: 22px !important;
}
[data-cbj-visual-json-article] [class*="riskCardTitle"],
[data-cbj-visual-json-article] [class*="checkItemTitle"] {
  font-size: 15px !important;
  line-height: 1.5 !important;
}
[data-cbj-visual-json-article] [class*="riskCardDesc"],
[data-cbj-visual-json-article] [class*="checkItemDesc"] {
  font-size: 12.5px !important;
  line-height: 1.78 !important;
  margin-top: 6px !important;
}

[data-cbj-visual-json-article] > section[class*="standaloneCheck"] {
  padding: 32px 0 34px !important;
}
[data-cbj-visual-json-article] [class*="standaloneCheckCard"] {
  display: block !important;
  align-content: start !important;
  justify-content: start !important;
  height: auto !important;
  min-height: 0 !important;
  max-height: none !important;
  padding: 26px 30px 30px !important;
  border-radius: 24px !important;
}
[data-cbj-visual-json-article] [class*="standaloneCheckCard"] > * {
  margin-top: 0 !important;
  margin-bottom: 0 !important;
}
[data-cbj-visual-json-article] [class*="standaloneCheckLabel"] {
  display: block !important;
  font-size: 11px !important;
  line-height: 1 !important;
  letter-spacing: .28em !important;
  margin: 0 0 18px !important;
}
[data-cbj-visual-json-article] [class*="standaloneCheckTitle"] {
  display: block !important;
  font-size: clamp(27px, 5.5vw, 36px) !important;
  line-height: 1.18 !important;
  letter-spacing: -.035em !important;
  margin: 0 !important;
  padding: 0 !important;
}
[data-cbj-visual-json-article] [class*="standaloneCheckDesc"] {
  font-size: 13.8px !important;
  line-height: 1.78 !important;
  margin: 22px 0 0 !important;
  padding: 0 !important;
}
[data-cbj-visual-json-article] [class*="standaloneCheckTags"] {
  display: flex !important;
  flex-wrap: wrap !important;
  justify-content: flex-start !important;
  gap: 9px 10px !important;
  margin: 22px 0 0 !important;
  padding: 0 !important;
  align-items: center !important;
}
[data-cbj-visual-json-article] [class*="standaloneCheckTag"] {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  width: auto !important;
  height: auto !important;
  min-width: 0 !important;
  min-height: 0 !important;
  max-width: none !important;
  flex: 0 0 auto !important;
  line-height: 1.18 !important;
  white-space: nowrap !important;
  font-size: 12px !important;
  padding: 6px 12px !important;
  border-radius: 999px !important;
}

[data-cbj-visual-json-article] [class*="stepsSection"] {
  padding-top: 38px !important;
}
[data-cbj-visual-json-article] [class*="stepsList"] {
  gap: 46px !important;
  padding-left: 0 !important;
}
[data-cbj-visual-json-article] [class*="stepsList"]::before {
  left: 18px !important;
  top: 16px !important;
  bottom: 32px !important;
  width: 3px !important;
}
[data-cbj-visual-json-article] [class*="stepItem"] {
  grid-template-columns: 40px minmax(0, 1fr) !important;
  gap: 20px !important;
  align-items: start !important;
}
[data-cbj-visual-json-article] [class*="stepNumber"] {
  width: 36px !important;
  height: 36px !important;
  min-width: 36px !important;
  font-size: 18px !important;
}
[data-cbj-visual-json-article] [class*="stepTitle"] {
  font-size: 18px !important;
  line-height: 1.48 !important;
}
[data-cbj-visual-json-article] [class*="stepDesc"] {
  font-size: 14.5px !important;
  line-height: 1.9 !important;
  margin-top: 8px !important;
}

[data-cbj-visual-json-article] [class*="finalSummaryTitle"] {
  font-size: clamp(30px, 7.6vw, 46px) !important;
  line-height: 1.13 !important;
  letter-spacing: -.04em !important;
}
[data-cbj-visual-json-article] [class*="finalSummaryList"] {
  margin-top: 24px !important;
  gap: 13px !important;
}
[data-cbj-visual-json-article] [class*="finalSummaryItem"] {
  grid-template-columns: 52px minmax(0, 1fr) !important;
  gap: 14px !important;
  padding: 15px 17px !important;
  border-radius: 16px !important;
  min-height: 0 !important;
  align-items: start !important;
}
[data-cbj-visual-json-article] [class*="finalSummaryNum"] {
  font-size: 27px !important;
  line-height: 1 !important;
}
[data-cbj-visual-json-article] [class*="finalSummaryItemTitle"] {
  font-size: 17px !important;
  line-height: 1.4 !important;
}
[data-cbj-visual-json-article] [class*="finalSummaryItemDesc"] {
  font-size: 13px !important;
  line-height: 1.75 !important;
  margin-top: 6px !important;
}

@media (max-width: 560px) {
  [data-cbj-visual-json-article] [class*="riskHeader"],
  [data-cbj-visual-json-article] [class*="checkHeader"] {
    grid-template-columns: 28px minmax(0, 1fr) !important;
    gap: 9px !important;
  }
  [data-cbj-visual-json-article] [class*="riskHeader"]::before,
  [data-cbj-visual-json-article] [class*="checkHeader"]::before {
    font-size: 22px !important;
  }
  [data-cbj-visual-json-article] [class*="riskTitle"],
  [data-cbj-visual-json-article] [class*="checkTitle"] {
    font-size: 19px !important;
  }
  [data-cbj-visual-json-article] > section[class*="standaloneCheck"] {
    padding: 26px 0 28px !important;
  }
  [data-cbj-visual-json-article] [class*="standaloneCheckCard"] {
    padding: 24px 24px 26px !important;
    border-radius: 22px !important;
  }
  [data-cbj-visual-json-article] [class*="standaloneCheckLabel"] {
    font-size: 10.5px !important;
    margin-bottom: 16px !important;
  }
  [data-cbj-visual-json-article] [class*="standaloneCheckTitle"] {
    font-size: 27px !important;
    line-height: 1.18 !important;
  }
  [data-cbj-visual-json-article] [class*="standaloneCheckDesc"] {
    font-size: 13.4px !important;
    line-height: 1.74 !important;
    margin-top: 20px !important;
  }
  [data-cbj-visual-json-article] [class*="standaloneCheckTags"] {
    justify-content: flex-start !important;
    gap: 8px 9px !important;
    margin-top: 20px !important;
  }
  [data-cbj-visual-json-article] [class*="standaloneCheckTag"] {
    font-size: 11.5px !important;
    padding: 5.5px 10px !important;
  }
  [data-cbj-visual-json-article] [class*="stepsList"] {
    gap: 44px !important;
  }
  [data-cbj-visual-json-article] [class*="stepItem"] {
    grid-template-columns: 38px minmax(0, 1fr) !important;
    gap: 18px !important;
  }
  [data-cbj-visual-json-article] [class*="stepNumber"] {
    width: 34px !important;
    height: 34px !important;
    min-width: 34px !important;
    font-size: 17px !important;
  }
  [data-cbj-visual-json-article] [class*="finalSummaryTitle"] {
    font-size: 30px !important;
  }
  [data-cbj-visual-json-article] [class*="finalSummaryItem"] {
    grid-template-columns: 48px minmax(0, 1fr) !important;
    padding: 14px 15px !important;
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
