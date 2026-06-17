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

export function KintoJsonArticlePage(props: KintoJsonArticlePageProps) {
  const slug = props.article.slug ?? props.article.layoutId;

  if (slug === visualArticleSlug) {
    return <VisualJsonArticlePage data={visualArticleData} article={props.article} labels={props.labels} />;
  }

  return <VisualArticlePage {...props} />;
}
