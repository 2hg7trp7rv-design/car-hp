// app/page.tsx
import { HeroSection } from "@/components/home/HeroSection";
import { CategorySection } from "@/components/home/CategorySection";
import { LatestNewsSection } from "@/components/home/LatestNewsSection";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <HeroSection />
      <CategorySection />
      <LatestNewsSection />
    </div>
  );
}
