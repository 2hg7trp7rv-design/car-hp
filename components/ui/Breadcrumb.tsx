import type { FC } from "react";

import { Breadcrumb as LayoutBreadcrumb } from "@/components/layout/Breadcrumb";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export const Breadcrumb: FC<BreadcrumbProps> = ({ items }) => {
  return <LayoutBreadcrumb items={items} />;
};
