export const editorialSurfaceClasses = [
  "detail-card",
  "detail-card-muted",
  "detail-card-moss",
  "detail-card-clay",
] as const;

export function getEditorialSurfaceClass(index: number): string {
  const safeIndex = Number.isFinite(index) ? Math.abs(index) : 0;
  return editorialSurfaceClasses[safeIndex % editorialSurfaceClasses.length];
}
