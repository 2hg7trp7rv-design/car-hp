// components/car/CarRotator.tsx
"use client";

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  type MouseEvent,
  type TouchEvent,
} from "react";
import Image from "next/image";

type CarRotatorProps = {
  images?: string[];
  imageUrl?: string;
  alt?: string;
  aspectRatio?: string;
  className?: string;
  autoRotate?: boolean;
};

export function CarRotator({
  images,
  imageUrl,
  alt,
  aspectRatio = "aspect-[16/9]",
  className = "",
  autoRotate = false,
}: CarRotatorProps) {
  const frames = useMemo(
    () => (images && images.length > 0 ? images : imageUrl ? [imageUrl] : []),
    [images, imageUrl],
  );
  const totalFrames = frames.length;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [loadedCount, setLoadedCount] = useState(0);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const sensitivity = 15;

  const isAllLoaded = loadedCount >= totalFrames && totalFrames > 0;
  const progress = totalFrames > 0 ? Math.round((loadedCount / totalFrames) * 100) : 0;
  const altBase = alt ?? "360度車両ビュー";

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia === "undefined") {
      return;
    }
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const listener = () => setReducedMotion(media.matches);
    listener();
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, []);

  useEffect(() => {
    if (totalFrames === 0) return;

    let mounted = true;
    setLoadedCount(0);

    frames.forEach((src) => {
      const img = new window.Image();
      img.src = src;
      img.onload = () => {
        if (mounted) setLoadedCount((prev) => prev + 1);
      };
      img.onerror = () => {
        if (mounted) setLoadedCount((prev) => prev + 1);
      };
    });

    return () => {
      mounted = false;
    };
  }, [frames, totalFrames]);

  useEffect(() => {
    if (!autoRotate) return;
    if (hasInteracted) return;
    if (!isAllLoaded) return;
    if (isDragging) return;
    if (totalFrames <= 1) return;
    if (reducedMotion) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalFrames);
    }, 120);

    return () => clearInterval(interval);
  }, [autoRotate, hasInteracted, isAllLoaded, isDragging, totalFrames, reducedMotion]);

  const handleStart = (clientX: number) => {
    if (!isAllLoaded || totalFrames <= 1) return;
    setIsDragging(true);
    setStartX(clientX);
    setHasInteracted(true);
  };

  const handleMove = useCallback(
    (clientX: number) => {
      if (!isDragging || totalFrames <= 1) return;

      const delta = startX - clientX;
      if (Math.abs(delta) > sensitivity) {
        const direction = delta > 0 ? 1 : -1;
        setCurrentIndex((prev) => (prev + direction + totalFrames) % totalFrames);
        setStartX(clientX);
      }
    },
    [isDragging, sensitivity, startX, totalFrames],
  );

  const handleEnd = () => setIsDragging(false);

  const onMouseDown = (e: MouseEvent<HTMLDivElement>) => handleStart(e.clientX);
  const onMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    e.preventDefault();
    handleMove(e.clientX);
  };
  const onMouseUp = () => handleEnd();
  const onMouseLeave = () => handleEnd();

  const onTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 0) return;
    handleStart(e.touches[0].clientX);
  };
  const onTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    if (!isDragging || e.touches.length === 0) return;
    handleMove(e.touches[0].clientX);
  };
  const onTouchEnd = () => handleEnd();

  if (totalFrames === 0) {
    return (
      <div
        className={[
          "flex items-center justify-center rounded-[24px] border border-[var(--border-default)]",
          "bg-[var(--surface-1)] text-sm text-[var(--text-tertiary)]",
          aspectRatio,
        ].join(" ")}
      >
        画像がまだ登録されていません
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={[
        "relative w-full overflow-hidden rounded-[24px] border border-[var(--border-default)]",
        "bg-[var(--surface-1)] shadow-soft-card",
        aspectRatio,
        className,
        isAllLoaded ? "cursor-grab active:cursor-grabbing" : "cursor-wait",
        "touch-none select-none",
      ].join(" ")}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      aria-label="360度ビューワー。ドラッグして回転。"
      aria-busy={!isAllLoaded}
      role="group"
    >
      {totalFrames > 1 && (
        <div className="absolute left-4 top-4 z-20 flex items-center gap-2 rounded-full border border-[rgba(122,135,108,0.24)] bg-[rgba(251,248,243,0.92)] px-3 py-1.5 text-[10px] font-semibold tracking-[0.18em] text-[var(--text-primary)] shadow-sm backdrop-blur-sm">
          <div className="h-2 w-2 rounded-full bg-[var(--accent-base)]" />
          <span>360°ビュー</span>
        </div>
      )}

      {!isAllLoaded && (
        <div
          className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[rgba(251,248,243,0.92)] backdrop-blur-sm transition-opacity duration-300"
          aria-live="polite"
        >
          <div className="mb-3 text-[10px] font-semibold tracking-[0.28em] text-[var(--text-tertiary)]">
            読み込み中
          </div>
          <div className="h-[3px] w-32 overflow-hidden rounded-full bg-[rgba(31,28,25,0.08)]">
            <div
              className="h-full bg-[var(--accent-base)] transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-3 text-[10px] font-medium text-[var(--accent-strong)]">{progress}%</div>
        </div>
      )}

      {isAllLoaded && !hasInteracted && !autoRotate && totalFrames > 1 && !reducedMotion && (
        <div className="pointer-events-none absolute inset-x-0 bottom-5 z-20 flex justify-center px-4">
          <div className="rounded-full border border-[rgba(31,28,25,0.10)] bg-[rgba(251,248,243,0.88)] px-4 py-2 text-[10px] font-semibold tracking-[0.16em] text-[var(--text-secondary)] backdrop-blur-sm">
            左右にドラッグして見る
          </div>
        </div>
      )}

      <div className="relative h-full w-full">
        {frames.map((src, index) => (
          <Image
            key={`${src}-${index}`}
            src={src}
            alt={index === 0 ? altBase : `${altBase} ${index + 1}`}
            fill
            sizes="(min-width: 1024px) 800px, 100vw"
            className={`object-cover transition-opacity duration-100 ${
              index === currentIndex ? "z-10 opacity-100" : "z-0 opacity-0"
            }`}
            draggable={false}
            priority={index === 0}
          />
        ))}
      </div>

      {totalFrames > 1 && (
        <div className="absolute bottom-6 left-0 right-0 z-20 flex justify-center px-4">
          <div className="relative h-[3px] w-full max-w-[132px] rounded-full bg-[rgba(251,248,243,0.62)]">
            <div
              className="absolute top-0 h-full rounded-full bg-[var(--accent-base)] transition-all duration-75 ease-out"
              style={{
                width: "20%",
                left: `${(currentIndex / totalFrames) * 80}%`,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default CarRotator;
