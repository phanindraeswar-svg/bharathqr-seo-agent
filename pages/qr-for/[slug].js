import Head from 'next/head';
import Link from 'next/link';
import seoData from '../../seo_updates.json';

export async function getStaticPaths() {
  const routes = seoData?.optimized_data?.suggested_routes || [];
  return { paths: routes.map((item) => ({ params: { slug: item.slug.trim() } })), fallback: false };
}

export async function getStaticProps({ params }) {
  const { slug } = params;
  const routes = seoData?.optimized_data?.suggested_routes || [];
  const currentRouteData = routes.find((item) => item.slug.trim() === slug);

  if (!currentRouteData) {
    return { notFound: true };
  }

  return {
    props: { currentRouteData },
    revalidate: 86400,
  };
}

export default function DynamicIndustryPage({ currentRouteData }) {
  const pageUrl = `https://bharathqr.com/qr-for/${currentRouteData.slug}`;
  const metaDesc = currentRouteData.meta_description || currentRouteData.body_text?.slice(0, 155);

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": currentRouteData.heading,
    "description": metaDesc,
    "url": pageUrl,
    "publisher": {
      "@type": "Organization",
      "name": "BharathQR",
      "url": "https://bharathqr.com"
    }
  };

  return (
    <>
      <Head>
        <title>{currentRouteData.heading} | BharathQR</title>
        <meta name="description" content={metaDesc} />
        <meta name="keywords" content={`${currentRouteData.industry} UPI QR code, free QR code for ${currentRouteData.industry}, UPI payment ${currentRouteData.industry} India`} />
        <link rel="canonical" href={pageUrl} />
        <meta property="og:title" content={currentRouteData.heading} />
        <meta property="og:description" content={metaDesc} />
        <meta property="og:url" content={pageUrl} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }} />
      </Head>

      <div style={{ fontFamily: 'system-ui, sans-serif', color: '#111827' }}>

        {/* NAV */}
        <nav style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #E5E7EB', background: '#fff' }}>
          <Link href="/" style={{ color: '#1D9E75', textDecoration: 'none', fontWeight: '600', fontSize: '14px' }}>
            ← Back to BharathQR Generator
          </Link>
        </nav>

        {/* HERO */}
        <div style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', padding: '3rem 1.5rem', textAlign: 'center' }}>
          <div style={{ maxWidth: '680px', margin: '0 auto' }}>
            <span style={{ background: '#1D9E75', color: '#fff', fontSize: '12px', fontWeight: '700', padding: '4px 12px', borderRadius: '100px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Free for {currentRouteData.industry}
            </span>
            <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.25rem)', fontWeight: '800', color: '#111827', marginTop: '1rem', marginBottom: '1rem', lineHeight: '1.25' }}>
              {currentRouteData.heading}
            </h1>
            <p style={{ fontSize: '1.05rem', color: '#4B5563', lineHeight: '1.7', marginBottom: '2rem', maxWidth: '560px', margin: '0 auto 2rem' }}>
              {currentRouteData.body_text}
            </p>

            {/* UPI App compatibility */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
              {['GPay', 'PhonePe', 'Paytm', 'BHIM', '+43 apps'].map(app => (
                <span key={app} style={{ background: '#fff', border: '1px solid #D1D5DB', borderRadius: '8px', padding: '5px 12px', fontSize: '13px', fontWeight: '600', color: '#374151' }}>
                  {app}
                </span>
              ))}
            </div>

            <Link href="/" style={{ display: 'inline-block', background: '#1D9E75', color: '#fff', padding: '12px 28px', borderRadius: '10px', textDecoration: 'none', fontSize: '16px', fontWeight: '700' }}>
              Generate Your Free UPI QR Now →
            </Link>
          </div>
        </div>

        {/* BENEFITS */}
        <div style={{ padding: '3rem 1.5rem', background: '#fff' }}>
          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '1.5rem', textAlign: 'center' }}>
              Why {currentRouteData.industry} Choose BharathQR
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              {[
                { icon: '₹0', title: 'Zero Fees', desc: 'No MDR, no hidden charges ever' },
                { icon: '⚡', title: 'Instant Credit', desc: 'Direct to your bank account' },
                { icon: '📱', title: 'All UPI Apps', desc: 'GPay, PhonePe, Paytm & more' },
                { icon: '🔒', title: '100% Secure', desc: 'Data never stored on servers' },
              ].map(({ icon, title, desc }) => (
                <div key={title} style={{ padding: '1.25rem', background: '#F9FAFB', borderRadius: '10px', border: '1px solid #E5E7EB', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{icon}</div>
                  <div style={{ fontWeight: '700', fontSize: '0.95rem', marginBottom: '0.25rem' }}>{title}</div>
                  <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>{desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div style={{ padding: '3rem 1.5rem', background: '#1D9E75', textAlign: 'center' }}>
          <h2 style={{ color: '#fff', fontSize: '1.4rem', fontWeight: '700', marginBottom: '0.75rem' }}>
            Ready to Accept UPI Payments?
          </h2>
          <p style={{ color: '#D1FAE5', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
            Generate your free QR code in 30 seconds. No signup required.
          </p>
          <Link href="/" style={{ background: '#fff', color: '#1D9E75', padding: '12px 28px', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '15px' }}>
            Generate Free QR Code →
          </Link>
        </div>

        {/* FOOTER */}
        <footer style={{ background: '#111827', color: '#9CA3AF', padding: '2rem 1.5rem', textAlign: 'center', fontSize: '13px' }}>
          <p>© {new Date().getFullYear()} BharathQR — Free UPI QR Code Generator for Indian Merchants</p>
          <p style={{ marginTop: '0.5rem' }}>
            <Link href="/" style={{ color: '#6EE7B7', textDecoration: 'none' }}>Home</Link>
            {' · '}
            <Link href="/blog" style={{ color: '#6EE7B7', textDecoration: 'none' }}>Blog</Link>
          </p>
        </footer>
      </div>
    </>
  );
}
