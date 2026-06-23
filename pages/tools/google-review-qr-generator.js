import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import styles from '../../styles/GoogleReviewQRGenerator.module.css';

const CANONICAL_URL = 'https://www.bharathqr.com/tools/google-review-qr-generator';
const DEFAULT_REVIEW_LINK = 'https://g.page/r/your-business/review';

const TEMPLATES = [
  { id: 'counter', title: 'Counter Standee / Display', size: '100 × 150 mm / 3.94 × 5.91 in', shape: 'portrait' },
  { id: 'beige', title: 'Beige / White-Gold', size: '100 × 150 mm / 3.94 × 5.91 in', shape: 'portrait' },
  { id: 'credit', title: 'Credit Card / NFC Review Card', size: '54 × 85.6 mm / 2.13 × 3.37 in', shape: 'card' },
  { id: 'round', title: 'Round Sticker', size: '100 × 100 mm / 3.94 × 3.94 in', shape: 'round' }
];

const SIZE_PRESETS = {
  counter: [
    { id: 'recommended', label: 'Recommended', size: '100 × 150 mm / 3.94 × 5.91 in', note: 'Premium compact display', w: 100, h: 150 },
    { id: 'large', label: 'Large', size: '120 × 180 mm / 4.72 × 7.09 in', note: 'Elegant high visibility', w: 120, h: 180 },
    { id: 'xl', label: 'XL', size: '150 × 225 mm / 5.91 × 8.86 in', note: 'Large premium display', w: 150, h: 225 }
  ],
  beige: [
    { id: 'recommended', label: 'Recommended', size: '100 × 150 mm / 3.94 × 5.91 in', note: 'Premium compact display', w: 100, h: 150 },
    { id: 'large', label: 'Large', size: '120 × 180 mm / 4.72 × 7.09 in', note: 'Elegant high visibility', w: 120, h: 180 },
    { id: 'xl', label: 'XL', size: '150 × 225 mm / 5.91 × 8.86 in', note: 'Large premium display', w: 150, h: 225 }
  ],
  credit: [
    { id: 'recommended', label: 'Recommended', size: '54 × 85.6 mm / 2.13 × 3.37 in', note: 'Standard card size', w: 85.6, h: 54 },
    { id: 'large', label: 'Large', size: '60 × 95 mm / 2.36 × 3.74 in', note: 'Easy scan card', w: 95, h: 60 },
    { id: 'xl', label: 'XL', size: '70 × 110 mm / 2.76 × 4.33 in', note: 'Large handout card', w: 110, h: 70 }
  ],
  round: [
    { id: 'recommended', label: 'Recommended', size: '100 × 100 mm / 3.94 × 3.94 in', note: 'Best round sticker size', w: 100, h: 100 },
    { id: 'small', label: 'Small', size: '90 × 90 mm / 3.54 × 3.54 in', note: 'Compact sticker', w: 90, h: 90 },
    { id: 'large', label: 'Large', size: '120 × 120 mm / 4.72 × 4.72 in', note: 'Large visibility sticker', w: 120, h: 120 }
  ]
};

const RELATED_LINKS = [
  { href: '/tools/whatsapp-qr-generator', title: 'WhatsApp QR Generator' },
  { href: '/tools/url-qr-generator', title: 'URL QR Generator' },
  { href: '/templates/google-review-card-template', title: 'Google Review Card Template' },
  { href: '/templates/review-qr-standee', title: 'Review QR Standee' },
  { href: '/blog/how-to-find-google-review-link', title: 'How to Find Google Review Link' },
  { href: '/get-more-google-reviews', title: 'Get More Google Reviews' }
];

function GoogleWord() {
  return (
    <span className={styles.googleWord}>
      <span>G</span><span>o</span><span>o</span><span>g</span><span>l</span><span>e</span>
    </span>
  );
}

function safeUrl(value) {
  const clean = String(value || '').trim();
  if (!clean) return DEFAULT_REVIEW_LINK;
  return /^https?:\/\//i.test(clean) ? clean : `https://${clean}`;
}

