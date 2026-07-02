import type { SVGProps } from "react";

type IconName =
  | "menu"
  | "close"
  | "home"
  | "book"
  | "column"
  | "guide"
  | "about"
  | "clock"
  | "chevronRight"
  | "chevronUp"
  | "sparkles"
  | "check"
  | "warning"
  | "arrow"
  | "list"
  | "source"
  | "calendar"
  | "person"
  | "wind"
  | "circleDot"
  | "zap";

type Props = SVGProps<SVGSVGElement> & { name: IconName };

export function ArticleIcon({ name, ...props }: Props) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.9,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    ...props,
  };

  switch (name) {
    case "menu":
      return <svg {...common}><path d="M4 7h16M4 12h16M4 17h16" /></svg>;
    case "close":
      return <svg {...common}><path d="m6 6 12 12M18 6 6 18" /></svg>;
    case "home":
      return <svg {...common}><path d="m3 11 9-7 9 7" /><path d="M5.5 10.5V20h13v-9.5M9.5 20v-6h5v6" /></svg>;
    case "book":
      return <svg {...common}><path d="M4 5.5A3.5 3.5 0 0 1 7.5 2H20v17H7.5A3.5 3.5 0 0 0 4 22z" /><path d="M4 5.5V22M8 6h8M8 10h8" /></svg>;
    case "column":
      return <svg {...common}><path d="M5 4h14v16H5z" /><path d="M8 8h8M8 12h8M8 16h5" /></svg>;
    case "guide":
      return <svg {...common}><path d="M4 4h7a3 3 0 0 1 3 3v13a3 3 0 0 0-3-3H4z" /><path d="M20 4h-3a3 3 0 0 0-3 3v13a3 3 0 0 1 3-3h3z" /></svg>;
    case "about":
      return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 7.5h.01" /></svg>;
    case "clock":
      return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" /></svg>;
    case "chevronRight":
      return <svg {...common}><path d="m9 6 6 6-6 6" /></svg>;
    case "chevronUp":
      return <svg {...common}><path d="m6 15 6-6 6 6" /></svg>;
    case "sparkles":
      return <svg {...common}><path d="m12 3 1.1 3.2L16 7.5l-2.9 1.3L12 12l-1.1-3.2L8 7.5l2.9-1.3z" /><path d="m18.5 13 .7 2 1.8.8-1.8.8-.7 2-.7-2-1.8-.8 1.8-.8zM5 14l.8 2.3L8 17.2l-2.2 1L5 20.5l-.8-2.3-2.2-1 2.2-.9z" /></svg>;
    case "check":
      return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="m8 12 2.5 2.5L16.5 8" /></svg>;
    case "warning":
      return <svg {...common}><path d="M12 3 2.8 20h18.4z" /><path d="M12 9v5M12 17h.01" /></svg>;
    case "arrow":
      return <svg {...common}><path d="M4 12h16M14 6l6 6-6 6" /></svg>;
    case "list":
      return <svg {...common}><path d="M9 6h11M9 12h11M9 18h11" /><path d="M4 6h.01M4 12h.01M4 18h.01" /></svg>;
    case "source":
      return <svg {...common}><path d="M6 3h9l3 3v15H6z" /><path d="M15 3v4h4M9 11h6M9 15h6" /></svg>;
    case "calendar":
      return <svg {...common}><rect x="3.5" y="5.5" width="17" height="15" rx="2" /><path d="M8 3v5M16 3v5M3.5 10h17" /></svg>;
    case "person":
      return <svg {...common}><circle cx="12" cy="8" r="3.5" /><path d="M5 21a7 7 0 0 1 14 0" /></svg>;
    case "wind":
      return <svg {...common}><path d="M3 8h9.5a2.5 2.5 0 1 0-2.2-3.7" /><path d="M3 12h15a2.5 2.5 0 1 1-2.2 3.7" /><path d="M3 16h7" /></svg>;
    case "circleDot":
      return <svg {...common}><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="2.5" /><path d="M12 3.5v3M20.5 12h-3M12 20.5v-3M3.5 12h3" /></svg>;
    case "zap":
      return <svg {...common}><path d="m13 2-7 11h6l-1 9 7-12h-6z" /></svg>;
    default:
      return null;
  }
}
