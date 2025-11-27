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
  /** 左側（Before） */
  leftImage: string;
  leftLabel?: string;
  leftAlt?: string;

  /** 右側（After） */
  rightImage: string;
  rightLabel?: string;
  rightAlt?: string;

  /** 初期位置 */
  initialPosition?: number;

  className?: string;
};

export default function CompareSlider({
  leftImage,
  leftLabel,
  leftAlt = "Left Image",
  rightImage,
  rightLabel,
  rightAlt = "Right Image",
  initialPosition = 50,
  className = "",
}: CompareSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  /** 位置更新 */
  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = Math.max(0, Math.min((x / rect.width) * 100, 100));

    setSliderPosition(percent);
  }, []);

  // --- Mouse events ---
  const onMouseDown = () => setIsDragging(true);
  const onMouseUp = () => setIsDragging(false);
  const onMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  // --- Touch events ---
  const onTouchStart = () => setIsDragging(true);
  const onTouchEnd = () => setIsDragging(false);
  const onTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    if (!isDragging || e.touches.length === 0) return;
    handleMove(e.touches[0].clientX);
  };

  // --- Keyboard accessibility ---
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowLeft") {
      setSliderPosition((prev) => Math.max(0, prev - 5));
    } else if (e.key === "ArrowRight") {
      setSliderPosition((prev) => Math.min(100, prev + 5));
    }
  };

  return (
    <div
      className={`group relative w-full select-none overflow-hidden rounded-3xl shadow-soft-card touch-none ${className}`}
      ref={containerRef}
      role="slider"
      aria-valuenow={sliderPosition}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="画像比較スライダー"
      tabIndex={0}
      onKeyDown={onKeyDown}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onTouchEnd={onTouchEnd}
      onMouseMove={onMouseMove}
      onTouchMove={onTouchMove}
    >
      {/* Right image */}
      <div className="absolute inset-0 h-full w-full">
        <Image
          src={rightImage}
          alt={rightAlt}
          fill
          className="object-cover"
          priority
        />
        {rightLabel && (
          <div className="absolute bottom-4 right-4 z-10 rounded-full bg-slate-900/60 px-4 py-1.5 text-[10px] font-bold tracking-[0.16em] text-white backdrop-blur-md">
            {rightLabel}
          </div>
        )}
      </div>

      {/* Left image (clipped) */}
      <div
        className="absolute inset-0 h-full w-full overflow-hidden border-r border-white/20"
        style={{ width: `${sliderPosition}%` }}
      >
        <Image
          src={leftImage}
          alt={leftAlt}
          fill
          className="object-cover"
          priority
        />
        {leftLabel && (
          <div className="absolute bottom-4 left-4 z-10 rounded-full bg-tiffany-600/90 px-4 py-1.5 text-[10px] font-bold text-white backdrop-blur-md">
            {leftLabel}
          </div>
        )}
      </div>

      {/* Slider handle */}
      <div
        className="absolute inset-y-0 z-20 cursor-ew-resize"
        style={{ left: `${sliderPosition}%` }}
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
      >
        <div className="h-full w-[2px] -translate-x-1/2 bg-white shadow-[0_0_15px_rgba(0,0,0,0.2)]" />

        <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border-[3px] border-white bg-tiffany-500 shadow-[0_4px_20px_rgba(10,186,181,0.4)] transition-transform hover:scale-110 active:scale-95">
            <svg
              width="20"
              height="20"
              stroke="currentColor"
              strokeWidth="2.5"
              fill="none"
              className="text-white"
              viewBox="0 0 24 24"
            >
              <path d="M15 18l-6-6 6-6" />
              <polyline
                points="9 18 15 12 9 6"
                transform="rotate(180 12 12)"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* invisible slider */}
      <input
        type="range"
        min="0"
        max="100"
        value={sliderPosition}
        onChange={(e) => setSliderPosition(Number(e.target.value))}
        className="absolute inset-0 z-30 h-full w-full cursor-ew-resize opacity-0"
        aria-hidden="true"
      />
    </div>
  );
}
