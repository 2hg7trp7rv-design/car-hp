"use client";

import Navigation from "@/app/components/Navigation";
import HeroSection from "@/app/sections/HeroSection";
import FooterSection from "@/app/sections/FooterSection";
import HomeEditorialSequence from "@/app/sections/HomeEditorialSequence";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0A0A0A] text-white">
      <Navigation />
      <HeroSection />
      <HomeEditorialSequence />
      <FooterSection />
    </main>
  );
}
