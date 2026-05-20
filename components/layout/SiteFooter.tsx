// components/layout/SiteFooter.tsx
import { EditorialFooter } from "@/components/layout/EditorialFooter";

type SiteFooterProps = { variant?: "default" | "carArticle" | "editorialArticle" };

export function SiteFooter({ variant: _variant = "default" }: SiteFooterProps) {
  return <EditorialFooter />;
}
