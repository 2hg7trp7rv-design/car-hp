import type { Metadata } from 'next';

import VisualJsonArticlePage from '@/components/editorialArticle/VisualJsonArticlePage';
import articleData from '@/data/article-layouts/modern-car-custom-regret-reason-column.visual.json';
import type { VisualArticleData } from '@/types/visual-article';

const TITLE = '車のカスタムで後悔しやすい理由';
const DESCRIPTION =
  '純正を崩す前に。その変更が、車検・保証・整備入庫・売却まで、車全体にどう関わるかを確認する。';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: `${TITLE} | CAR BOUTIQUE JOURNAL`,
    description: DESCRIPTION,
    type: 'article',
    images: ['/assets/og-image.webp'],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${TITLE} | CAR BOUTIQUE JOURNAL`,
    description: DESCRIPTION,
    images: ['/assets/og-image.webp'],
  },
};

export default function Home() {
  return <VisualJsonArticlePage data={articleData as VisualArticleData} />;
}
