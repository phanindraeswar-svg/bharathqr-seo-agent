
import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import styles from '../../styles/GoogleReviewQRGenerator.module.css';

const DEFAULT_REVIEW_LINK = 'https://g.page/r/your-business/review';

const QR_STYLES = [
  { id: 'clean', label: 'Clean', icon: '▦' },
  { id: 'google', label: 'Google Colors', icon: 'G' },
  { id: 'gradient', label: 'Gradient', icon: '▧' },
  { id: 'badge', label: 'Badge', icon: '●' },
  { id: 'rounded', label: 'Rounded', icon: '▣' },
  { id: 'dots', label: 'Dots', icon: '▪' }
];

const TEMPLATES = [
  { id: 'simple', name: 'Table Tent', label: 'Simple', tone: 'light', defaultSize: 'tent' },
  { id: 'premium', name: 'Acrylic Standee', label: 'Premium', tone: 'dark', defaultSize: 'tent' },
  { id: 'thankYou', name: 'Review Card', label: 'Thank You', tone: 'clean', defaultSize: 'a6' },
  { id: 'round', name: 'Round Sticker', label: 'Circle', tone: 'round', defaultSize: 'round' },
  { id: 'feedback', name: 'Black Feedback Card', label: 'Elegant', tone: 'cream', defaultSize: 'square' }
];

const PRINT_SIZES = [
  { id: 'a6', name: 'A6', label: 'Postcard', mm: '105 × 148 mm', widthMm: 105, heightMm: 148 },
  { id: 'a5', name: 'A5', label: 'Flyer', mm: '148 × 210 mm', widthMm: 148, heightMm: 210 },
  { id: 'a4', name: 'A4', label: 'Poster', mm: '210 × 297 mm', widthMm: 210, heightMm: 297 },
  { id: 'square', name: 'Square', label: 'Sticker', mm: '100 × 100 mm', widthMm: 100, heightMm: 100 },
  { id: 'round', name: 'Round', label: 'Sticker', mm: '90 × 90 mm', widthMm: 90, heightMm: 90 },
  { id: 'tent', name: 'Table Tent', label: 'Standee', mm: '100 × 150 mm', widthMm: 100, heightMm: 150 }
];

const RELATED_LINKS = [
  { href: '/use-cases/collect-reviews', title: 'Collect Google Reviews Use Case' },
  { href: '/blog/2026-06-10-google-review-qr-code-generator-for-restaurants-co', title: 'Restaurant Google Review QR Guide' },
  { href: '/solutions/restaurants', title: 'Restaurant QR Solutions' },
  { href: '/solutions/clinics', title: 'Clinic QR Solutions' },
  { href: '/solutions/salons', title: 'Salon QR Solutions' },
  { href: '/templates/google-review-poster', title: 'Google Review Poster Template' },
  { href: '/templates/clinic-review-qr-poster', title: 'Clinic Review QR Poster' },
  { href: '/tools/whatsapp-qr-generator', title: 'WhatsApp QR Generator' },
  { href: '/tools/url-qr-generator', title: 'URL QR Generator' }
];

function safeUrl(value) {
  const trimmed = String(value || '').trim();
  if (!trimmed) return DEFAULT_REVIEW_LINK;
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function parseHttpUrl(value) {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
    return url;
  } catch (error) {
    return null;
  }
}

function isLikelyGoogleReviewUrl(value) {
  const url = parseHttpUrl(value);
  if (!url) return false;
  const host = url.hostname.replace(/^www\./, '').toLowerCase();
  const text = `${host}${url.pathname}${url.search}`.toLowerCase();
  return (
    host === 'g.page' ||
    host.endsWith('.g.page') ||
    host === 'maps.app.goo.gl' ||
    host.endsWith('.google.com') ||
    host === 'google.com' ||
    text.includes('writereview') ||
    text.includes('/review') ||
    text.includes('lrd=')
  );
}

function clampText(value, max) {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, max);
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

function createPdfBlobFromCanvas(canvas, printSize) {
  const jpegUrl = canvas.toDataURL('image/jpeg', 0.95);
  const imageBytes = dataUrlToBytes(jpegUrl);
  const pageWidth = (printSize.widthMm * 72) / 25.4;
  const pageHeight = (printSize.heightMm * 72) / 25.4;
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
  if (!img) return;
  const ratio = Math.min(w / img.width, h / img.height);
  const dw = img.width * ratio;
  const dh = img.height * ratio;
  ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
}

function drawGoogleWord(ctx, x, y, size, align = 'center') {
  const letters = [
    ['G', '#4285F4'], ['o', '#EA4335'], ['o', '#FBBC05'], ['g', '#4285F4'], ['l', '#34A853'], ['e', '#EA4335']
  ];
  ctx.save();
  ctx.font = `700 ${size}px Arial, sans-serif`;
  ctx.textBaseline = 'middle';
  const widths = letters.map(([letter]) => ctx.measureText(letter).width);
  const total = widths.reduce((a, b) => a + b, 0) - size * 0.05;
  let current = align === 'center' ? x - total / 2 : x;
  letters.forEach(([letter, color], index) => {
    ctx.fillStyle = color;
    ctx.fillText(letter, current, y);
    current += widths[index] - size * 0.05;
  });
  ctx.restore();
}

