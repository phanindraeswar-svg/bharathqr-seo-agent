import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function MenuQRGenerator() {
  const [menuUrl, setMenuUrl] = useState('');
  const [qrUrl, setQrUrl] = useState('');
  const [error, setError] = useState('');

  const generateQR = async () => {
    setError(''); setQrUrl('');
    const url = menuUrl.trim();
    if (!/^https?:\/\//i.test(url)) { setError('Enter your digital menu link starting with https://'); return; }
    try {
      const QRCode = (await import('qrcode')).default;
      const dataUrl = await QRCode.toDataURL(url, { width: 360, margin: 2, errorCorrectionLevel: 'M', color: { dark: '#111827', light: '#FFFFFF' } });
      setQrUrl(dataUrl);
    } catch (_) { setError('Could not generate Menu QR. Please try again.'); }
  };
  const downloadQR = () => { if (!qrUrl) return; const a=document.createElement('a'); a.href=qrUrl; a.download='bharathqr-menu-qr.png'; a.click(); };

  const schema = { '@context':'https://schema.org', '@type':'SoftwareApplication', name:'Menu QR Code Generator', applicationCategory:'BusinessApplication', operatingSystem:'Web', offers:{'@type':'Offer',price:'0',priceCurrency:'INR'}, url:'https://bharathqr.com/tools/menu-qr-generator' };
  return <>
    <Head><title>Menu QR Code Generator for Restaurants, Cafes & Hotels — BharathQR</title><meta name="description" content="Create a free Menu QR Code for restaurants, cafes, hotels and food stalls. Share digital menus on tables, posters, bills and WhatsApp."/><link rel="canonical" href="https://bharathqr.com/tools/menu-qr-generator"/><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema)}}/></Head>
    <main style={{maxWidth:980,margin:'0 auto',padding:'1.5rem 1rem'}}>
      <section style={{background:'linear-gradient(135deg,#ECFDF5,#FFFFFF)',border:'1px solid #D1FAE5',borderRadius:24,padding:'clamp(1.25rem,5vw,2.5rem)',textAlign:'center'}}><p style={{color:'#1D9E75',fontWeight:800,margin:0}}>Restaurant QR Tool</p><h1 style={{fontSize:'clamp(2rem,7vw,3.2rem)',margin:'0.5rem 0'}}>Menu QR Code Generator</h1><p style={{color:'#4B5563',fontSize:18,lineHeight:1.6}}>Create a Menu QR Code for restaurants, cafes, hotels, dhabas and food stalls. Customers scan the QR code to open your digital menu without asking staff or touching printed menus.</p></section>
      <section style={{marginTop:24,display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:20}}><div style={{border:'1px solid #E5E7EB',borderRadius:20,padding:20}}><label style={{display:'block',fontWeight:800,marginBottom:8}}>Digital menu link</label><input value={menuUrl} onChange={e=>setMenuUrl(e.target.value)} placeholder="https://your-restaurant.com/menu" style={{width:'100%',padding:14,border:'1px solid #D1D5DB',borderRadius:12,fontSize:16}}/>{error&&<p style={{color:'#DC2626',fontWeight:700}}>{error}</p>}<button onClick={generateQR} style={{width:'100%',marginTop:14,padding:15,background:'#1D9E75',color:'#fff',border:0,borderRadius:12,fontWeight:800,fontSize:16}}>Generate Menu QR</button>{qrUrl&&<button onClick={downloadQR} style={{width:'100%',marginTop:10,padding:15,background:'#064E3B',color:'#fff',border:0,borderRadius:12,fontWeight:800,fontSize:16}}>Download PNG</button>}</div><div style={{border:'1px solid #E5E7EB',borderRadius:20,padding:20,textAlign:'center',background:'#FAFAFA'}}><h2 style={{marginTop:0}}>QR Preview</h2>{qrUrl?<img src={qrUrl} alt="Menu QR Code" style={{width:320,maxWidth:'100%',borderRadius:12}}/>:<p style={{color:'#6B7280'}}>Your Menu QR appears here.</p>}</div></section>
      <section style={{marginTop:32,lineHeight:1.7}}><h2>Best for restaurants, cafes and hotels</h2><p>A Menu QR Code helps restaurants, cafes, hotels and food courts reduce menu printing costs, share updated menu links, and let customers scan from tables, table tents, posters, bills and takeaway packaging.</p><h2>Where to place your Menu QR</h2><ul><li>Restaurant tables, table tents and menu boards.</li><li>Hotel rooms, cafe counters and takeaway packets.</li><li>WhatsApp Business profile, Instagram bio and food delivery flyers.</li></ul><h2>Print tip</h2><p>Print the QR clearly with a short CTA like “Scan Menu”. Test it with Android and iPhone before placing it on every table.</p><p><Link href="/use-cases/share-digital-menu" style={{color:'#1D9E75',fontWeight:800}}>Read the Share Digital Menu use case →</Link></p></section>
    </main>
  </>;
}
