import { VisualArticlePage } from "@/components/editorialArticle/VisualArticlePage";
import type { EditorialArticleLabels, EditorialArticleViewModel } from "@/components/editorialArticle/EditorialArticlePage";
import type { InternalLinkMeta } from "@/lib/content/internal-link-index";

type KintoArticle = EditorialArticleViewModel & {
  slug?: string | null;
  layoutId?: string | null;
};

type KintoJsonArticlePageProps = {
  article: KintoArticle;
  labels: EditorialArticleLabels;
  linkIndex: Record<string, InternalLinkMeta>;
};

export function KintoJsonArticlePage(props: KintoJsonArticlePageProps) {
  return <VisualArticlePage {...props} />;
}
