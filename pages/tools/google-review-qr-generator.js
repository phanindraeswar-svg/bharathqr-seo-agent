import Head from 'next/head';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styles from '../../styles/GoogleReviewQRGenerator.module.css';

const CANONICAL = 'https://www.bharathqr.com/tools/google-review-qr-generator';

const TEMPLATES = [
  { id: 'counter', name: 'Counter Standee / Display', sizeLabel: '100 x 150 mm / 3.94 x 5.91 in', type: 'standee' },
  { id: 'beige', name: 'Beige / White-Gold', sizeLabel: '100 x 150 mm / 3.94 x 5.91 in', type: 'beige' },
  { id: 'nfc', name: 'Credit Card / NFC Review Card', sizeLabel: '54 x 85.6 mm / 2.13 x 3.37 in', type: 'card' },
  { id: 'round', name: 'Round Sticker', sizeLabel: '100 x 100 mm / 3.94 x 3.94 in', type: 'round' }
];

const SIZE_OPTIONS = {
  counter: [
    { id: 'recommended', label: 'Recommended', dim: '100 x 150 mm / 3.94 x 5.91 in', note: 'Premium compact display' },
    { id: 'large', label: 'Large', dim: '120 x 180 mm / 4.72 x 7.09 in', note: 'Elegant high visibility' },
    { id: 'xl', label: 'XL', dim: '150 x 225 mm / 5.91 x 8.86 in', note: 'Large premium display' }
  ],
  beige: [
    { id: 'recommended', label: 'Recommended', dim: '100 x 150 mm / 3.94 x 5.91 in', note: 'Premium compact display' },
    { id: 'large', label: 'Large', dim: '120 x 180 mm / 4.72 x 7.09 in', note: 'Elegant high visibility' },
    { id: 'xl', label: 'XL', dim: '150 x 225 mm / 5.91 x 8.86 in', note: 'Large premium display' }
  ],
  nfc: [
    { id: 'recommended', label: 'Recommended', dim: '54 x 85.6 mm / 2.13 x 3.37 in', note: 'Standard NFC card size' },
    { id: 'large', label: 'Large', dim: '60 x 95 mm / 2.36 x 3.74 in', note: 'Easy scan card' },
    { id: 'xl', label: 'XL', dim: '70 x 110 mm / 2.76 x 4.33 in', note: 'Premium feedback card' }
  ],
  round: [
    { id: 'recommended', label: 'Recommended', dim: '100 x 100 mm / 3.94 x 3.94 in', note: 'Best round sticker size' },
    { id: 'large', label: 'Large', dim: '120 x 120 mm / 4.72 x 4.72 in', note: 'Large visibility sticker' },
    { id: 'xl', label: 'XL', dim: '150 x 150 mm / 5.91 x 5.91 in', note: 'Premium round display' }
  ]
};

const FINISHED_PRODUCTS = [
  { id: 'counter', name: 'Counter Standee / Display', sub: '100 x 150 mm / 3.94 x 5.91 in' },
  { id: 'beige', name: 'Beige / White-Gold', sub: '100 x 150 mm / 3.94 x 5.91 in' },
  { id: 'nfc', name: 'Credit Card / NFC Review Card', sub: '54 x 85.6 mm / 2.13 x 3.37 in' },
  { id: 'round', name: 'Round Sticker', sub: '100 x 100 mm / 3.94 x 3.94 in' }
];

const TRUST_BAR = [
  { icon: '🎨', label: 'No Design Skills Needed' },
  { icon: '🖨️', label: 'Print Ready High Quality' },
  { icon: '✏️', label: 'Fully Customizable' },
  { icon: '🏬', label: 'Trusted by Indian Businesses' },
  { icon: '✅', label: '100% Satisfaction Guarantee' }
];

