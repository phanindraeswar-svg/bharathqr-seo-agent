import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import QRCode from 'qrcode';
import styles from '../../styles/GoogleReviewQRGenerator.module.css';

const CANONICAL_URL = 'https://www.bharathqr.com/tools/google-review-qr-generator';
const DEFAULT_REVIEW_LINK = 'https://g.page/r/your-business/review';
const BHARATHQR_UTM = `${CANONICAL_URL}?utm_source=whatsapp&utm_medium=share&utm_campaign=google_review_qr`;
const INCH_PER_MM = 1 / 25.4;
const CANVAS_SCALE = 3; // high-DPI print canvas scale

const TEMPLATES = [
  { id: 'table', name: 'Counter Standee / Display', shortName: 'Counter Standee', type: 'portrait', tone: 'white', useCase: 'Tables, counters & acrylic displays' },
  { id: 'beige', name: 'Beige / White-Gold', shortName: 'Beige / White-Gold', type: 'portrait', tone: 'beige', useCase: 'Premium & elegant style' },
  { id: 'credit', name: 'Credit Card / NFC Review Card', shortName: 'Credit Card / NFC', type: 'landscape', tone: 'credit', useCase: 'Carry anywhere, tap or scan' },
  { id: 'round', name: 'Round Sticker', shortName: 'Round Sticker', type: 'round', tone: 'round', useCase: 'Perfect for glass and counters' }
];

const SIZE_PRESETS = {
  table: [
    { id: 'recommended', label: 'Recommended', widthMm: 100, heightMm: 150, note: 'Best for counters, tables and acrylic displays' },
    { id: 'large', label: 'Large', widthMm: 120, heightMm: 180, note: 'More visibility at reception' },
    { id: 'xl', label: 'XL', widthMm: 150, heightMm: 225, note: 'High visibility display' }
  ],
  beige: [
    { id: 'recommended', label: 'Recommended', widthMm: 100, heightMm: 150, note: 'Premium compact display' },
    { id: 'large', label: 'Large', widthMm: 120, heightMm: 180, note: 'Elegant high visibility' },
    { id: 'xl', label: 'XL', widthMm: 150, heightMm: 225, note: 'Large premium display' }
  ],
  credit: [
    { id: 'recommended', label: 'Recommended', widthMm: 85.6, heightMm: 54, note: 'Standard card size' },
    { id: 'large', label: 'Large', widthMm: 90, heightMm: 57, note: 'Slightly larger card' },
    { id: 'xl', label: 'XL', widthMm: 100, heightMm: 63, note: 'Large handout card' }
  ],
  round: [
    { id: 'recommended', label: 'Recommended', widthMm: 100, heightMm: 100, note: 'Best round sticker size' },
    { id: 'small', label: 'Small', widthMm: 90, heightMm: 90, note: 'Compact glass sticker' },
    { id: 'large', label: 'Large', widthMm: 120, heightMm: 120, note: 'Large visibility sticker' }
  ]
};

const RELATED_LINKS = [
  { href: '/tools/whatsapp-qr-generator', title: 'WhatsApp QR Generator' },
  { href: '/tools/url-qr-generator', title: 'URL QR Generator' },
  { href: '/solutions/restaurants', title: 'Restaurant QR Solutions' },
  { href: '/solutions/clinics', title: 'Clinic QR Solutions' },
  { href: '/templates/google-review-poster', title: 'Google Review Poster Template' }
];

const TEMPLATE_BY_ID = TEMPLATES.reduce((acc, item) => ({ ...acc, [item.id]: item }), {});

function safeUrl(value) {
  const trimmed = String(value || '').trim();
  if (!trimmed) return DEFAULT_REVIEW_LINK;
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}
function clampText(value, max = 80) { return String(value || '').replace(/\s+/g, ' ').trim().slice(0, max); }
function mmToInches(mm) { return (Number(mm || 0) * INCH_PER_MM).toFixed(2); }
function formatMm(mm) { const n = Number(mm || 0); return n % 1 ? n.toFixed(1) : String(Math.round(n)); }
function formatSize(size, template) {
  if (template.type === 'round') return `${formatMm(size.widthMm)} × ${formatMm(size.widthMm)} mm circle / ${mmToInches(size.widthMm)} × ${mmToInches(size.widthMm)} in`;
  return `${formatMm(size.widthMm)} × ${formatMm(size.heightMm)} mm / ${mmToInches(size.widthMm)} × ${mmToInches(size.heightMm)} in`;
}
function sanitizeFilename(value) { return clampText(value || 'google-review-qr', 48).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'google-review-qr'; }

function dataUrlToBytes(dataUrl) {
  const binary = atob((dataUrl.split(',')[1] || ''));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}
