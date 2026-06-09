import Head from 'next/head';
import Link from 'next/link';

export default function PolicyPage() {
  const title = 'Advertising Disclosure — BharathQR';
  const description = 'BharathQR may use advertising, affiliate references, or sponsored placements in the future while keeping core QR tools free and transparent.';
  const schema = { '@context':'https://schema.org', '@type':'WebPage', name:title, description, url:'https://bharathqr.com/advertising-disclosure' };
  return <>
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href="https://bharathqr.com/advertising-disclosure" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content="https://bharathqr.com/advertising-disclosure" />
      <meta name="twitter:card" content="summary_large_image" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
    </Head>
    <main style={{maxWidth:900,margin:'0 auto',padding:'2rem 1rem',lineHeight:1.75}}>
      <p style={{color:'#1D9E75',fontWeight:900,margin:0}}>BharathQR Trust</p>
      <h1 style={{fontSize:'clamp(2rem,6vw,3.2rem)',margin:'0.4rem 0'}}>Advertising Disclosure</h1>
      <p style={{color:'#4B5563',fontSize:18}}>{description}</p>
      <section style={{marginTop:24}}><h2>Our promise</h2><p>BharathQR is built to provide free, mobile-first QR tools for Indian businesses, creators, students and professionals. If we display ads or partner links in the future, we will keep them clearly separated from tool functionality.</p></section>
<section style={{marginTop:24}}><h2>What this means for users</h2><p>You can create QR codes without login, database storage, payment subscription, or hidden software installation. Advertising will never change the static QR data you enter into a tool.</p></section>
<section style={{marginTop:24}}><h2>Editorial independence</h2><p>Our guides, tool pages, safety pages and comparisons are written to help users choose the right QR use case. We do not promise guaranteed rankings, payments, reviews, or business outcomes.</p></section>
<section style={{marginTop:24}}><h2>Contact</h2><p>For questions about advertising or disclosure, contact us through the BharathQR contact page.</p></section>
      <p style={{marginTop:28}}><Link href="/trust" style={{color:'#1D9E75',fontWeight:900}}>Explore QR safety and trust guides →</Link></p>
    </main>
  </>;
}
