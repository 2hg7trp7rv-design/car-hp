// components/analytics/ConsentManageButton.tsx
"use client";

export function ConsentManageButton() {
  return (
    <button
      type="button"
      onClick={() => {
        if (typeof window === "undefined") return;
        window.dispatchEvent(new CustomEvent("cbj:open-consent"));
      }}
      className="hover:text-white hover:underline underline-offset-4"
    >
      Cookie設定
    </button>
  );
}
