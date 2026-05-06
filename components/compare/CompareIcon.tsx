// components/compare/CompareIcon.tsx

export function CompareIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M10 6H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h5" />
      <path d="M14 18h5a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-5" />
      <path d="M8 12h8" />
    </svg>
  );
}