function drawStars(ctx, x, y, size, show = true) {
  if (!show) return;
  ctx.save();
  ctx.fillStyle = '#f7b500';
  ctx.font = `700 ${size}px Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('★★★★★', x, y);
  ctx.restore();
}


function fittedFontSize(ctx, text, maxWidth, startSize, minSize, weight = 900) {
  let size = startSize;
  const value = String(text || '');
  while (size > minSize) {
    ctx.font = `${weight} ${Math.round(size)}px Arial, sans-serif`;
    if (ctx.measureText(value).width <= maxWidth) return size;
    size -= Math.max(1, startSize * 0.04);
  }
  return minSize;
}

function drawFittedText(ctx, text, x, y, maxWidth, startSize, minSize, options = {}) {
  const size = fittedFontSize(ctx, text, maxWidth, startSize, minSize, options.weight || 900);
  ctx.save();
  ctx.font = `${options.weight || 900} ${Math.round(size)}px Arial, sans-serif`;
  ctx.fillStyle = options.color || '#111827';
  ctx.textAlign = options.align || 'center';
  ctx.textBaseline = options.baseline || 'middle';
  ctx.fillText(String(text || ''), x, y);
  ctx.restore();
  return size;
}

function drawWrappedText(ctx, text, x, y, maxWidth, lineHeight, maxLines, options = {}) {
  const words = String(text || '').split(' ').filter(Boolean);
  const lines = [];
  let current = '';
  words.forEach((word) => {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width <= maxWidth || !current) current = test;
    else { lines.push(current); current = word; }
  });
  if (current) lines.push(current);
  const visible = lines.slice(0, maxLines);
  if (lines.length > maxLines && visible.length) visible[visible.length - 1] = `${visible[visible.length - 1].slice(0, -1)}…`;
  ctx.save();
  ctx.fillStyle = options.color || '#111827';
  ctx.textAlign = options.align || 'center';
  ctx.textBaseline = 'top';
  visible.forEach((line, i) => ctx.fillText(line, x, y + i * lineHeight));
  ctx.restore();
}


function drawSmartText(ctx, text, x, y, maxWidth, startSize, minSize, options = {}) {
  const words = String(text || '').replace(/\s+/g, ' ').trim().split(' ').filter(Boolean);
  const maxLines = options.maxLines || 2;
  const weight = options.weight || 800;
  const color = options.color || '#111827';
  const align = options.align || 'center';
  const lineHeightRatio = options.lineHeightRatio || 1.12;
  const cleaned = words.length ? words.join(' ') : String(text || '').trim();
  if (!cleaned) return { height: 0, size: minSize };

  for (let size = startSize; size >= minSize; size -= Math.max(1, startSize * 0.045)) {
    ctx.font = `${weight} ${Math.round(size)}px Arial, sans-serif`;
    const lines = [];
    let current = '';
    if (words.length <= 1 && ctx.measureText(cleaned).width > maxWidth) {
      lines.push(cleaned);
    } else {
      words.forEach((word) => {
        const test = current ? `${current} ${word}` : word;
        if (ctx.measureText(test).width <= maxWidth || !current) current = test;
        else { lines.push(current); current = word; }
      });
      if (current) lines.push(current);
    }
    if (lines.length <= maxLines && lines.every((line) => ctx.measureText(line).width <= maxWidth)) {
      const lineHeight = size * lineHeightRatio;
      ctx.save();
      ctx.font = `${weight} ${Math.round(size)}px Arial, sans-serif`;
      ctx.fillStyle = color;
      ctx.textAlign = align;
      ctx.textBaseline = 'middle';
      const firstY = y - ((lines.length - 1) * lineHeight) / 2;
      lines.forEach((line, index) => ctx.fillText(line, x, firstY + index * lineHeight));
      ctx.restore();
      return { height: lines.length * lineHeight, size };
    }
  }

  ctx.save();
  ctx.font = `${weight} ${Math.round(minSize)}px Arial, sans-serif`;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  let value = cleaned;
  while (value.length > 4 && ctx.measureText(`${value}…`).width > maxWidth) value = value.slice(0, -1);
  ctx.fillText(value.length < cleaned.length ? `${value}…` : value, x, y);
  ctx.restore();
  return { height: minSize * lineHeightRatio, size: minSize };
}

function canvasDimensions(size) {
  const width = 1400;
  const height = Math.round(width * (size.heightMm / size.widthMm));
  if (size.id === 'round' || size.id === 'square') return { width: 1400, height: 1400 };
  return { width, height };
}

function drawLogoBadge(ctx, logoImg, x, y, size, showLogo) {
  if (!showLogo) return;
  ctx.save();
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#ff5a1f';
  ctx.lineWidth = Math.max(3, size * 0.035);
  ctx.beginPath();
  ctx.arc(x, y, size / 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.clip();
  if (logoImg) drawContainedImage(ctx, logoImg, x - size * 0.36, y - size * 0.36, size * 0.72, size * 0.72);
  else {
    ctx.fillStyle = '#111827';
    ctx.font = `900 ${size * 0.18}px Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('YOUR', x, y - size * 0.08);
    ctx.fillText('LOGO', x, y + size * 0.12);
  }
  ctx.restore();
}

