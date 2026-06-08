import Head from 'next/head';
import Link from 'next/link';

const tools = [
  { title: 'UPI QR Generator', href: '/', desc: 'Create a free UPI QR code for GPay, PhonePe, Paytm and BHIM.' },
  { title: 'Google Review QR Generator', href: '/tools/google-review-qr-generator', desc: 'Turn your Google review link into a scannable QR code.' }
];

export default function ToolsIndex() {
  return (
    <>
      <Head>
        <title>Free QR and Digital Tools — BharathQR</title>
        <meta name="description" content="Free QR, UPI, WhatsApp and business tools for Indian merchants and creators. No login required." />
        <link rel="canonical" href="https://bharathqr.com/tools" />
      </Head>
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1rem' }}>
        <section style={{ textAlign: 'center', marginBottom: 28 }}>
          <h1 style={{ fontSize: 'clamp(2rem, 6vw, 3rem)', marginBottom: 8 }}>Free Digital Tools</h1>
          <p style={{ color: '#4B5563', fontSize: 18 }}>Fast, mobile-first tools for Indian businesses. No login. No hidden fees.</p>
        </section>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          {tools.map((tool) => (
            <Link key={tool.href} href={tool.href} style={{ border: '1px solid #D1FAE5', borderRadius: 18, padding: 20, textDecoration: 'none', color: '#111827', background: '#F0FDF4' }}>
              <h2 style={{ marginTop: 0, color: '#065F46', fontSize: 20 }}>{tool.title}</h2>
              <p style={{ color: '#4B5563', lineHeight: 1.6 }}>{tool.desc}</p>
              <strong style={{ color: '#1D9E75' }}>Open tool →</strong>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}
