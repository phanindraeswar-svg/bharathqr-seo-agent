export const SITE_URL = 'https://bharathqr.com';

export function breadcrumbSchema(items = []) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url?.startsWith('http') ? item.url : `${SITE_URL}${item.url || '/'}`,
    })),
  };
}

export function faqSchema(faqs = []) {
  const clean = (faqs || []).filter((f) => f && f.question && f.answer);
  if (!clean.length) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: clean.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };
}

export function howToSchema({ name, description, url, steps = [] }) {
  const cleanSteps = (steps || []).filter(Boolean);
  if (!cleanSteps.length) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name,
    description,
    url: url?.startsWith('http') ? url : `${SITE_URL}${url || ''}`,
    step: cleanSteps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.title || `Step ${index + 1}`,
      text: step.text || step,
    })),
  };
}

export function itemListSchema({ name, url, items = [] }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    url: url?.startsWith('http') ? url : `${SITE_URL}${url || ''}`,
    itemListElement: (items || []).filter(Boolean).map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name || item.title || item.label,
      url: item.url?.startsWith('http') ? item.url : `${SITE_URL}${item.url || item.href || '/'}`,
    })),
  };
}

export function jsonLd(schema) {
  if (!schema) return null;
  return { __html: JSON.stringify(schema) };
}
