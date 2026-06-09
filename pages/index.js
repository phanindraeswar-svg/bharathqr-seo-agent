import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import seoData from '../seo_updates.json';

export async function getStaticProps() {
  const routes = seoData?.optimized_data?.suggested_routes || [];
  return {
    props: { suggestedRoutes: routes },
    revalidate: 86400,
  };
}

// UPI QR generator — runs only in browser
function QRGenerator() {
  const [upiId, setUpiId] = useState('');
  const [name, setName]   = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote]   = useState('');
  const [qrUrl, setQrUrl] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef(null);

  const generateQR = async () => {
    setError('');
    setQrUrl('');
    if (!upiId.trim()) {
      setError('UPI ID is required.');
      return;
    }
    if (!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/.test(upiId.trim())) {
      setError('Please enter a valid UPI ID (e.g. name@bank)');
      return;
    }
    let upiString = `upi://pay?pa=${encodeURIComponent(upiId.trim())}&pn=${encodeURIComponent((name.trim() || 'BharathQR User'))}&cu=INR`;
    if (amount) upiString += `&am=${encodeURIComponent(amount)}`;
    if (note)   upiString += `&tn=${encodeURIComponent(note)}`;

    try {
      const QRCode = (await import('qrcode')).default;
      const dataUrl = await QRCode.toDataURL(upiString, {
        width: 300, margin: 2,
        color: { dark: '#111827', light: '#FFFFFF' }
      });
      setQrUrl(dataUrl);
    } catch (e) {
      setError('Failed to generate QR code. Please try again.');
    }
  };

  const downloadQR = () => {
    if (!qrUrl) return;
    const a = document.createElement('a');
    a.href = qrUrl;
    a.download = `bharathqr-${upiId.replace('@','_')}.png`;
    a.click();
  };

  const copyUPI = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const inputStyle = {
    width: '100%', padding: '10px 14px', borderRadius: '8px',
    border: '1px solid #D1D5DB', fontSize: '15px', outline: 'none',
    boxSizing: 'border-box', marginBottom: '12px',
  };
  const labelStyle = { fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '4px', display: 'block' };

  return (
    <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #E5E7EB', padding: '2rem', maxWidth: '480px', margin: '0 auto' }}>
      <div style={{ marginBottom: '12px' }}>
        <label style={labelStyle}>UPI ID / VPA *</label>
        <input style={inputStyle} placeholder="yourname@bank" value={upiId} onChange={e => setUpiId(e.target.value)} />
      </div>
      <div style={{ marginBottom: '12px' }}>
        <label style={labelStyle}>Merchant / Business Name — Optional</label>
        <input style={inputStyle} placeholder="My Shop" value={name} onChange={e => setName(e.target.value)} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
        <div>
          <label style={labelStyle}>Amount (₹) — Optional</label>
          <input style={inputStyle} placeholder="0.00" type="number" value={amount} onChange={e => setAmount(e.target.value)} />
        </div>
        <div>
          <label style={labelStyle}>Note — Optional</label>
          <input style={inputStyle} placeholder="Payment for..." value={note} onChange={e => setNote(e.target.value)} />
        </div>
      </div>
      {error && <p style={{ color: '#DC2626', fontSize: '13px', marginBottom: '12px' }}>{error}</p>}
      <button
        onClick={generateQR}
        style={{ width: '100%', background: '#1D9E75', color: '#fff', border: 'none', borderRadius: '10px', padding: '12px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', marginBottom: '1rem' }}
      >
        Generate Free UPI QR Code
      </button>

      {qrUrl && (
        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <img src={qrUrl} alt="UPI QR Code" style={{ width: '220px', height: '220px', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '8px' }} />
          <p style={{ fontSize: '12px', color: '#6B7280', marginTop: '8px' }}>Scan with GPay, PhonePe, Paytm, BHIM</p>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '12px' }}>
            <button onClick={downloadQR} style={{ background: '#1D9E75', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 18px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>
              Download PNG
            </button>
            <button onClick={copyUPI} style={{ background: '#F3F4F6', color: '#111', border: '1px solid #D1D5DB', borderRadius: '8px', padding: '8px 18px', cursor: 'pointer', fontSize: '14px' }}>
              {copied ? 'Copied!' : 'Copy UPI ID'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Home({ suggestedRoutes }) {
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "BharathQR — AI-Powered QR & Business Growth Platform",
    "url": "https://bharathqr.com",
    "applicationCategory": "FinanceApplication",
    "operatingSystem": "Web",
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "INR" },
    "description": "Generate free UPI QR codes for your business instantly. Zero fees. Works with GPay, PhonePe, Paytm, BHIM and 45+ UPI apps.",
  };

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', color: '#111827' }}>
      <Head>
        <title>Free UPI QR Code Generator for Indian Merchants — BharathQR</title>
        <meta name="description" content="Generate free UPI QR codes for your business in seconds. Zero MDR fees. Works with GPay, PhonePe, Paytm, BHIM & 45+ UPI apps. No signup needed." />
        <meta name="keywords" content="free UPI QR code generator, UPI QR code, free payment QR India, GPay QR code, PhonePe QR code, merchant QR code" />
        <meta property="og:title" content="Free UPI QR Code Generator — BharathQR" />
        <meta property="og:description" content="Zero-fee UPI QR codes for Indian merchants. Instant bank credit. Works with all UPI apps." />
        <meta property="og:url" content="https://bharathqr.com" />
        <link rel="canonical" href="https://bharathqr.com" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }} />
      </Head>

      {/* HERO */}
      <header style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', padding: '3rem 1.5rem 4rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
          <span style={{ background: '#1D9E75', color: '#fff', fontSize: '12px', fontWeight: '700', padding: '4px 12px', borderRadius: '100px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            100% Free — Zero MDR Fees
          </span>
          <h1 style={{ fontSize: 'clamp(1.8rem, 5vw, 2.8rem)', fontWeight: '800', color: '#111827', marginTop: '1rem', marginBottom: '0.75rem', lineHeight: '1.2' }}>
            India's AI-Powered QR & Business Growth Platform<br />for Indian Merchants
          </h1>
          <p style={{ fontSize: '1.1rem', color: '#4B5563', marginBottom: '2rem', lineHeight: '1.6' }}>
            Generate UPI QR, Google Review QR, WhatsApp QR, WiFi QR and business QR tools for Indian shops, restaurants, hotels, clinics and salons.
          </p>

          {/* UPI App Logos Strip */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
            {['GPay', 'PhonePe', 'Paytm', 'BHIM', 'Amazon Pay'].map(app => (
              <span key={app} style={{ background: '#fff', border: '1px solid #D1D5DB', borderRadius: '8px', padding: '6px 14px', fontSize: '13px', fontWeight: '600', color: '#374151' }}>
                {app}
              </span>
            ))}
            <span style={{ background: '#fff', border: '1px solid #D1D5DB', borderRadius: '8px', padding: '6px 14px', fontSize: '13px', color: '#374151' }}>
              +43 more UPI apps
            </span>
          </div>

          {/* QR Generator Tool */}
          <QRGenerator />

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '1.25rem' }}>
            {[
              { href: '/tools', label: 'Explore QR Tools' },
              { href: '/solutions', label: 'Business Solutions' },
              { href: '/use-cases', label: 'Use Cases' },
              { href: '/trust', label: 'QR Safety' },
            ].map((item) => (
              <Link key={item.href} href={item.href} style={{ background: '#fff', border: '1px solid #D1FAE5', color: '#065F46', padding: '10px 14px', borderRadius: 999, textDecoration: 'none', fontWeight: 800, fontSize: 14 }}>
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </header>

      {/* HOW IT WORKS */}
      <section style={{ padding: '4rem 1.5rem', background: '#fff', textAlign: 'center' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '0.5rem' }}>How BharathQR Works</h2>
          <p style={{ color: '#6B7280', marginBottom: '3rem' }}>Get paid digitally in 3 simple steps</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
            {[
              { step: '1', title: 'Enter UPI ID', desc: 'Type your UPI ID or VPA like name@bank into the generator above.' },
              { step: '2', title: 'Generate QR', desc: 'Click generate. Your unique UPI QR code is created instantly in your browser.' },
              { step: '3', title: 'Get Paid', desc: 'Download and display your QR. Customers scan and pay instantly — money goes directly to your bank.' },
            ].map(({ step, title, desc }) => (
              <div key={step} style={{ padding: '1.5rem', background: '#F9FAFB', borderRadius: '12px' }}>
                <div style={{ width: '40px', height: '40px', background: '#1D9E75', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '18px', margin: '0 auto 1rem' }}>{step}</div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem' }}>{title}</h3>
                <p style={{ fontSize: '0.9rem', color: '#6B7280', lineHeight: '1.5' }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section style={{ padding: '4rem 1.5rem', background: '#F9FAFB' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '0.5rem' }}>Benefits with BharathQR</h2>
          <p style={{ color: '#6B7280', marginBottom: '3rem' }}>Why thousands of Indian merchants choose BharathQR</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', textAlign: 'left' }}>
            {[
              { icon: '₹0', title: 'Zero Transaction Fees', desc: 'No MDR. No hidden charges. Keep 100% of every payment you receive.' },
              { icon: '⚡', title: 'Instant Bank Credit', desc: 'Payments go directly to your bank account — no waiting, no intermediaries.' },
              { icon: '📱', title: 'Works on All UPI Apps', desc: 'Compatible with GPay, PhonePe, Paytm, BHIM, Amazon Pay and 43+ more apps.' },
              { icon: '🔒', title: 'Private & Secure', desc: 'Your data never leaves your browser. Nothing is stored on our servers.' },
              { icon: '🎯', title: 'No Signup Needed', desc: 'No account, no app download, no KYC. Just generate and start accepting payments.' },
              { icon: '♾️', title: 'Lifetime Validity', desc: 'Your QR code works forever as long as your UPI ID is active.' },
            ].map(({ icon, title, desc }) => (
              <div key={title} style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
                <div style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>{icon}</div>
                <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '0.4rem' }}>{title}</h3>
                <p style={{ fontSize: '0.875rem', color: '#6B7280', lineHeight: '1.5', margin: 0 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INDUSTRY PAGES */}
      {suggestedRoutes.length > 0 && (
        <section style={{ padding: '4rem 1.5rem', background: '#fff' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: '700', textAlign: 'center', marginBottom: '0.5rem' }}>
              Free UPI QR Solutions for Every Business
            </h2>
            <p style={{ color: '#6B7280', textAlign: 'center', marginBottom: '3rem' }}>
              Tailored UPI payment solutions for Indian merchants across all industries
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
              {suggestedRoutes.map((item) => (
                <div key={item.slug} style={{ padding: '1.5rem', border: '1px solid #E5E7EB', borderRadius: '12px', background: '#FAFAFA', transition: 'box-shadow 0.2s' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#111827', marginBottom: '0.5rem' }}>
                    {item.industry}
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: '1rem', lineHeight: '1.5' }}>
                    {item.meta_description || item.body_text?.slice(0, 100) + '...'}
                  </p>
                  {/* FIXED: /qr-for/ not /pages/ */}
                  <Link
                    href={`/qr-for/${item.slug}`}
                    style={{ color: '#1D9E75', fontWeight: '600', textDecoration: 'none', fontSize: '0.9rem' }}
                  >
                    Get Free QR Code →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      <section style={{ padding: '4rem 1.5rem', background: '#F9FAFB' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '700', textAlign: 'center', marginBottom: '3rem' }}>Frequently Asked Questions</h2>
          {[
            { q: 'Is BharathQR really free?', a: 'Yes, 100% free. We charge zero fees — no MDR, no transaction charges, no subscription. You keep every rupee your customers pay.' },
            { q: 'Which UPI apps work with BharathQR?', a: 'Your BharathQR code works with all UPI apps including Google Pay, PhonePe, Paytm, BHIM, Amazon Pay, and 43+ other apps.' },
            { q: 'Do I need to create an account?', a: 'No. No signup, no app download, no KYC. Just enter your UPI ID and generate your QR code in seconds.' },
            { q: 'Is my UPI ID safe?', a: 'Yes. Your UPI ID is processed entirely in your browser and never stored on our servers. Your data is private and secure.' },
            { q: 'Can I set a fixed amount on the QR code?', a: 'Yes. Enter the amount in the Amount field and your QR code will have a pre-filled payment amount that customers can see before paying.' },
          ].map(({ q, a }) => (
            <div key={q} style={{ marginBottom: '1.5rem', padding: '1.25rem 1.5rem', background: '#fff', borderRadius: '10px', border: '1px solid #E5E7EB' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '0.5rem', color: '#111827' }}>{q}</h3>
              <p style={{ fontSize: '0.9rem', color: '#6B7280', lineHeight: '1.6', margin: 0 }}>{a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* BLOG LINK */}
      <section style={{ padding: '3rem 1.5rem', background: '#1D9E75', textAlign: 'center' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.75rem' }}>
            Learn How to Grow Your Business with UPI Payments
          </h2>
          <p style={{ color: '#D1FAE5', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
            Free guides, tips and strategies for Indian merchants to go cashless and grow faster.
          </p>
          <Link href="/blog" style={{ background: '#fff', color: '#1D9E75', padding: '10px 28px', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '15px' }}>
            Read Merchant Guides →
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: '#111827', color: '#9CA3AF', padding: '2rem 1.5rem', textAlign: 'center', fontSize: '13px' }}>
        <p style={{ marginBottom: '0.5rem' }}>© {new Date().getFullYear()} BharathQR — Free UPI QR Code Generator for Indian Merchants</p>
        <p>BharathQR is not affiliated with NPCI, BHIM, or any bank. UPI is a product of NPCI.</p>
      </footer>
    </div>
  );
}
