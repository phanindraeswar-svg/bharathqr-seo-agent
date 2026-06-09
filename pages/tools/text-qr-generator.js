import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function TextQRGenerator() {
  const [qrUrl, setQrUrl] = useState('');
  const [error, setError] = useState('');
  const [input, setInput] = useState('');

  const generateQR = async () => {
    setError('');
    setQrUrl('');
    const text = input.trim(); if (!text) { setError('Enter text to create a QR code.'); return; } if (text.length > 1200) { setError('Keep text below 1200 characters for reliable scanning.'); return; }
    try {
      const QRCode = (await import('qrcode')).default;
      const dataUrl = await QRCode.toDataURL(text, { width: 340, margin: 2, errorCorrectionLevel: 'M', color: { dark: '#111827', light: '#FFFFFF' } });
      setQrUrl(dataUrl);
    } catch (e) {
      setError('Could not generate QR code. Please try again.');
    }
  };

  const downloadQR = () => {
    if (!qrUrl) return;
    const a = document.createElement('a');
    a.href = qrUrl;
    a.download = 'bharathqr-text-qr-generator.png';
    a.click();
  };

  const schema = { '@context': 'https://schema.org', '@type': 'SoftwareApplication', name: 'Text QR Code Generator', applicationCategory: 'BusinessApplication', operatingSystem: 'Web', offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' }, url: 'https://bharathqr.com/tools/text-qr-generator' };
  const faqSchema = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: [
    { '@type': 'Question', name: 'Is Text QR Code Generator free?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. BharathQR lets you create this QR code for free without login.' } },
    { '@type': 'Question', name: 'Can Indian businesses use this QR?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Shops, restaurants, hotels, clinics, salons and creators can generate, download and print this QR code.' } }
  ] };

  return (
    <>
      <Head>
        <title>Text QR Code Generator — BharathQR</title>
        <meta name="description" content="Create a free text QR code for plain messages, notes, instructions, coupon text and offline information sharing." />
        <link rel="canonical" href="https://bharathqr.com/tools/text-qr-generator" />
        <meta property="og:title" content="Text QR Code Generator — BharathQR" />
        <meta property="og:description" content="Create a free text QR code for plain messages, notes, instructions, coupon text and offline information sharing." />
        <meta property="og:url" content="https://bharathqr.com/tools/text-qr-generator" />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      </Head>
      <main style={{ maxWidth: 980, margin: '0 auto', padding: '1.5rem 1rem' }}>
        <section style={{ background: 'linear-gradient(135deg,#ECFDF5,#FFFFFF)', border: '1px solid #D1FAE5', borderRadius: 24, padding: 'clamp(1.25rem, 5vw, 2.5rem)', textAlign: 'center' }}>
          <p style={{ color: '#1D9E75', fontWeight: 800, margin: 0 }}>Free QR Tool</p>
          <h1 style={{ fontSize: 'clamp(2rem, 7vw, 3.2rem)', margin: '0.5rem 0' }}>Text QR Code Generator</h1>
          <p style={{ color: '#4B5563', fontSize: 18, lineHeight: 1.6 }}>Create a free text QR code for plain messages, notes, instructions, coupon text and offline information sharing.</p>
        </section>
        <section style={{ marginTop: 24, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
          <div style={{ border: '1px solid #E5E7EB', borderRadius: 20, padding: 20 }}>
            <label style={{ display: 'block', fontWeight: 800, marginBottom: 8 }}>Text message</label><textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type your note, instruction or message" rows={5} style={{ width: '100%', padding: 14, border: '1px solid #D1D5DB', borderRadius: 12, fontSize: 16 }} />
            {error && <p style={{ color: '#DC2626', fontWeight: 700 }}>{error}</p>}
            <button onClick={generateQR} style={{ width: '100%', marginTop: 14, padding: 15, background: '#1D9E75', color: '#fff', border: 0, borderRadius: 12, fontWeight: 800, fontSize: 16 }}>Generate QR Code</button>
            {qrUrl && <button onClick={downloadQR} style={{ width: '100%', marginTop: 10, padding: 15, background: '#064E3B', color: '#fff', border: 0, borderRadius: 12, fontWeight: 800, fontSize: 16 }}>Download PNG</button>}
          </div>
          <div style={{ border: '1px solid #E5E7EB', borderRadius: 20, padding: 20, textAlign: 'center', background: '#FAFAFA' }}>
            <h2 style={{ marginTop: 0 }}>QR Preview</h2>
            {qrUrl ? <img src={qrUrl} alt="Text QR Code Generator" style={{ width: 320, maxWidth: '100%', borderRadius: 12 }} /> : <p style={{ color: '#6B7280' }}>Your QR code will appear here.</p>}
          </div>
        </section>
        <section style={{ marginTop: 32, lineHeight: 1.7 }}>
          <h2>Best for</h2>
          <p>Useful for schools, events, shops and offices that need to share a short note, instruction, coupon code or offline message through a scannable QR code.</p>
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
