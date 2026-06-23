import VisualJsonArticlePage from "@/components/editorialArticle/VisualJsonArticlePage";
import articleData from "@/data/article-layouts/modern-car-custom-regret-reason-column.visual.json";
import type { VisualArticleData } from "@/types/visual-article";

export default function ColumnLesson17Page() {
  return <VisualJsonArticlePage data={articleData as VisualArticleData} />;
}
