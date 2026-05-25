import { useRouter } from 'next/router';
import Head from 'next/head';
import seoData from '../../seo_updates.json';

export default function DynamicIndustryPage() {
  const router = useRouter();
  const { slug } = router.query;

  // Matches the URL slug directly with your JSON slug field
  const currentRouteData = seoData.optimized_data.suggested_routes.find(
    (item) => item.slug.trim() === slug
  );

  // Show a clean loading state while Next.js finishes compiling the routing hooks
  if (!slug || !currentRouteData) {
    return (
      <div style={{ padding: '3rem', fontFamily: 'system-ui, sans-serif', color: '#888', textAlign: 'center' }}>
        Loading landing page details...
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{currentRouteData.heading} — BharatQRGen</title>
        <meta name="description" content={currentRouteData.body_text} />
        <meta name="keywords" content={`${currentRouteData.industry} upi qr, free qr code for ${currentRouteData.industry}`} />
      </Head>

      <div style={{ maxWidth: '740px', margin: '5rem auto', padding: '0 1.5rem', fontFamily: 'system-ui, sans-serif' }}>
        <span style={{ fontSize: '10px', fontWeight: '700', background: '#E1F5EE', color: '#0F6E56', padding: '5px 12px', borderRadius: '100px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Optimized for {currentRouteData.industry}
        </span>
        
        <h1 style={{ fontSize: '32px', fontWeight: '600', color: '#111', marginTop: '14px', marginBottom: '1.2rem', lineHeight: '1.25' }}>
          {currentRouteData.heading}
        </h1>
        
        <p style={{ fontSize: '15px', color: '#444', lineHeight: '1.65', marginBottom: '2.5rem' }}>
          {currentRouteData.body_text}
        </p>

        <div style={{ background: '#fafaf8', border: '1px solid #e8e8e4', borderRadius: '16px', padding: '1.5rem', textAlign: 'center' }}>
          <h3 style={{ fontSize: '16px', color: '#111', marginBottom: '#0.5rem' }}>
            Need an instant payment code for your business?
          </h3>
          <p style={{ fontSize: '13px', color: '#666', marginBottom: '1.25rem' }}>
            Generate a completely free, zero-fee custom UPI QR sticker instantly.
          </p>
          <a href="/" style={{ display: 'inline-block', background: '#1D9E75', color: '#fff', padding: '10px 20px', borderRadius: '10px', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>
            Go to Free QR Generator →
          </a>
        </div>
      </div>
    </>
  );
}