function drawQrFrame(ctx, x, y, size, qrImg, logoImg, accent, styleId, showLogo) {
  ctx.save();
  ctx.fillStyle = '#fff';
  roundRect(ctx, x, y, size, size, size * 0.035);
  ctx.fill();
  const quiet = size * 0.08;
  const qrSize = size - quiet * 2;
  if (qrImg) ctx.drawImage(qrImg, x + quiet, y + quiet, qrSize, qrSize);
  const line = Math.max(10, size * 0.035);
  const c = size * 0.22;
  const rad = line * 0.4;
  const corners = [['#EA4335', x, y, true, true], ['#FBBC05', x + size - c, y, false, true], ['#34A853', x, y + size - c, true, false], ['#1A73E8', x + size - c, y + size - c, false, false]];
  corners.forEach(([color, cx, cy, left, top]) => {
    ctx.strokeStyle = styleId === 'gradient' ? accent : color;
    ctx.lineWidth = line;
    ctx.lineCap = 'round';
    ctx.beginPath();
    if (left && top) { ctx.moveTo(cx, cy + c); ctx.lineTo(cx, cy + rad); ctx.arcTo(cx, cy, cx + rad, cy, rad); ctx.lineTo(cx + c, cy); }
    if (!left && top) { ctx.moveTo(cx, cy); ctx.lineTo(cx + c - rad, cy); ctx.arcTo(cx + c, cy, cx + c, cy + rad, rad); ctx.lineTo(cx + c, cy + c); }
    if (left && !top) { ctx.moveTo(cx + c, cy + c); ctx.lineTo(cx + rad, cy + c); ctx.arcTo(cx, cy + c, cx, cy + c - rad, rad); ctx.lineTo(cx, cy); }
    if (!left && !top) { ctx.moveTo(cx, cy + c); ctx.lineTo(cx + c - rad, cy + c); ctx.arcTo(cx + c, cy + c, cx + c, cy + c - rad, rad); ctx.lineTo(cx + c, cy); }
    ctx.stroke();
  });
  if (showLogo) {
    const logoSize = size * 0.2;
    ctx.beginPath();
    ctx.arc(x + size / 2, y + size / 2, logoSize / 2, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.save();
    ctx.beginPath();
    ctx.arc(x + size / 2, y + size / 2, logoSize / 2.35, 0, Math.PI * 2);
    ctx.clip();
    if (logoImg) drawContainedImage(ctx, logoImg, x + size / 2 - logoSize * 0.32, y + size / 2 - logoSize * 0.32, logoSize * 0.64, logoSize * 0.64);
    else {
      ctx.fillStyle = '#4285F4';
      ctx.font = `900 ${logoSize * 0.56}px Arial, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('G', x + size / 2, y + size / 2 + logoSize * 0.02);
    }
    ctx.restore();
  }
  ctx.restore();
}

function drawProduct(ctx, canvas, state, qrImg, logoImg) {
  const { width: w, height: h } = canvas;
  const center = w / 2;
  const selectedTemplate = TEMPLATES.find((t) => t.id === state.templateId) || TEMPLATES[0];
  const isDark = selectedTemplate.id === 'premium' || selectedTemplate.id === 'feedback';
  const isRound = selectedTemplate.id === 'round' || state.printSize.id === 'round';
  const ink = isDark ? '#ffffff' : '#111827';
  const muted = isDark ? '#dbe2ea' : '#374151';
  const bg = selectedTemplate.id === 'feedback'
    ? '#070707'
    : selectedTemplate.id === 'premium'
      ? '#050505'
      : selectedTemplate.id === 'thankYou'
        ? '#fffdf9'
        : '#ffffff';

  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, w, h);

  ctx.save();
  if (isRound) {
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, Math.min(w, h) * 0.455, 0, Math.PI * 2);
    ctx.clip();
  } else if (isDark) {
    const outerPad = w * 0.045;
    roundRect(ctx, outerPad, outerPad, w - outerPad * 2, h - outerPad * 2, w * 0.045);
    ctx.clip();
  }

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  if (selectedTemplate.id === 'feedback') {
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, '#090909');
    g.addColorStop(0.48, '#141414');
    g.addColorStop(1, '#2a1608');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }

  if (isRound) {
    const r = Math.min(w, h) * 0.405;
    ctx.lineWidth = w * 0.018;
    ctx.lineCap = 'round';
    ctx.beginPath(); ctx.strokeStyle = '#34A853'; ctx.arc(center, h / 2, r, Math.PI * 0.76, Math.PI * 1.42); ctx.stroke();
    ctx.beginPath(); ctx.strokeStyle = '#EA4335'; ctx.arc(center, h / 2, r, Math.PI * 1.42, Math.PI * 1.86); ctx.stroke();
    ctx.beginPath(); ctx.strokeStyle = '#FBBC05'; ctx.arc(center, h / 2, r, Math.PI * 1.86, Math.PI * 2.25); ctx.stroke();
    ctx.beginPath(); ctx.strokeStyle = '#4285F4'; ctx.arc(center, h / 2, r, Math.PI * 0.25, Math.PI * 0.76); ctx.stroke();
  }

  const compositionHeight = Math.min(h * 0.86, w * (isRound ? 0.9 : 1.25));
  const top = (h - compositionHeight) / 2;
  const logoSize = w * (isRound ? 0.12 : 0.14);
  const headlineText = clampText(state.headline, 24) || 'Review us on';
  const ctaText = clampText(state.ctaText, 30) || 'Scan QR to leave a review';
  const businessText = clampText(state.businessName, 28);

  let y = top + compositionHeight * 0.08;

  if (state.showLogo && !isDark) {
    drawLogoBadge(ctx, logoImg, center, y, logoSize, true);
    y += logoSize * 0.85;
  }

  if (selectedTemplate.id === 'premium') {
    drawSmartText(ctx, headlineText || 'Share your experience on', center, y, w * 0.72, w * 0.045, w * 0.026, { color: '#ffffff', weight: 800, maxLines: 2 });
    y += w * 0.1;
  } else if (selectedTemplate.id === 'feedback') {
    drawSmartText(ctx, headlineText || 'Your feedback matters', center, y, w * 0.7, w * 0.044, w * 0.026, { color: '#ffffff', weight: 800, maxLines: 2 });
    y += w * 0.09;
  } else {
    drawSmartText(ctx, headlineText, center, y, w * (isRound ? 0.56 : 0.7), w * 0.048, w * 0.024, { color: ink, weight: 800, maxLines: 2 });
    y += w * 0.075;
  }

  drawGoogleWord(ctx, center, y, w * (isRound ? 0.082 : isDark ? 0.096 : 0.108));
  y += w * (isRound ? 0.074 : 0.092);
  drawStars(ctx, center, y, w * (isRound ? 0.045 : 0.055), state.showStars);
  y += w * (isRound ? 0.085 : 0.095);

  const qrSize = Math.min(w * (isRound ? 0.36 : 0.44), compositionHeight * 0.36);
  drawQrFrame(ctx, center - qrSize / 2, y, qrSize, qrImg, logoImg, state.accent, state.qrStyle, state.showLogo);
  y += qrSize + w * 0.08;

  if (selectedTemplate.id === 'premium' || selectedTemplate.id === 'feedback') {
    drawSmartText(ctx, ctaText, center, y, w * 0.68, w * 0.035, w * 0.022, { color: '#ffffff', weight: 800, maxLines: 2 });
  } else if (isRound) {
    drawSmartText(ctx, ctaText || 'Thank you!', center, y, w * 0.52, w * 0.024, w * 0.016, { color: muted, weight: 800, maxLines: 2 });
  } else {
    const btnW = w * 0.56;
    const btnH = w * 0.075;
    roundRect(ctx, center - btnW / 2, y - btnH / 2, btnW, btnH, btnH * 0.18);
    ctx.fillStyle = '#1a73e8';
    ctx.fill();
    drawSmartText(ctx, ctaText, center, y, btnW * 0.84, w * 0.027, w * 0.018, { color: '#ffffff', weight: 800, maxLines: 1 });
  }
  y += w * 0.075;

  if (businessText && businessText !== 'Your Business Name') {
    drawSmartText(ctx, businessText, center, Math.min(y, top + compositionHeight * 0.92), w * 0.72, w * 0.027, w * 0.017, { color: isDark ? '#ffffff' : '#374151', weight: 700, maxLines: 2 });
  }

  ctx.restore();

  if (isRound) {
    ctx.save();
    ctx.lineWidth = w * 0.012;
    ctx.strokeStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, Math.min(w, h) * 0.456, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}

function FinishedProductMock({ template, qrDataUrl }) {
  return (
    <article className={styles.productCard}>
      <div className={`${styles.productScene} ${styles[`scene_${template.id}`] || ''}`}>
        <div className={`${styles.productAsset} ${styles[`asset_${template.id}`] || ''}`}>
          {qrDataUrl ? <img src={qrDataUrl} alt="" /> : <span />}
        </div>
      </div>
      <b>{template.name}</b>
      <span>{template.label}</span>
    </article>
  );
}

function TemplateThumb({ template, active, qrDataUrl, onClick }) {
  const dark = template.id === 'premium' || template.id === 'feedback';
  return (
    <button type="button" onClick={onClick} className={`${styles.templateCard} ${active ? styles.activeTemplate : ''}`} aria-pressed={active} aria-label={`Select ${template.name} ${template.label} template`}>
      <div className={`${styles.templateThumb} ${dark ? styles.darkThumb : ''} ${template.id === 'round' ? styles.roundThumb : ''} ${template.id === 'feedback' ? styles.feedbackThumb : ''}`}>
        <span className={styles.tinyHeadline}>{template.id === 'premium' ? 'SHARE YOUR EXPERIENCE ON' : template.id === 'feedback' ? 'Your Feedback Matters!' : 'Review us on'}</span>
        <span className={styles.googleWord}><span>G</span><span>o</span><span>o</span><span>g</span><span>l</span><span>e</span></span>
        <span className={styles.tinyStars}>★★★★★</span>
        {qrDataUrl ? <img src={qrDataUrl} alt="QR preview" className={styles.tinyQr} /> : <span className={styles.tinyQrPlaceholder} />}
        <span className={styles.tinyCta}>{template.id === 'premium' ? 'TO LEAVE A REVIEW' : template.id === 'feedback' ? 'Thank you!' : 'Scan QR to leave a review'}</span>
      </div>
      <strong>{template.name}</strong>
      <small>{template.label}</small>
    </button>
  );
}

export default function GoogleReviewQRGenerator() {
  const canvasRef = useRef(null);
  const [reviewUrl, setReviewUrl] = useState(DEFAULT_REVIEW_LINK);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [qrPreviewDataUrl, setQrPreviewDataUrl] = useState('');
  const [logoDataUrl, setLogoDataUrl] = useState('');
  const [qrStyle, setQrStyle] = useState('clean');
  const [templateId, setTemplateId] = useState('simple');
  const [businessName, setBusinessName] = useState('Your Business Name');
  const [headline, setHeadline] = useState('Review us on');
  const [ctaText, setCtaText] = useState('Scan QR to leave a review');
  const [accent, setAccent] = useState('#ff5a1f');
  const [showStars, setShowStars] = useState(true);
  const [showLogo, setShowLogo] = useState(true);
  const [printSizeId, setPrintSizeId] = useState(TEMPLATES[0].defaultSize || 'tent');
  const [toast, setToast] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeEditorTab, setActiveEditorTab] = useState('text');
  const [isCanvasReady, setIsCanvasReady] = useState(false);

  const printSize = useMemo(() => PRINT_SIZES.find((s) => s.id === printSizeId) || PRINT_SIZES[0], [printSizeId]);
  const selectedTemplate = useMemo(() => TEMPLATES.find((t) => t.id === templateId) || TEMPLATES[0], [templateId]);
  const actionUrl = useMemo(() => safeUrl(reviewUrl), [reviewUrl]);
  const linkLooksValid = Boolean(parseHttpUrl(actionUrl));
  const canShareReviewLink = Boolean(qrDataUrl && linkLooksValid);
  const shareButtonLabel = linkLooksValid ? '💬 Share Link via WhatsApp' : '💬 Paste review link to share';
  const linkStatusText = linkLooksValid
    ? 'Ready to generate review QR'
    : 'Paste a valid Google review link starting with https://';

  useEffect(() => {
    let active = true;
    const generate = async () => {
      try {
        const QRCodeModule = await import('qrcode');
        const QRCode = QRCodeModule.default || QRCodeModule;
        const data = await QRCode.toDataURL(actionUrl, {
          width: 1024,
          margin: 2,
          errorCorrectionLevel: 'H',
          color: { dark: '#050505', light: '#ffffff' }
        });
        if (active) setQrDataUrl(data);
      } catch (error) {
        if (active) setQrDataUrl('');
      }
    };
    generate();
    return () => { active = false; };
  }, [actionUrl]);

  useEffect(() => {
    let active = true;
    const drawPreview = async () => {
      if (!qrDataUrl) {
        if (active) setQrPreviewDataUrl('');
        return;
      }
      const [qrImg, logoImg] = await Promise.all([loadImage(qrDataUrl), loadImage(logoDataUrl)]);
      if (!active) return;
      const previewCanvas = document.createElement('canvas');
      previewCanvas.width = 1024;
      previewCanvas.height = 1024;
      const ctx = previewCanvas.getContext('2d');
      if (!ctx) return;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 1024, 1024);
      drawQrFrame(ctx, 48, 48, 928, qrImg, logoImg, accent, qrStyle, showLogo);
      setQrPreviewDataUrl(previewCanvas.toDataURL('image/png'));
    };
    drawPreview();
    return () => { active = false; };
  }, [qrDataUrl, logoDataUrl, accent, qrStyle, showLogo]);

  useEffect(() => {
    let active = true;
    setIsCanvasReady(false);
    const draw = async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const dims = canvasDimensions(printSize);
      canvas.width = dims.width;
      canvas.height = dims.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const [qrImg, logoImg] = await Promise.all([loadImage(qrDataUrl), loadImage(logoDataUrl)]);
      if (!active) return;
      drawProduct(ctx, canvas, {
        templateId,
        businessName: clampText(businessName, 36),
        headline: clampText(headline, 28) || 'Review us on',
        ctaText: clampText(ctaText, 32) || 'Scan QR to leave a review',
        accent,
        qrStyle,
        showStars,
        showLogo,
        printSize
      }, qrImg, logoImg);
      setIsCanvasReady(true);
    };
    draw();
    return () => { active = false; };
  }, [qrDataUrl, logoDataUrl, templateId, businessName, headline, ctaText, accent, qrStyle, showStars, showLogo, printSize]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(''), 1800);
    return () => clearTimeout(timer);
  }, [toast]);

  const showToast = (message) => setToast(message);

  const onLogoUpload = (event) => {
    const input = event.target;
    const file = input.files?.[0];
    if (!file) return;
    const allowedTypes = ['image/png', 'image/jpeg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      showToast('Please upload PNG, JPG or WebP');
      input.value = '';
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      showToast('Logo must be under 3 MB');
      input.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setLogoDataUrl(String(reader.result || ''));
      input.value = '';
      showToast('Logo added safely');
    };
    reader.onerror = () => {
      input.value = '';
      showToast('Logo upload failed. Try another PNG, JPG or WebP.');
    };
    reader.readAsDataURL(file);
  };

  const clearLogo = () => {
    setLogoDataUrl('');
    showToast('Logo removed');
  };

  const handleTemplateSelect = (template) => {
    setTemplateId(template.id);
    if (template.defaultSize) setPrintSizeId(template.defaultSize);
    showToast(`${template.name} template selected`);
  };

  const downloadQrPng = () => {
    if (!qrPreviewDataUrl) {
      showToast('QR is still generating');
      return;
    }
    try {
      downloadDataUrl(qrPreviewDataUrl, 'bharathqr-google-review-qr.png');
    } catch (error) {
      showToast('QR download failed. Try again.');
    }
  };

  const shareReviewLink = () => {
    if (!linkLooksValid) {
      showToast('Paste a valid review link first');
      return;
    }
    const text = encodeURIComponent(`Please review us on Google: ${actionUrl}`);
    window.open(`https://wa.me/?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  const downloadFinalPng = () => {
    const canvas = canvasRef.current;
    if (!canvas || !isCanvasReady) {
      showToast('Preview is still loading');
      return;
    }
    try {
      downloadDataUrl(canvas.toDataURL('image/png'), `bharathqr-google-review-${selectedTemplate.id}.png`);
    } catch (error) {
      showToast('PNG export failed. Remove unsupported logo and try again.');
    }
  };

  const downloadFinalPdf = () => {
    const canvas = canvasRef.current;
    if (!canvas || !isCanvasReady) {
      showToast('Preview is still loading');
      return;
    }
    try {
      const blob = createPdfBlobFromCanvas(canvas, printSize);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bharathqr-google-review-${selectedTemplate.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      showToast('PDF export failed. Remove unsupported logo and try again.');
    }
  };

  const softwareSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'BharathQR Google Review QR Generator',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    url: 'https://www.bharathqr.com/tools/google-review-qr-generator',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
    featureList: ['Google Review QR code generator', 'Logo upload', 'Print-ready templates', 'High-resolution PNG and PDF downloads']
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.bharathqr.com/' },
      { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://www.bharathqr.com/tools' },
      { '@type': 'ListItem', position: 3, name: 'Google Review QR Generator', item: 'https://www.bharathqr.com/tools/google-review-qr-generator' }
    ]
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      { '@type': 'Question', name: 'Is this Google Review QR Generator free?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. BharathQR lets Indian businesses create Google Review QR codes with logo and print-ready templates for free.' } },
      { '@type': 'Question', name: 'Can I add my business logo?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Upload your logo and it appears safely inside the QR and selected template without cropping or stretching.' } },
      { '@type': 'Question', name: 'Can I download print-ready files?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. You can download the final design as PNG or PDF from the live product preview.' } }
    ]
  };

  return (
    <>
      <Head>
        <title>Google Review QR Code Generator with Logo & Templates | BharathQR</title>
        <meta name="description" content="Create a premium Google Review QR code with logo, choose from 5 print-ready templates and download PNG or PDF assets for Indian businesses." />
        <link rel="canonical" href="https://www.bharathqr.com/tools/google-review-qr-generator" />
        <meta property="og:title" content="Google Review QR Code Generator with Logo & Templates | BharathQR" />
        <meta property="og:description" content="Turn every customer visit into a Google review with a free QR generator, live template preview and print-ready PNG/PDF downloads." />
        <meta property="og:url" content="https://www.bharathqr.com/tools/google-review-qr-generator" />
        <meta property="og:image" content="https://www.bharathqr.com/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Google Review QR Code Generator with Logo & Templates | BharathQR" />
        <meta name="twitter:description" content="Create a Google Review QR code with logo, choose a print-ready template, and download PNG/PDF assets." />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      </Head>
      <style jsx global>{`
        #__next > header:first-child { display: none !important; }
        #__next > footer { display: none !important; }
      `}</style>
      <header className={styles.localTopbar}>
        <div className={styles.localNav}>
          <Link href="/" className={styles.localBrand}><span className={styles.localMark}>BQ</span><b>Bharath<span>QR</span></b></Link>
          <div className={styles.localNavActions}>
            <a href="#template-studio">View Templates</a>
            <button type="button" aria-label="Menu" aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}><i /></button>
          </div>
        </div>
      </header>
      {menuOpen && (
        <nav className={styles.localMenu} aria-label="Tool page menu">
          <a href="#qr-generator" onClick={() => setMenuOpen(false)}>QR Generator</a>
          <a href="#template-studio" onClick={() => setMenuOpen(false)}>Templates</a>
          <a href="#finished-products" onClick={() => setMenuOpen(false)}>Finished Products</a>
          <a href="#review-guide" onClick={() => setMenuOpen(false)}>Guide</a>
        </nav>
      )}

      <main className={styles.page}>
        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <h1>Turn Every Customer Visit Into a <span>5★</span> <b><i>G</i><i>o</i><i>o</i><i>g</i><i>l</i><i>e</i></b> Review</h1>
            <p>Create a premium Google Review QR code with your logo. Choose from beautiful templates and download print-ready assets in seconds.</p>
            <div className={styles.trustPills}>
              <span>🎁 100% Free</span>
              <span>👤 No Sign-up</span>
              <span>🖨️ Print Ready</span>
            </div>
          </div>
          <div className={styles.heroArt} aria-hidden="true">
            <div className={styles.heroCircle} />
            <div className={styles.heroStandee}>
              <div className={styles.heroLogo}>{logoDataUrl ? <img src={logoDataUrl} alt="Uploaded business logo" /> : <>YOUR<br />LOGO</>}</div>
              <strong>Review us on</strong>
              <span className={styles.heroGoogle}><i>G</i><i>o</i><i>o</i><i>g</i><i>l</i><i>e</i></span>
              <span className={styles.heroStars}>★★★★★</span>
              <div className={styles.heroQrBox}>{qrPreviewDataUrl && <img src={qrPreviewDataUrl} alt="" />}</div>
              <em>Scan QR to leave a review</em>
            </div>
            <div className={styles.plant}><span /><span /><span /><span /><b /></div>
          </div>
        </section>

        <section className={styles.workflow} aria-label="Google review QR workflow">
          <div><strong>1</strong><span>▦</span><h2>Create QR<br />With Logo</h2><p>Generate your Google Review QR code with your logo</p></div>
          <i />
          <div><strong>2</strong><span>▧</span><h2>Choose<br />Template</h2><p>Pick an eye-catching template that fits your business</p></div>
          <i />
          <div><strong>3</strong><span>▤</span><h2>Print<br />Ready</h2><p>Download print-ready files and start getting reviews</p></div>
        </section>

        <section id="qr-generator" className={styles.qrPanel} aria-label="QR generator">
          <div className={styles.qrForm}>
            <div className={styles.sectionTitle}><span>1</span><h2>QR Generator</h2></div>
            <label>Google review link</label>
            <input value={reviewUrl} onChange={(e) => setReviewUrl(e.target.value)} placeholder="https://g.page/r/your-business/review" aria-invalid={!linkLooksValid} aria-describedby="review-link-status" />
            <div id="review-link-status" className={styles.linkStatus} aria-live="polite"><span className={linkLooksValid ? styles.goodDot : styles.warnDot} />{linkStatusText}</div>
            <label>Upload logo (optional)</label>
            <label className={styles.uploadBox}>
              <input type="file" accept="image/png,image/jpeg,image/webp" onChange={onLogoUpload} />
              <span className={styles.uploadIcon}>{logoDataUrl ? <img src={logoDataUrl} alt="Uploaded logo preview" /> : '▧'}</span><b>{logoDataUrl ? 'Change Logo' : 'Upload logo'}<small>PNG/JPG/WebP · appears in QR + template</small></b><i>›</i>
            </label>
            {logoDataUrl && <button type="button" className={styles.clearLogoBtn} onClick={clearLogo}>Remove logo</button>}
          </div>
          <div className={styles.qrPreviewBlock}>
            <b>Preview</b>
            <div className={styles.qrPreviewCard}>
              <span>LIVE QR PREVIEW</span>
              {qrPreviewDataUrl && <img src={qrPreviewDataUrl} alt="Generated Google Review QR" />}
              <small>High-resolution QR PNG</small>
            </div>
          </div>
          <div className={styles.qrStyles}>
            <b>Eye-catching QR style</b>
            <div>
              {QR_STYLES.map((item) => (
                <button key={item.id} type="button" onClick={() => setQrStyle(item.id)} className={qrStyle === item.id ? styles.activeStyle : ''} aria-pressed={qrStyle === item.id} aria-label={`Use ${item.label} QR style`}>
                  <span>{item.icon}</span>{item.label}
                </button>
              ))}
            </div>
          </div>
          <div className={styles.qrActions}>
            <button type="button" onClick={downloadQrPng} disabled={!qrPreviewDataUrl}>⇩ Download QR PNG</button>
            <button type="button" onClick={shareReviewLink} className={!canShareReviewLink ? styles.needsLink : ''}>{shareButtonLabel}</button>
          </div>
        </section>

        <section id="template-studio" className={styles.studioGrid}>
          <article className={styles.studioPanel}>
            <div className={styles.sectionTitle}><span>2</span><h2>Template Studio</h2></div>
            <p>Choose a template and customize it</p>
            <div className={styles.templateGrid}>
              {TEMPLATES.map((template) => <TemplateThumb key={template.id} template={template} qrDataUrl={qrPreviewDataUrl || qrDataUrl} active={templateId === template.id} onClick={() => handleTemplateSelect(template)} />)}
            </div>
            <div className={styles.editorTabs}>
              <button type="button" onClick={() => setActiveEditorTab('text')} className={activeEditorTab === 'text' ? styles.activeEditorTab : ''} aria-pressed={activeEditorTab === 'text'}>Edit Text</button>
              <button type="button" onClick={() => setActiveEditorTab('colors')} className={activeEditorTab === 'colors' ? styles.activeEditorTab : ''} aria-pressed={activeEditorTab === 'colors'}>Colors</button>
            </div>
            {activeEditorTab === 'text' ? (
              <div className={styles.editorGrid}>
                <label>Business / shop name<input maxLength={28} value={businessName} onChange={(e) => setBusinessName(e.target.value)} /></label>
                <label>Headline<input maxLength={24} value={headline} onChange={(e) => setHeadline(e.target.value)} /></label>
                <label>CTA text<input maxLength={30} value={ctaText} onChange={(e) => setCtaText(e.target.value)} /></label>
                <label>Show stars<select value={showStars ? 'show' : 'hide'} onChange={(e) => setShowStars(e.target.value === 'show')}><option value="show">Show stars</option><option value="hide">Hide stars</option></select></label>
                <label>Show logo area<select value={showLogo ? 'show' : 'hide'} onChange={(e) => setShowLogo(e.target.value === 'show')}><option value="show">Show logo</option><option value="hide">Hide logo</option></select></label>
              </div>
            ) : (
              <div className={`${styles.editorGrid} ${styles.colorEditor}`}>
                <label>Accent color<div className={styles.swatches}>{['#ff5a1f', '#1a73e8', '#7c3aed', '#050505'].map((color) => <button key={color} aria-label={`Set accent ${color}`} type="button" onClick={() => setAccent(color)} className={accent === color ? styles.activeSwatch : ''} style={{ background: color }} />)}</div></label>
                <p>Choose a high-contrast accent. QR output stays black-on-white for reliable scanning.</p>
              </div>
            )}
            <div className={styles.printSizes}>{PRINT_SIZES.map((size) => <button type="button" key={size.id} onClick={() => setPrintSizeId(size.id)} className={printSizeId === size.id ? styles.activeSize : ''} aria-pressed={printSizeId === size.id} aria-label={`Use ${size.name} ${size.label} size ${size.mm}`}><b>{size.name}</b><small>{size.label}</small></button>)}</div>
          </article>

          <aside className={styles.productPanel}>
            <div className={styles.productHead}><h2>LIVE PRODUCT PREVIEW</h2><span>LIVE</span></div>
            <div className={styles.canvasShell}><canvas id="templateCanvas" ref={canvasRef} className={styles.templateCanvas} role="img" aria-label="Live Google Review QR product preview" /></div>
            <div className={styles.productMeta}><span>{printSize.name} {printSize.label}</span><i /> <span>{printSize.mm}</span><br /><b>Template: {selectedTemplate.label}</b></div>
            <div className={styles.finalShare}><button type="button" onClick={shareReviewLink} className={!canShareReviewLink ? styles.needsLink : ''}>{shareButtonLabel}</button></div>
            <div className={styles.finalActions}><button type="button" onClick={downloadFinalPng} disabled={!qrDataUrl || !isCanvasReady}>⇩ Download PNG</button><button type="button" onClick={downloadFinalPdf} disabled={!qrDataUrl || !isCanvasReady}>⇩ Download PDF</button></div>
          </aside>
        </section>

        <section className={styles.featurePanel} aria-label="Google Review QR generator benefits">
          <article><span>📱</span><b>Mobile Friendly</b><p>Clean stacked layout that stays readable on small screens.</p></article>
          <article><span>🖼️</span><b>Your Logo, Clear & Visible</b><p>Larger logo preview with safe contain-fit placement.</p></article>
          <article><span>▦</span><b>Bigger QR Preview</b><p>Preview the QR clearly before downloading or printing.</p></article>
          <article><span>T</span><b>Simple & Clean UI</b><p>Less clutter, better spacing and stronger visual hierarchy.</p></article>
          <article><span>⇩</span><b>Print-Ready Downloads</b><p>Export high-quality PNG and PDF files from the live canvas.</p></article>
          <article><span>💬</span><b>Share via WhatsApp</b><p>Share your Google review link instantly with customers.</p></article>
        </section>

        <section id="finished-products" className={styles.products}>
          <div className={styles.productsHead}><h2>Finished Products You Can Print</h2><a href="#template-studio">View All Templates</a></div>
          <div>
            {TEMPLATES.map((template) => <FinishedProductMock key={template.id} template={template} qrDataUrl={qrPreviewDataUrl} />)}
          </div>
        </section>

        <section id="review-guide" className={styles.seoBlock}>
          <div>
            <h2>Why Google Review QR codes help local businesses</h2>
            <p>Most happy customers leave without searching for your business later. A Google Review QR code gives them one simple scan path from your counter, table, reception desk, bill folder or packaging to your review page.</p>
          </div>
          <div>
            <h3>Use it ethically</h3>
            <p>Ask for honest reviews, never offer rewards for reviews, and place the QR where genuine customers can scan after a real visit.</p>
          </div>
          <div>
            <h3>Related Review Growth pages</h3>
            <div className={styles.relatedLinks}>{RELATED_LINKS.map((link) => <Link href={link.href} key={link.href}>{link.title} →</Link>)}</div>
          </div>
          <div className={styles.faqMini}>
            <details><summary>Is this Google Review QR Generator free?</summary><p>Yes. You can create a Google Review QR code and download print-ready files without login.</p></details>
            <details><summary>Can I add my logo?</summary><p>Yes. The logo is contained safely, centered and never cropped or stretched.</p></details>
            <details><summary>Will the QR remain scannable?</summary><p>The QR is generated with high correction level, quiet zone and strong contrast to keep scans reliable.</p></details>
          </div>
        </section>
      </main>
      {toast && <div className={styles.toast} role="status" aria-live="polite">{toast}</div>}
    </>
  );
}
