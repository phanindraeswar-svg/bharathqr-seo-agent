import { useState } from 'react';
import Head from 'next/head';

export default function GoogleReviewQRGenerator() {
  const [reviewUrl, setReviewUrl] = useState('');
  const [qrUrl, setQrUrl] = useState('');
  const [error, setError] = useState('');

  const generateQR = async () => {
    setError('');
    setQrUrl('');
    const url = reviewUrl.trim();
    if (!url) {
      setError('Paste your Google review link first.');
      return;
    }
    if (!/^https?:\/\//i.test(url)) {
      setError('Please paste a valid link starting with http:// or https://');
      return;
    }
    try {
      const QRCode = (await import('qrcode')).default;
      const dataUrl = await QRCode.toDataURL(url, {
        width: 320,
        margin: 2,
        color: { dark: '#111827', light: '#FFFFFF' }
      });
      setQrUrl(dataUrl);
    } catch (e) {
      setError('Could not generate QR code. Please try again.');
    }
  };

  const downloadQR = () => {
    if (!qrUrl) return;
    const a = document.createElement('a');
    a.href = qrUrl;
    a.download = 'bharathqr-google-review-qr.png';
    a.click();
  };

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Free Google Review QR Generator',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
    url: 'https://bharathqr.com/tools/google-review-qr-generator'
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      { '@type': 'Question', name: 'Is the Google Review QR Generator free?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. BharathQR lets you create a Google Review QR code for free without login.' } },
      { '@type': 'Question', name: 'Can restaurants and shops use this QR?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Restaurants, salons, clinics, hotels, cafes and local shops can print the QR code and ask customers to scan it for reviews.' } }
    ]
  };

  return (
    <>
      <Head>
        <title>Free Google Review QR Generator — BharathQR</title>
        <meta name="description" content="Create a free Google Review QR code for your business. No login. Perfect for restaurants, shops, hotels and salons in India." />
        <link rel="canonical" href="https://bharathqr.com/tools/google-review-qr-generator" />
        <meta property="og:title" content="Free Google Review QR Generator — BharathQR" />
        <meta property="og:description" content="Turn your Google review link into a scannable QR code for free." />
        <meta property="og:url" content="https://bharathqr.com/tools/google-review-qr-generator" />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      </Head>
      <main style={{ maxWidth: 980, margin: '0 auto', padding: '1.5rem 1rem' }}>
        <section style={{ background: 'linear-gradient(135deg,#ECFDF5,#FFFFFF)', border: '1px solid #D1FAE5', borderRadius: 24, padding: 'clamp(1.25rem, 5vw, 2.5rem)', textAlign: 'center' }}>
          <p style={{ color: '#1D9E75', fontWeight: 800, margin: 0 }}>Free Business QR Tool</p>
          <h1 style={{ fontSize: 'clamp(2rem, 7vw, 3.4rem)', margin: '0.5rem 0' }}>Google Review QR Generator</h1>
          <p style={{ color: '#4B5563', fontSize: 18, lineHeight: 1.6 }}>Paste your Google review link and create a QR code customers can scan after visiting your shop, restaurant, hotel, salon or clinic.</p>
        </section>

        <section style={{ marginTop: 24, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
          <div style={{ border: '1px solid #E5E7EB', borderRadius: 20, padding: 20 }}>
            <label style={{ display: 'block', fontWeight: 800, marginBottom: 8 }}>Google review link</label>
            <input value={reviewUrl} onChange={(e) => setReviewUrl(e.target.value)} placeholder="https://g.page/r/..." style={{ width: '100%', padding: 14, border: '1px solid #D1D5DB', borderRadius: 12 }} />
            {error && <p style={{ color: '#DC2626', fontWeight: 700 }}>{error}</p>}
            <button onClick={generateQR} style={{ width: '100%', marginTop: 14, background: '#1D9E75', color: '#fff', border: 0, borderRadius: 12, fontWeight: 800 }}>Generate Review QR</button>
            {qrUrl && <button onClick={downloadQR} style={{ width: '100%', marginTop: 10, background: '#064E3B', color: '#fff', border: 0, borderRadius: 12, fontWeight: 800 }}>Download PNG</button>}
          </div>
          <div style={{ border: '1px solid #E5E7EB', borderRadius: 20, padding: 20, textAlign: 'center', background: '#FAFAFA' }}>
            <h2 style={{ marginTop: 0 }}>QR Preview</h2>
            {qrUrl ? <img src={qrUrl} alt="Google Review QR Code" style={{ width: 320, maxWidth: '100%', borderRadius: 12 }} /> : <p style={{ color: '#6B7280' }}>Your QR code will appear here.</p>}
          </div>
        </section>

        <section style={{ marginTop: 32, lineHeight: 1.7 }}>
          <h2>How businesses can use this QR</h2>
          <ol>
            <li>Copy your Google review link from your Google Business Profile.</li>
            <li>Paste it above and generate the QR code.</li>
            <li>Print it near your billing counter, table, reception desk or parcel area.</li>
          </ol>
          <h2>Best for Indian businesses</h2>
          <p>Restaurants in Hyderabad, salons in Chennai, clinics in Pune, hotels in Jaipur and cafes in Bengaluru can use review QR codes to make customer feedback easier.</p>
        </section>
      </main>
    </>
  );
}
