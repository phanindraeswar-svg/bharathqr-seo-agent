// force fresh google review v15 deployment
import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import QRCode from 'qrcode';
import styles from '../../styles/GoogleReviewQRGenerator.module.css';

const CANONICAL_URL = 'https://www.bharathqr.com/tools/google-review-qr-generator';
const DEFAULT_REVIEW_LINK = 'https://g.page/r/your-business/review';
const INCH_PER_MM = 1 / 25.4;

const TEMPLATES = [
  {
    id: 'table',
    name: 'Table Tent / Standee',
    shortName: 'Table Tent',
    label: 'Standee',
    sizeLabel: '100 × 150 mm',
    inchLabel: '3.94 × 5.91 in',
    widthMm: 100,
    heightMm: 150,
    type: 'portrait',
    colorMode: 'white',
    useCase: 'Perfect for tables and counters',
    icon: 'tent'
  },
  {
    id: 'acrylic',
    name: 'Acrylic Standee',
    shortName: 'Acrylic Standee',
    label: 'Standee',
    sizeLabel: '100 × 150 mm',
    inchLabel: '3.94 × 5.91 in',
    widthMm: 100,
    heightMm: 150,
    type: 'portrait',
    colorMode: 'white',
    useCase: 'Elegant look for any place',
    icon: 'acrylic'
  },
  {
    id: 'beige',
    name: 'Beige / White-Gold',
    shortName: 'Beige / White-Gold',
    label: 'Premium',
    sizeLabel: '100 × 150 mm',
    inchLabel: '3.94 × 5.91 in',
    widthMm: 100,
    heightMm: 150,
    type: 'portrait',
    colorMode: 'beige',
    useCase: 'Premium & elegant style',
    icon: 'card'
  },
  {
    id: 'credit',
    name: 'Credit Card / NFC Review Card',
    shortName: 'Credit Card / NFC',
    label: 'Review Card',
    sizeLabel: '85.6 × 54 mm',
    inchLabel: '3.37 × 2.12 in',
    widthMm: 85.6,
    heightMm: 54,
    type: 'landscape',
    colorMode: 'white',
    useCase: 'Carry anywhere, tap or scan',
    icon: 'nfc'
  },
  {
    id: 'round',
    name: 'Round Sticker',
    shortName: 'Round Sticker',
    label: 'Circle',
    sizeLabel: '100 × 100 mm circle',
    inchLabel: '3.94 × 3.94 in',
    widthMm: 100,
    heightMm: 100,
    type: 'round',
    colorMode: 'white',
    useCase: 'Perfect for glass, walls & more',
    icon: 'round'
  }
];

const TEMPLATE_BY_ID = TEMPLATES.reduce((acc, item) => ({ ...acc, [item.id]: item }), {});

const RELATED_LINKS = [
  { href: '/tools/whatsapp-qr-generator', title: 'WhatsApp QR Generator' },
  { href: '/tools/url-qr-generator', title: 'URL QR Generator' },
  { href: '/solutions/restaurants', title: 'Restaurant QR Solutions' },
  { href: '/solutions/clinics', title: 'Clinic QR Solutions' },
  { href: '/templates/google-review-poster', title: 'Google Review Poster Template' }
];

function safeUrl(value) {
  const trimmed = String(value || '').trim();
  if (!trimmed) return DEFAULT_REVIEW_LINK;
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function clampText(value, max) {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, max);
}

function mmToInches(mm) {
  return (Number(mm || 0) * INCH_PER_MM).toFixed(2);
}

