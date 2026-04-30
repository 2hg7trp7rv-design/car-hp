"use client";

type ConsentManageButtonProps = {
  className?: string;
};

export function ConsentManageButton({ className }: ConsentManageButtonProps) {
  return (
    <button
      type="button"
      onClick={() => {
        if (typeof window === "undefined") return;
        window.dispatchEvent(new CustomEvent("cbj:open-consent"));
      }}
      className={
        className ??
        "text-[var(--text-secondary)] transition hover:text-[var(--accent-strong)] hover:underline underline-offset-4"
      }
    >
      Cookie設定
    </button>
  );
}
