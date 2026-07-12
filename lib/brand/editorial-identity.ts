import type { GuideAuthorProfile } from "@/lib/content-types";

export const CBJ_EDITORIAL_ORGANIZATION_NAME = "CAR BOUTIQUE JOURNAL 編集部";

export const CBJ_EDITORIAL_ORGANIZATION: GuideAuthorProfile = {
  kind: "organization",
  name: CBJ_EDITORIAL_ORGANIZATION_NAME,
  credential: "公式情報・一次資料をもとに確認・編集",
};

/**
 * Until a real person has been verified and intentionally published, article
 * authorship stays with the editorial organization. This prevents an arbitrary
 * JSON name from becoming a Person entity in public UI or structured data.
 */
export function resolveVerifiedArticleAuthor(
  profile?: GuideAuthorProfile | null,
): GuideAuthorProfile {
  if (
    profile?.kind === "organization" &&
    profile.name.trim() === CBJ_EDITORIAL_ORGANIZATION_NAME
  ) {
    return {
      kind: "organization",
      name: CBJ_EDITORIAL_ORGANIZATION_NAME,
      credential: CBJ_EDITORIAL_ORGANIZATION.credential,
    };
  }

  return { ...CBJ_EDITORIAL_ORGANIZATION };
}

export function cbjEditorialOrganizationJsonLd(siteUrl: string) {
  const baseUrl = siteUrl.replace(/\/+$/u, "");
  return {
    "@type": "Organization",
    "@id": `${baseUrl}/#editorial`,
    name: CBJ_EDITORIAL_ORGANIZATION_NAME,
    url: `${baseUrl}/legal/about`,
    parentOrganization: {
      "@id": `${baseUrl}/#organization`,
    },
  } as const;
}
