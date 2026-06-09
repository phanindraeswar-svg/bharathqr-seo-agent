import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function VCardQRGenerator() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [business, setBusiness] = useState('');
  const [website, setWebsite] = useState('');
  const [qrUrl, setQrUrl] = useState('');
  const [error, setError] = useState('');

  const generateQR = async () => {
    setError(''); setQrUrl('');
    if (!name.trim() || !phone.trim()) { setError('Enter at least name and phone number.'); return; }
    const vcard = `BEGIN:VCARD\nVERSION:3.0\nFN:${name.trim()}\nORG:${business.trim()}\nTEL:${phone.trim()}\nEMAIL:${email.trim()}\nURL:${website.trim()}\nEND:VCARD`;
    try {
      const QRCode = (await import('qrcode')).default;
      const dataUrl = await QRCode.toDataURL(vcard, { width: 340, margin: 2, errorCorrectionLevel: 'M', color: { dark: '#111827', light: '#FFFFFF' } });
      setQrUrl(dataUrl);
    } catch (e) { setError('Could not generate QR code. Please try again.'); }
  };
  const downloadQR = () => { if (!qrUrl) return; const a = document.createElement('a'); a.href = qrUrl; a.download = 'bharathqr-vcard-qr-generator.png'; a.click(); };
  const inputStyle = { width: '100%', padding: 14, border: '1px solid #D1D5DB', borderRadius: 12, fontSize: 16, marginBottom: 12 };
  const schema = { '@context': 'https://schema.org', '@type': 'SoftwareApplication', name: 'vCard QR Code Generator', applicationCategory: 'BusinessApplication', operatingSystem: 'Web', offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' }, url: 'https://bharathqr.com/tools/vcard-qr-generator' };
  return <>
    <Head><title>vCard QR Code Generator — BharathQR</title><meta name="description" content="Create a free vCard QR code for digital business cards, real estate agents, doctors, salons and small business contacts."/><link rel="canonical" href="https://bharathqr.com/tools/vcard-qr-generator"/><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} /></Head>
    <main style={{ maxWidth: 980, margin: '0 auto', padding: '1.5rem 1rem' }}>
      <section style={{ background: 'linear-gradient(135deg,#ECFDF5,#FFFFFF)', border: '1px solid #D1FAE5', borderRadius: 24, padding: 'clamp(1.25rem, 5vw, 2.5rem)', textAlign: 'center' }}><p style={{ color:'#1D9E75', fontWeight:800, margin:0 }}>Free Business QR Tool</p><h1 style={{ fontSize:'clamp(2rem,7vw,3.2rem)', margin:'0.5rem 0' }}>vCard QR Code Generator</h1><p style={{ color:'#4B5563', fontSize:18, lineHeight:1.6 }}>Create a contact QR code for business cards, clinics, real estate visits, salons and freelancers. Customers scan and save your contact instantly.</p></section>
      <section style={{ marginTop:24, display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:20 }}>
        <div style={{ border:'1px solid #E5E7EB', borderRadius:20, padding:20 }}>
          <input value={name} onChange={e=>setName(e.target.value)} placeholder="Full name" style={inputStyle}/>
          <input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="Phone number" style={inputStyle}/>
          <input value={business} onChange={e=>setBusiness(e.target.value)} placeholder="Business / company (optional)" style={inputStyle}/>
          <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email (optional)" style={inputStyle}/>
          <input value={website} onChange={e=>setWebsite(e.target.value)} placeholder="Website (optional)" style={inputStyle}/>
          {error && <p style={{ color:'#DC2626', fontWeight:700 }}>{error}</p>}
          <button onClick={generateQR} style={{ width:'100%', padding:15, background:'#1D9E75', color:'#fff', border:0, borderRadius:12, fontWeight:800, fontSize:16 }}>Generate vCard QR</button>
          {qrUrl && <button onClick={downloadQR} style={{ width:'100%', marginTop:10, padding:15, background:'#064E3B', color:'#fff', border:0, borderRadius:12, fontWeight:800, fontSize:16 }}>Download PNG</button>}
        </div>
        <div style={{ border:'1px solid #E5E7EB', borderRadius:20, padding:20, textAlign:'center', background:'#FAFAFA' }}><h2 style={{ marginTop:0 }}>QR Preview</h2>{qrUrl ? <img src={qrUrl} alt="vCard QR Code" style={{ width:320, maxWidth:'100%', borderRadius:12 }}/> : <p style={{ color:'#6B7280' }}>Your QR code will appear here.</p>}</div>
      </section>
      <section style={{ marginTop:32, lineHeight:1.7 }}><h2>Best for Indian professionals</h2><p>A vCard QR code is useful for real estate agents, doctors, consultants, salons, freelancers and retail stores. Print it on business cards, brochures, posters and shop counters.</p><p><Link href="/tools" style={{ color:'#1D9E75', fontWeight:800 }}>Explore more free BharathQR tools →</Link></p></section>
    </main>
  </>;
}