function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1200);
}
function downloadDataUrl(dataUrl, filename) {
  const a = document.createElement('a');
  a.href = dataUrl; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
}
function createPdfBlobFromCanvas(canvas, size) {
  const imageBytes = dataUrlToBytes(canvas.toDataURL('image/jpeg', 0.96));
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
    if (!src) { resolve(null); return; }
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}
function roundRect(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath(); ctx.moveTo(x + radius, y); ctx.arcTo(x + w, y, x + w, y + h, radius); ctx.arcTo(x + w, y + h, x, y + h, radius); ctx.arcTo(x, y + h, x, y, radius); ctx.arcTo(x, y, x + w, y, radius); ctx.closePath();
}
function drawContainedImage(ctx, img, x, y, w, h) {
  if (!img || !img.width || !img.height) return;
  const ratio = Math.min(w / img.width, h / img.height);
  const dw = img.width * ratio;
  const dh = img.height * ratio;
  ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
}
function drawDefaultLogo(ctx, x, y, size, accent = '#f59e0b') {
  ctx.save(); ctx.translate(x, y); ctx.strokeStyle = accent; ctx.fillStyle = accent; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = Math.max(2, size * 0.052);
  ctx.beginPath(); ctx.arc(0, -size * 0.08, size * 0.22, Math.PI, 0); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-size * 0.32, size * 0.1); ctx.lineTo(size * 0.32, size * 0.1); ctx.lineTo(size * 0.23, size * 0.3); ctx.lineTo(-size * 0.23, size * 0.3); ctx.closePath(); ctx.stroke();
  for (let i = -3; i <= 3; i += 1) { const a = (-90 + i * 17) * (Math.PI / 180); ctx.beginPath(); ctx.moveTo(Math.cos(a) * size * 0.34, Math.sin(a) * size * 0.34 - size * 0.08); ctx.lineTo(Math.cos(a) * size * 0.48, Math.sin(a) * size * 0.48 - size * 0.08); ctx.stroke(); }
  ctx.restore();
}
function drawLogoBadge(ctx, x, y, size, logoImg, accent = '#f59e0b') {
  const pad = size * 0.27;
  ctx.save(); ctx.beginPath(); ctx.arc(x, y, size / 2, 0, Math.PI * 2); ctx.fillStyle = '#fff'; ctx.shadowColor = 'rgba(15,23,42,.17)'; ctx.shadowBlur = size * 0.12; ctx.fill(); ctx.shadowBlur = 0; ctx.lineWidth = Math.max(2, size * 0.04); ctx.strokeStyle = accent; ctx.stroke();
  ctx.beginPath(); ctx.arc(x, y, size / 2 - pad * 0.52, 0, Math.PI * 2); ctx.clip();
  if (logoImg) drawContainedImage(ctx, logoImg, x - size / 2 + pad, y - size / 2 + pad, size - pad * 2, size - pad * 2); else drawDefaultLogo(ctx, x, y, size * 0.82, accent);
  ctx.restore();
}
function drawGoogleWord(ctx, x, y, size, align = 'center') {
  const letters = [['G', '#4285F4'], ['o', '#EA4335'], ['o', '#FBBC05'], ['g', '#4285F4'], ['l', '#34A853'], ['e', '#EA4335']];
  ctx.save(); ctx.font = `700 ${Math.round(size)}px Arial, Helvetica, sans-serif`; ctx.textBaseline = 'middle';
  const widths = letters.map(([letter]) => ctx.measureText(letter).width); const spacing = size * 0.03; const total = widths.reduce((a, b) => a + b, 0) + spacing * (letters.length - 1);
  let current = align === 'center' ? x - total / 2 : x;
  letters.forEach(([letter, color], index) => { ctx.fillStyle = color; ctx.fillText(letter, current, y); current += widths[index] + spacing; });
  ctx.restore();
}
function drawStars(ctx, x, y, size, color = '#f5a400', maxWidth = 0) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.font = `700 ${Math.round(size)}px Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const stars = '★★★★★';
  if (maxWidth && ctx.measureText(stars).width > maxWidth) {
    let fit = size;
    while (fit > size * 0.65) {
      ctx.font = `700 ${Math.round(fit)}px Arial, sans-serif`;
      if (ctx.measureText(stars).width <= maxWidth) break;
      fit -= 1;
    }
  }
  ctx.fillText(stars, x, y);
  ctx.restore();
}
function getFontCss(size, family, weight = 700, italic = false) { return `${italic ? 'italic ' : ''}${weight} ${Math.round(size)}px ${family}`; }
function fitFontSize(ctx, value, maxWidth, startSize, minSize, family, weight = 700, italic = false) {
  const text = clampText(value, 100);
  let size = startSize;
  while (size > minSize) {
    ctx.font = getFontCss(size, family, weight, italic);
    if (ctx.measureText(text).width <= maxWidth) return size;
    size -= 1;
  }
  return minSize;
}
function splitIntoLines(ctx, text, maxWidth, maxLines) {
  const words = String(text || '').split(/\s+/).filter(Boolean);
  if (!words.length) return [''];
  const lines = [];
  let line = words[0];
  for (let i = 1; i < words.length; i += 1) {
    const test = `${line} ${words[i]}`;
    if (ctx.measureText(test).width <= maxWidth) line = test;
    else { lines.push(line); line = words[i]; }
  }
  lines.push(line);
  if (lines.length <= maxLines) return lines;
  const kept = lines.slice(0, maxLines);
  kept[maxLines - 1] = `${kept[maxLines - 1].replace(/\s+$/, '')}…`;
  return kept;
}
function drawFittedText(ctx, text, x, y, maxWidth, startSize, minSize, options = {}) {
  const family = options.family || 'Inter, Arial, sans-serif';
  const weight = options.weight || 700;
  const value = clampText(text, options.maxChars || 80);
  const italic = !!options.italic;
  const maxLines = options.maxLines || 1;
  let size = fitFontSize(ctx, value, maxWidth, startSize, minSize, family, weight, italic);
  ctx.save();
  ctx.fillStyle = options.color || '#111827';
  ctx.textAlign = options.align || 'center';
  ctx.textBaseline = 'middle';
  ctx.font = getFontCss(size, family, weight, italic);
  let lines = [value];
  if (ctx.measureText(value).width > maxWidth && maxLines > 1) {
    size = Math.max(minSize, size - 1);
    ctx.font = getFontCss(size, family, weight, italic);
    lines = splitIntoLines(ctx, value, maxWidth, maxLines);
  }
  const lineHeight = size * (options.lineHeight || 1.18);
  const startY = y - ((lines.length - 1) * lineHeight) / 2;
  lines.forEach((line, index) => ctx.fillText(line, x, startY + index * lineHeight));
  ctx.restore();
  return lineHeight * lines.length;
}

function drawCanvasDesign(ctx, canvas, template, size, opts) {
  const { qrImg, logoImg, businessName, headline, subText, starColor, textColor } = opts;
  const w = canvas.width; const h = canvas.height; const min = Math.min(w, h); const accent = template.tone === 'beige' ? '#c58a25' : '#f97316'; const navy = textColor || '#0f172a';
  ctx.clearRect(0, 0, w, h); ctx.save(); ctx.fillStyle = template.tone === 'beige' ? '#fff8ec' : '#fff'; ctx.fillRect(0, 0, w, h);
  if (template.tone === 'acrylic') { const g = ctx.createLinearGradient(0, 0, w, h); g.addColorStop(0, '#fff'); g.addColorStop(0.55, '#f8fafc'); g.addColorStop(1, '#edf2f8'); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h); }
  if (template.tone === 'beige') { const pad = min * 0.055; ctx.strokeStyle = '#d5a342'; ctx.lineWidth = min * 0.012; roundRect(ctx, pad, pad, w - pad * 2, h - pad * 2, min * 0.025); ctx.stroke(); ctx.globalAlpha = 0.18; ctx.fillStyle = '#f5d79b'; ctx.beginPath(); ctx.arc(w * 0.88, h * 0.11, min * 0.22, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1; }
  if (template.type === 'round') {
    ctx.fillStyle = '#fffaf2'; ctx.fillRect(0, 0, w, h); ctx.beginPath(); ctx.arc(w / 2, h / 2, min * 0.468, 0, Math.PI * 2); ctx.fillStyle = '#fffdf8'; ctx.fill(); ctx.lineWidth = min * 0.018; ctx.strokeStyle = '#e5b85b'; ctx.stroke(); ctx.clip();
    drawLogoBadge(ctx, w / 2, h * 0.16, min * 0.14, logoImg, accent);
    drawFittedText(ctx, businessName, w / 2, h * 0.28, w * 0.68, min * 0.064, min * 0.036, { family: 'Georgia, serif', weight: 700, color: '#7c2d12', maxChars: 38, maxLines: 2 });
    drawFittedText(ctx, headline, w / 2, h * 0.37, w * 0.72, min * 0.048, min * 0.03, { color: navy, weight: 650, maxChars: 42, maxLines: 2 });
    drawGoogleWord(ctx, w / 2, h * 0.46, min * 0.10); drawStars(ctx, w / 2, h * 0.54, min * 0.04, starColor, w * 0.5);
    const qrSize = min * 0.26; const qrX = (w - qrSize) / 2; const qrY = h * 0.59; ctx.fillStyle = '#fff'; roundRect(ctx, qrX - min * 0.014, qrY - min * 0.014, qrSize + min * 0.028, qrSize + min * 0.028, min * 0.02); ctx.fill(); ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize); drawLogoBadge(ctx, w / 2, qrY + qrSize / 2, qrSize * 0.23, logoImg, accent);
    drawFittedText(ctx, subText, w / 2, h * 0.91, w * 0.52, min * 0.026, min * 0.017, { color: '#334155', weight: 600, maxChars: 34, italic: true }); ctx.restore(); return;
  }
  if (template.type === 'landscape') {
    const pad = h * 0.12; const g = ctx.createLinearGradient(0, 0, w, h); g.addColorStop(0, '#0f172a'); g.addColorStop(0.62, '#111827'); g.addColorStop(1, '#25120b'); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h); ctx.globalAlpha = 0.35; ctx.strokeStyle = '#c58a25'; ctx.lineWidth = h * 0.012; roundRect(ctx, pad * 0.55, pad * 0.55, w - pad * 1.1, h - pad * 1.1, h * 0.05); ctx.stroke(); ctx.globalAlpha = 1;
    drawLogoBadge(ctx, pad + h * 0.13, h * 0.24, h * 0.17, logoImg, accent);
    drawFittedText(ctx, businessName, w * 0.36, h * 0.22, w * 0.42, h * 0.095, h * 0.055, { family: 'Georgia, serif', weight: 700, color: '#f9d98a', maxChars: 32, maxLines: 2 });
    drawFittedText(ctx, 'Tap or Scan', w * 0.34, h * 0.39, w * 0.33, h * 0.07, h * 0.04, { color: '#fff', weight: 800, maxChars: 16 });
    drawFittedText(ctx, 'to review us on', w * 0.34, h * 0.48, w * 0.3, h * 0.045, h * 0.03, { color: '#d1d5db', weight: 500, maxChars: 18 });
    drawGoogleWord(ctx, w * 0.34, h * 0.59, h * 0.092); drawStars(ctx, w * 0.34, h * 0.77, h * 0.044, starColor, w * 0.28);
    const qrSize = h * 0.52; const qrX = w * 0.66; const qrY = h * 0.24; ctx.fillStyle = '#fff'; roundRect(ctx, qrX - h * 0.035, qrY - h * 0.035, qrSize + h * 0.07, qrSize + h * 0.07, h * 0.045); ctx.fill(); ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize); drawLogoBadge(ctx, qrX + qrSize / 2, qrY + qrSize / 2, qrSize * 0.2, logoImg, accent);
    drawFittedText(ctx, subText, w * 0.66 + qrSize / 2, h * 0.88, qrSize * 1.08, h * 0.036, h * 0.024, { color: '#e5e7eb', weight: 600, maxChars: 38, italic: true }); ctx.restore(); return;
  }
  drawLogoBadge(ctx, w / 2, h * 0.1, min * 0.145, logoImg, accent);
  drawFittedText(ctx, businessName, w / 2, h * 0.205, w * 0.74, min * 0.085, min * 0.045, { family: 'Georgia, serif', weight: 700, color: '#7c2d12', maxChars: 38, maxLines: 2 });
  ctx.save(); ctx.strokeStyle = template.tone === 'beige' ? '#d5a342' : '#e6b348'; ctx.lineWidth = Math.max(2, min * 0.006); ctx.beginPath(); ctx.moveTo(w * 0.28, h * 0.255); ctx.lineTo(w * 0.72, h * 0.255); ctx.stroke(); ctx.restore();
  drawFittedText(ctx, headline, w / 2, h * 0.34, w * 0.76, min * 0.065, min * 0.035, { color: navy, weight: 650, maxChars: 42, maxLines: 2 });
  drawGoogleWord(ctx, w / 2, h * 0.43, min * 0.118); drawStars(ctx, w / 2, h * 0.525, min * 0.052, starColor, w * 0.54);
  const qrSize = min * 0.42; const qrX = (w - qrSize) / 2; const qrY = h * 0.59; ctx.fillStyle = '#fff'; roundRect(ctx, qrX - min * 0.018, qrY - min * 0.018, qrSize + min * 0.036, qrSize + min * 0.036, min * 0.024); ctx.fill(); ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize); drawLogoBadge(ctx, w / 2, qrY + qrSize / 2, qrSize * 0.21, logoImg, accent);
  const ctaY = Math.min(h * 0.93, qrY + qrSize + min * 0.07); const ctaW = w * 0.72; const ctaH = min * 0.068; ctx.fillStyle = template.tone === 'beige' ? '#c58a25' : '#1266e3'; roundRect(ctx, (w - ctaW) / 2, ctaY - ctaH / 2, ctaW, ctaH, ctaH * 0.28); ctx.fill(); drawFittedText(ctx, subText, w / 2, ctaY, ctaW * 0.84, min * 0.032, min * 0.021, { color: '#fff', weight: 750, maxChars: 40 }); ctx.restore();
}

function WhatsAppIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M12.04 2a9.86 9.86 0 0 0-8.46 14.92L2.5 22l5.2-1.04A9.9 9.9 0 1 0 12.04 2Zm.01 1.72a8.16 8.16 0 1 1 0 16.32 8.06 8.06 0 0 1-4.16-1.14l-.3-.18-3.08.62.64-3-.2-.31a8.16 8.16 0 0 1 7.1-12.31Zm-3.5 4.36c-.18 0-.47.06-.72.34-.25.27-.95.93-.95 2.26s.98 2.62 1.12 2.8c.14.18 1.89 3.03 4.7 4.13 2.33.91 2.81.73 3.31.68.51-.05 1.65-.67 1.88-1.32.23-.65.23-1.2.16-1.32-.07-.11-.25-.18-.53-.32-.28-.14-1.65-.81-1.9-.9-.26-.1-.44-.14-.63.14-.18.28-.72.9-.88 1.08-.16.18-.33.2-.61.07-.28-.14-1.18-.44-2.25-1.39-.83-.74-1.39-1.66-1.55-1.94-.16-.28-.02-.43.12-.57.13-.13.28-.33.42-.49.14-.16.18-.28.28-.47.09-.18.05-.35-.02-.49-.07-.14-.62-1.5-.85-2.05-.22-.53-.45-.46-.62-.47h-.52Z" /></svg>; }

function GoogleReviewQRGeneratorPage() {
  const canvasRef = useRef(null); const qrPreviewRef = useRef(null); const fileInputRef = useRef(null);
  const [reviewLink, setReviewLink] = useState(DEFAULT_REVIEW_LINK); const [businessName, setBusinessName] = useState('Sunrise Cafe'); const [headline, setHeadline] = useState('Review Us on Google'); const [subText, setSubText] = useState('Scan QR code to leave a review');
  const [selectedTemplate, setSelectedTemplate] = useState('table'); const [sizePreset, setSizePreset] = useState('recommended'); const [logoDataUrl, setLogoDataUrl] = useState(''); const [qrDataUrl, setQrDataUrl] = useState(''); const [toast, setToast] = useState(''); const [starColor, setStarColor] = useState('#f5a400'); const [textColor, setTextColor] = useState('#111827');
  const template = TEMPLATE_BY_ID[selectedTemplate] || TEMPLATES[0]; const presets = SIZE_PRESETS[selectedTemplate] || SIZE_PRESETS.table; const selectedSize = presets.find((item) => item.id === sizePreset) || presets[0]; const cleanReviewUrl = useMemo(() => safeUrl(reviewLink), [reviewLink]); const fileBase = useMemo(() => sanitizeFilename(`${businessName}-${template.id}-google-review`), [businessName, template.id]);

  useEffect(() => { setSizePreset('recommended'); }, [selectedTemplate]);
  useEffect(() => { let alive = true; QRCode.toDataURL(cleanReviewUrl, { margin: 2, width: 1024, errorCorrectionLevel: 'H', color: { dark: '#000', light: '#fff' } }).then((url) => { if (alive) setQrDataUrl(url); }).catch(() => {}); return () => { alive = false; }; }, [cleanReviewUrl]);
  useEffect(() => { if (!qrDataUrl) return; const canvas = qrPreviewRef.current; const ctx = canvas?.getContext('2d'); if (!canvas || !ctx) return; let cancelled = false; Promise.all([loadImage(qrDataUrl), loadImage(logoDataUrl)]).then(([qrImg, logoImg]) => { if (cancelled || !qrImg) return; const scale = 2; canvas.width = 420 * scale; canvas.height = 420 * scale; canvas.style.width = '100%'; canvas.style.height = 'auto'; ctx.setTransform(scale, 0, 0, scale, 0, 0); ctx.clearRect(0, 0, 420, 420); ctx.fillStyle = '#fff'; roundRect(ctx, 16, 16, 388, 388, 24); ctx.fill(); ctx.drawImage(qrImg, 52, 52, 316, 316); drawLogoBadge(ctx, 210, 210, 72, logoImg, '#f59e0b'); }); return () => { cancelled = true; }; }, [qrDataUrl, logoDataUrl]);
  useEffect(() => { if (!qrDataUrl) return; const canvas = canvasRef.current; const ctx = canvas?.getContext('2d'); if (!canvas || !ctx) return; let cancelled = false; Promise.all([loadImage(qrDataUrl), loadImage(logoDataUrl)]).then(([qrImg, logoImg]) => { if (cancelled || !qrImg) return; const aspect = selectedSize.widthMm / selectedSize.heightMm; let outW = 500 * CANVAS_SCALE; let outH = Math.round(outW / aspect); if (template.type === 'round') { outW = 500 * CANVAS_SCALE; outH = 500 * CANVAS_SCALE; } if (template.type === 'landscape') { outW = 600 * CANVAS_SCALE; outH = Math.round(outW / aspect); } if (outH > 750 * CANVAS_SCALE) { outH = 750 * CANVAS_SCALE; outW = Math.round(outH * aspect); } canvas.width = outW; canvas.height = outH; drawCanvasDesign(ctx, canvas, template, selectedSize, { qrImg, logoImg, businessName, headline, subText, starColor, textColor }); }); return () => { cancelled = true; }; }, [qrDataUrl, logoDataUrl, businessName, headline, subText, starColor, textColor, template, selectedSize]);
  useEffect(() => { if (!toast) return undefined; const timer = setTimeout(() => setToast(''), 2600); return () => clearTimeout(timer); }, [toast]);

  function handleLogoUpload(event) { const file = event.target.files?.[0]; if (!file) return; if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) { setToast('Please upload PNG, JPG or WEBP logo.'); return; } if (file.size > 2 * 1024 * 1024) { setToast('Logo must be under 2MB.'); return; } const reader = new FileReader(); reader.onload = () => setLogoDataUrl(String(reader.result || '')); reader.readAsDataURL(file); }
  function removeLogo() { setLogoDataUrl(''); if (fileInputRef.current) fileInputRef.current.value = ''; }
  function downloadQrPng() { if (qrDataUrl) downloadDataUrl(qrDataUrl, `${sanitizeFilename(businessName)}-google-review-qr.png`); }
  async function copyLink() { try { await navigator.clipboard.writeText(cleanReviewUrl); setToast('Review link copied.'); } catch { setToast('Could not copy automatically.'); } }
  function downloadDesignPng() { const canvas = canvasRef.current; if (!canvas) return; canvas.toBlob((blob) => { if (blob) downloadBlob(blob, `${fileBase}.png`); }, 'image/png', 1); }
  function downloadDesignSvg() { const canvas = canvasRef.current; if (!canvas) return; const dataUrl = canvas.toDataURL('image/png'); const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width}" height="${canvas.height}" viewBox="0 0 ${canvas.width} ${canvas.height}"><image width="${canvas.width}" height="${canvas.height}" href="${dataUrl}"/></svg>`; downloadBlob(new Blob([svg], { type: 'image/svg+xml' }), `${fileBase}.svg`); }
  function downloadDesignPdf() { const canvas = canvasRef.current; if (!canvas) return; downloadBlob(createPdfBlobFromCanvas(canvas, selectedSize), `${fileBase}.pdf`); }
  function whatsappMessage(kind = 'link') { const intro = kind === 'design' ? 'Please see our Google Review QR design and leave a review:' : 'Hi, please leave us a Google review:'; return `${intro}\n${cleanReviewUrl}\n\nCreated free with BharathQR:\n${BHARATHQR_UTM}`; }
  function shareWhatsAppLink() { window.open(`https://wa.me/?text=${encodeURIComponent(whatsappMessage('link'))}`, '_blank', 'noopener,noreferrer'); }
  async function shareWhatsAppDesign() { const canvas = canvasRef.current; if (!canvas) return; const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png', 1)); if (!blob) return; const file = new File([blob], `${fileBase}.png`, { type: 'image/png' }); if (navigator.canShare && navigator.canShare({ files: [file] }) && navigator.share) { try { await navigator.share({ title: 'Google Review QR Design', text: whatsappMessage('design'), files: [file] }); return; } catch (err) { if (err?.name === 'AbortError') return; } } downloadBlob(blob, `${fileBase}.png`); const fallback = `${whatsappMessage('design')}\n\nI downloaded the PNG design. Please attach/share the downloaded image in WhatsApp.`; window.open(`https://wa.me/?text=${encodeURIComponent(fallback)}`, '_blank', 'noopener,noreferrer'); }

  const softwareSchema = { '@context': 'https://schema.org', '@type': 'SoftwareApplication', name: 'BharathQR Google Review QR Code Generator', applicationCategory: 'BusinessApplication', operatingSystem: 'Web', url: CANONICAL_URL, offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' }, description: 'Create print-ready Google Review QR codes with business logo, premium templates and WhatsApp sharing.' };
  const breadcrumbSchema = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.bharathqr.com/' }, { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://www.bharathqr.com/tools' }, { '@type': 'ListItem', position: 3, name: 'Google Review QR Generator', item: CANONICAL_URL }] };
  const faqSchema = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: [{ '@type': 'Question', name: 'Is BharathQR Google Review QR Generator free?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. You can create Google Review QR codes and print-ready templates without login.' } }, { '@type': 'Question', name: 'Can I add my logo?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Upload PNG, JPG or WEBP. The logo is contain-fit with safe padding.' } }, { '@type': 'Question', name: 'Which print formats are available?', acceptedAnswer: { '@type': 'Answer', text: 'Counter Standee/Display, Beige White-Gold, Credit Card/NFC Review Card and Round Sticker are available with tested print presets.' } }] };

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
          <Link href="/" className={styles.brand} aria-label="BharathQR Home"><span className={styles.brandMark}>⌗</span><span>Bharath<span>QR</span></span></Link>
          <nav className={styles.navLinks} aria-label="Primary navigation"><Link href="/tools">Tools</Link><Link href="/solutions">Solutions</Link><Link href="/use-cases">Use Cases</Link><Link href="/materials">Materials</Link><Link href="/blog">Blog</Link></nav>
          <Link className={styles.templateButton} href="/templates">▦ View Templates</Link><button className={styles.menuButton} type="button" aria-label="Open menu">☰</button>
        </header>

        <section className={styles.hero}>
          <div className={styles.heroCopy}><h1>Turn Every Customer Visit Into a <span>5★ Google</span> Review</h1><p>Create a premium Google Review QR code with your logo. Choose from beautiful templates and download print-ready assets in seconds.</p><div className={styles.trustPills}><span>🎁 100% Free</span><span>👤 No Sign-up</span><span>🖨️ Print Ready</span></div></div>
          <div className={styles.heroVisual}><div className={styles.heroCardMock}><div className={styles.heroLogo}>SUNRISE<br />CAFE</div><strong>Sunrise Cafe</strong><small>Review us on</small><b className={styles.googleMini}>Google</b><span className={styles.starMini}>★★★★★</span>{qrDataUrl ? <img src={qrDataUrl} alt="Google Review QR preview" /> : <span className={styles.qrSkeleton} />}<em>Scan QR to leave a review</em></div><div className={styles.heroPlant} aria-hidden="true"><span /></div></div>
        </section>

        <section className={styles.workflow} aria-label="How it works">{[['1', 'Enter Review Link', 'Add your Google review link'], ['2', 'Customize Template', 'Choose template, edit details and colors'], ['3', 'Preview & Download', 'Download print-ready files'], ['4', 'Print & Display', 'Print and start getting more reviews']].map((step, index) => <div className={styles.workflowStep} key={step[0]}><span>{step[0]}</span><b>{step[1]}</b><small>{step[2]}</small>{index < 3 && <i>······›</i>}</div>)}</section>

        <section className={styles.builderGrid}>
          <aside className={`${styles.panel} ${styles.qrPanel}`}>
            <div className={styles.panelTitle}><span>1</span><div><h2>QR Generator</h2><p>Enter your Google review link</p></div></div>
            <label className={styles.inputLabel}>Google review link<input value={reviewLink} onChange={(e) => setReviewLink(e.target.value)} placeholder="https://g.page/r/your-business/review" /></label><p className={styles.helperText}>Paste your real Google review link. It redirects directly to printing and sharing.</p>
            <label className={styles.inputLabel}>Business / Location name<input value={businessName} onChange={(e) => setBusinessName(e.target.value)} maxLength={50} /></label>
            <div className={styles.uploadCard}><input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={handleLogoUpload} hidden /><button type="button" className={styles.logoPreview} onClick={() => fileInputRef.current?.click()}>{logoDataUrl ? <img src={logoDataUrl} alt="Uploaded logo" /> : <span>☕</span>}</button><div><strong>{logoDataUrl ? 'Logo uploaded' : 'Upload logo'}</strong><small>PNG, JPG, WEBP • Max 2MB</small><div><button type="button" onClick={() => fileInputRef.current?.click()}>{logoDataUrl ? 'Replace logo' : 'Choose logo'}</button>{logoDataUrl && <button type="button" onClick={removeLogo}>Remove</button>}</div></div></div>
            <div className={styles.qrPreviewBox}><canvas ref={qrPreviewRef} aria-label="QR preview" /><small>✅ High-resolution QR<br />Size: 1024 × 1024 px</small></div><div className={styles.qrActions}><button type="button" onClick={downloadQrPng}>⬇ Download QR</button><button type="button" onClick={copyLink}>🔗 Copy Link</button></div><div className={styles.readyNote}>✓ QR code is ready to use!</div>
          </aside>

          <section className={`${styles.panel} ${styles.studioPanel}`}>
            <div className={styles.panelTitle}><span>2</span><div><h2>Template Studio</h2><p>Choose a template and customize it your way</p></div><button type="button" className={styles.resetButton} onClick={() => { setSelectedTemplate('table'); setBusinessName('Sunrise Cafe'); setHeadline('Review Us on Google'); setSubText('Scan QR code to leave a review'); setSizePreset('recommended'); }}>↻ Reset All</button></div>
            <div className={styles.templateGrid}>{TEMPLATES.map((item) => <button type="button" key={item.id} className={`${styles.templateCard} ${selectedTemplate === item.id ? styles.activeTemplate : ''} ${styles[`card_${item.id}`]}`} onClick={() => setSelectedTemplate(item.id)}><span className={styles.selectDot}>{selectedTemplate === item.id ? '●' : '○'}</span><strong>{item.name}</strong><div className={`${styles.templateMini} ${styles[`mini_${item.id}`]}`}><span className={styles.miniLogo}>SUNRISE</span><i>{item.id === 'beige' ? 'Thank You!' : item.id === 'credit' ? 'Tap or Scan' : 'Review Us'}</i><b>Google</b><em>★★★★★</em>{qrDataUrl ? <img src={qrDataUrl} alt="" /> : <span className={styles.qrLite}>▦</span>}<small>Scan QR code</small></div><span className={styles.templateSize}>{formatSize(SIZE_PRESETS[item.id][0], item)}</span></button>)}</div>
            <div className={styles.controlsGrid}><label>Business Name<input value={businessName} onChange={(e) => setBusinessName(e.target.value)} maxLength={50} /></label><label>Headline<input value={headline} onChange={(e) => setHeadline(e.target.value)} maxLength={48} /></label><label>Sub Text<input value={subText} onChange={(e) => setSubText(e.target.value)} maxLength={60} /></label><label>Star Color<select value={starColor} onChange={(e) => setStarColor(e.target.value)}><option value="#f5a400">Gold</option><option value="#f97316">Orange</option><option value="#c58a25">White-Gold</option></select></label><label>Text Color<select value={textColor} onChange={(e) => setTextColor(e.target.value)}><option value="#111827">Black</option><option value="#7c2d12">Brown</option><option value="#1e3a8a">Blue</option></select></label></div>
            <div className={styles.sizePanel}><div className={styles.sizePanelHeader}><strong>Print Size</strong><span>Only tested presets are available, so layout and export stay clean.</span></div><div className={styles.sizeChoices}>{presets.map((preset) => <button type="button" key={preset.id} className={sizePreset === preset.id ? styles.activeSize : ''} onClick={() => setSizePreset(preset.id)}><b>{preset.label}</b><strong>{formatSize(preset, template)}</strong><span>{preset.note}</span></button>)}</div></div>
          </section>

          <aside className={`${styles.panel} ${styles.previewPanel}`}>
            <div className={styles.panelTitle}><span>3</span><div><h2>Live Product Preview</h2><p>See how your design looks</p></div><b className={styles.liveBadge}>LIVE</b></div><div className={styles.canvasStage}><canvas id="templateCanvas" ref={canvasRef} aria-label="Final printable product preview" /></div><div className={styles.previewMeta}><strong>{template.name}</strong><span>{formatSize(selectedSize, template)}</span><small>{selectedSize.label} Print Size</small></div><button type="button" className={styles.downloadDesign} onClick={downloadDesignPng}>⬇ Download Design</button><div className={styles.fileButtons}><button type="button" onClick={downloadDesignPng}>PNG</button><button type="button" onClick={downloadDesignSvg}>SVG</button><button type="button" onClick={downloadDesignPdf}>PDF</button></div><div className={styles.whatsappArea}><span>Share Design</span><button type="button" onClick={shareWhatsAppLink}><WhatsAppIcon /> Share Link via WhatsApp</button><button type="button" onClick={shareWhatsAppDesign}><WhatsAppIcon /> Share Design via WhatsApp</button></div><p className={styles.previewFoot}>High quality • Print ready</p></aside>
        </section>

        <section className={styles.finishedSection}><div className={styles.sectionHeading}><div><h2>Finished Products You Can Print</h2><p>Premium prints for every need</p></div><Link href="/templates">View All Templates →</Link></div><div className={styles.productRow}>{TEMPLATES.map((item) => <article className={`${styles.productCard} ${styles[`product_${item.id}`]}`} key={item.id}><div className={styles.productScene}><div className={`${styles.productFace} ${styles[`face_${item.id}`]}`}><span>{item.id === 'beige' ? 'Thank You!' : item.id === 'credit' ? 'Tap or Scan' : 'Review Us'}</span><b>Google</b>{qrDataUrl ? <img src={qrDataUrl} alt="" /> : <i>▦</i>}</div></div><strong>{item.name}</strong><small>{formatSize(SIZE_PRESETS[item.id][0], item)}</small></article>)}</div></section>
        <section className={styles.bottomInfo}><div><b>✂ No Design Skills Needed</b><span>Create in minutes</span></div><div><b>🖨 Print Ready High Quality</b><span>Sharp, clean & professional</span></div><div><b>🛠 Fully Customizable</b><span>Your style, your way</span></div><div><b>🏪 Trusted by Indian Businesses</b><span>Across clinics, salons, cafés</span></div><div><b>🛡 Secure & Private</b><span>Your data stays in browser</span></div></section>
        <section className={styles.seoBlock}><div><h2>Free Google Review QR Generator for Indian businesses</h2><p>BharathQR helps clinics, salons, cafés, restaurants, shops and local service businesses create review QR codes with business logo, elegant templates and print-ready downloads.</p></div><div className={styles.relatedLinks}>{RELATED_LINKS.map((link) => <Link href={link.href} key={link.href}>{link.title}</Link>)}</div></section>{toast && <div className={styles.toast} role="status" aria-live="polite">{toast}</div>}
      </main>
    </>
  );
}

export default GoogleReviewQRGeneratorPage;
