import React from 'react';
// Step back two directories to safely read the root JSON data matrix
import seoData from '../../seo_updates.json';

export async function getStaticPaths() {
  const routes = seoData?.optimized_data?.suggested_routes || [];
  const paths = routes.map((item) => ({
    params: { slug: item.slug },
  }));

  // 'blocking' ensures any brand new programmatic routes render perfectly without 404s
  return { paths, fallback: 'blocking' };
}

export async function getStaticProps({ params }) {
  const routes = seoData?.optimized_data?.suggested_routes || [];
  const pageData = routes.find((item) => item.slug === params.slug) || null;

  if (!pageData) {
    return { notFound: true };
  }

  return {
    props: { pageData },
    // Sync with your 24-hour daily agent crawler sequence
    revalidate: 86400,
  };
}

export default function IndustryPage({ pageData }) {
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: '3rem', maxWidth: '800px', margin: '0 auto', color: '#111827' }}>
      <span style={{ textTransform: 'uppercase', color: '#2563EB', fontWeight: 'bold', fontSize: '0.85rem', letterSpacing: '0.05em' }}>
        {pageData.industry} Specialization
      </span>
      <h1 style={{ fontSize: '2.5rem', marginTop: '0.5rem', marginBottom: '1.5rem', color: '#111827', fontWeight: '800' }}>
        {pageData.heading}
      </h1>
      <p style={{ fontSize: '1.15rem', lineHeight: '1.75', color: '#4B5563', marginBottom: '2.5rem' }}>
        {pageData.body_text}
      </p>
      
      {/* Dynamic CTA box directing users back to use your core generator layout */}
      <div style={{ background: '#F3F4F6', padding: '2.5rem', borderRadius: '12px', textAlign: 'center', border: '1px solid #E5E7EB' }}>
        <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>Ready to set up digital payments for your business storefront?</h3>
        <p style={{ fontSize: '0.95rem', color: '#6B7280', marginBottom: '1.5rem' }}>
          Generate your zero-fee transactional static UPI QR code on our homepage instantly.
        </p>
        <a href="/" style={{ display: 'inline-block', background: '#2563EB', color: '#FFF', padding: '0.75rem 1.75rem', borderRadius: '6px', textDecoration: 'none', fontWeight: '600', boxShadow: '0 2px 4px rgba(37,99,235,0.2)' }}>
          Go to Free QR Generator &rarr;
        </a>
      </div>
    </div>
  );
}
