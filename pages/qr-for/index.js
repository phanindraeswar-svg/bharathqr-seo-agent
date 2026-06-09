import Head from 'next/head';
import Link from 'next/link';
import seoData from '../../seo_updates.json';
import internalLinks from '../../data/internal_link_graph.json';
import RelatedLinks from '../../components/RelatedLinks';

export default function QrForIndex() {
  const routes = seoData?.optimized_data?.suggested_routes || [];
  const safeRoutes = routes.filter((route) => route?.slug && route?.title).slice(0, 80);
  return (
    <>
      <Head>
        <title>QR Codes for Indian Businesses — BharathQR</title>
        <meta name="description" content="Explore QR code use cases for restaurants, hotels, shops, salons, clinics, events and more. Find the right BharathQR tool for your business." />
        <link rel="canonical" href="https://bharathqr.com/qr-for" />
        <meta property="og:title" content="QR Codes for Indian Businesses — BharathQR" />
        <meta property="og:description" content="Industry-specific QR code ideas for payments, reviews, WhatsApp, WiFi, menus and more." />
      </Head>
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1rem' }}>
        <section style={{ textAlign: 'center', background: 'linear-gradient(135deg,#ECFDF5,#FFFFFF)', border: '1px solid #D1FAE5', borderRadius: 24, padding: 'clamp(1.25rem,5vw,2.5rem)' }}>
          <p style={{ color: '#1D9E75', fontWeight: 900, margin: 0 }}>Industry QR Ideas</p>
          <h1 style={{ fontSize: 'clamp(2rem,7vw,3.2rem)', margin: '0.5rem 0' }}>QR Codes for Indian Businesses</h1>
          <p style={{ color: '#4B5563', fontSize: 18, lineHeight: 1.6 }}>Find practical QR ideas for shops, restaurants, hotels, salons, clinics, events and local businesses. Use QR codes to accept payments, collect reviews, open WhatsApp chats, share menus and connect WiFi.</p>
        </section>
        <section style={{ marginTop: 28, display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 14 }}>
          {safeRoutes.map((route) => (
            <Link key={route.slug} href={`/qr-for/${route.slug}`} style={{ border: '1px solid #D1FAE5', borderRadius: 16, padding: 18, background: '#F0FDF4', color: '#111827', textDecoration: 'none' }}>
              <strong style={{ color: '#065F46' }}>{route.title}</strong>
              <p style={{ color: '#4B5563', lineHeight: 1.5 }}>{route.description || 'QR code guide for Indian businesses.'}</p>
              <span style={{ color: '#1D9E75', fontWeight: 800 }}>Read guide →</span>
            </Link>
          ))}
        </section>
        <RelatedLinks title="Start with these BharathQR hubs" links={internalLinks.primary_hubs} />
      </main>
    </>
  );
}
