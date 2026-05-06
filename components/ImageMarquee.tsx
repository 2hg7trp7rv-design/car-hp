"use client";

import { useRef, useEffect } from 'react';
import gsap from 'gsap';

interface Props {
  images: string[];
  direction?: 'left' | 'right';
  speed?: number;
  imageHeight?: string;
}

export default function ImageMarquee({
  images,
  direction = 'left',
  speed = 30,
  imageHeight = '180px',
}: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const allImages = [...images, ...images];

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const items = track.querySelectorAll('.marquee-item');
    const totalWidth = Array.from(items)
      .slice(0, images.length)
      .reduce((acc, item) => acc + (item as HTMLElement).offsetWidth + 16, 0);
    gsap.set(track, { x: direction === 'left' ? 0 : -totalWidth / 2 });
    const tween = gsap.to(track, {
      x: direction === 'left' ? -totalWidth / 2 : 0,
      duration: speed,
      ease: 'none',
      repeat: -1,
    });
    return () => {
      tween.kill();
    };
  }, [direction, speed, images.length]);

  return (
    <div className="overflow-hidden">
      <div ref={trackRef} className="flex gap-4 w-max will-change-transform">
        {allImages.map((src, i) => (
          <div
            key={`${src}-${i}`}
            className="marquee-item flex-shrink-0 rounded-lg overflow-hidden"
            style={{ height: imageHeight }}
          >
            <img
              src={src}
              alt=""
              className="h-full w-auto object-cover"
              loading="lazy"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
