import Head from 'next/head';
import Link from 'next/link';

export default function PolicyPage() {
  const title = 'Editorial Policy — BharathQR';
  const description = 'BharathQR editorial standards for QR code guides, business use cases, safety content, and AI-assisted content.';
  const schema = { '@context':'https://schema.org', '@type':'WebPage', name:title, description, url:'https://bharathqr.com/editorial-policy' };
  return <>
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href="https://bharathqr.com/editorial-policy" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content="https://bharathqr.com/editorial-policy" />
      <meta name="twitter:card" content="summary_large_image" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
    </Head>
    <main style={{maxWidth:900,margin:'0 auto',padding:'2rem 1rem',lineHeight:1.75}}>
      <p style={{color:'#1D9E75',fontWeight:900,margin:0}}>BharathQR Trust</p>
      <h1 style={{fontSize:'clamp(2rem,6vw,3.2rem)',margin:'0.4rem 0'}}>Editorial Policy</h1>
      <p style={{color:'#4B5563',fontSize:18}}>{description}</p>
      <section style={{marginTop:24}}><h2>Purpose</h2><p>BharathQR publishes practical QR code and business growth content for Indian shops, restaurants, hotels, clinics, salons, schools, events and creators.</p></section>
<section style={{marginTop:24}}><h2>Content standards</h2><p>Every guide should be useful, simple, commercial-intent focused and connected to a real BharathQR tool, solution, use case, material, trust page or comparison page.</p></section>
<section style={{marginTop:24}}><h2>AI-assisted writing</h2><p>We may use AI tools to draft and improve content, but content must pass validation for readability, founder preferences, banned phrases, commercial intent and trust claims before publication.</p></section>
<section style={{marginTop:24}}><h2>Fact-sensitive topics</h2><p>Content mentioning UPI limits, RBI rules, GST, government schemes, bank policies, payment safety, QR fraud or legal/regulatory topics should be reviewed carefully and updated when needed.</p></section>
<section style={{marginTop:24}}><h2>Corrections</h2><p>If we find outdated or unclear content, we add it to the content refresh queue and improve it instead of publishing more generic articles.</p></section>
      <p style={{marginTop:28}}><Link href="/trust" style={{color:'#1D9E75',fontWeight:900}}>Explore QR safety and trust guides →</Link></p>
    </main>
  </>;
}