const INTERNAL_LINKS = [
  { href: '/blog/restaurant-google-review-qr-code', label: 'Restaurant Google Review QR Guide' },
  { href: '/blog/clinic-google-review-qr-code', label: 'Clinic Google Review QR Guide' },
  { href: '/blog/salon-google-review-qr-code', label: 'Salon Google Review QR Guide' },
  { href: '/templates/google-review-card-template', label: 'Google Review Card Template' },
  { href: '/templates/review-qr-standee', label: 'Review QR Standee' },
  { href: '/blog/how-to-find-google-review-link', label: 'How to Find Google Review Link' },
  { href: '/get-more-google-reviews', label: 'Get More Google Reviews' },
  { href: '/tools/whatsapp-qr-generator', label: 'WhatsApp QR Generator' },
  { href: '/tools/url-qr-generator', label: 'URL QR Generator' }
];

const STAR_COLORS = ['#F5A700', '#0E0D14', '#F35F1B', '#34A853'];
const TEXT_COLORS = ['#0E0D14', '#7A5B17', '#F35F1B', '#1F2937'];

function safeLink(value) {
  const v = (value || '').trim();
  if (!v) return 'https://g.page/r/sample/review';
  return /^https?:\/\//i.test(v) ? v : `https://${v}`;
}

function fileSafeName(name) {
  return (name || 'sunrise-cafe')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 48) || 'sunrise-cafe';
}

