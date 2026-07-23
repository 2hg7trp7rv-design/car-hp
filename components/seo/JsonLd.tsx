// components/seo/JsonLd.tsx
import React from 'react';

import { getSiteUrl } from '@/lib/site';
import { getOperator } from '@/lib/operator';

type JsonLdType = 'Article' | 'Product' | 'BreadcrumbList';

interface JsonLdProps {
  // ✅ 既存呼び出し（carsページなど）で <JsonLd data={...} /> のみがあるため optional にする
  // 既存で type を渡している呼び出しはそのまま動く
  type?: JsonLdType;

  data: any; // 柔軟性のためany許容

  // ✅ 既存呼び出しで id を渡しているため受け口を用意
  id?: string;
}

function isArticleType(value?: unknown): boolean {
  return value === 'Article' || value === 'NewsArticle' || value === 'BlogPosting';
}

function buildCbjPerson() {
  const siteUrl = getSiteUrl();
  const operator = getOperator();
  return {
    '@type': 'Person',
    name: operator.name,
    jobTitle: operator.credential,
    url: `${siteUrl}/legal/about`,
  };
}

function normalizePersonLike(value: any) {
  const cbjPerson = buildCbjPerson();
  if (!value || typeof value !== 'object') return cbjPerson;

  const type = value['@type'];
  const name = String(value.name ?? '');
  const isCbjOrganization = type === 'Organization' && name.includes('CAR BOUTIQUE JOURNAL');

  if (isCbjOrganization) return cbjPerson;
  if (type === 'Person') {
    return {
      ...value,
      url: value.url ?? cbjPerson.url,
      jobTitle: value.jobTitle ?? cbjPerson.jobTitle,
    };
  }

  return value;
}

function enhanceArticleJsonLd(data: any, resolvedType?: unknown) {
  const dataType = data?.['@type'] ?? resolvedType;
  if (!isArticleType(dataType)) return data;

  return {
    ...data,
    author: Array.isArray(data?.author)
      ? data.author.map((entry: any) => normalizePersonLike(entry))
      : normalizePersonLike(data?.author),
    reviewedBy: Array.isArray(data?.reviewedBy)
      ? data.reviewedBy.map((entry: any) => normalizePersonLike(entry))
      : normalizePersonLike(data?.reviewedBy),
  };
}

export const JsonLd: React.FC<JsonLdProps> = ({ type, data, id }) => {
  // ✅ type が省略された場合は data 内の @type を尊重する（存在しなければ type を使う）
  const resolvedType = type ?? data?.['@type'];
  const enhancedData = enhanceArticleJsonLd(data, resolvedType);

  const jsonLd = {
    '@context': 'https://schema.org',
    ...(resolvedType ? { '@type': resolvedType } : {}),
    ...enhancedData,
  };

  return (
    <script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
};
