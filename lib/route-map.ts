export type SectionMeta = {
  index: number;
  total: number;
  name: string;
};

const TOTAL = 8;

export function getSectionMeta(pathname: string): SectionMeta {
  const path = (pathname || "/").split("?")[0];

  if (path === "/") return { index: 1, total: TOTAL, name: "HOME" };
  if (path === "/menu") return { index: 1, total: TOTAL, name: "MENU" };
  if (path.startsWith("/collection/") && path !== "/collection") return { index: 3, total: TOTAL, name: "DETAIL" };
  if (path === "/collection") return { index: 2, total: TOTAL, name: "COLLECTION" };
  if (path === "/about") return { index: 4, total: TOTAL, name: "ABOUT" };
  if (path === "/contact") return { index: 5, total: TOTAL, name: "CONTACT" };

  return { index: 1, total: TOTAL, name: "HOME" };
}

export function format2(n: number): string {
  return String(n).padStart(2, "0");
}
