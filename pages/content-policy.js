import Head from 'next/head';
import Link from 'next/link';

export default function PolicyPage() {
  const title = 'Content Policy — BharathQR';
  const description = 'BharathQR content policy for helpful, trustworthy, India-focused QR and business utility content.';
  const schema = { '@context':'https://schema.org', '@type':'WebPage', name:title, description, url:'https://bharathqr.com/content-policy' };
  return <>
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href="https://bharathqr.com/content-policy" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content="https://bharathqr.com/content-policy" />
      <meta name="twitter:card" content="summary_large_image" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
    </Head>
    <main style={{maxWidth:900,margin:'0 auto',padding:'2rem 1rem',lineHeight:1.75}}>
      <p style={{color:'#1D9E75',fontWeight:900,margin:0}}>BharathQR Trust</p>
      <h1 style={{fontSize:'clamp(2rem,6vw,3.2rem)',margin:'0.4rem 0'}}>Content Policy</h1>
      <p style={{color:'#4B5563',fontSize:18}}>{description}</p>
      <section style={{marginTop:24}}><h2>People-first content</h2><p>BharathQR content should help real people complete practical actions: accept UPI payments, collect Google reviews, share menus, open WhatsApp chats, connect WiFi, print QR standees and use QR codes safely.</p></section>
<section style={{marginTop:24}}><h2>No misleading claims</h2><p>We do not claim to be NPCI, Google, WhatsApp, PhonePe, Paytm, BHIM, a bank, or a government body. We do not guarantee reviews, payments, rankings, indexing, or revenue.</p></section>
<section style={{marginTop:24}}><h2>No sensitive storage promise</h2><p>Our current static QR tools are designed to work without login, database or account creation. Users should still avoid entering private information into tools unnecessarily.</p></section>
<section style={{marginTop:24}}><h2>Quality requirements</h2><p>Content should be crisp, high-intent, mobile-friendly, easy to read, and free from generic filler such as “digital landscape”, “leverage”, or “revolutionary”.</p></section>
      <p style={{marginTop:28}}><Link href="/trust" style={{color:'#1D9E75',fontWeight:900}}>Explore QR safety and trust guides →</Link></p>
    </main>
  </>;
}
