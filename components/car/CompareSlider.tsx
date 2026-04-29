// components/car/CompareSlider.tsx
"use client";

import React, {
  useState,
  useRef,
  useCallback,
  type MouseEvent,
  type TouchEvent,
  type KeyboardEvent,
} from "react";
import Image from "next/image";

type CompareSliderProps = {
  leftImage: string;
  leftLabel?: string;
  leftAlt?: string;
  rightImage: string;
  rightLabel?: string;
  rightAlt?: string;
  initialPosition?: number;
  className?: string;
};

export default function CompareSlider({
  leftImage,
  leftLabel,
  leftAlt = "比較画像（左）",
  rightImage,
  rightLabel,
  rightAlt = "比較画像（右）",
  initialPosition = 50,
  className = "",
}: CompareSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(() =>
    Math.min(100, Math.max(0, initialPosition)),
  );
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = Math.max(0, Math.min((x / rect.width) * 100, 100));
    setSliderPosition(percent);
  }, []);

  const onMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const onMouseUp = () => {
    setIsDragging(false);
  };
  const onMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    e.preventDefault();
    handleMove(e.clientX);
  };

  const onTouchStart = () => {
    setIsDragging(true);
  };
  const onTouchEnd = () => {
    setIsDragging(false);
  };
  const onTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    if (!isDragging || e.touches.length === 0) return;
    handleMove(e.touches[0].clientX);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      setSliderPosition((prev) => Math.max(0, prev - 5));
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      setSliderPosition((prev) => Math.min(100, prev + 5));
    }
  };

  return (
    <div
      ref={containerRef}
      className={[
        "group relative w-full select-none overflow-hidden rounded-[24px] border border-[var(--border-default)]",
        "bg-[rgba(251,248,243,0.72)] shadow-soft-card touch-none",
        className,
      ].join(" ")}
      role="slider"
      aria-valuenow={Math.round(sliderPosition)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-orientation="horizontal"
      aria-label="画像比較スライダー"
      tabIndex={0}
      onKeyDown={onKeyDown}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onTouchEnd={onTouchEnd}
      onMouseMove={onMouseMove}
      onTouchMove={onTouchMove}
    >
      <div className="absolute inset-0 h-full w-full">
        <Image
          src={rightImage}
          alt={rightAlt}
          fill
          className="object-cover"
          sizes="(min-width: 1024px) 800px, 100vw"
          quality={72}
        />
        {rightLabel && (
          <div className="absolute bottom-4 right-4 z-10 rounded-full border border-[rgba(76,69,61,0.26)] bg-[rgba(251,248,243,0.88)] px-4 py-1.5 text-[10px] font-semibold tracking-[0.16em] text-[var(--text-primary)] backdrop-blur-sm">
            {rightLabel}
          </div>
        )}
      </div>

      <div
        className="absolute inset-0 h-full w-full overflow-hidden border-r border-[rgba(251,248,243,0.72)]"
        style={{ width: `${sliderPosition}%` }}
      >
        <Image
          src={leftImage}
          alt={leftAlt}
          fill
          className="object-cover"
          sizes="(min-width: 1024px) 800px, 100vw"
          quality={72}
        />
        {leftLabel && (
          <div className="absolute bottom-4 left-4 z-10 rounded-full border border-[rgba(27,63,229,0.22)] bg-[rgba(229,235,239,0.88)] px-4 py-1.5 text-[10px] font-semibold tracking-[0.16em] text-[var(--text-primary)] backdrop-blur-sm">
            {leftLabel}
          </div>
        )}
      </div>

      <div
        className="absolute inset-y-0 z-20 cursor-ew-resize"
        style={{ left: `${sliderPosition}%` }}
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
      >
        <div className="h-full w-[2px] -translate-x-1/2 bg-[rgba(251,248,243,0.92)] shadow-[0_0_12px_rgba(14,12,10,0.18)]" />

        <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div
            className={[
              "flex h-12 w-12 items-center justify-center rounded-full border border-[rgba(14,12,10,0.14)]",
              "bg-[rgba(251,248,243,0.96)] text-[var(--text-primary)] shadow-soft-card",
              "transition-transform duration-150 group-hover:scale-[1.03] active:scale-[0.98]",
            ].join(" ")}
            aria-hidden="true"
          >
            <svg
              width="20"
              height="20"
              stroke="currentColor"
              strokeWidth="2.2"
              fill="none"
              className="text-[var(--accent-strong)]"
              viewBox="0 0 24 24"
            >
              <path d="M11 18l-6-6 6-6" />
              <path d="M13 6l6 6-6 6" />
            </svg>
          </div>
        </div>
      </div>

      <input
        type="range"
        min={0}
        max={100}
        value={sliderPosition}
        onChange={(e) =>
          setSliderPosition(Math.min(100, Math.max(0, Number(e.target.value))))
        }
        className="absolute inset-0 z-30 h-full w-full cursor-ew-resize opacity-0"
        aria-hidden="true"
      />
    </div>
  );
}
