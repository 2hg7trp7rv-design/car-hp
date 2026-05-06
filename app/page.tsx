"use client";

import Navigation from "@/app/components/Navigation";
import ImageMarquee from "@/components/ImageMarquee";
import HeroSection from "@/app/sections/HeroSection";
import FullScreenSlider from "@/app/sections/FullScreenSlider";
import PartsAssemblySection from "@/app/sections/PartsAssemblySection";
import ArchiveStories from "@/app/sections/ArchiveStories";
import FloatingGallerySection from "@/app/sections/FloatingGallerySection";
import CategoriesSection from "@/app/sections/CategoriesSection";
import HorizontalScrollSection from "@/app/sections/HorizontalScrollSection";
import StatsSection from "@/app/sections/StatsSection";
import FooterSection from "@/app/sections/FooterSection";

const marqueeImages = [
  "/hero-bugatti-v3.jpg",
  "/car-gtr.jpg",
  "/car-mustang.jpg",
  "/car-corvette.jpg",
  "/car-red.jpg",
  "/detail-engine.jpg",
  "/detail-oil.jpg",
  "/detail-wheel.jpg",
];

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0A0A0A] text-white">
      <Navigation />
      <HeroSection />
      <div className="overflow-hidden py-10">
        <ImageMarquee images={marqueeImages} direction="left" speed={30} imageHeight="180px" />
      </div>
      <PartsAssemblySection />
      <div className="overflow-hidden py-10">
        <ImageMarquee images={[...marqueeImages].reverse()} direction="right" speed={35} imageHeight="150px" />
      </div>
      <FullScreenSlider />
      <ArchiveStories />
      <FloatingGallerySection />
      <CategoriesSection />
      <HorizontalScrollSection />
      <StatsSection />
      <FooterSection />
    </main>
  );
}
