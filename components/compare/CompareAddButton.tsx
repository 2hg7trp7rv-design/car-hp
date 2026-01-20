"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { CompareIcon } from "@/components/compare/CompareIcon";
import { addCompareSlug, buildCompareUrl, useCompareSlugs } from "@/components/compare/compareStore";
import { usePageContext } from "@/lib/analytics/pageContext";
import { trackCompareAdd } from "@/lib/analytics/events";

type Props = {
  slug: string;
  label?: string;
  /**
   * icon: アイコンのみ
   * pill: テキスト付き
   */
  mode?: "icon" | "pill";
  /** 追加後に /compare へ遷移する */
  goToCompare?: boolean;
  /** 分析用 */
  source?: string;
  className?: string;
};

export function CompareAddButton({
  slug,
  label = "比較",
  mode = "icon",
  goToCompare = false,
  source = "unknown",
  className,
}: Props) {
  const router = useRouter();
  const ctx = usePageContext();
  const { slugs } = useCompareSlugs();

  const isActive = useMemo(() => slugs.includes(slug), [slugs, slug]);
  const [justAdded, setJustAdded] = useState(false);

  const onClick = () => {
    const next = addCompareSlug(slug);

    trackCompareAdd({
      page_type: ctx.page_type,
      content_id: ctx.content_id,
      car_slug: slug,
      count: next.length,
      source,
    });

    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 900);

    if (goToCompare) {
      router.push(buildCompareUrl(next));
    }
  };

  if (mode === "pill") {
    return (
      <Button
        type="button"
        variant={isActive ? "subtle" : "outline"}
        size="sm"
        magnetic
        onClick={onClick}
        className={className}
        aria-label={label}
      >
        <CompareIcon className="h-4 w-4" />
        {justAdded ? "追加" : label}
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant={isActive ? "subtle" : "outline"}
      size="icon"
      magnetic={false}
      onClick={onClick}
      className={[
        "h-8 w-8 rounded-full bg-white/80 backdrop-blur",
        isActive ? "border-tiffany-300 text-tiffany-700" : "border-slate-200 text-slate-700",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label={isActive ? "比較に追加済み" : "比較に追加"}
      title={isActive ? "比較に追加済み" : "比較に追加"}
    >
      <CompareIcon className={justAdded ? "h-4 w-4 scale-[1.05]" : "h-4 w-4"} />
    </Button>
  );
}
