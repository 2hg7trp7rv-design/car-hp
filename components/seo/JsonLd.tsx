// components/seo/JsonLd.tsx
import React from 'react';

type JsonLdType = 'Article' | 'Product' | 'BreadcrumbList';

interface JsonLdProps {
  // ✅ 既存呼び出し（carsページなど）で <JsonLd data={...} /> のみがあるため optional にする
  // 既存で type を渡している呼び出しはそのまま動く
  type?: JsonLdType;

  data: any; // 柔軟性のためany許容

  // ✅ 既存呼び出しで id を渡しているため受け口を用意
  id?: string;
}

export const JsonLd: React.FC<JsonLdProps> = ({ type, data, id }) => {
  // ✅ type が省略された場合は data 内の @type を尊重する（存在しなければ type を使う）
  const resolvedType = type ?? data?.['@type'];

  const jsonLd = {
    '@context': 'https://schema.org',
    ...(resolvedType ? { '@type': resolvedType } : {}),
    ...data,
  };

  return (
    <script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
};