function roundedRect(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function loadImage(src) {
  return new Promise(resolve => {
    if (!src) return resolve(null);
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function drawContainedImage(ctx, img, x, y, w, h) {
  if (!img) return;
  const ratio = Math.min(w / img.width, h / img.height);
  const dw = img.width * ratio;
  const dh = img.height * ratio;
  ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
}

function drawGoogleCanvas(ctx, x, y, fontSize) {
  const letters = [ ['G','#4285F4'], ['o','#EA4335'], ['o','#FBBC05'], ['g','#4285F4'], ['l','#34A853'], ['e','#EA4335'] ];
  ctx.save();
  ctx.font = `900 ${fontSize}px Arial, sans-serif`;
  ctx.textBaseline = 'middle';
  const total = letters.reduce((sum, [l]) => sum + ctx.measureText(l).width, 0) + letters.length * 2;
  let cursor = x - total / 2;
  letters.forEach(([l, c]) => {
    ctx.fillStyle = c;
    ctx.fillText(l, cursor, y);
    cursor += ctx.measureText(l).width + 2;
  });
  ctx.restore();
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1200);
}

function makePdfFromCanvas(canvas, printSize) {
  const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
  const pageW = (printSize.w * 72) / 25.4;
  const pageH = (printSize.h * 72) / 25.4;
  const encodedImage = dataUrl.split(',')[1];
  const binary = atob(encodedImage);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  const enc = new TextEncoder();
  const chunks = [];
  const offsets = [0];
  let offset = 0;
  const add = text => { const b = enc.encode(text); chunks.push(b); offset += b.length; };
  const addBytes = b => { chunks.push(b); offset += b.length; };
  const obj = n => { offsets[n] = offset; add(`${n} 0 obj\n`); };
  add('%PDF-1.4\n');
  obj(1); add('<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');
  obj(2); add('<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n');
  obj(3); add(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageW.toFixed(2)} ${pageH.toFixed(2)}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>\nendobj\n`);
  obj(4); add(`<< /Type /XObject /Subtype /Image /Width ${canvas.width} /Height ${canvas.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${bytes.length} >>\nstream\n`); addBytes(bytes); add('\nendstream\nendobj\n');
  const content = `q\n${pageW.toFixed(2)} 0 0 ${pageH.toFixed(2)} 0 0 cm\n/Im0 Do\nQ\n`;
  obj(5); add(`<< /Length ${enc.encode(content).length} >>\nstream\n${content}endstream\nendobj\n`);
  const xref = offset;
  add('xref\n0 6\n0000000000 65535 f \n');
  for (let i = 1; i <= 5; i++) add(`${String(offsets[i]).padStart(10, '0')} 00000 n \n`);
  add(`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`);
  return new Blob(chunks, { type: 'application/pdf' });
}

function TemplateCard({ template, active, qrDataUrl, onClick }) {
  return (
    <button type="button" onClick={onClick} className={`${styles.templateCard} ${active ? styles.activeTemplate : ''}`}>
      <span className={styles.radioDot} />
      <strong>{template.title}</strong>
      <span className={`${styles.miniTemplate} ${styles[`mini_${template.id}`]}`}>
        <span className={styles.miniLogo}>LOGO</span>
        <span className={styles.miniBusiness}>Sunrise Cafe</span>
        <small>Review us on</small>
        <GoogleWord />
        <em>★★★★★</em>
        {qrDataUrl ? <img src={qrDataUrl} alt="" /> : <span className={styles.qrBlank} />}
        <b>Scan QR to leave a review</b>
      </span>
      <small>{template.size}</small>
    </button>
  );
}

export default function GoogleReviewQRGenerator() {
  const canvasRef = useRef(null);
  const [reviewLink, setReviewLink] = useState(DEFAULT_REVIEW_LINK);
  const [businessName, setBusinessName] = useState('Sunrise Cafe');
  const [headline, setHeadline] = useState('Review us on Google');
  const [subText, setSubText] = useState('Scan QR to leave a review');
  const [logoDataUrl, setLogoDataUrl] = useState('');
  const [templateId, setTemplateId] = useState('counter');
  const [sizeId, setSizeId] = useState('recommended');
  const [accent, setAccent] = useState('#ff4d16');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [toast, setToast] = useState('');

  const selectedTemplate = useMemo(() => TEMPLATES.find(t => t.id === templateId) || TEMPLATES[0], [templateId]);
  const sizeOptions = SIZE_PRESETS[templateId] || SIZE_PRESETS.counter;
  const selectedSize = sizeOptions.find(s => s.id === sizeId) || sizeOptions[0];

  useEffect(() => {
    let active = true;
    async function generateQr() {
      try {
        const QRCodeModule = await import('qrcode');
        const QRCode = QRCodeModule.default || QRCodeModule;
        const data = await QRCode.toDataURL(safeUrl(reviewLink), {
          width: 1024,
          margin: 2,
          errorCorrectionLevel: 'H',
          color: { dark: '#0e1726', light: '#ffffff' }
        });
        if (active) setQrDataUrl(data);
      } catch {
        if (active) setQrDataUrl('');
      }
    }
    generateQr();
    return () => { active = false; };
  }, [reviewLink]);

  useEffect(() => {
    let active = true;
    async function draw() {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const portrait = selectedTemplate.shape === 'portrait';
      const card = selectedTemplate.shape === 'card';
      const round = selectedTemplate.shape === 'round';
      const width = card ? 1200 : round ? 1000 : 900;
      const height = card ? 760 : round ? 1000 : 1350;
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      const qrImg = await loadImage(qrDataUrl);
      const logoImg = await loadImage(logoDataUrl);
      if (!active || !ctx) return;
      ctx.clearRect(0, 0, width, height);

      if (selectedTemplate.id === 'credit') {
        const grad = ctx.createLinearGradient(0, 0, width, height);
        grad.addColorStop(0, '#15110f');
        grad.addColorStop(1, '#332115');
        ctx.fillStyle = grad;
        roundedRect(ctx, 30, 30, width-60, height-60, 46);
        ctx.fill();
        ctx.textAlign = 'left';
        ctx.fillStyle = '#f7d078';
        ctx.font = 'italic 900 62px Georgia, serif';
        ctx.fillText(businessName, 80, 160);
        ctx.fillStyle = '#ffffff';
        ctx.font = '900 56px Arial, sans-serif';
        ctx.fillText('Tap or Scan', 80, 260);
        ctx.font = '500 32px Arial, sans-serif';
        ctx.fillText('to review us on', 80, 315);
        drawGoogleCanvas(ctx, 250, 390, 58);
        ctx.fillStyle = '#f7b500';
        ctx.font = '900 42px Arial, sans-serif';
        ctx.fillText('★★★★★', 80, 455);
        drawQr(ctx, qrImg, logoImg, width-390, 170, 280, accent);
      } else if (round) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(width/2, height/2, 470, 0, Math.PI*2);
        ctx.clip();
        const grad = ctx.createLinearGradient(0, 0, width, height);
        grad.addColorStop(0, '#fffdf8');
        grad.addColorStop(1, '#fff0d9');
        ctx.fillStyle = grad;
        ctx.fillRect(0,0,width,height);
        ctx.strokeStyle = accent;
        ctx.lineWidth = 14;
        ctx.beginPath();
        ctx.arc(width/2, height/2, 430, 0, Math.PI*2);
        ctx.stroke();
        drawLogo(ctx, logoImg, width/2 - 60, 135, 120, accent);
        ctx.textAlign = 'center';
        ctx.fillStyle = '#7a3b18';
        ctx.font = 'italic 900 54px Georgia, serif';
        ctx.fillText(businessName, width/2, 330);
        ctx.fillStyle = '#0e1726';
        ctx.font = '700 32px Arial, sans-serif';
        ctx.fillText(headline, width/2, 385);
        drawGoogleCanvas(ctx, width/2, 455, 56);
        ctx.fillStyle = '#f7b500';
        ctx.font = '900 42px Arial, sans-serif';
        ctx.fillText('★★★★★', width/2, 525);
        drawQr(ctx, qrImg, logoImg, width/2 - 145, 580, 290, accent);
        ctx.restore();
      } else {
        const grad = ctx.createLinearGradient(0, 0, 0, height);
        if (selectedTemplate.id === 'beige') {
          grad.addColorStop(0, '#fff5de');
          grad.addColorStop(1, '#e7bd7c');
        } else {
          grad.addColorStop(0, '#fffdf8');
          grad.addColorStop(1, '#fff0df');
        }
        ctx.fillStyle = grad;
        roundedRect(ctx, 30, 30, width-60, height-60, 32);
        ctx.fill();
        ctx.strokeStyle = '#ecc38d';
        ctx.lineWidth = 5;
        roundedRect(ctx, 46, 46, width-92, height-92, 26);
        ctx.stroke();
        drawLogo(ctx, logoImg, width/2-55, 105, 110, accent);
        ctx.textAlign = 'center';
        ctx.fillStyle = '#7a3b18';
        ctx.font = 'italic 900 62px Georgia, serif';
        ctx.fillText(businessName, width/2, 285);
        ctx.fillStyle = '#0e1726';
        ctx.font = '700 36px Arial, sans-serif';
        ctx.fillText(headline, width/2, 350);
        drawGoogleCanvas(ctx, width/2, 435, 66);
        ctx.fillStyle = '#f7b500';
        ctx.font = '900 46px Arial, sans-serif';
        ctx.fillText('★★★★★', width/2, 510);
        drawQr(ctx, qrImg, logoImg, width/2-190, 610, 380, accent);
        ctx.fillStyle = '#1967f2';
        roundedRect(ctx, width/2-265, height-170, 530, 74, 22);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = '800 30px Arial, sans-serif';
        ctx.fillText(subText, width/2, height-123);
      }
    }
    draw();
    return () => { active = false; };
  }, [qrDataUrl, logoDataUrl, selectedTemplate, businessName, headline, subText, accent]);

  function drawLogo(ctx, img, x, y, size, color) {
    ctx.save();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(x + size/2, y + size/2, size/2, 0, Math.PI*2);
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 5;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x + size/2, y + size/2, size*0.38, 0, Math.PI*2);
    ctx.clip();
    if (img) drawContainedImage(ctx, img, x+size*0.13, y+size*0.13, size*0.74, size*0.74);
    else {
      ctx.fillStyle = '#7a3b18';
      ctx.font = `900 ${size*0.16}px Arial, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('LOGO', x + size/2, y + size/2);
    }
    ctx.restore();
  }

  function drawQr(ctx, qrImg, logoImg, x, y, size, color) {
    ctx.save();
    ctx.fillStyle = '#fff';
    roundedRect(ctx, x-18, y-18, size+36, size+36, 24);
    ctx.fill();
    if (qrImg) ctx.drawImage(qrImg, x, y, size, size);
    drawLogo(ctx, logoImg, x + size/2 - size*0.115, y + size/2 - size*0.115, size*0.23, color);
    ctx.restore();
  }

  function handleLogoUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setToast('Please upload an image file.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setLogoDataUrl(String(reader.result || ''));
    reader.readAsDataURL(file);
  }

  async function downloadPng() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
    downloadBlob(blob, `bharathqr-google-review-${selectedTemplate.id}.png`);
  }

  function downloadPdf() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    downloadBlob(makePdfFromCanvas(canvas, selectedSize), `bharathqr-google-review-${selectedTemplate.id}.pdf`);
  }

  function shareWhatsApp() {
    window.open(`https://wa.me/?text=${encodeURIComponent(`Please review ${businessName}: ${safeUrl(reviewLink)}`)}`, '_blank');
  }

  return (
    <>
      <Head>
        <title>Google Review QR Code Generator with Logo & Templates | BharathQR</title>
        <meta name="description" content="Create a Google Review QR code with logo and print-ready templates. Download PNG or PDF for counters, cards, stickers and stands." />
        <link rel="canonical" href={CANONICAL_URL} />
      </Head>

      <main className={styles.page}>
        <header className={styles.topbar}>
          <Link href="/" className={styles.brand}><span className={styles.brandMark}>QR</span><b>Bharath<span>QR</span></b></Link>
          <nav><Link href="/tools">Tools</Link><Link href="/solutions">Solutions</Link><Link href="/blog">Blog</Link><Link href="/pricing">Pricing</Link></nav>
          <a href="#generator" className={styles.dashboardButton}>Dashboard</a>
        </header>

        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <h1>Turn Every Customer Visit<br />Into a <span>5★</span> <GoogleWord /> Review</h1>
            <p>Create a premium Google Review QR code with your logo. Choose from beautiful templates and download print-ready assets in seconds.</p>
            <div className={styles.heroPills}><span>🎁 100% Free</span><span>👤 No Sign-up</span><span>🖨️ Print Ready</span></div>
          </div>
          <div className={styles.heroArt}>
            <div className={styles.heroCard}>
              <span className={styles.heroLogo}>SUNRISE<br />CAFE</span>
              <strong>Sunrise Cafe</strong>
              <small>Review us on</small>
              <GoogleWord />
              <em>★★★★★</em>
              {qrDataUrl && <img src={qrDataUrl} alt="Preview QR" />}
              <b>Scan QR to leave a review</b>
            </div>
            <div className={styles.plant} />
          </div>
        </section>

        <section className={styles.workflow}>
          <div><span>1</span><b>Enter Review Link</b><small>Add your Google review link</small></div>
          <i />
          <div><span>2</span><b>Customize Template</b><small>Choose template, edit details and colors</small></div>
          <i />
          <div><span>3</span><b>Preview & Download</b><small>Download print-ready files</small></div>
          <i />
          <div><span>4</span><b>Print & Display</b><small>Start getting more reviews</small></div>
        </section>

        <section id="generator" className={styles.generatorGrid}>
          <article className={styles.panel}>
            <h2><span>1</span>QR Generator</h2>
            <label>Google review link</label>
            <input value={reviewLink} onChange={e => setReviewLink(e.target.value)} />
            <p>Paste your full Google review link. It will redirect directly to your review and sharing.</p>
            <label>Business / Location name</label>
            <input value={businessName} onChange={e => setBusinessName(e.target.value)} />
            <label>Upload logo optional</label>
            <div className={styles.qrLogoRow}>
              <div>{qrDataUrl && <img src={qrDataUrl} alt="Generated QR" />}</div>
              <label className={styles.uploadBox}><input type="file" accept="image/*" onChange={handleLogoUpload} hidden />Choose logo</label>
            </div>
            <button onClick={downloadPng}>Download QR PNG</button>
            <button className={styles.secondaryButton} onClick={shareWhatsApp}>Share via WhatsApp</button>
            <div className={styles.ready}>✓ QR code is ready to use!</div>
          </article>

          <article className={`${styles.panel} ${styles.studioPanel}`}>
            <h2><span>2</span>Template Studio</h2>
            <p>Choose a template and customize it your way</p>
            <div className={styles.templateGrid}>
              {TEMPLATES.map(template => <TemplateCard key={template.id} template={template} qrDataUrl={qrDataUrl} active={template.id === templateId} onClick={() => { setTemplateId(template.id); setSizeId('recommended'); }} />)}
            </div>
            <div className={styles.editorGrid}>
              <label>Business Name<input value={businessName} onChange={e => setBusinessName(e.target.value)} /></label>
              <label>Headline<input value={headline} onChange={e => setHeadline(e.target.value)} /></label>
              <label>Sub Text<input value={subText} onChange={e => setSubText(e.target.value)} /></label>
              <label>Accent Color<input type="color" value={accent} onChange={e => setAccent(e.target.value)} /></label>
            </div>
            <h3>Print Size <small>(Tested sizes)</small></h3>
            <div className={styles.sizeGrid}>{sizeOptions.map(size => <button key={size.id} onClick={() => setSizeId(size.id)} className={size.id === sizeId ? styles.activeSize : ''}><b>{size.label}</b><span>{size.size}</span><small>{size.note}</small></button>)}</div>
          </article>

          <aside className={styles.previewPanel}>
            <h2><span>3</span>Live Product Preview <b>LIVE</b></h2>
            <div className={styles.previewStage}><canvas id="templateCanvas" ref={canvasRef} /></div>
            <div className={styles.previewMeta}><b>{selectedTemplate.title}</b><span>{selectedSize.size}</span><small>Recommended Print Size</small></div>
            <button onClick={downloadPng}>Download Design</button>
            <div className={styles.downloadRow}><button onClick={downloadPng}>PNG</button><button onClick={downloadPdf}>PDF</button></div>
            <button className={styles.secondaryButton} onClick={shareWhatsApp}>Share Link via WhatsApp</button>
          </aside>
        </section>

        <section className={styles.products}>
          <header><div><h2>Finished Products You Can Print</h2><p>Premium prints for every need</p></div><Link href="/templates">View All Templates →</Link></header>
          <div className={styles.productGrid}>{TEMPLATES.map(template => <article key={template.id}><span className={`${styles.productMock} ${styles[`product_${template.id}`]}`}>{qrDataUrl && <img src={qrDataUrl} alt="" />}</span><b>{template.title}</b><small>{template.size}</small></article>)}</div>
        </section>

        <section className={styles.bottomInfo}>
          <div><span>🎨</span><b>No Design Skills Needed</b><small>Create in minutes</small></div>
          <div><span>🖨️</span><b>Print Ready High Quality</b><small>Sharp, clean and professional</small></div>
          <div><span>☘️</span><b>Fully Customizable</b><small>Your style, your way</small></div>
          <div><span>👍</span><b>Trusted by Indian Businesses</b><small>Across clinics, salons, cafes</small></div>
          <div><span>♡</span><b>100% Satisfaction Guarantee</b><small>We are here to help</small></div>
        </section>

        <section className={styles.seoBlock}>
          <h2>Create a premium Google Review QR code for your business</h2>
          <div className={styles.relatedLinks}>{RELATED_LINKS.map(link => <Link key={link.href} href={link.href}>{link.title}</Link>)}</div>
        </section>
        {toast && <div className={styles.toast}>{toast}</div>}
      </main>
    </>
  );
}
