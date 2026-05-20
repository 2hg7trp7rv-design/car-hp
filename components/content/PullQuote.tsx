import { cn } from "@/lib/utils";

import { renderInlineMarkdown } from "@/components/content/InlineMarkdown";

type Props = {
  text: string;
  className?: string;
};

export function PullQuote({ text, className }: Props) {
  const t = (text ?? "").toString().trim();
  if (!t) return null;

  return (
    <blockquote className={cn("cbj-pullquote", className)}>
      <p className="cbj-pullquote-text">{renderInlineMarkdown(t)}</p>
    </blockquote>
  );
}
