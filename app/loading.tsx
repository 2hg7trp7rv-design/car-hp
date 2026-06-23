import styles from "@/components/column/lesson17/lesson17.module.css";

export default function Loading() {
  return (
    <div className={`${styles.scope} cbj-lesson17 min-h-screen bg-lesson-cream`}>
      <header className="sticky top-0 z-50 border-b border-lesson-border bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-[1000px] items-center justify-between px-4 py-3">
          <div className="flex items-center gap-1.5">
            <span className="font-quicksand text-xl font-bold tracking-tight text-lesson-primary">
              CBJ
            </span>
            <span className="hidden text-[10px] text-lesson-light sm:inline">
              CAR BOUTIQUE JOURNAL
            </span>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg" aria-hidden="true">
            <span className="block h-0.5 w-5 bg-lesson-primary shadow-[0_6px_0_#2D2D2D,0_-6px_0_#2D2D2D]" />
          </div>
        </div>
      </header>

      <main>
        <section
          className="relative flex min-h-[85vh] flex-col items-center justify-center overflow-hidden"
          style={{ background: "linear-gradient(135deg, #FF6B8A 0%, #FF8E53 100%)" }}
        >
          <div className="plus-pattern absolute inset-0 opacity-40" />
          <div className="animate-float-slow absolute left-[8%] top-[15%] h-16 w-16 rounded-full border border-white/20" />
          <div className="animate-float absolute right-[10%] top-[25%] h-10 w-10 rounded-full border border-white/15" />
          <div className="relative z-10 flex flex-col items-center px-6 pt-16 text-center">
            <div className="mb-8 flex items-center justify-center gap-4 sm:gap-6">
              <div className="animate-float h-20 w-20 overflow-hidden rounded-full border-4 border-white/80 shadow-xl sm:h-24 sm:w-24">
                <img src="/assets/char-juna-avatar.webp" alt="JUNA" className="h-full w-full object-cover" />
              </div>
              <img
                src="/assets/car-illustration.webp"
                alt=""
                className="animate-float-slow h-12 w-12 object-contain opacity-90 sm:h-14 sm:w-14"
              />
              <div className="animate-float h-20 w-20 overflow-hidden rounded-full border-4 border-white/80 shadow-xl sm:h-24 sm:w-24">
                <img src="/assets/char-rina-avatar.webp" alt="莉奈" className="h-full w-full object-cover" />
              </div>
            </div>
            <p className="mb-4 text-sm font-light tracking-[0.3em] text-white/90">Lesson 17</p>
            <h1 className="mb-4 text-3xl font-bold leading-tight text-white drop-shadow-lg sm:text-4xl">
              車のカスタムで
              <br />
              後悔しやすい理由
            </h1>
            <p className="mb-8 max-w-md text-sm leading-relaxed text-white/80 sm:text-base">
              純正を崩す前に。その変更が、車検・保証・整備入庫・売却まで、
              <br className="hidden sm:block" />
              車全体にどう関わるかを確認する。
            </p>
            <div className="flex items-center gap-3 rounded-full bg-white/20 px-5 py-2.5 backdrop-blur-sm">
              <span className="text-sm text-white/90">12 min read</span>
              <span className="text-white/50">|</span>
              <span className="text-sm text-white/90">初級〜中級</span>
              <span className="text-white/50">|</span>
              <span className="text-xs text-white/80">COLUMN</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
