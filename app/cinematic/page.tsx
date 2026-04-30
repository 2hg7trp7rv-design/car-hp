import type { Metadata } from "next";
import { CinematicHero } from "@/components/home/CinematicHero";

export const metadata: Metadata = {
  title: "CAR BOUTIQUE JOURNAL — Automotive Editorial",
  description:
    "A cinematic automotive editorial experience featuring the finest automobiles and stories.",
};

export default function CinematicPage() {
  return (
    <main>
      <CinematicHero />
      {/* Spacer content to enable scroll effect */}
      <section className="min-h-screen bg-paper px-4 py-24 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-4xl">
          <p className="font-mono text-[10px] tracking-[0.18em] text-cobalt">
            EDITORIAL CONTENT
          </p>
          <h2 className="mt-4 font-sans text-[clamp(2rem,5vw,3.5rem)] font-bold leading-[1.1] tracking-[-0.03em] text-ink">
            The Art of Automotive Storytelling
          </h2>
          <p className="mt-6 max-w-2xl text-[16px] leading-[1.9] text-ink-soft">
            Every vehicle carries a narrative — a convergence of engineering
            philosophy, design heritage, and the dreams of those who built it.
            At CAR BOUTIQUE JOURNAL, we uncover these stories with the depth
            and reverence they deserve.
          </p>
        </div>
      </section>
      <section className="min-h-screen bg-paper-light px-4 py-24 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-4xl">
          <p className="font-mono text-[10px] tracking-[0.18em] text-cobalt">
            HERITAGE
          </p>
          <h2 className="mt-4 font-sans text-[clamp(2rem,5vw,3.5rem)] font-bold leading-[1.1] tracking-[-0.03em] text-ink">
            Timeless Machines
          </h2>
          <p className="mt-6 max-w-2xl text-[16px] leading-[1.9] text-ink-soft">
            From the golden era of grand touring to the precision of modern
            engineering, we document the evolution of automotive excellence
            across decades and continents.
          </p>
        </div>
      </section>
    </main>
  );
}
