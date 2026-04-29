import { DetailFixedBackground } from "@/components/layout/DetailFixedBackground";

export default function Loading() {
  return (
    <main className="detail-page">
      <DetailFixedBackground />
      <div className="page-shell pb-24 pt-24 sm:pt-28">
        <div className="mx-auto max-w-md">
          <div className="detail-card-muted p-8 text-center sm:p-10">
            <p className="text-[10px] font-semibold tracking-[0.28em] text-[var(--text-tertiary)]">
              CAR BOUTIQUE JOURNAL
            </p>
            <p className="mt-4 text-[28px] font-semibold tracking-[-0.04em] text-[var(--text-primary)]">
              読み込み中
            </p>
            <p className="mt-3 text-[14px] leading-relaxed text-[var(--text-secondary)]">
              大きな演出は入れず、そのまま次のページを開いています。
            </p>

            <div className="mx-auto mt-6 h-px w-full max-w-[240px] bg-[rgba(14,12,10,0.08)]" />

            <div className="mt-6 flex justify-center gap-2" aria-hidden="true">
              <span className="h-2 w-2 rounded-full bg-[rgba(27,63,229,0.22)]" />
              <span className="h-2 w-2 rounded-full bg-[rgba(27,63,229,0.34)]" />
              <span className="h-2 w-2 rounded-full bg-[rgba(27,63,229,0.22)]" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
