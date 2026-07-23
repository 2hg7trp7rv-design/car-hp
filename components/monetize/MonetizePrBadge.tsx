// components/monetize/MonetizePrBadge.tsx
//
// 景表法対応: マネタイズブロックが表示される記事の上部に自動で出す
// 「PR/広告を含みます」バッジ。表示条件は canRenderGuideMonetizeBlock() で
// CTAブロックと共有する（lib/monetize.ts 参照）。

type MonetizePrBadgeProps = {
  className?: string;
};

export function MonetizePrBadge({ className }: MonetizePrBadgeProps) {
  return (
    <div className={className}>
      <p className="inline-flex w-fit items-center gap-2 rounded-full border border-[rgba(192,124,89,0.24)] bg-[rgba(241,226,216,0.85)] px-3 py-1.5 text-[11px] font-semibold tracking-[0.08em] text-[var(--accent-clay)]">
        <span aria-hidden="true">PR</span>
        <span>この記事には広告・アフィリエイトリンクを含みます</span>
      </p>
    </div>
  );
}
