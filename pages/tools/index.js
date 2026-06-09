import Head from 'next/head';
import Link from 'next/link';
import toolClusters from '../../data/tool_clusters.json';

export default function ToolsIndex() {
  const tools = Object.values(toolClusters);
  return (
    <>
      <Head>
        <title>Free QR Code Tools for Business — BharathQR</title>
        <meta name="description" content="Free QR tools for Indian businesses: UPI QR, Google Review QR, WhatsApp QR, WiFi QR, URL QR, Text QR and vCard QR. No login required." />
        <link rel="canonical" href="https://bharathqr.com/tools" />
      <meta property="og:title" content="Free QR Code Tools for Business — BharathQR" /><meta property="og:description" content="Free QR tools for Indian businesses: UPI QR, Google Review QR, WhatsApp QR, WiFi QR, URL QR, Text QR and vCard QR. No login required." /><meta property="og:url" content="https://bharathqr.com/tools" /><meta name="twitter:title" content="Free QR Code Tools for Business — BharathQR" /><meta name="twitter:description" content="Free QR tools for Indian businesses: UPI QR, Google Review QR, WhatsApp QR, WiFi QR, URL QR, Text QR and vCard QR. No login required." /></Head>
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1rem' }}>
        <section style={{ textAlign: 'center', marginBottom: 28 }}>
          <h1 style={{ fontSize: 'clamp(2rem, 6vw, 3rem)', marginBottom: 8 }}>Free QR Code Tools</h1>
          <p style={{ color: '#4B5563', fontSize: 18 }}>Create QR codes for payments, Google reviews, WhatsApp, WiFi, links, text and digital business cards. No login. No hidden fees.</p>
        </section>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          {tools.map((tool) => (
            <Link key={tool.slug} href={tool.tool_url} style={{ border: '1px solid #D1FAE5', borderRadius: 18, padding: 20, textDecoration: 'none', color: '#111827', background: '#F0FDF4' }}>
              <h2 style={{ marginTop: 0, color: '#065F46', fontSize: 20 }}>{tool.title}</h2>
              <p style={{ color: '#4B5563', lineHeight: 1.6 }}>{tool.primary_keyword} for {tool.industries?.slice(0, 3).join(', ')}.</p>
              <strong style={{ color: '#1D9E75' }}>Open tool →</strong>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}
