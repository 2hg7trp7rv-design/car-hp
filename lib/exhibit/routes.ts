// lib/exhibit/routes.ts

import routesData from "@/data/exhibit/routes.json";

export type ExhibitionRouteStep = {
  href: string;
  label: string;
};

export type ExhibitionRoute = {
  id: string;
  title: string;
  duration: string;
  lead: string;
  steps: ExhibitionRouteStep[];
};

const ROUTES: ExhibitionRoute[] = routesData as unknown as ExhibitionRoute[];

export function getExhibitionRoutes(): ExhibitionRoute[] {
  return ROUTES;
}