function formatSize(widthMm, heightMm, type) {
  const w = Number(widthMm || 0);
  const h = Number(heightMm || 0);
  if (type === 'round') return `${Math.round(w)} × ${Math.round(w)} mm circle / ${mmToInches(w)} × ${mmToInches(w)} in`;
  return `${w % 1 ? w.toFixed(1) : Math.round(w)} × ${h % 1 ? h.toFixed(1) : Math.round(h)} mm / ${mmToInches(w)} × ${mmToInches(h)} in`;
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

function downloadDataUrl(dataUrl, filename) {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

function dataUrlToBytes(dataUrl) {
  const base64 = dataUrl.split(',')[1] || '';
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function createPdfBlobFromCanvas(canvas, size) {
  const jpegUrl = canvas.toDataURL('image/jpeg', 0.96);
  const imageBytes = dataUrlToBytes(jpegUrl);
  const pageWidth = (size.widthMm * 72) / 25.4;
  const pageHeight = (size.heightMm * 72) / 25.4;
  const encoder = new TextEncoder();
  const chunks = [];
  const offsets = [0];
  let offset = 0;
  const addText = (text) => { const bytes = encoder.encode(text); chunks.push(bytes); offset += bytes.length; };
  const addBytes = (bytes) => { chunks.push(bytes); offset += bytes.length; };
  const startObj = (id) => { offsets[id] = offset; addText(`${id} 0 obj\n`); };
  addText('%PDF-1.4\n');
  startObj(1); addText('<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');
  startObj(2); addText('<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n');
  startObj(3); addText(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth.toFixed(2)} ${pageHeight.toFixed(2)}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>\nendobj\n`);
  startObj(4); addText(`<< /Type /XObject /Subtype /Image /Width ${canvas.width} /Height ${canvas.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${imageBytes.length} >>\nstream\n`);
  addBytes(imageBytes); addText('\nendstream\nendobj\n');
  const content = `q\n${pageWidth.toFixed(2)} 0 0 ${pageHeight.toFixed(2)} 0 0 cm\n/Im0 Do\nQ\n`;
  startObj(5); addText(`<< /Length ${encoder.encode(content).length} >>\nstream\n${content}endstream\nendobj\n`);
  const xrefOffset = offset;
  addText('xref\n0 6\n0000000000 65535 f \n');
  for (let i = 1; i <= 5; i += 1) addText(`${String(offsets[i]).padStart(10, '0')} 00000 n \n`);
  addText(`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`);
  return new Blob(chunks, { type: 'application/pdf' });
}

function loadImage(src) {
  return new Promise((resolve) => {
    if (!src) return resolve(null);
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function roundRect(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function drawContainedImage(ctx, img, x, y, w, h) {
  if (!img || !img.width || !img.height) return;
  const ratio = Math.min(w / img.width, h / img.height);
  const dw = img.width * ratio;
  const dh = img.height * ratio;
  ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
}

function drawDefaultLogo(ctx, x, y, size, color = '#f59e0b') {
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = Math.max(3, size * 0.055);
  ctx.beginPath();
  ctx.arc(0, size * 0.04, size * 0.22, Math.PI, 0);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-size * 0.34, size * 0.22);
  ctx.lineTo(size * 0.34, size * 0.22);
  ctx.lineTo(size * 0.24, size * 0.4);
  ctx.lineTo(-size * 0.24, size * 0.4);
  ctx.closePath();
  ctx.stroke();
  ctx.beginPath();
  for (let i = -3; i <= 3; i += 1) {
    const angle = (-90 + i * 16) * (Math.PI / 180);
    ctx.moveTo(Math.cos(angle) * size * 0.34, Math.sin(angle) * size * 0.34);
    ctx.lineTo(Math.cos(angle) * size * 0.48, Math.sin(angle) * size * 0.48);
  }
  ctx.stroke();
  ctx.restore();
}

function drawLogoBadge(ctx, x, y, size, logoImg, options = {}) {
  const border = options.border || '#f59e0b';
  const innerPad = size * 0.24;
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, size / 2, 0, Math.PI * 2);
  ctx.fillStyle = '#fff';
  ctx.shadowColor = 'rgba(15, 23, 42, 0.18)';
  ctx.shadowBlur = size * 0.14;
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.lineWidth = Math.max(2, size * 0.045);
  ctx.strokeStyle = border;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x, y, size / 2 - innerPad * 0.42, 0, Math.PI * 2);
  ctx.clip();
  if (logoImg) drawContainedImage(ctx, logoImg, x - size / 2 + innerPad, y - size / 2 + innerPad, size - innerPad * 2, size - innerPad * 2);
  else drawDefaultLogo(ctx, x, y - size * 0.06, size * 0.9, border);
  ctx.restore();
}

function drawGoogleWord(ctx, x, y, size, align = 'center') {
  const letters = [
    ['G', '#4285F4'], ['o', '#EA4335'], ['o', '#FBBC05'], ['g', '#4285F4'], ['l', '#34A853'], ['e', '#EA4335']
  ];
  ctx.save();
  ctx.font = `700 ${Math.round(size)}px Arial, Helvetica, sans-serif`;
  ctx.textBaseline = 'middle';
  const widths = letters.map(([letter]) => ctx.measureText(letter).width);
  const spacing = size * 0.02;
  const total = widths.reduce((a, b) => a + b, 0) + spacing * (letters.length - 1);
  let current = align === 'center' ? x - total / 2 : x;
  letters.forEach(([letter, color], index) => {
    ctx.fillStyle = color;
    ctx.fillText(letter, current, y);
    current += widths[index] + spacing;
  });
  ctx.restore();
}

function drawStars(ctx, x, y, size, color = '#f5a400') {
  ctx.save();
  ctx.fillStyle = color;
  ctx.font = `700 ${Math.round(size)}px Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('★★★★★', x, y);
  ctx.restore();
}

function fittedFontSize(ctx, text, maxWidth, startSize, minSize, fontFamily, weight = 700) {
  const value = String(text || '');
  let size = startSize;
  while (size > minSize) {
    ctx.font = `${weight} ${Math.round(size)}px ${fontFamily}`;
    if (ctx.measureText(value).width <= maxWidth) return size;
    size -= 2;
  }
  return minSize;
}

function drawFittedText(ctx, text, x, y, maxWidth, startSize, minSize, options = {}) {
  const fontFamily = options.fontFamily || 'Inter, Arial, sans-serif';
  const weight = options.weight || 700;
  const value = clampText(text, options.maxChars || 80);
  const size = fittedFontSize(ctx, value, maxWidth, startSize, minSize, fontFamily, weight);
  ctx.save();
  ctx.font = `${weight} ${Math.round(size)}px ${fontFamily}`;
  ctx.fillStyle = options.color || '#111827';
  ctx.textAlign = options.align || 'center';
  ctx.textBaseline = options.baseline || 'middle';
  if (options.letterSpacing) {
    const chars = value.split('');
    const total = chars.reduce((sum, char) => sum + ctx.measureText(char).width, 0) + options.letterSpacing * (chars.length - 1);
    let cx = x - total / 2;
    chars.forEach((char) => {
      ctx.fillText(char, cx, y);
      cx += ctx.measureText(char).width + options.letterSpacing;
    });
  } else {
    ctx.fillText(value, x, y);
  }
  ctx.restore();
  return size;
}

function drawWrappedText(ctx, text, x, y, maxWidth, lineHeight, maxLines, options = {}) {
  const value = clampText(text, options.maxChars || 120);
  const words = value.split(' ').filter(Boolean);
  const lines = [];
  let current = '';
  words.forEach((word) => {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width <= maxWidth || !current) current = test;
    else { lines.push(current); current = word; }
  });
  if (current) lines.push(current);
  const visible = lines.slice(0, maxLines);
  if (lines.length > maxLines && visible.length) visible[visible.length - 1] = `${visible[visible.length - 1].replace(/\.*$/, '')}…`;
  ctx.save();
  ctx.fillStyle = options.color || '#111827';
  ctx.textAlign = options.align || 'center';
  ctx.textBaseline = 'middle';
  visible.forEach((line, index) => ctx.fillText(line, x, y + index * lineHeight));
  ctx.restore();
}

function drawPrintDesign(ctx, canvas, template, opts) {
  const { qrImg, logoImg, businessName, headline, subText, starColor, textColor } = opts;
  const w = canvas.width;
  const h = canvas.height;
  const min = Math.min(w, h);
  const isRound = template.type === 'round';
  const isCredit = template.type === 'landscape';
  const isBeige = template.colorMode === 'beige';
  const accent = isBeige ? '#c58a25' : '#f97316';
  const navy = '#0f172a';
  ctx.clearRect(0, 0, w, h);
  ctx.save();
  ctx.fillStyle = isBeige ? '#fff8ee' : '#ffffff';
  ctx.fillRect(0, 0, w, h);

  if (isRound) {
    ctx.fillStyle = '#fffaf2';
    ctx.fillRect(0, 0, w, h);
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, min * 0.47, 0, Math.PI * 2);
    ctx.fillStyle = '#fffdf9';
    ctx.fill();
    ctx.lineWidth = min * 0.018;
    ctx.strokeStyle = '#e5ba68';
    ctx.stroke();
    ctx.clip();
  }

  if (isBeige) {
    const pad = min * 0.05;
    ctx.strokeStyle = '#d9aa4b';
    ctx.lineWidth = min * 0.012;
    roundRect(ctx, pad, pad, w - pad * 2, h - pad * 2, min * 0.025);
    ctx.stroke();
    ctx.globalAlpha = 0.25;
    ctx.fillStyle = '#fff1d6';
    ctx.beginPath();
    ctx.arc(w * 0.86, h * 0.14, min * 0.22, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  if (isCredit) {
    const margin = w * 0.08;
    const logoSize = h * 0.18;
    drawLogoBadge(ctx, margin + logoSize * 0.55, h * 0.24, logoSize, logoImg, { border: accent });
    drawFittedText(ctx, businessName, w * 0.5, h * 0.2, w * 0.54, h * 0.12, h * 0.06, {
      color: '#7c2d12', fontFamily: 'Georgia, serif', weight: 700, maxChars: 34
    });
    ctx.save();
    ctx.textAlign = 'center';
    ctx.font = `700 ${Math.round(h * 0.06)}px Inter, Arial, sans-serif`;
    ctx.fillStyle = textColor || navy;
    ctx.fillText('Tap or Scan', w * 0.5, h * 0.34);
    ctx.font = `500 ${Math.round(h * 0.045)}px Inter, Arial, sans-serif`;
    ctx.fillStyle = '#475569';
    ctx.fillText('to review us on', w * 0.5, h * 0.41);
    ctx.restore();
    drawGoogleWord(ctx, w * 0.5, h * 0.49, h * 0.13);
    const qrSize = h * 0.38;
    ctx.drawImage(qrImg, w * 0.54, h * 0.54, qrSize, qrSize);
    drawLogoBadge(ctx, w * 0.54 + qrSize / 2, h * 0.54 + qrSize / 2, qrSize * 0.26, logoImg, { border: accent });
    drawStars(ctx, w * 0.28, h * 0.78, h * 0.06, starColor);
    drawWrappedText(ctx, subText, w * 0.28, h * 0.64, w * 0.3, h * 0.06, 2, { color: '#334155', maxChars: 48 });
    ctx.restore();
    return;
  }

  const topY = isRound ? h * 0.15 : h * 0.075;
  const logoSize = isRound ? min * 0.16 : min * 0.18;
  drawLogoBadge(ctx, w / 2, topY + logoSize / 2, logoSize, logoImg, { border: accent });

  const bizY = isRound ? h * 0.29 : h * 0.22;
  drawFittedText(ctx, businessName, w / 2, bizY, w * 0.72, isRound ? min * 0.075 : min * 0.09, min * 0.04, {
    color: '#7c2d12', fontFamily: 'Georgia, serif', weight: 700, maxChars: 34
  });
  ctx.save();
  ctx.strokeStyle = isBeige ? '#d9aa4b' : '#eab308';
  ctx.lineWidth = Math.max(2, min * 0.006);
  ctx.beginPath();
  ctx.moveTo(w * 0.28, bizY + min * 0.055);
  ctx.lineTo(w * 0.72, bizY + min * 0.055);
  ctx.stroke();
  ctx.restore();

  const headlineY = isRound ? h * 0.39 : h * 0.34;
  drawFittedText(ctx, headline, w / 2, headlineY, w * 0.76, min * 0.07, min * 0.035, {
    color: textColor || navy, fontFamily: 'Inter, Arial, sans-serif', weight: 700, maxChars: 42
  });
  drawGoogleWord(ctx, w / 2, headlineY + min * 0.095, min * (isRound ? 0.12 : 0.15));
  drawStars(ctx, w / 2, headlineY + min * (isRound ? 0.19 : 0.225), min * (isRound ? 0.055 : 0.065), starColor);

  const qrSize = isRound ? min * 0.27 : min * 0.46;
  const qrX = (w - qrSize) / 2;
  const qrY = isRound ? h * 0.6 : h * 0.6;
  ctx.fillStyle = '#fff';
  roundRect(ctx, qrX - min * 0.018, qrY - min * 0.018, qrSize + min * 0.036, qrSize + min * 0.036, min * 0.024);
  ctx.fill();
  ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
  drawLogoBadge(ctx, w / 2, qrY + qrSize / 2, qrSize * 0.22, logoImg, { border: accent });

  const ctaY = isRound ? h * 0.91 : Math.min(h - min * 0.08, qrY + qrSize + min * 0.09);
  const ctaW = isRound ? w * 0.52 : w * 0.72;
  const ctaH = isRound ? min * 0.06 : min * 0.075;
  ctx.fillStyle = isBeige ? '#c58a25' : '#1266e3';
  roundRect(ctx, (w - ctaW) / 2, ctaY - ctaH / 2, ctaW, ctaH, ctaH * 0.28);
  ctx.fill();
  drawFittedText(ctx, subText, w / 2, ctaY, ctaW * 0.82, min * 0.036, min * 0.022, {
    color: '#fff', fontFamily: 'Inter, Arial, sans-serif', weight: 700, maxChars: 45
  });
  ctx.restore();
}

function GoogleReviewQRGeneratorPage() {
  const canvasRef = useRef(null);
  const qrPreviewRef = useRef(null);
  const [reviewLink, setReviewLink] = useState(DEFAULT_REVIEW_LINK);
  const [businessName, setBusinessName] = useState('Sunri Cafe Mountain View');
  const [headline, setHeadline] = useState('Review Us on Google');
  const [subText, setSubText] = useState('Scan QR code to leave a review');
  const [selectedTemplate, setSelectedTemplate] = useState('table');
  const [logoDataUrl, setLogoDataUrl] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [toast, setToast] = useState('');
  const [starColor, setStarColor] = useState('#f5a400');
  const [textColor, setTextColor] = useState('#111827');
  const [useCustom, setUseCustom] = useState(false);
  const [customWidth, setCustomWidth] = useState(100);
  const [customHeight, setCustomHeight] = useState(150);
  const [customDiameter, setCustomDiameter] = useState(100);

  const template = TEMPLATE_BY_ID[selectedTemplate] || TEMPLATES[0];
  const printSize = useMemo(() => {
    if (!useCustom) return template;
    if (template.type === 'round') return { ...template, widthMm: Number(customDiameter) || template.widthMm, heightMm: Number(customDiameter) || template.heightMm };
    return { ...template, widthMm: Number(customWidth) || template.widthMm, heightMm: Number(customHeight) || template.heightMm };
  }, [customDiameter, customHeight, customWidth, template, useCustom]);

  const cleanReviewUrl = useMemo(() => safeUrl(reviewLink), [reviewLink]);

  useEffect(() => {
    let alive = true;
    QRCode.toDataURL(cleanReviewUrl, { width: 1024, margin: 2, errorCorrectionLevel: 'H', color: { dark: '#000000', light: '#ffffff' } })
      .then((url) => { if (alive) setQrDataUrl(url); })
      .catch(() => { if (alive) setQrDataUrl(''); });
    return () => { alive = false; };
  }, [cleanReviewUrl]);

  useEffect(() => {
    if (!selectedTemplate) return;
    const next = TEMPLATE_BY_ID[selectedTemplate];
    setUseCustom(false);
    setCustomWidth(next.widthMm);
    setCustomHeight(next.heightMm);
    setCustomDiameter(next.widthMm);
  }, [selectedTemplate]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(''), 2600);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    async function drawAll() {
      if (!qrDataUrl) return;
      const canvas = canvasRef.current;
      const qrPreview = qrPreviewRef.current;
      if (!canvas) return;
      const [qrImg, logoImg] = await Promise.all([loadImage(qrDataUrl), loadImage(logoDataUrl)]);
      if (!qrImg) return;
      const wMm = Number(printSize.widthMm) || 100;
      const hMm = Number(printSize.heightMm) || 150;
      const longSide = 2200;
      const aspect = wMm / hMm;
      if (aspect >= 1) {
        canvas.width = longSide;
        canvas.height = Math.max(1200, Math.round(longSide / aspect));
      } else {
        canvas.height = longSide;
        canvas.width = Math.max(1200, Math.round(longSide * aspect));
      }
      drawPrintDesign(canvas.getContext('2d'), canvas, template, { qrImg, logoImg, businessName, headline, subText, starColor, textColor });

      if (qrPreview) {
        qrPreview.width = 1024;
        qrPreview.height = 1024;
        const qctx = qrPreview.getContext('2d');
        qctx.clearRect(0, 0, 1024, 1024);
        qctx.fillStyle = '#fff';
        qctx.fillRect(0, 0, 1024, 1024);
        qctx.drawImage(qrImg, 82, 82, 860, 860);
        drawLogoBadge(qctx, 512, 512, 190, logoImg, { border: '#f59e0b' });
      }
    }
    drawAll();
  }, [businessName, headline, logoDataUrl, printSize, qrDataUrl, starColor, subText, template, textColor]);

  function showToast(message) {
    setToast(message);
  }

  function handleLogoUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!/^image\//.test(file.type) || file.type === 'image/svg+xml') {
      showToast('Please upload a PNG, JPG or WebP logo.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setLogoDataUrl(String(reader.result || ''));
    reader.readAsDataURL(file);
  }

  function downloadQrPng() {
    const canvas = qrPreviewRef.current;
    if (!canvas) return;
    downloadDataUrl(canvas.toDataURL('image/png'), 'bharathqr-google-review-qr.png');
  }

  function downloadQrSvg() {
    const canvas = qrPreviewRef.current;
    if (!canvas) return;
    const png = canvas.toDataURL('image/png');
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024"><image width="1024" height="1024" href="${png}"/></svg>`;
    downloadBlob(new Blob([svg], { type: 'image/svg+xml' }), 'bharathqr-google-review-qr.svg');
  }

  function downloadQrPdf() {
    const canvas = qrPreviewRef.current;
    if (!canvas) return;
    downloadBlob(createPdfBlobFromCanvas(canvas, { widthMm: 100, heightMm: 100 }), 'bharathqr-google-review-qr.pdf');
  }

  function downloadFinalPng() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    downloadDataUrl(canvas.toDataURL('image/png'), `bharathqr-${template.id}-review-template.png`);
  }

  function downloadFinalSvg() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const png = canvas.toDataURL('image/png');
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width}" height="${canvas.height}" viewBox="0 0 ${canvas.width} ${canvas.height}"><image width="${canvas.width}" height="${canvas.height}" href="${png}"/></svg>`;
    downloadBlob(new Blob([svg], { type: 'image/svg+xml' }), `bharathqr-${template.id}-review-template.svg`);
  }

  function downloadFinalPdf() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    downloadBlob(createPdfBlobFromCanvas(canvas, printSize), `bharathqr-${template.id}-review-template.pdf`);
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(cleanReviewUrl);
      showToast('Review link copied.');
    } catch (error) {
      showToast('Could not copy link.');
    }
  }

  function shareLinkViaWhatsApp() {
    const message = `Please leave us a Google review: ${cleanReviewUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
  }

  async function shareDesignViaWhatsApp() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png', 0.96));
    if (!blob) return;
    const file = new File([blob], `bharathqr-${template.id}-review-template.png`, { type: 'image/png' });
    if (navigator.canShare && navigator.canShare({ files: [file] }) && navigator.share) {
      await navigator.share({ title: 'Google Review QR Design', text: 'Share this Google Review QR design.', files: [file] });
      return;
    }
    downloadBlob(blob, `bharathqr-${template.id}-review-template.png`);
    const message = `I downloaded my Google Review QR design. Please attach/share the downloaded PNG. Review link: ${cleanReviewUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
  }

  const softwareSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'BharathQR Google Review QR Code Generator',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    url: CANONICAL_URL,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
    description: 'Create print-ready Google Review QR codes with business logo, premium templates and WhatsApp sharing.'
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.bharathqr.com/' },
      { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://www.bharathqr.com/tools' },
      { '@type': 'ListItem', position: 3, name: 'Google Review QR Generator', item: CANONICAL_URL }
    ]
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      { '@type': 'Question', name: 'Is BharathQR Google Review QR Generator free?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. You can create a Google Review QR code and print-ready review templates without login.' } },
      { '@type': 'Question', name: 'Can I add my logo?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Your logo appears in the QR center and template with safe padding so it is not cropped.' } },
      { '@type': 'Question', name: 'Which print formats are available?', acceptedAnswer: { '@type': 'Answer', text: 'Table Tent, Acrylic Standee, Beige White-Gold, Credit Card/NFC Review Card and Round Sticker are available with recommended sizes and custom sizing.' } }
    ]
  };

  return (
    <>
      <Head>
        <title>Google Review QR Code Generator With Logo | BharathQR</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Create premium Google Review QR codes with logo, print-ready templates, WhatsApp sharing and PNG, SVG, PDF downloads." />
        <link rel="canonical" href={CANONICAL_URL} />
        <meta property="og:title" content="Google Review QR Code Generator With Logo | BharathQR" />
        <meta property="og:description" content="Turn every customer visit into a 5-star Google Review with premium printable QR templates." />
        <meta property="og:url" content={CANONICAL_URL} />
        <meta property="og:type" content="website" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      </Head>

      <main className={styles.pageShell}>
        <header className={styles.topbar}>
          <Link href="/" className={styles.brand} aria-label="BharathQR Home">
            <span className={styles.brandMark}>⌗</span><span>Bharath<span>QR</span></span>
          </Link>
          <nav className={styles.navLinks} aria-label="Primary navigation">
            <Link href="/">Home</Link>
            <Link href="/tools">Tools</Link>
            <Link href="/templates">Templates</Link>
            <Link href="/blog">Blog</Link>
          </nav>
          <Link className={styles.templateButton} href="/templates">▦ View Templates</Link>
          <button className={styles.menuButton} type="button" aria-label="Open menu">☰</button>
        </header>

        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <h1>Turn Every Customer Visit Into a <span>5★ Google</span> Review</h1>
            <p>Create a premium Google Review QR code with your logo. Choose from beautiful templates and download print-ready assets in seconds.</p>
            <div className={styles.trustPills}>
              <span>🎁 100% Free</span><span>👤 No Sign-up</span><span>🖨️ Print Ready</span>
            </div>
          </div>
          <div className={styles.heroVisual}>
            <div className={styles.heroCardMock}>
              <div className={styles.heroLogo}>SUNRI<br />CAFE</div>
              <strong>Sunri Cafe<br />Mountain View</strong>
              <small>Review us on</small>
              <b className={styles.googleMini}>Google</b>
              <span className={styles.starMini}>★★★★★</span>
              {qrDataUrl ? <img src={qrDataUrl} alt="Google Review QR preview" /> : <span className={styles.qrSkeleton} />}
              <em>Scan QR to leave a review</em>
            </div>
            <div className={styles.heroPlant} aria-hidden="true"><span /></div>
          </div>
        </section>

        <section className={styles.workflow} aria-label="How it works">
          {[['1', 'Enter Review Link', 'Add your Google review link'], ['2', 'Customize Template', 'Choose template, edit details and colors'], ['3', 'Preview & Download', 'Download print-ready files'], ['4', 'Print & Display', 'Print and start getting more reviews']].map((step, index) => (
            <div className={styles.workflowStep} key={step[0]}>
              <span>{step[0]}</span><b>{step[1]}</b><small>{step[2]}</small>{index < 3 && <i>······›</i>}
            </div>
          ))}
        </section>

        <section className={styles.builderGrid}>
          <aside className={`${styles.panel} ${styles.qrPanel}`}>
            <div className={styles.panelTitle}><span>1</span><div><h2>QR Generator</h2><p>Enter your Google review link</p></div></div>
            <label className={styles.inputLabel}>Google review link
              <input value={reviewLink} onChange={(e) => setReviewLink(e.target.value)} placeholder="https://g.page/r/your-business/review" />
            </label>
            <p className={styles.helperText}>Paste your real Google review link. It redirects directly to printing and sharing.</p>
            <label className={styles.inputLabel}>Business / Location name
              <input value={businessName} onChange={(e) => setBusinessName(e.target.value)} maxLength={50} />
            </label>
            <label className={styles.uploadTile}>
              <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleLogoUpload} />
              <span className={styles.uploadIcon}>☕</span>
              <strong>{logoDataUrl ? 'Logo uploaded' : 'Upload logo'}</strong>
              <small>PNG / JPG / WEBP</small>
            </label>
            <div className={styles.qrPreviewBox}>
              <canvas ref={qrPreviewRef} aria-label="QR preview" />
              <small>✅ High-resolution QR<br />Size: 1024 × 1024 px</small>
            </div>
            <div className={styles.qrActions}>
              <button type="button" onClick={downloadQrPng}>⬇ Download QR</button>
              <button type="button" onClick={copyLink}>🔗 Copy Link</button>
            </div>
            <div className={styles.readyNote}>✓ QR code is ready to use!</div>
          </aside>

          <section className={`${styles.panel} ${styles.studioPanel}`}>
            <div className={styles.panelTitle}><span>2</span><div><h2>Template Studio</h2><p>Choose a template and customize it your way</p></div><button type="button" className={styles.resetButton} onClick={() => { setSelectedTemplate('table'); setBusinessName('Sunri Cafe Mountain View'); setHeadline('Review Us on Google'); setSubText('Scan QR code to leave a review'); setUseCustom(false); }}>↻ Reset All</button></div>

            <div className={styles.templateGrid}>
              {TEMPLATES.map((item) => (
                <button type="button" key={item.id} className={`${styles.templateCard} ${selectedTemplate === item.id ? styles.activeTemplate : ''} ${item.colorMode === 'beige' ? styles.beigeTemplateCard : ''}`} onClick={() => setSelectedTemplate(item.id)}>
                  <span className={styles.selectDot}>{selectedTemplate === item.id ? '●' : '○'}</span>
                  <strong>{item.name}</strong>
                  <div className={`${styles.templateMini} ${styles[`mini_${item.id}`]}`}>
                    <span className={styles.miniLogo}>SUNRI</span>
                    <i>{item.id === 'beige' ? 'Thank You!' : item.id === 'credit' ? 'Tap or Scan' : 'Review Us'}</i>
                    <b>Google</b>
                    <em>★★★★★</em>
                    <span className={styles.miniQr}>▦</span>
                    <small>Scan QR code</small>
                  </div>
                  <span className={styles.templateSize}>{item.sizeLabel}<br />{item.inchLabel}</span>
                </button>
              ))}
            </div>

            <div className={styles.controlsGrid}>
              <label>Business Name<input value={businessName} onChange={(e) => setBusinessName(e.target.value)} maxLength={50} /></label>
              <label>Headline<input value={headline} onChange={(e) => setHeadline(e.target.value)} maxLength={48} /></label>
              <label>Sub Text<input value={subText} onChange={(e) => setSubText(e.target.value)} maxLength={60} /></label>
              <label>Star Color<select value={starColor} onChange={(e) => setStarColor(e.target.value)}><option value="#f5a400">Gold</option><option value="#f97316">Orange</option><option value="#c58a25">White-Gold</option></select></label>
              <label>Text Color<select value={textColor} onChange={(e) => setTextColor(e.target.value)}><option value="#111827">Black</option><option value="#7c2d12">Brown</option><option value="#1e3a8a">Blue</option></select></label>
            </div>

            <div className={styles.printTabs}>
              <button type="button" className={!useCustom ? styles.tabActive : ''} onClick={() => setUseCustom(false)}>Print Size</button>
              <button type="button" className={useCustom ? styles.tabActive : ''} onClick={() => setUseCustom(true)}>Custom Size</button>
            </div>

            <div className={styles.sizePanel}>
              <div className={styles.recommendedSize}>
                <strong>Recommended Size</strong>
                <b>{formatSize(template.widthMm, template.heightMm, template.type)}</b>
                <span>{template.useCase}</span>
              </div>
              <div className={styles.customSizeBox}>
                <strong>Custom Size</strong>
                {template.type === 'round' ? (
                  <label>Diameter (mm)<input type="number" min="60" max="300" value={customDiameter} onChange={(e) => { setCustomDiameter(e.target.value); setUseCustom(true); }} /></label>
                ) : (
                  <div className={styles.customInputs}>
                    <label>Width<input type="number" min="60" max="300" value={customWidth} onChange={(e) => { setCustomWidth(e.target.value); setUseCustom(true); }} /></label>
                    <label>Height<input type="number" min="60" max="400" value={customHeight} onChange={(e) => { setCustomHeight(e.target.value); setUseCustom(true); }} /></label>
                  </div>
                )}
              </div>
            </div>
          </section>

          <aside className={`${styles.panel} ${styles.previewPanel}`}>
            <div className={styles.panelTitle}><span>3</span><div><h2>Live Product Preview</h2><p>See how your design looks</p></div><b className={styles.liveBadge}>LIVE</b></div>
            <div className={styles.canvasStage}>
              <canvas id="templateCanvas" ref={canvasRef} aria-label="Final printable product preview" />
            </div>
            <div className={styles.previewMeta}>
              <strong>{template.name}</strong>
              <span>{formatSize(printSize.widthMm, printSize.heightMm, template.type)}</span>
              <small>{useCustom ? 'Custom Print Size' : 'Recommended Print Size'}</small>
            </div>
            <button type="button" className={styles.downloadDesign} onClick={downloadFinalPng}>⬇ Download Design</button>
            <div className={styles.fileButtons}>
              <button type="button" onClick={downloadFinalPng}>PNG</button>
              <button type="button" onClick={downloadFinalSvg}>SVG</button>
              <button type="button" onClick={downloadFinalPdf}>PDF</button>
            </div>
            <div className={styles.whatsappArea}>
              <span>Share Design</span>
              <button type="button" onClick={shareLinkViaWhatsApp}>🟢 WhatsApp Link</button>
              <button type="button" onClick={shareDesignViaWhatsApp}>🟢 WhatsApp Design</button>
            </div>
            <p className={styles.previewFoot}>High quality • Print ready</p>
          </aside>
        </section>

        <section className={styles.finishedSection}>
          <div className={styles.sectionHeading}><div><h2>Finished Products You Can Print</h2><p>Premium prints for every need</p></div><Link href="/templates">View All Templates →</Link></div>
          <div className={styles.productRow}>
            {TEMPLATES.map((item) => (
              <article className={`${styles.productCard} ${styles[`product_${item.id}`]}`} key={item.id}>
                <div className={styles.productMock}><span>Review Us<br /><b>Google</b><i>▦</i></span></div>
                <strong>{item.name}</strong>
                <small>{item.sizeLabel} | {item.inchLabel}</small>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.bottomInfo}>
          <div><b>✂ No Design Skills Needed</b><span>Create in minutes</span></div>
          <div><b>🖨 Print Ready High Quality</b><span>Sharp, clean & professional</span></div>
          <div><b>🛠 Fully Customizable</b><span>Your style, your way</span></div>
          <div><b>🏪 Trusted by Indian Businesses</b><span>Across clinics, salons, cafés</span></div>
          <div><b>🛡 Secure & Private</b><span>Your data stays in browser</span></div>
        </section>

        <section className={styles.seoBlock}>
          <div>
            <h2>Free Google Review QR Generator for Indian businesses</h2>
            <p>BharathQR helps clinics, salons, cafés, restaurants, shops and local service businesses create review QR codes with business logo, elegant templates and print-ready downloads.</p>
          </div>
          <div className={styles.relatedLinks}>{RELATED_LINKS.map((link) => <Link href={link.href} key={link.href}>{link.title}</Link>)}</div>
        </section>
        {toast && <div className={styles.toast} role="status" aria-live="polite">{toast}</div>}
      </main>
    </>
  );
}

export default GoogleReviewQRGeneratorPage;
