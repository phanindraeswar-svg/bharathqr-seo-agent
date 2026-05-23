import React from 'react';
import Link from 'next/link';
// Import the generated JSON dataset directly
import seoData from '../seo_updates.json';

export async function getStaticProps() {
  // Pass the generated routes safely into the homepage component properties
  const routes = seoData?.optimized_data?.suggested_routes || [];
  return {
    props: {
      suggestedRoutes: routes,
    },
    // Re-generate page data securely every 24 hours (ISR)
    revalidate: 86400,
  };
}

export default function Home({ suggestedRoutes }) {
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Existing App Header and QR Code Tool */}
      <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', color: '#111827' }}>BharathQR Code Generator</h1>
        <p style={{ color: '#4B5563' }}>Generate free instant UPI QR codes for your business utility.</p>
      </header>

      {/* Your core operational UI component logic goes here */}
      <main style={{ minHeight: '300px', background: '#F9FAFB', borderRadius: '8px', padding: '2rem', marginBottom: '4rem', textAlign: 'center' }}>
        <p style={{ color: '#9CA3AF' }}>[ Your Core Interactive QR Code Generator Tool Module UI Box ]</p>
      </main>

      {/* AUTOMATED INTERNAL LINKING SECTION FOR PROGRAMMATIC SEO */}
      {suggestedRoutes.length > 0 && (
        <section style={{ borderTop: '1px solid #E5E7EB', paddingTop: '3rem' }}>
          <h2 style={{ fontSize: '1.75rem', color: '#111827', marginBottom: '1.5rem' }}>
            Tailored UPI Payment Solutions Across Industries
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
            {suggestedRoutes.map((item) => (
              <div 
                key={item.slug} 
                style={{ padding: '1.5rem', border: '1px solid #E5E7EB', borderRadius: '8px', background: '#FFFFFF', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
              >
                <h3 style={{ fontSize: '1.2rem', color: '#1F2937', marginBottom: '0.5rem' }}>
                  {item.industry || item.heading}
                </h3>
                <p style={{ fontSize: '0.9rem', color: '#6B7280', marginBottom: '1rem' }}>
                  Custom QR tools optimized explicitly for local operations.
                </p>
                {/* Dynamically links to your pages/[slug].js configuration */}
                <Link 
                  href={`/pages/${item.slug}`}
                  style={{ color: '#2563EB', fontWeight: '500', textDecoration: 'none', fontSize: '0.95rem' }}
                >
                  Create Custom QR &rarr;
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
