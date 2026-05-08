// components/heritage/RelatedGuidesSection.tsx

import { extractHeritageGuideSlugs } from "@/lib/heritage";
import type { HeritageItem } from "@/lib/heritage";
import { GuideCardList } from "@/components/guide/GuideCardList";

type Props = {
  heritage: HeritageItem;
};

/**
 * HERITAGE → GUIDE 導線
 * 「判断材料」として GUIDE を添える
 */
export function RelatedGuidesSection({ heritage }: Props) {
  const guideSlugs = extractHeritageGuideSlugs(heritage);

  return (
    <section>
      <h2>関連ガイド</h2>

      {guideSlugs.length === 0 ? (
        <p>関連するガイドは準備中です。</p>
      ) : (
        <GuideCardList slugs={guideSlugs} />
      )}
    </section>
  );
}
