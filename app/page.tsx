import type { Metadata } from "next";

import ColumnLesson17Page from "@/components/column/lesson17/ColumnLesson17Page";

const TITLE = "車のカスタムで後悔しやすい理由";
const DESCRIPTION =
  "純正を崩す前に。その変更が、車検・保証・整備入庫・売却まで、車全体にどう関わるかを確認する。";
const ARTICLE_PATH = "/column/modern-car-custom-regret-reason-column";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: ARTICLE_PATH },
  openGraph: {
    title: `${TITLE} | CAR BOUTIQUE JOURNAL`,
    description: DESCRIPTION,
    type: "article",
    url: ARTICLE_PATH,
    images: ["/ogp-default.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: `${TITLE} | CAR BOUTIQUE JOURNAL`,
    description: DESCRIPTION,
    images: ["/ogp-default.jpg"],
  },
};

export default function Home() {
  return <ColumnLesson17Page />;
}
