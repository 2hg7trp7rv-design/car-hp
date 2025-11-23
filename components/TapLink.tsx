// components/TapLink.tsx
"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

type Props = {
  href: string;
  className?: string;
  children: ReactNode;
};

export default function TapLink({ href, className, children }: Props) {
  const router = useRouter();

  const handleClick = () => {
    // できるだけ確実に遷移させる
    try {
      router.push(href);
    } catch {
      window.location.href = href;
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={className}
    >
      {children}
    </button>
  );
}