function dataUrlToBytes(dataUrl) {
  const binary = atob((dataUrl.split(',')[1] || ''));
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function getCanvasSize(templateId) {
  if (templateId === 'round') return { w: 700, h: 700 };
  if (templateId === 'nfc') return { w: 1000, h: 630 };
  return { w: 700, h: 1050 };
}

function buildPdf(canvas, sizeMm) {
  const imageBytes = dataUrlToBytes(canvas.toDataURL('image/jpeg', 0.95));
  const pageW = (sizeMm.w * 72) / 25.4;
  const pageH = (sizeMm.h * 72) / 25.4;
  const enc = new TextEncoder();
  const chunks = [];
  const offsets = [0];
  let off = 0;
  const add = (t) => { const b = enc.encode(t); chunks.push(b); off += b.length; };
  const addBytes = (b) => { chunks.push(b); off += b.length; };
  const obj = (n) => { offsets[n] = off; add(`${n} 0 obj\n`); };
  add('%PDF-1.4\n');
  obj(1); add('<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');
  obj(2); add('<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n');
  obj(3); add(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageW.toFixed(2)} ${pageH.toFixed(2)}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>\nendobj\n`);
  obj(4); add(`<< /Type /XObject /Subtype /Image /Width ${canvas.width} /Height ${canvas.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${imageBytes.length} >>\nstream\n`); addBytes(imageBytes); add('\nendstream\nendobj\n');
  const content = `q\n${pageW.toFixed(2)} 0 0 ${pageH.toFixed(2)} 0 0 cm\n/Im0 Do\nQ\n`;
  obj(5); add(`<< /Length ${enc.encode(content).length} >>\nstream\n${content}endstream\nendobj\n`);
  const xref = off;
  add('xref\n0 6\n0000000000 65535 f \n');
  for (let i = 1; i <= 5; i += 1) add(`${String(offsets[i]).padStart(10, '0')} 00000 n \n`);
  add(`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`);
  return new Blob(chunks, { type: 'application/pdf' });
}

function svgFromCanvas(canvas) {
  const dataUrl = canvas.toDataURL('image/png');
  const w = canvas.width;
  const h = canvas.height;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}"><image href="${dataUrl}" width="${w}" height="${h}" /></svg>`;
  return new Blob([svg], { type: 'image/svg+xml' });
}

function GoogleWord({ size = 22 }) {
  const colors = ['#4285F4', '#EA4335', '#FBBC05', '#4285F4', '#34A853', '#EA4335'];
  const letters = ['G', 'o', 'o', 'g', 'l', 'e'];
  return (
    <span className={styles.googleWord} style={{ fontSize: size }}>
      {letters.map((l, i) => (
        <span key={i} style={{ color: colors[i] }}>{l}</span>
      ))}
    </span>
  );
}

function roundRect(ctx, x, y, w, h, r) {
  const radius = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

export default function GoogleReviewQRGenerator() {
  const [reviewLink, setReviewLink] = useState('https://g.page/r/C5qz1XOLJ/review');
  const [businessName, setBusinessName] = useState('Sunrise Cafe');
  const [headline, setHeadline] = useState('Review us on Google');
  const [subText, setSubText] = useState('Scan QR code to leave a review');
  const [logoData, setLogoData] = useState('');
  const [templateId, setTemplateId] = useState('counter');
  const [sizeId, setSizeId] = useState('recommended');
  const [starColor, setStarColor] = useState(STAR_COLORS[0]);
  const [textColor, setTextColor] = useState(TEXT_COLORS[0]);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const canvasRef = useRef(null);
  const logoImgRef = useRef(null);
  const qrImgRef = useRef(null);

  const currentTemplate = useMemo(() => TEMPLATES.find((t) => t.id === templateId), [templateId]);
  const sizes = SIZE_OPTIONS[templateId];

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const QRCode = (await import('qrcode')).default;
        const url = await QRCode.toDataURL(safeLink(reviewLink), {
          width: 1024,
          margin: 1,
          errorCorrectionLevel: 'H',
          color: { dark: '#0E0D14', light: '#FFFFFF' }
        });
        if (active) setQrDataUrl(url);
      } catch (e) {
        // ignore
      }
    })();
    return () => { active = false; };
  }, [reviewLink]);

  useEffect(() => {
    if (!qrDataUrl) return;
    const img = new Image();
    img.onload = () => { qrImgRef.current = img; drawCanvas(); };
    img.src = qrDataUrl;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qrDataUrl, templateId, sizeId, businessName, headline, subText, starColor, textColor, logoData]);

  useEffect(() => {
    if (!logoData) {
      logoImgRef.current = null;
      drawCanvas();
      return;
    }
    const img = new Image();
    img.onload = () => { logoImgRef.current = img; drawCanvas(); };
    img.src = logoData;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logoData]);

  const drawGoogleWord = (ctx, x, y, size) => {
    const letters = ['G', 'o', 'o', 'g', 'l', 'e'];
    const colors = ['#4285F4', '#EA4335', '#FBBC05', '#4285F4', '#34A853', '#EA4335'];
    ctx.font = `900 ${size}px Inter, Arial`;
    ctx.textBaseline = 'alphabetic';
    const widths = letters.map((l) => ctx.measureText(l).width);
    const total = widths.reduce((a, b) => a + b, 0) + (letters.length - 1) * 2;
    let cur = x - total / 2;
    letters.forEach((l, i) => {
      ctx.fillStyle = colors[i];
      ctx.textAlign = 'left';
      ctx.fillText(l, cur, y);
      cur += widths[i] + 2;
    });
    ctx.textAlign = 'center';
  };

  const drawStars = (ctx, x, y, size, color) => {
    ctx.fillStyle = color;
    ctx.font = `900 ${size}px Arial`;
    ctx.textAlign = 'center';
    ctx.fillText('★★★★★', x, y);
  };

  const drawLogoCircle = (ctx, x, y, size, dark = false) => {
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, size / 2, 0, Math.PI * 2);
    ctx.fillStyle = dark ? '#000' : '#FFF';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#F35F1B';
    ctx.stroke();
    const img = logoImgRef.current;
    if (img) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, size / 2 - 6, 0, Math.PI * 2);
      ctx.clip();
      const ratio = Math.min(size / img.width, size / img.height);
      const dw = img.width * ratio;
      const dh = img.height * ratio;
      ctx.drawImage(img, x - dw / 2, y - dh / 2, dw, dh);
      ctx.restore();
    } else {
      ctx.fillStyle = dark ? '#FBD17B' : '#7A4B12';
      ctx.font = `900 ${Math.max(10, size * 0.18)}px Inter, Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('LOGO', x, y);
      ctx.textBaseline = 'alphabetic';
    }
    ctx.restore();
  };

  const drawQrWithLogo = (ctx, cx, cy, size, dark = false) => {
    const qr = qrImgRef.current;
    if (!qr) return;
    ctx.save();
    ctx.fillStyle = '#FFFFFF';
    roundRect(ctx, cx - size / 2 - 10, cy - size / 2 - 10, size + 20, size + 20, 16);
    ctx.fill();
    ctx.drawImage(qr, cx - size / 2, cy - size / 2, size, size);
    drawLogoCircle(ctx, cx, cy, size * 0.22, dark);
    ctx.restore();
  };

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { w, h } = getCanvasSize(templateId);
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, w, h);

    if (templateId === 'counter') {
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, '#FFFDF8');
      grad.addColorStop(1, '#FFF3E0');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = '#F1C089';
      ctx.lineWidth = 6;
      ctx.strokeRect(20, 20, w - 40, h - 40);

      drawLogoCircle(ctx, w / 2, 130, 90);
      ctx.fillStyle = textColor;
      ctx.font = '800 56px Inter, Arial';
      ctx.textAlign = 'center';
      ctx.fillText(businessName, w / 2, 270);
      ctx.font = '600 32px Inter, Arial';
      ctx.fillText(headline, w / 2, 320);
      drawGoogleWord(ctx, w / 2, 400, 56);
      drawStars(ctx, w / 2, 460, 40, starColor);
      drawQrWithLogo(ctx, w / 2, h - 320, 320);

      ctx.fillStyle = '#0F62D9';
      roundRect(ctx, w / 2 - 220, h - 100, 440, 60, 28);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = '700 24px Inter, Arial';
      ctx.fillText(subText, w / 2, h - 62);
    }

    if (templateId === 'beige') {
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, '#FFF8E7');
      grad.addColorStop(1, '#F2D6A1');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      drawLogoCircle(ctx, w / 2, 130, 90);
      ctx.fillStyle = '#7A4B12';
      ctx.font = 'italic 800 56px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillText(businessName, w / 2, 270);
      ctx.fillStyle = textColor;
      ctx.font = '600 30px Inter, Arial';
      ctx.fillText(headline, w / 2, 320);
      drawGoogleWord(ctx, w / 2, 400, 56);
      drawStars(ctx, w / 2, 460, 40, starColor);
      drawQrWithLogo(ctx, w / 2, h - 320, 320);

      ctx.fillStyle = '#0F62D9';
      roundRect(ctx, w / 2 - 220, h - 100, 440, 60, 28);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = '700 24px Inter, Arial';
      ctx.fillText(subText, w / 2, h - 62);
    }

    if (templateId === 'nfc') {
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, '#111111');
      grad.addColorStop(1, '#2A1B0E');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      drawLogoCircle(ctx, 160, h / 2, 100, true);
      ctx.fillStyle = '#FBD17B';
      ctx.font = 'italic 800 56px Georgia, serif';
      ctx.textAlign = 'left';
      ctx.fillText(businessName, 280, h / 2 - 60);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = '700 38px Inter, Arial';
      ctx.fillText('Tap or Scan', 280, h / 2);

      ctx.fillStyle = '#CBD5E1';
      ctx.font = '500 26px Inter, Arial';
      ctx.fillText('to review us on', 280, h / 2 + 50);

      drawGoogleWord(ctx, 280 + 130, h / 2 + 110, 50);
      drawStars(ctx, 280 + 90, h / 2 + 170, 36, starColor);

      drawQrWithLogo(ctx, w - 200, h / 2, 280, true);
    }

    if (templateId === 'round') {
      const cx = w / 2;
      const cy = h / 2;
      const r = w / 2 - 12;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFDF8';
      ctx.fill();
      ctx.strokeStyle = '#F1C089';
      ctx.lineWidth = 10;
      ctx.stroke();

      drawLogoCircle(ctx, cx, cy - 180, 80);
      ctx.fillStyle = '#7A4B12';
      ctx.font = 'italic 800 48px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillText(businessName, cx, cy - 60);

      ctx.fillStyle = textColor;
      ctx.font = '600 26px Inter, Arial';
      ctx.fillText(headline, cx, cy - 20);

      drawGoogleWord(ctx, cx, cy + 30, 42);
      drawStars(ctx, cx, cy + 80, 30, starColor);
      drawQrWithLogo(ctx, cx, cy + 200, 200);
    }
  }, [templateId, businessName, headline, subText, starColor, textColor]);

  const handleLogoUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setLogoData(reader.result);
    reader.readAsDataURL(file);
  };

  const handleDownload = (format) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const base = fileSafeName(businessName);
    if (format === 'png') {
      const a = document.createElement('a');
      a.href = canvas.toDataURL('image/png');
      a.download = `${base}-${templateId}.png`;
      a.click();
    } else if (format === 'svg') {
      const blob = svgFromCanvas(canvas);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${base}-${templateId}.svg`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1500);
    } else if (format === 'pdf') {
      const sel = sizes.find((s) => s.id === sizeId) || sizes[0];
      const [mmStr] = sel.dim.split('/');
      const cleaned = mmStr.replace(/mm/, '').trim();
      const [wStr, hStr] = cleaned.split('x').map((v) => parseFloat(v));
      const blob = buildPdf(canvas, { w: wStr || 100, h: hStr || 150 });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${base}-${templateId}.pdf`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1500);
    }
  };

  const handleShareLink = () => {
    const text = `Please review ${businessName} on Google: ${safeLink(reviewLink)}`;
    if (typeof window !== 'undefined') {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    }
  };

  const handleShareDesign = () => {
    const text = `Check our Google review template from BharathQR: ${CANONICAL}`;
    if (typeof window !== 'undefined') {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    }
  };

  const copyReviewLink = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(safeLink(reviewLink));
    }
  };

  return (
    <>
      <Head>
        <title>Google Review QR Code Generator with Logo & Templates | BharathQR</title>
        <meta name="description" content="Create a premium Google Review QR code with your logo. Choose from beautiful print-ready templates and download in PNG, SVG, or PDF. Free, no sign-up, made for Indian businesses." />
        <link rel="canonical" href={CANONICAL} />
        <meta property="og:title" content="Google Review QR Code Generator | BharathQR" />
        <meta property="og:description" content="Turn every customer visit into a 5★ Google review with print-ready QR templates." />
        <meta property="og:url" content={CANONICAL} />
      </Head>

      <main className={styles.page}>
        <header className={styles.topbar}>
          <Link href="/" className={styles.brand}>
            <span className={styles.brandMark}>QR</span>
            <span className={styles.brandName}>Bharath<span style={{ color: '#F35F1B' }}>QR</span></span>
          </Link>
          <nav className={styles.nav}>
            <Link href="/tools">Tools</Link>
            <Link href="/solutions">Solutions</Link>
            <Link href="/blog">Blog</Link>
            <Link href="/pricing">Pricing</Link>
          </nav>
          <Link href="/dashboard" className={styles.cta}>Dashboard</Link>
        </header>

        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <h1>
              Turn Every Customer Visit<br />
              Into a <span className={styles.starHero}>5★</span> <GoogleWord size={48} /> Review
            </h1>
            <p>
              Create a premium Google Review QR code with your logo.<br />
              Choose from beautiful templates and download print-ready assets in seconds.
            </p>
            <div className={styles.heroPills}>
              <span>🎁 100% Free</span>
              <span>👤 No Sign-up</span>
              <span>🖨️ Print Ready</span>
            </div>
          </div>
          <div className={styles.heroVisual}>
            <div className={styles.heroStandee}>
              <div className={styles.heroLogo}>SUNRISE<br />CAFE</div>
              <div className={styles.heroTitle}>Sunrise Cafe</div>
              <div className={styles.heroSub}>Review us on</div>
              <GoogleWord size={32} />
              <div className={styles.heroStars}>★★★★★</div>
              <div className={styles.heroQr}>
                {qrDataUrl && <img src={qrDataUrl} alt="QR" />}
              </div>
              <div className={styles.heroScan}>Scan QR to leave a review</div>
            </div>
            <div className={styles.heroPlant} />
          </div>
        </section>

        <section className={styles.workflow}>
          <div className={styles.workflowStep}>
            <div className={`${styles.workflowDot} ${styles.dotOne}`}>1</div>
            <div>
              <strong>Enter Review Link</strong>
              <span>Add your Google review link</span>
            </div>
          </div>
          <div className={styles.dotArrow}>·····›</div>
          <div className={styles.workflowStep}>
            <div className={`${styles.workflowDot} ${styles.dotTwo}`}>2</div>
            <div>
              <strong>Customize Template</strong>
              <span>Choose template, edit details and colors</span>
            </div>
          </div>
          <div className={styles.dotArrow}>·····›</div>
          <div className={styles.workflowStep}>
            <div className={`${styles.workflowDot} ${styles.dotThree}`}>3</div>
            <div>
              <strong>Preview & Download</strong>
              <span>Download print-ready files</span>
            </div>
          </div>
          <div className={styles.dotArrow}>·····›</div>
          <div className={styles.workflowStep}>
            <div className={`${styles.workflowDot} ${styles.dotFour}`}>4</div>
            <div>
              <strong>Print & Display</strong>
              <span>Start getting more reviews</span>
            </div>
          </div>
        </section>

        <section className={styles.mainPanel}>
          <div className={styles.col}>
            <div className={styles.colHead}>
              <div className={`${styles.colNum} ${styles.numOne}`}>1</div>
              <h2>QR Generator</h2>
            </div>
            <p className={styles.colSub}>Google review link</p>

            <label className={styles.label}>Google review link</label>
            <input
              className={styles.input}
              type="url"
              value={reviewLink}
              onChange={(e) => setReviewLink(e.target.value)}
            />
            <p className={styles.helper}>
              Paste your full Google review link.<br />
              It redirects directly to your review and sharing.
            </p>

            <label className={styles.label}>Business / Location name</label>
            <input
              className={styles.input}
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
            />

            <label className={styles.label}>
              Upload logo (optional) <span className={styles.helperInline}>PNG, JPG, SVG, WEBP - Max 2MB</span>
            </label>
            <div className={styles.logoRow}>
              <div className={styles.qrPreview}>
                {qrDataUrl && <img src={qrDataUrl} alt="QR Preview" />}
              </div>
              <label className={styles.logoUpload}>
                <input type="file" accept="image/*" onChange={handleLogoUpload} hidden />
                <span>⬆ Choose logo</span>
              </label>
            </div>

            <p className={styles.qrMeta}>
              <span className={styles.green}>✓ High-resolution QR</span><br />
              <span className={styles.helperInline}>Size: 1024 x 1024 px</span>
            </p>

            <div className={styles.btnRow}>
              <button className={styles.btnDark} onClick={() => handleDownload('png')}>⬇ Download QR</button>
              <button className={styles.btnGhost} onClick={copyReviewLink}>🔗 Copy Link</button>
            </div>

            <div className={styles.readyTag}>✓ QR code is ready to use!</div>
          </div>

          <div className={styles.col}>
            <div className={styles.colHead}>
              <div className={`${styles.colNum} ${styles.numTwo}`}>2</div>
              <h2>Template Studio</h2>
            </div>
            <p className={styles.colSub}>Choose a template and customize it your way</p>

            <div className={styles.templateGrid}>
              {TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className={`${styles.templateCard} ${templateId === t.id ? styles.templateActive : ''}`}
                  onClick={() => setTemplateId(t.id)}
                >
                  <div className={styles.radio} />
                  <div className={styles.templateName}>{t.name}</div>
                  <div className={`${styles.templateMockup} ${styles[`mockup_${t.id}`]}`}>
                    <div className={styles.mockLogo}>SUNRISE<br />CAFE</div>
                    <div className={styles.mockTitle}>Sunrise Cafe</div>
                    <div className={styles.mockSub}>Review us on</div>
                    <GoogleWord size={16} />
                    <div className={styles.mockStars}>★★★★★</div>
                    <div className={styles.mockQr} />
                    <div className={styles.mockScan}>Scan QR to leave a review</div>
                  </div>
                  <div className={styles.templateSize}>{t.sizeLabel}</div>
                </button>
              ))}
            </div>

            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label className={styles.label}>Business Name</label>
                <input className={styles.input} value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Headline</label>
                <input className={styles.input} value={headline} onChange={(e) => setHeadline(e.target.value)} />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Sub Text</label>
                <input className={styles.input} value={subText} onChange={(e) => setSubText(e.target.value)} />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Star Color</label>
                <select className={styles.input} value={starColor} onChange={(e) => setStarColor(e.target.value)}>
                  {STAR_COLORS.map((c) => (<option key={c} value={c}>{c}</option>))}
                </select>
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Text Color</label>
                <select className={styles.input} value={textColor} onChange={(e) => setTextColor(e.target.value)}>
                  {TEXT_COLORS.map((c) => (<option key={c} value={c}>{c}</option>))}
                </select>
              </div>
            </div>

            <p className={styles.colSub} style={{ marginTop: 18 }}>Print Size (Tested Sizes)</p>
            <div className={styles.sizeGrid}>
              {sizes.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className={`${styles.sizeCard} ${sizeId === s.id ? styles.sizeActive : ''}`}
                  onClick={() => setSizeId(s.id)}
                >
                  <div className={styles.sizeLabel}>{s.label}</div>
                  <div className={styles.sizeDim}>{s.dim}</div>
                  <div className={styles.sizeNote}>{s.note}</div>
                </button>
              ))}
            </div>
          </div>

          <div className={styles.col}>
            <div className={styles.colHead}>
              <div className={`${styles.colNum} ${styles.numThree}`}>3</div>
              <h2>Live Product Preview</h2>
              <span className={styles.liveBadge}>LIVE</span>
            </div>
            <p className={styles.colSub}>See how your design looks</p>

            <div className={styles.previewStage}>
              <canvas ref={canvasRef} className={styles.canvas} />
            </div>

            <div className={styles.previewMeta}>
              <strong>{currentTemplate?.name}</strong>
              <span>{(sizes.find((s) => s.id === sizeId) || sizes[0]).dim}</span>
              <em>Recommended Print Size</em>
            </div>

            <button className={styles.btnPrimary} onClick={() => handleDownload('png')}>⬇ Download Design</button>
            <div className={styles.formatRow}>
              <button onClick={() => handleDownload('png')}>📷 PNG</button>
              <button onClick={() => handleDownload('svg')}>🖼 SVG</button>
              <button onClick={() => handleDownload('pdf')}>📄 PDF</button>
            </div>
            <button className={styles.btnWhats} onClick={handleShareLink}>💬 Share Link via WhatsApp</button>
            <button className={styles.btnWhats} onClick={handleShareDesign}>💬 Share Design via WhatsApp</button>
            <p className={styles.previewFooter}>High quality • Print ready</p>
          </div>
        </section>

        <section className={styles.finished}>
          <div className={styles.finishedHead}>
            <div>
              <h2>Finished Products You Can Print</h2>
              <p>Premium prints for every need</p>
            </div>
            <Link href="/templates" className={styles.viewAll}>View All Templates →</Link>
          </div>
          <div className={styles.finishedGrid}>
            {FINISHED_PRODUCTS.map((p) => (
              <div key={p.id} className={styles.finishedCard}>
                <div className={`${styles.finishedMockup} ${styles[`finished_${p.id}`]}`}>
                  <div className={styles.finishLogo}>SUNRISE<br />CAFE</div>
                  <div className={styles.finishTitle}>Sunrise Cafe</div>
                  <div className={styles.finishSub}>Review us on</div>
                  <GoogleWord size={20} />
                  <div className={styles.finishStars}>★★★★★</div>
                  <div className={styles.finishQr} />
                </div>
                <strong>{p.name}</strong>
                <span>{p.sub}</span>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.trust}>
          {TRUST_BAR.map((t) => (
            <div key={t.label} className={styles.trustItem}>
              <span>{t.icon}</span>
              <strong>{t.label}</strong>
            </div>
          ))}
        </section>

        <section className={styles.relatedLinks}>
          <h3>More tools and guides</h3>
          <div className={styles.linkGrid}>
            {INTERNAL_LINKS.map((l) => (
              <Link key={l.href} href={l.href}>{l.label}</Link>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
