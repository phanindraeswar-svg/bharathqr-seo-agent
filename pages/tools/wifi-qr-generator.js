import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function WiFiQRGenerator() {
  const [qrUrl, setQrUrl] = useState('');
  const [error, setError] = useState('');
  const [network, setNetwork] = useState(''); const [password, setPassword] = useState(''); const [security, setSecurity] = useState('WPA');

  const generateQR = async () => {
    setError('');
    setQrUrl('');
    const ssid = network.trim(); if (!ssid) { setError('Enter your WiFi network name.'); return; } const esc = (v) => v.replace(/[\\;,:"]/g, (m) => '\\' + m); const wifiText = `WIFI:T:${security};S:${esc(ssid)};P:${esc(password)};;`;
    try {
      const QRCode = (await import('qrcode')).default;
      const dataUrl = await QRCode.toDataURL(wifiText, { width: 340, margin: 2, errorCorrectionLevel: 'M', color: { dark: '#111827', light: '#FFFFFF' } });
      setQrUrl(dataUrl);
    } catch (e) {
      setError('Could not generate QR code. Please try again.');
    }
  };

  const downloadQR = () => {
    if (!qrUrl) return;
    const a = document.createElement('a');
    a.href = qrUrl;
    a.download = 'bharathqr-wifi-qr-generator.png';
    a.click();
  };

  const schema = { '@context': 'https://schema.org', '@type': 'SoftwareApplication', name: 'WiFi QR Code Generator', applicationCategory: 'BusinessApplication', operatingSystem: 'Web', offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' }, url: 'https://bharathqr.com/tools/wifi-qr-generator' };
  const faqSchema = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: [
    { '@type': 'Question', name: 'Is WiFi QR Code Generator free?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. BharathQR lets you create this QR code for free without login.' } },
    { '@type': 'Question', name: 'Can Indian businesses use this QR?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Shops, restaurants, hotels, clinics, salons and creators can generate, download and print this QR code.' } }
  ] };

  return (
    <>
      <Head>
        <title>WiFi QR Code Generator — BharathQR</title>
        <meta name="description" content="Create a free WiFi QR code so hotel guests, cafe customers and office visitors can connect without typing passwords." />
        <link rel="canonical" href="https://bharathqr.com/tools/wifi-qr-generator" />
        <meta property="og:title" content="WiFi QR Code Generator — BharathQR" />
        <meta property="og:description" content="Create a free WiFi QR code so hotel guests, cafe customers and office visitors can connect without typing passwords." />
        <meta property="og:url" content="https://bharathqr.com/tools/wifi-qr-generator" />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      </Head>
      <main style={{ maxWidth: 980, margin: '0 auto', padding: '1.5rem 1rem' }}>
        <section style={{ background: 'linear-gradient(135deg,#ECFDF5,#FFFFFF)', border: '1px solid #D1FAE5', borderRadius: 24, padding: 'clamp(1.25rem, 5vw, 2.5rem)', textAlign: 'center' }}>
          <p style={{ color: '#1D9E75', fontWeight: 800, margin: 0 }}>Free QR Tool</p>
          <h1 style={{ fontSize: 'clamp(2rem, 7vw, 3.2rem)', margin: '0.5rem 0' }}>WiFi QR Code Generator</h1>
          <p style={{ color: '#4B5563', fontSize: 18, lineHeight: 1.6 }}>Create a free WiFi QR code so hotel guests, cafe customers and office visitors can connect without typing passwords.</p>
        </section>
        <section style={{ marginTop: 24, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
          <div style={{ border: '1px solid #E5E7EB', borderRadius: 20, padding: 20 }}>
            <label style={{ display: 'block', fontWeight: 800, marginBottom: 8 }}>WiFi network name</label><input value={network} onChange={(e) => setNetwork(e.target.value)} placeholder="Hotel_Guest_WiFi" style={{ width: '100%', padding: 14, border: '1px solid #D1D5DB', borderRadius: 12, fontSize: 16 }} /><label style={{ display: 'block', fontWeight: 800, margin: '14px 0 8px' }}>WiFi password</label><input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" style={{ width: '100%', padding: 14, border: '1px solid #D1D5DB', borderRadius: 12, fontSize: 16 }} /><label style={{ display: 'block', fontWeight: 800, margin: '14px 0 8px' }}>Security</label><select value={security} onChange={(e) => setSecurity(e.target.value)} style={{ width: '100%', padding: 14, border: '1px solid #D1D5DB', borderRadius: 12, fontSize: 16 }}><option value="WPA">WPA/WPA2</option><option value="WEP">WEP</option><option value="nopass">No password</option></select>
            {error && <p style={{ color: '#DC2626', fontWeight: 700 }}>{error}</p>}
            <button onClick={generateQR} style={{ width: '100%', marginTop: 14, padding: 15, background: '#1D9E75', color: '#fff', border: 0, borderRadius: 12, fontWeight: 800, fontSize: 16 }}>Generate QR Code</button>
            {qrUrl && <button onClick={downloadQR} style={{ width: '100%', marginTop: 10, padding: 15, background: '#064E3B', color: '#fff', border: 0, borderRadius: 12, fontWeight: 800, fontSize: 16 }}>Download PNG</button>}
          </div>
          <div style={{ border: '1px solid #E5E7EB', borderRadius: 20, padding: 20, textAlign: 'center', background: '#FAFAFA' }}>
            <h2 style={{ marginTop: 0 }}>QR Preview</h2>
            {qrUrl ? <img src={qrUrl} alt="WiFi QR Code Generator" style={{ width: 320, maxWidth: '100%', borderRadius: 12 }} /> : <p style={{ color: '#6B7280' }}>Your QR code will appear here.</p>}
          </div>
        </section>
        <section style={{ marginTop: 32, lineHeight: 1.7 }}>
          <h2>Best for</h2>
          <p>Best for hotels, cafes, restaurants, clinics and co-working spaces where guests ask for WiFi passwords again and again.</p>
          <h2>Where to use this QR code</h2>
          <ul>
            <li>Shop counters, hotel reception desks and restaurant tables.</li>
            <li>Business cards, brochures, posters, flyers and packaging.</li>
            <li>WhatsApp messages, Instagram bios and customer support pages.</li>
          </ul>
          <h2>Print tip</h2>
          <p>Download the PNG, test scan it on your phone, then print it clearly with enough white space around the QR code.</p>
          <p><Link href="/tools" style={{ color: '#1D9E75', fontWeight: 800 }}>Explore more free BharathQR tools →</Link></p>
        </section>
      </main>
    </>
  );
}
