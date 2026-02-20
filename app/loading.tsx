// app/loading.tsx
import { DetailFixedBackground } from "@/components/layout/DetailFixedBackground";

/**
 * ルート遷移時のローディングUI（作品版）
 * - 大きなスケルトンを出すと“制作途中”に見えるため、最小の合図だけにする
 * - Stage（暗い展示空間）の空気を切らない
 */
export default function Loading() {
  return (
    <main className="relative min-h-screen text-white">
      <DetailFixedBackground />

      <div className="page-shell pb-24 pt-24">
        <div className="mx-auto max-w-md text-center">
          <p className="text-[10px] tracking-[0.34em] text-white/60">
            CAR BOUTIQUE JOURNAL
          </p>

          <p className="cb-font-display mt-4 text-[18px] tracking-[0.10em] text-white/85">
            Loading
          </p>

          <div className="mt-6 h-px w-full bg-gradient-to-r from-transparent via-white/25 to-transparent" />

          <div className="mt-6 flex justify-center gap-2" aria-hidden="true">
            <span className="h-1.5 w-1.5 rounded-full bg-white/55 animate-pulse" />
            <span className="h-1.5 w-1.5 rounded-full bg-white/35 animate-pulse" />
            <span className="h-1.5 w-1.5 rounded-full bg-white/25 animate-pulse" />
          </div>
        </div>
      </div>
    </main>
  );
}
