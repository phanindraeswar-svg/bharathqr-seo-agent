import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function SMSQRGenerator() {
  const [qrUrl, setQrUrl] = useState('');
  const [error, setError] = useState('');
  const [phone, setPhone] = useState(''); const [message, setMessage] = useState('');

  const generateQR = async () => {
    setError('');
    setQrUrl('');
    const number = phone.replace(/[^0-9]/g, ''); if (number.length < 10) { setError('Enter a valid mobile number'); return; } const qrData = `SMSTO:${number}:${message.trim()}`;
    try {
      const QRCode = (await import('qrcode')).default;
      const dataUrl = await QRCode.toDataURL(qrData, { width: 340, margin: 2, errorCorrectionLevel: 'M', color: { dark: '#111827', light: '#FFFFFF' } });
      setQrUrl(dataUrl);
    } catch (e) { setError('Could not generate QR code. Please try again.'); }
  };

  const downloadQR = () => { if (!qrUrl) return; const a = document.createElement('a'); a.href = qrUrl; a.download = 'bharathqr-sms-qr-generator.png'; a.click(); };

  const schema = { '@context': 'https://schema.org', '@type': 'SoftwareApplication', name: 'SMS QR Generator', applicationCategory: 'BusinessApplication', operatingSystem: 'Web', offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' }, url: 'https://bharathqr.com/tools/sms-qr-generator' };
  const faqSchema = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: [
    { '@type': 'Question', name: 'Is SMS QR Generator free?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. BharathQR lets you create this QR code for free without login.' } },
    { '@type': 'Question', name: 'Where can I use this QR code?', acceptedAnswer: { '@type': 'Answer', text: 'Use it on event posters, enquiry counters, local ads, clinic notices and service booking cards.' } }
  ] };

  return (
    <>
      <Head>
        <title>SMS QR Code Generator — BharathQR</title>
        <meta name="description" content="Create a free SMS QR code with a phone number and pre-filled message for customer enquiries, event responses and simple follow-ups." />
        <link rel="canonical" href="https://bharathqr.com/tools/sms-qr-generator" />
        <meta property="og:title" content="SMS QR Code Generator — BharathQR" />
        <meta property="og:description" content="Create a free SMS QR code with a phone number and pre-filled message for customer enquiries, event responses and simple follow-ups." />
        <meta property="og:url" content="https://bharathqr.com/tools/sms-qr-generator" />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      </Head>
      <main style={{ maxWidth: 980, margin: '0 auto', padding: '1.5rem 1rem' }}>
        <section style={{ background: 'linear-gradient(135deg,#ECFDF5,#FFFFFF)', border: '1px solid #D1FAE5', borderRadius: 24, padding: 'clamp(1.25rem, 5vw, 2.5rem)', textAlign: 'center' }}>
          <p style={{ color: '#1D9E75', fontWeight: 800, margin: 0 }}>Free QR Tool</p>
          <h1 style={{ fontSize: 'clamp(2rem, 7vw, 3.2rem)', margin: '0.5rem 0' }}>SMS QR Generator</h1>
          <p style={{ color: '#4B5563', fontSize: 18, lineHeight: 1.6 }}>Create a free SMS QR code with a phone number and pre-filled message for customer enquiries, event responses and simple follow-ups.</p>
        </section>
        <section style={{ marginTop: 24, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
          <div style={{ border: '1px solid #E5E7EB', borderRadius: 20, padding: 20 }}>
            <label style={{ display: 'block', fontWeight: 800, marginBottom: 8 }}>Mobile number with country code</label><input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="919876543210" style={{ width: '100%', padding: 14, border: '1px solid #D1D5DB', borderRadius: 12, fontSize: 16, marginBottom: 12 }} /><label style={{ display: 'block', fontWeight: 800, marginBottom: 8 }}>SMS message — optional</label><textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Hi, I want to know more." rows={4} style={{ width: '100%', padding: 14, border: '1px solid #D1D5DB', borderRadius: 12, fontSize: 16, marginBottom: 12 }} />
            {error && <p style={{ color: '#DC2626', fontWeight: 700 }}>{error}</p>}
            <button onClick={generateQR} style={{ width: '100%', marginTop: 14, padding: 15, background: '#1D9E75', color: '#fff', border: 0, borderRadius: 12, fontWeight: 800, fontSize: 16 }}>Generate QR Code</button>
            {qrUrl && <button onClick={downloadQR} style={{ width: '100%', marginTop: 10, padding: 15, background: '#064E3B', color: '#fff', border: 0, borderRadius: 12, fontWeight: 800, fontSize: 16 }}>Download PNG</button>}
          </div>
          <div style={{ border: '1px solid #E5E7EB', borderRadius: 20, padding: 20, textAlign: 'center', background: '#FAFAFA' }}>
            <h2 style={{ marginTop: 0 }}>QR Preview</h2>
            {qrUrl ? <img src={qrUrl} alt="SMS QR Generator" style={{ width: 320, maxWidth: '100%', borderRadius: 12 }} /> : <p style={{ color: '#6B7280' }}>Your QR code will appear here.</p>}
          </div>
        </section>
        <section style={{ marginTop: 32, lineHeight: 1.7 }}>
          <h2>Best for</h2>
          <p>Perfect for shops, clinics, events and service providers that want customers to scan a QR code and open a ready-to-send SMS enquiry.</p>
          <h2>Where to use this QR code</h2>
          <ul><li>Posters, flyers, event banners and enquiry counters.</li><li>Clinic appointment notices and service booking cards.</li><li>Local business print ads and shop windows.</li></ul>
          <h2>Print and safety tip</h2>
          <p>Download the PNG, test scan it on Android and iPhone, then print it with enough white space around the QR code. For customer-facing QR codes, display it clearly and check the destination before printing.</p>
          <p><Link href="/tools" style={{ color: '#1D9E75', fontWeight: 800 }}>Explore more free BharathQR tools →</Link></p>
        </section>
      </main>
    </>
  );
}
