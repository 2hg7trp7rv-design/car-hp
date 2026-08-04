import type { Metadata } from "next";

import RefbookHome from "@/components/home/RefbookHome";

const TITLE = "車の“なんで？”に、0から答える参考書";
const DESCRIPTION =
  "部品の名前も知らない初学者から、もっと深く知りたいマスター候補まで。絵と図と例え話で、車の「なぜ？」が「なるほど！」に変わる自動車メディア。";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    title: `CAR BOUTIQUE JOURNAL — ${TITLE}`,
    description: DESCRIPTION,
    type: "website",
    url: "/",
    images: ["/ogp-default.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: `CAR BOUTIQUE JOURNAL — ${TITLE}`,
    description: DESCRIPTION,
    images: ["/ogp-default.jpg"],
  },
};

export default function Home() {
  return <RefbookHome />;
}
