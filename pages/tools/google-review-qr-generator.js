// force fresh google review v15 deployment
import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import styles from '../../styles/GoogleReviewQRGenerator.module.css';

const CANONICAL_URL = 'https://www.bharathqr.com/tools/google-review-qr-generator';
const DEFAULT_REVIEW_LINK = 'https://g.page/r/your-business/review';

const QR_STYLES = [
  { id: 'clean', label: 'Clean', icon: '▦' },
  { id: 'google', label: 'Google Colors', icon: 'G' },
  { id: 'gradient', label: 'Gradient', icon: '▧' },
  { id: 'badge', label: 'Badge', icon: '★' },
  { id: 'rounded', label: 'Rounded', icon: '▣' },
  { id: 'dots', label: 'Dots', icon: '⠿' }
];

const PRINT_SIZES = [
  { id: 'a6', name: 'A6 Postcard', short: 'A6', label: 'Postcard', mm: '105 × 148 mm', inch: '4.13 × 5.83 in', widthMm: 105, heightMm: 148 },
  { id: 'a5', name: 'A5 Flyer', short: 'A5', label: 'Flyer', mm: '148 × 210 mm', inch: '5.83 × 8.27 in', widthMm: 148, heightMm: 210 },
  { id: 'square', name: 'Square Sticker', short: 'Square', label: 'Sticker', mm: '100 × 100 mm', inch: '3.94 × 3.94 in', widthMm: 100, heightMm: 100 },
  { id: 'round', name: 'Round Sticker', short: 'Round', label: 'Sticker', mm: '90 × 90 mm', inch: '3.54 × 3.54 in', widthMm: 90, heightMm: 90 },
  { id: 'tent', name: 'Table Tent / Standee', short: 'Tent', label: 'Standee', mm: '100 × 150 mm', inch: '3.94 × 5.91 in', widthMm: 100, heightMm: 150 }
];

const PRINT_SIZE_BY_ID = PRINT_SIZES.reduce((acc, item) => ({ ...acc, [item.id]: item }), {});

const TEMPLATES = [
  { id: 'simple', name: 'Table Tent', label: 'Simple', fullName: 'Table Tent Simple', defaultSize: 'tent', tone: 'light' },
  { id: 'premium', name: 'Acrylic Standee', label: 'Premium', fullName: 'Acrylic Standee Premium', defaultSize: 'tent', tone: 'dark' },
  { id: 'thankYou', name: 'Review Card', label: 'Thank You', fullName: 'Review Card Thank You', defaultSize: 'a6', tone: 'light' },
  { id: 'round', name: 'Round Sticker', label: 'Circle', fullName: 'Round Sticker Circle', defaultSize: 'round', tone: 'round' },
  { id: 'feedback', name: 'Black Feedback Card', label: 'Elegant', fullName: 'Black Feedback Card Elegant', defaultSize: 'a6', tone: 'dark' }
];

const ACCENTS = ['#ff4a1c', '#1a73e8', '#7c3aed', '#f59e0b', '#111827'];

const RELATED_LINKS = [
  { href: '/tools/whatsapp-qr-generator', title: 'WhatsApp QR Generator' },
  { href: '/tools/url-qr-generator', title: 'URL QR Generator' },
  { href: '/templates/google-review-poster', title: 'Google Review Poster Template' },
  { href: '/templates/clinic-review-qr-poster', title: 'Clinic Review QR Poster' },
  { href: '/solutions/restaurants', title: 'Restaurant QR Solutions' },
  { href: '/solutions/clinics', title: 'Clinic QR Solutions' },
  { href: '/solutions/salons', title: 'Salon QR Solutions' },
  { href: '/blog/2026-06-10-google-review-qr-code-generator-for-restaurants-co', title: 'Restaurant Google Review QR Guide' }
];

function clampText(value, max = 80) {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, max);
}

function safeUrl(value) {
  const clean = clampText(value, 400);
  if (!clean) return DEFAULT_REVIEW_LINK;
  return /^https?:\/\//i.test(clean) ? clean : `https://${clean}`;
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
  return host === 'g.page' || host.endsWith('.g.page') || host === 'maps.app.goo.gl' || host.endsWith('.google.com') || text.includes('writereview') || text.includes('/review') || text.includes('lrd=');
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1200);
}

function downloadDataUrl(dataUrl, filename) {
  const anchor = document.createElement('a');
  anchor.href = dataUrl;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}

function canvasToBlob(canvas, type = 'image/png', quality = 0.96) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Canvas export failed'));
    }, type, quality);
  });
}

function dataUrlToBytes(dataUrl) {
  const base64 = dataUrl.split(',')[1] || '';
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
}

function createPdfBlobFromCanvas(canvas, printSize) {
  const jpegUrl = canvas.toDataURL('image/jpeg', 0.96);
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
  for (let id = 1; id <= 5; id += 1) addText(`${String(offsets[id]).padStart(10, '0')} 00000 n \n`);
  addText(`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`);
  return new Blob(chunks, { type: 'application/pdf' });
}

function createSvgBlobFromCanvas(canvas, printSize) {
  const dataUrl = canvas.toDataURL('image/png');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${printSize.widthMm}mm" height="${printSize.heightMm}mm" viewBox="0 0 ${canvas.width} ${canvas.height}"><image href="${dataUrl}" x="0" y="0" width="${canvas.width}" height="${canvas.height}" preserveAspectRatio="xMidYMid meet"/></svg>`;
  return new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
}

function loadImage(src) {
  return new Promise((resolve) => {
    if (!src) {
      resolve(null);
      return;
    }
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function roundRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function drawContainedImage(ctx, img, x, y, width, height, radius = 0) {
  if (!img) return;
  ctx.save();
  if (radius) {
    roundRect(ctx, x, y, width, height, radius);
    ctx.clip();
  }
  const ratio = Math.min(width / img.width, height / img.height);
  const targetWidth = img.width * ratio;
  const targetHeight = img.height * ratio;
  const targetX = x + (width - targetWidth) / 2;
  const targetY = y + (height - targetHeight) / 2;
  ctx.drawImage(img, targetX, targetY, targetWidth, targetHeight);
  ctx.restore();
}

function applyFont(ctx, size, weight = 800, family = 'Arial, Helvetica, sans-serif') {
  ctx.font = `${weight} ${Math.round(size)}px ${family}`;
}

function drawFittedText(ctx, text, x, y, maxWidth, startSize, minSize, options = {}) {
  const value = clampText(text, options.maxChars || 80);
  if (!value) return minSize;
  const weight = options.weight || 800;
  const family = options.family || 'Arial, Helvetica, sans-serif';
  let size = startSize;
  applyFont(ctx, size, weight, family);
  while (size > minSize && ctx.measureText(value).width > maxWidth) {
    size -= 1;
    applyFont(ctx, size, weight, family);
  }
  let output = value;
  while (output.length > 4 && ctx.measureText(`${output}…`).width > maxWidth) output = output.slice(0, -1);
  ctx.save();
  ctx.fillStyle = options.color || '#111827';
  ctx.textAlign = options.align || 'center';
  ctx.textBaseline = options.baseline || 'middle';
  applyFont(ctx, size, weight, family);
  ctx.fillText(output.length < value.length ? `${output}…` : output, x, y);
  ctx.restore();
  return size;
}

function splitLines(ctx, text, maxWidth, maxLines) {
  const words = clampText(text, 140).split(' ').filter(Boolean);
  if (!words.length) return [];
  const lines = [];
  let line = '';
  words.forEach((word) => {
    const candidate = line ? `${line} ${word}` : word;
    if (ctx.measureText(candidate).width <= maxWidth || !line) {
      line = candidate;
    } else {
      lines.push(line);
      line = word;
    }
  });
  if (line) lines.push(line);
  const output = lines.slice(0, maxLines);
  if (lines.length > maxLines && output.length) {
    let last = output[output.length - 1];
    while (last.length > 4 && ctx.measureText(`${last}…`).width > maxWidth) last = last.slice(0, -1);
    output[output.length - 1] = `${last}…`;
  }
  return output;
}

function drawSmartText(ctx, text, x, y, maxWidth, startSize, minSize, options = {}) {
  const value = clampText(text, options.maxChars || 100);
  if (!value) return { height: 0, size: minSize, lines: 0 };
  const maxLines = options.maxLines || 2;
  const weight = options.weight || 800;
  const color = options.color || '#111827';
  const align = options.align || 'center';
  const family = options.family || 'Arial, Helvetica, sans-serif';
  const lineRatio = options.lineRatio || 1.16;

  for (let size = startSize; size >= minSize; size -= 1) {
    applyFont(ctx, size, weight, family);
    const lines = splitLines(ctx, value, maxWidth, maxLines);
    if (lines.length <= maxLines && lines.every((line) => ctx.measureText(line).width <= maxWidth)) {
      const lineHeight = size * lineRatio;
      const firstY = y - ((lines.length - 1) * lineHeight) / 2;
      ctx.save();
      ctx.fillStyle = color;
      ctx.textAlign = align;
      ctx.textBaseline = 'middle';
      applyFont(ctx, size, weight, family);
      lines.forEach((line, index) => ctx.fillText(line, x, firstY + index * lineHeight));
      ctx.restore();
      return { height: lineHeight * lines.length, size, lines: lines.length };
    }
  }
  drawFittedText(ctx, value, x, y, maxWidth, minSize, minSize, { weight, color, align, family });
  return { height: minSize * lineRatio, size: minSize, lines: 1 };
}

function drawGoogleWord(ctx, x, y, size, align = 'center') {
  const letters = [
    ['G', '#4285F4'], ['o', '#EA4335'], ['o', '#FBBC05'], ['g', '#4285F4'], ['l', '#34A853'], ['e', '#EA4335']
  ];
  ctx.save();
  applyFont(ctx, size, 700, 'Arial, Helvetica, sans-serif');
  ctx.textBaseline = 'middle';
  const spacing = size * 0.065;
  const widths = letters.map(([letter]) => ctx.measureText(letter).width);
  const total = widths.reduce((sum, width) => sum + width, 0) + spacing * (letters.length - 1);
  let current = align === 'center' ? x - total / 2 : x;
  letters.forEach(([letter, color], index) => {
    ctx.fillStyle = color;
    ctx.fillText(letter, current, y);
    current += widths[index] + spacing;
  });
  ctx.restore();
}

function drawStars(ctx, x, y, size, show = true) {
  if (!show) return;
  ctx.save();
  ctx.fillStyle = '#f7b500';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  applyFont(ctx, size, 760, 'Arial, Helvetica, sans-serif');
  ctx.fillText('★★★★★', x, y);
  ctx.restore();
}

function canvasDimensions(printSize) {
  if (printSize.id === 'round' || printSize.id === 'square') return { width: 1400, height: 1400 };
  const width = 1400;
  return { width, height: Math.round(width * (printSize.heightMm / printSize.widthMm)) };
}

function drawLogoBadge(ctx, logoImg, x, y, size, options = {}) {
  const visible = options.visible !== false;
  if (!visible) return;
  ctx.save();
  ctx.shadowColor = options.shadow || 'rgba(17,24,39,.10)';
  ctx.shadowBlur = size * 0.075;
  ctx.shadowOffsetY = size * 0.03;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(x, y, size / 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.lineWidth = Math.max(3, size * 0.032);
  ctx.strokeStyle = options.stroke || '#ff4a1c';
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x, y, size * 0.34, 0, Math.PI * 2);
  ctx.clip();
  if (logoImg) {
    drawContainedImage(ctx, logoImg, x - size * 0.31, y - size * 0.31, size * 0.62, size * 0.62);
  } else {
    ctx.fillStyle = '#111827';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    applyFont(ctx, size * 0.135, 850);
    ctx.fillText('YOUR', x, y - size * 0.065);
    ctx.fillText('LOGO', x, y + size * 0.11);
  }
  ctx.restore();
}

function drawCornerMarks(ctx, x, y, size, styleId, accent) {
  const cornerLength = size * 0.22;
  const line = Math.max(10, size * 0.035);
  const radius = line * 0.55;
  const colors = styleId === 'clean'
    ? ['#111827', '#111827', '#111827', '#111827']
    : styleId === 'gradient'
      ? [accent, '#f59e0b', '#22c55e', '#1a73e8']
      : ['#EA4335', '#FBBC05', '#34A853', '#1A73E8'];
  const corners = [
    { color: colors[0], sx: x, sy: y, kind: 'tl' },
    { color: colors[1], sx: x + size - cornerLength, sy: y, kind: 'tr' },
    { color: colors[2], sx: x, sy: y + size - cornerLength, kind: 'bl' },
    { color: colors[3], sx: x + size - cornerLength, sy: y + size - cornerLength, kind: 'br' }
  ];
  ctx.save();
  ctx.lineWidth = line;
  ctx.lineCap = styleId === 'rounded' ? 'round' : 'square';
  corners.forEach((corner) => {
    ctx.strokeStyle = corner.color;
    ctx.beginPath();
    if (corner.kind === 'tl') {
      ctx.moveTo(corner.sx, corner.sy + cornerLength); ctx.lineTo(corner.sx, corner.sy + radius); ctx.arcTo(corner.sx, corner.sy, corner.sx + radius, corner.sy, radius); ctx.lineTo(corner.sx + cornerLength, corner.sy);
    }
    if (corner.kind === 'tr') {
      ctx.moveTo(corner.sx, corner.sy); ctx.lineTo(corner.sx + cornerLength - radius, corner.sy); ctx.arcTo(corner.sx + cornerLength, corner.sy, corner.sx + cornerLength, corner.sy + radius, radius); ctx.lineTo(corner.sx + cornerLength, corner.sy + cornerLength);
    }
    if (corner.kind === 'bl') {
      ctx.moveTo(corner.sx + cornerLength, corner.sy + cornerLength); ctx.lineTo(corner.sx + radius, corner.sy + cornerLength); ctx.arcTo(corner.sx, corner.sy + cornerLength, corner.sx, corner.sy + cornerLength - radius, radius); ctx.lineTo(corner.sx, corner.sy);
    }
    if (corner.kind === 'br') {
      ctx.moveTo(corner.sx, corner.sy + cornerLength); ctx.lineTo(corner.sx + cornerLength - radius, corner.sy + cornerLength); ctx.arcTo(corner.sx + cornerLength, corner.sy + cornerLength, corner.sx + cornerLength, corner.sy + cornerLength - radius, radius); ctx.lineTo(corner.sx + cornerLength, corner.sy);
    }
    ctx.stroke();
  });
  ctx.restore();
}

function drawQrFrame(ctx, x, y, size, qrImg, logoImg, accent, styleId, showLogo) {
  ctx.save();
  if (styleId === 'gradient') {
    const glow = ctx.createRadialGradient(x + size / 2, y + size / 2, size * 0.2, x + size / 2, y + size / 2, size * 0.72);
    glow.addColorStop(0, 'rgba(255,74,28,0.15)');
    glow.addColorStop(1, 'rgba(26,115,232,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(x - size * 0.08, y - size * 0.08, size * 1.16, size * 1.16);
  }

  const radius = styleId === 'rounded' ? size * 0.08 : size * 0.035;
  ctx.fillStyle = '#ffffff';
  roundRect(ctx, x, y, size, size, radius);
  ctx.fill();

  if (styleId === 'dots') {
    ctx.save();
    ctx.fillStyle = 'rgba(17,24,39,.08)';
    for (let px = x + size * 0.06; px < x + size * 0.94; px += size * 0.12) {
      for (let py = y + size * 0.06; py < y + size * 0.94; py += size * 0.12) {
        ctx.beginPath();
        ctx.arc(px, py, size * 0.006, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  const quiet = size * 0.085;
  const qrSize = size - quiet * 2;
  if (qrImg) {
    ctx.drawImage(qrImg, x + quiet, y + quiet, qrSize, qrSize);
  } else {
    ctx.fillStyle = '#111827';
    roundRect(ctx, x + quiet, y + quiet, qrSize, qrSize, size * 0.02);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    applyFont(ctx, size * 0.08, 900);
    ctx.fillText('QR', x + size / 2, y + size / 2);
  }

  drawCornerMarks(ctx, x, y, size, styleId, accent);

  if (styleId === 'badge') {
    ctx.save();
    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.arc(x + size * 0.82, y + size * 0.18, size * 0.08, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    applyFont(ctx, size * 0.07, 900);
    ctx.fillText('★', x + size * 0.82, y + size * 0.18 + size * 0.004);
    ctx.restore();
  }

  if (showLogo) {
    const badgeSize = size * 0.235;
    drawLogoBadge(ctx, logoImg, x + size / 2, y + size / 2, badgeSize, { stroke: accent });
  }
  ctx.restore();
}

function drawBusinessSignature(ctx, text, x, y, maxWidth, baseSize, color, dark = false) {
  const value = clampText(text, 36);
  if (!value || value === 'Your Business Name') return;
  ctx.save();
  const size = drawFittedText(ctx, value, x, y, maxWidth, baseSize, baseSize * 0.62, {
    color,
    weight: 760,
    family: 'Trebuchet MS, Arial, Helvetica, sans-serif',
    maxChars: 36
  });
  const underlineWidth = Math.min(maxWidth * 0.45, ctx.measureText(value).width * 0.72);
  ctx.strokeStyle = dark ? 'rgba(255,255,255,.32)' : 'rgba(255,74,28,.38)';
  ctx.lineWidth = Math.max(2, size * 0.06);
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x - underlineWidth / 2, y + size * 0.74);
  ctx.lineTo(x + underlineWidth / 2, y + size * 0.74);
  ctx.stroke();
  ctx.restore();
}

function drawProductBackground(ctx, w, h, template, accent) {
  const isDark = template.id === 'premium' || template.id === 'feedback';
  const isRound = template.id === 'round';
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, w, h);

  if (isRound) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, Math.min(w, h) * 0.465, 0, Math.PI * 2);
    ctx.clip();
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.55, '#fffaf4');
    grad.addColorStop(1, '#fff1e8');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
    return;
  }

  const pad = Math.max(20, w * 0.035);
  ctx.save();
  roundRect(ctx, pad, pad, w - pad * 2, h - pad * 2, w * 0.03);
  ctx.clip();
  if (isDark) {
    const darkGrad = ctx.createLinearGradient(0, 0, w, h);
    darkGrad.addColorStop(0, '#050505');
    darkGrad.addColorStop(0.58, template.id === 'feedback' ? '#121212' : '#08080b');
    darkGrad.addColorStop(1, template.id === 'feedback' ? '#321406' : '#191018');
    ctx.fillStyle = darkGrad;
  } else if (template.id === 'thankYou') {
    const lightGrad = ctx.createLinearGradient(0, 0, w, h);
    lightGrad.addColorStop(0, '#ffffff');
    lightGrad.addColorStop(0.55, '#fffdf8');
    lightGrad.addColorStop(1, '#fff5ec');
    ctx.fillStyle = lightGrad;
  } else {
    ctx.fillStyle = '#ffffff';
  }
  ctx.fillRect(0, 0, w, h);

  if (!isDark) {
    ctx.strokeStyle = 'rgba(255,74,28,.10)';
    ctx.lineWidth = Math.max(4, w * 0.005);
    roundRect(ctx, pad + w * 0.025, pad + w * 0.025, w - pad * 2 - w * 0.05, h - pad * 2 - w * 0.05, w * 0.022);
    ctx.stroke();
  } else {
    ctx.strokeStyle = 'rgba(255,255,255,.12)';
    ctx.lineWidth = Math.max(4, w * 0.006);
    roundRect(ctx, pad + w * 0.025, pad + w * 0.025, w - pad * 2 - w * 0.05, h - pad * 2 - w * 0.05, w * 0.022);
    ctx.stroke();
  }

  if (template.id === 'premium') {
    ctx.fillStyle = 'rgba(251,188,5,.12)';
    ctx.beginPath();
    ctx.arc(w * 0.88, h * 0.12, w * 0.16, 0, Math.PI * 2);
    ctx.fill();
  }
  if (template.id === 'feedback') {
    ctx.fillStyle = 'rgba(255,74,28,.16)';
    ctx.beginPath();
    ctx.arc(w * 0.16, h * 0.16, w * 0.13, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  if (isRound) {
    const r = Math.min(w, h) * 0.405;
    ctx.lineWidth = w * 0.018;
    ctx.lineCap = 'round';
    ctx.beginPath(); ctx.strokeStyle = '#34A853'; ctx.arc(w / 2, h / 2, r, Math.PI * 0.74, Math.PI * 1.38); ctx.stroke();
    ctx.beginPath(); ctx.strokeStyle = '#EA4335'; ctx.arc(w / 2, h / 2, r, Math.PI * 1.40, Math.PI * 1.86); ctx.stroke();
    ctx.beginPath(); ctx.strokeStyle = '#FBBC05'; ctx.arc(w / 2, h / 2, r, Math.PI * 1.87, Math.PI * 2.24); ctx.stroke();
    ctx.beginPath(); ctx.strokeStyle = '#4285F4'; ctx.arc(w / 2, h / 2, r, Math.PI * 0.24, Math.PI * 0.72); ctx.stroke();
  }
}

function drawProduct(ctx, canvas, state, qrImg, logoImg) {
  const w = canvas.width;
  const h = canvas.height;
  const template = TEMPLATES.find((item) => item.id === state.templateId) || TEMPLATES[0];
  const isDark = template.id === 'premium' || template.id === 'feedback';
  const isRound = template.id === 'round' || state.printSize.id === 'round';
  const isCompact = h <= w * 1.15;
  const ink = isDark ? '#ffffff' : '#111827';
  const muted = isDark ? '#e5e7eb' : '#334155';
  const center = w / 2;

  drawProductBackground(ctx, w, h, template, state.accent);

  ctx.save();
  if (isRound) {
    ctx.beginPath();
    ctx.arc(center, h / 2, Math.min(w, h) * 0.465, 0, Math.PI * 2);
    ctx.clip();
  } else {
    const clipPad = Math.max(22, w * 0.034);
    roundRect(ctx, clipPad, clipPad, w - clipPad * 2, h - clipPad * 2, w * 0.03);
    ctx.clip();
  }

  const businessText = clampText(state.businessName, 36);
  const headlineText = clampText(state.headline, 34) || (isDark ? 'Share your experience on' : 'Review us on');
  const ctaText = clampText(state.ctaText, 42) || 'Scan QR to leave a review';

  let logoY;
  let logoSize;
  let businessY;
  let headlineY;
  let googleY;
  let starsY;
  let qrY;
  let qrSize;
  let ctaY;

  if (isRound) {
    logoY = h * 0.185;
    logoSize = w * 0.105;
    businessY = h * 0.285;
    headlineY = h * 0.365;
    googleY = h * 0.445;
    starsY = h * 0.515;
    qrSize = Math.min(w * 0.37, h * 0.31);
    qrY = h * 0.56;
    ctaY = Math.min(h * 0.86, qrY + qrSize + w * 0.075);
  } else if (isCompact) {
    logoY = h * 0.105;
    logoSize = w * 0.095;
    businessY = h * 0.195;
    headlineY = h * 0.285;
    googleY = h * 0.37;
    starsY = h * 0.445;
    qrSize = Math.min(w * 0.40, h * 0.30);
    qrY = h * 0.505;
    ctaY = Math.min(h * 0.86, qrY + qrSize + w * 0.07);
  } else {
    logoY = h * 0.105;
    logoSize = w * 0.118;
    businessY = h * 0.205;
    headlineY = h * 0.275;
    googleY = h * 0.345;
    starsY = h * 0.405;
    qrSize = Math.min(w * 0.49, h * 0.325);
    qrY = h * 0.465;
    ctaY = Math.min(h * 0.84, qrY + qrSize + w * 0.075);
  }

  if (state.showLogo) {
    drawLogoBadge(ctx, logoImg, center, logoY, logoSize, {
      stroke: state.accent,
      shadow: isDark ? 'rgba(0,0,0,.34)' : 'rgba(17,24,39,.12)'
    });
  }

  if (businessText && businessText !== 'Your Business Name') {
    drawBusinessSignature(ctx, businessText, center, businessY, w * (isRound ? 0.52 : 0.66), w * (isRound ? 0.032 : 0.034), isDark ? '#ffffff' : '#8f2f11', isDark);
  }

  if (template.id === 'feedback') {
    drawSmartText(ctx, 'YOUR FEEDBACK MATTERS!', center, headlineY - w * 0.035, w * 0.66, w * 0.042, w * 0.023, { color: ink, weight: 780, maxLines: 2, maxChars: 30 });
    drawSmartText(ctx, headlineText, center, headlineY + w * 0.045, w * 0.64, w * 0.028, w * 0.019, { color: muted, weight: 690, maxLines: 1, maxChars: 34 });
  } else {
    drawSmartText(ctx, headlineText, center, headlineY, w * (isRound ? 0.56 : 0.72), w * (isRound ? 0.034 : 0.039), w * 0.021, { color: ink, weight: 720, maxLines: 2, maxChars: 34 });
  }

  drawGoogleWord(ctx, center, googleY, w * (isRound ? 0.078 : isCompact ? 0.076 : 0.092));
  drawStars(ctx, center, starsY, w * (isRound ? 0.036 : isCompact ? 0.040 : 0.045), state.showStars);

  drawQrFrame(ctx, center - qrSize / 2, qrY, qrSize, qrImg, logoImg, state.accent, state.qrStyle, state.showLogo);

  if (isDark) {
    drawSmartText(ctx, ctaText, center, ctaY, w * 0.64, w * 0.030, w * 0.018, { color: '#ffffff', weight: 740, maxLines: 2, maxChars: 42 });
  } else if (isRound) {
    drawSmartText(ctx, ctaText, center, ctaY, w * 0.50, w * 0.024, w * 0.016, { color: muted, weight: 720, maxLines: 2, maxChars: 38 });
  } else {
    const pillWidth = w * (isCompact ? 0.56 : 0.58);
    const pillHeight = w * (isCompact ? 0.062 : 0.064);
    roundRect(ctx, center - pillWidth / 2, ctaY - pillHeight / 2, pillWidth, pillHeight, pillHeight * 0.22);
    ctx.fillStyle = '#1a73e8';
    ctx.fill();
    drawFittedText(ctx, ctaText, center, ctaY, pillWidth * 0.84, w * 0.0235, w * 0.016, { color: '#ffffff', weight: 740, maxChars: 42 });
  }

  if (template.id === 'feedback') {
    drawSmartText(ctx, 'THANK YOU', center, Math.min(h * 0.93, ctaY + w * 0.09), w * 0.54, w * 0.024, w * 0.017, { color: '#fbbf24', weight: 760, maxLines: 1 });
  }

  ctx.restore();

  if (isRound) {
    ctx.save();
    ctx.lineWidth = w * 0.012;
    ctx.strokeStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(center, h / 2, Math.min(w, h) * 0.466, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}

function GoogleWord() {
  return <span className={styles.googleWord}><span>G</span><span>o</span><span>o</span><span>g</span><span>l</span><span>e</span></span>;
}

function TemplateThumb({ template, active, qrDataUrl, onClick }) {
  const dark = template.tone === 'dark';
  const round = template.id === 'round';
  return (
    <button type="button" onClick={onClick} className={`${styles.templateCard} ${active ? styles.activeTemplate : ''}`} aria-pressed={active} aria-label={`Select ${template.fullName}`}>
      <span className={`${styles.templatePreview} ${dark ? styles.darkTemplatePreview : ''} ${round ? styles.roundTemplatePreview : ''} ${template.id === 'feedback' ? styles.feedbackTemplatePreview : ''}`}>
        <span className={styles.tinyLogo}>YOUR<br />LOGO</span>
        <span className={styles.tinyHeadline}>{template.id === 'feedback' ? 'YOUR FEEDBACK MATTERS!' : 'Review us on'}</span>
        <GoogleWord />
        <span className={styles.tinyStars}>★★★★★</span>
        {qrDataUrl ? <img src={qrDataUrl} alt="" className={styles.tinyQr} /> : <span className={styles.tinyQrBlank} />}
        <span className={styles.tinyCta}>{template.id === 'feedback' ? 'Thank you!' : 'Scan QR to review'}</span>
      </span>
      <strong>{template.name}</strong>
      <small>{template.label}</small>
    </button>
  );
}

function FinishedProductMock({ template, qrDataUrl }) {
  const size = PRINT_SIZE_BY_ID[template.defaultSize] || PRINT_SIZE_BY_ID.a6;
  return (
    <article className={styles.productCard}>
      <div className={`${styles.productScene} ${styles[`scene_${template.id}`] || ''}`}>
        <div className={styles.sceneLight} />
        <div className={`${styles.productAsset} ${styles[`asset_${template.id}`] || ''}`}>
          <div className={styles.assetLogo}>YOUR<br />LOGO</div>
          <GoogleWord />
          <div className={styles.assetStars}>★★★★★</div>
          {qrDataUrl ? <img src={qrDataUrl} alt="" /> : <span />}
        </div>
      </div>
      <b>{template.fullName}</b>
      <span>{size.mm} | {size.inch}</span>
    </article>
  );
}

export default function GoogleReviewQRGenerator() {
  const canvasRef = useRef(null);
  const [reviewUrl, setReviewUrl] = useState(DEFAULT_REVIEW_LINK);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [qrPreviewDataUrl, setQrPreviewDataUrl] = useState('');
  const [logoDataUrl, setLogoDataUrl] = useState('');
  const [qrStyle, setQrStyle] = useState('gradient');
  const [templateId, setTemplateId] = useState('simple');
  const [businessName, setBusinessName] = useState('Sunrise Cafe');
  const [headline, setHeadline] = useState('Review us on Google');
  const [ctaText, setCtaText] = useState('Scan QR to leave a review');
  const [accent, setAccent] = useState('#ff4a1c');
  const [showStars, setShowStars] = useState(true);
  const [showLogo, setShowLogo] = useState(true);
  const [printSizeId, setPrintSizeId] = useState('tent');
  const [activeEditorTab, setActiveEditorTab] = useState('text');
  const [menuOpen, setMenuOpen] = useState(false);
  const [toast, setToast] = useState('');
  const [isCanvasReady, setIsCanvasReady] = useState(false);

  const selectedTemplate = useMemo(() => TEMPLATES.find((template) => template.id === templateId) || TEMPLATES[0], [templateId]);
  const printSize = useMemo(() => PRINT_SIZE_BY_ID[printSizeId] || PRINT_SIZE_BY_ID.tent, [printSizeId]);
  const actionUrl = useMemo(() => safeUrl(reviewUrl), [reviewUrl]);
  const linkIsHttp = Boolean(parseHttpUrl(actionUrl));
  const linkLooksGoogle = isLikelyGoogleReviewUrl(actionUrl);
  const shareLinkLabel = linkIsHttp ? 'Share Link via WhatsApp' : 'Paste link to share';

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
    const draw = async () => {
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
      ctx.fillRect(0, 0, previewCanvas.width, previewCanvas.height);
      drawQrFrame(ctx, 46, 46, 932, qrImg, logoImg, accent, qrStyle, showLogo);
      setQrPreviewDataUrl(previewCanvas.toDataURL('image/png'));
    };
    draw();
    return () => { active = false; };
  }, [qrDataUrl, logoDataUrl, accent, qrStyle, showLogo]);

  useEffect(() => {
    let active = true;
    const draw = async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      setIsCanvasReady(false);
      const dimensions = canvasDimensions(printSize);
      canvas.width = dimensions.width;
      canvas.height = dimensions.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const [qrImg, logoImg] = await Promise.all([loadImage(qrDataUrl), loadImage(logoDataUrl)]);
      if (!active) return;
      drawProduct(ctx, canvas, {
        templateId,
        businessName,
        headline,
        ctaText,
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
    const timer = setTimeout(() => setToast(''), 2200);
    return () => clearTimeout(timer);
  }, [toast]);

  const showToast = (message) => setToast(message);

  const onLogoUpload = (event) => {
    const input = event.target;
    const file = input.files?.[0];
    if (!file) return;
    const allowedTypes = ['image/png', 'image/jpeg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      showToast('Upload PNG, JPG or WebP only');
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
      showToast('Logo added to QR and template');
    };
    reader.onerror = () => {
      input.value = '';
      showToast('Logo upload failed. Try another file.');
    };
    reader.readAsDataURL(file);
  };

  const handleTemplateSelect = (template) => {
    setTemplateId(template.id);
    setPrintSizeId(template.defaultSize);
    showToast(`${template.fullName} selected`);
  };

  const shareReviewLink = () => {
    if (!linkIsHttp) {
      showToast('Paste a valid review link first');
      return;
    }
    const message = encodeURIComponent(`Please review us on Google: ${actionUrl}`);
    window.open(`https://wa.me/?text=${message}`, '_blank', 'noopener,noreferrer');
  };

  const downloadQrPng = () => {
    if (!qrPreviewDataUrl) {
      showToast('QR is still generating');
      return;
    }
    downloadDataUrl(qrPreviewDataUrl, 'bharathqr-google-review-qr.png');
  };

  const downloadFinalPng = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !isCanvasReady) {
      showToast('Preview is still loading');
      return;
    }
    const blob = await canvasToBlob(canvas, 'image/png');
    downloadBlob(blob, `bharathqr-google-review-${selectedTemplate.id}.png`);
  };

  const downloadFinalSvg = () => {
    const canvas = canvasRef.current;
    if (!canvas || !isCanvasReady) {
      showToast('Preview is still loading');
      return;
    }
    const blob = createSvgBlobFromCanvas(canvas, printSize);
    downloadBlob(blob, `bharathqr-google-review-${selectedTemplate.id}.svg`);
  };

  const downloadFinalPdf = () => {
    const canvas = canvasRef.current;
    if (!canvas || !isCanvasReady) {
      showToast('Preview is still loading');
      return;
    }
    const blob = createPdfBlobFromCanvas(canvas, printSize);
    downloadBlob(blob, `bharathqr-google-review-${selectedTemplate.id}.pdf`);
  };

  const shareFinalDesign = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !isCanvasReady) {
      showToast('Preview is still loading');
      return;
    }
    try {
      const blob = await canvasToBlob(canvas, 'image/png');
      const file = new File([blob], `bharathqr-google-review-${selectedTemplate.id}.png`, { type: 'image/png' });
      const sharePayload = {
        files: [file],
        title: 'Google Review QR Design',
        text: `Google Review QR design for ${businessName || 'my business'}`
      };
      if (navigator.canShare && navigator.canShare({ files: [file] }) && navigator.share) {
        await navigator.share(sharePayload);
        showToast('Design shared');
        return;
      }
      downloadBlob(blob, `bharathqr-google-review-${selectedTemplate.id}.png`);
      const fallback = encodeURIComponent(`I downloaded my Google Review QR design. Please attach the downloaded PNG here and share it. Review link: ${actionUrl}`);
      window.open(`https://wa.me/?text=${fallback}`, '_blank', 'noopener,noreferrer');
      showToast('PNG downloaded. Attach it in WhatsApp.');
    } catch (error) {
      showToast('Design sharing failed. Use Download PNG.');
    }
  };

  const softwareSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'BharathQR Google Review QR Generator',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    url: CANONICAL_URL,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
    featureList: ['Google Review QR code generator', 'Logo upload', 'Print-ready templates', 'PNG download', 'SVG download', 'PDF download', 'WhatsApp sharing']
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
      { '@type': 'Question', name: 'Is the BharathQR Google Review QR Generator free?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Indian businesses can create a Google Review QR code with logo and print-ready templates for free.' } },
      { '@type': 'Question', name: 'Can I add my logo to the QR and template?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. You can upload a PNG, JPG or WebP logo. It is centered, contain-fit and placed on a clean background so it does not get cropped.' } },
      { '@type': 'Question', name: 'Can I download PNG, SVG and PDF files?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. The live product preview canvas is the source for PNG, SVG and PDF exports, so downloads match the preview.' } },
      { '@type': 'Question', name: 'Can I share the final design on WhatsApp?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. On browsers that support Web Share file sharing, the PNG design can be shared directly. Other browsers download the PNG and open WhatsApp with a fallback message.' } }
    ]
  };

  return (
    <>
      <Head>
        <title>Google Review QR Code Generator with Logo & Templates | BharathQR</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Create a premium Google Review QR code with logo. Choose 5 print-ready templates, preview live, and download PNG, SVG or PDF files for Indian businesses." />
        <link rel="canonical" href={CANONICAL_URL} />
        <meta property="og:title" content="Google Review QR Code Generator with Logo & Templates | BharathQR" />
        <meta property="og:description" content="Turn every customer visit into a Google review with a free QR generator, live template preview and print-ready downloads." />
        <meta property="og:url" content={CANONICAL_URL} />
        <meta property="og:image" content="https://www.bharathqr.com/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Google Review QR Code Generator with Logo & Templates | BharathQR" />
        <meta name="twitter:description" content="Create a Google Review QR code with logo, choose a template, and download PNG, SVG or PDF files." />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      </Head>
      <style jsx global>{`
        #__next > header:first-child { display: none !important; }
        #__next > footer { display: none !important; }
        html, body { overflow-x: hidden; }
      `}</style>

      <header className={styles.localTopbar}>
        <nav className={styles.localNav} aria-label="Google review QR generator navigation">
          <Link href="/" className={styles.localBrand} aria-label="BharathQR home"><span className={styles.localMark} />Bharath<span>QR</span></Link>
          <div className={styles.localNavActions}>
            <a href="#template-studio">▦ View Templates</a>
            <button type="button" onClick={() => setMenuOpen((value) => !value)} aria-label="Open menu" aria-expanded={menuOpen}>☰</button>
          </div>
          {menuOpen && (
            <div className={styles.localMenu}>
              <a href="#qr-generator">Create QR</a>
              <a href="#template-studio">Template Studio</a>
              <a href="#finished-products">Finished Products</a>
              <a href="#review-guide">Review Guide</a>
            </div>
          )}
        </nav>
      </header>

      <main className={styles.page}>
        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <h1>Turn Every Customer Visit Into a <span>5★</span> <GoogleWord /> Review</h1>
            <p>Create a premium Google Review QR code with your logo. Choose from beautiful templates and download print-ready assets in seconds.</p>
          </div>

          <div className={styles.heroArt} aria-hidden="true">
            <div className={styles.heroCircle} />
            <div className={styles.heroStandee}>
              <div className={styles.heroLogo}>{logoDataUrl ? <img src={logoDataUrl} alt="" /> : <>YOUR<br />LOGO</>}</div>
              <strong>Review us on</strong>
              <span className={styles.heroGoogle}><GoogleWord /></span>
              <span className={styles.heroStars}>★★★★★</span>
              <span className={styles.heroQrBox}>{qrPreviewDataUrl ? <img src={qrPreviewDataUrl} alt="" /> : null}</span>
              <em>Scan QR to leave a review</em>
            </div>
            <div className={styles.plant}><span /><span /><span /><span /><b /></div>
          </div>

          <div className={styles.trustPills}>
            <span>🎁 100% Free</span>
            <span>👤 No Sign-up</span>
            <span>🖨️ Print Ready</span>
          </div>
        </section>

        <section className={styles.workflow} aria-label="Workflow">
          <div>
            <strong>1</strong>
            <span>▦</span>
            <h2>Create QR<br />With Logo</h2>
            <p>Generate your Google Review QR code with your logo.</p>
          </div>
          <i />
          <div>
            <strong>2</strong>
            <span>▧</span>
            <h2>Choose<br />Template</h2>
            <p>Pick an eye-catching template that fits your business.</p>
          </div>
          <i />
          <div>
            <strong>3</strong>
            <span>▤</span>
            <h2>Print<br />Ready</h2>
            <p>Download print-ready files and start getting reviews.</p>
          </div>
        </section>

        <section id="qr-generator" className={styles.qrPanel} aria-label="QR generator">
          <article className={styles.qrForm}>
            <div className={styles.sectionTitle}><span>1</span><h2>QR Generator</h2></div>
            <label htmlFor="reviewUrl">Google review link</label>
            <div className={styles.inputShell}>
              <span>🔗</span>
              <input id="reviewUrl" value={reviewUrl} onChange={(event) => setReviewUrl(event.target.value)} placeholder="https://g.page/your-business/review" aria-invalid={!linkIsHttp} />
            </div>
            <p className={`${styles.statusLine} ${linkLooksGoogle ? styles.goodLine : ''}`}><span />{linkIsHttp ? (linkLooksGoogle ? 'Looks like a Google review link.' : 'Valid link. Use your exact Google review link before printing.') : 'Paste a valid Google review link before sharing or printing.'}</p>

            <label>Upload logo <small>(optional)</small></label>
            <label className={styles.uploadBox}>
              <input type="file" accept="image/png,image/jpeg,image/webp" onChange={onLogoUpload} />
              <span className={styles.uploadIcon}>{logoDataUrl ? <img src={logoDataUrl} alt="Uploaded logo preview" /> : '▧'}</span>
              <b>{logoDataUrl ? 'Change logo' : 'Upload logo'}<small>PNG / JPG / WebP · appears in QR + template</small></b>
              <i>›</i>
            </label>
            {logoDataUrl && <button type="button" className={styles.clearLogoBtn} onClick={() => { setLogoDataUrl(''); showToast('Logo removed'); }}>Remove logo</button>}
          </article>

          <article className={styles.qrPreviewBlock}>
            <div className={styles.qrPreviewCard}>
              <span>LIVE QR PREVIEW</span>
              {qrPreviewDataUrl ? <img src={qrPreviewDataUrl} alt="Generated Google Review QR code" /> : <div className={styles.qrLoading}>Generating QR…</div>}
              <small>High-resolution QR · 1024 × 1024 px</small>
            </div>
          </article>

          <article className={styles.qrControls}>
            <h2>Eye-catching QR style</h2>
            <div className={styles.qrStyles}>
              {QR_STYLES.map((style) => (
                <button key={style.id} type="button" onClick={() => setQrStyle(style.id)} className={qrStyle === style.id ? styles.activeStyle : ''} aria-pressed={qrStyle === style.id}>
                  <span>{style.icon}</span>
                  {style.label}
                </button>
              ))}
            </div>
            <div className={styles.qrActions}>
              <button type="button" onClick={downloadQrPng} disabled={!qrPreviewDataUrl}>⇩ Download QR PNG</button>
              <button type="button" className={styles.whatsappBtn} onClick={shareReviewLink} disabled={!linkIsHttp}>💬 {shareLinkLabel}</button>
            </div>
          </article>
        </section>

        <section id="template-studio" className={styles.studioGrid}>
          <article className={styles.studioPanel}>
            <div className={styles.sectionTitle}><span>2</span><h2>Template Studio</h2></div>
            <p className={styles.studioLead}>Choose a template and customize it</p>
            <div className={styles.templateGrid}>
              {TEMPLATES.map((template) => (
                <TemplateThumb key={template.id} template={template} qrDataUrl={qrPreviewDataUrl || qrDataUrl} active={template.id === templateId} onClick={() => handleTemplateSelect(template)} />
              ))}
            </div>

            <div className={styles.editorTabs} role="tablist" aria-label="Template controls">
              <button type="button" role="tab" onClick={() => setActiveEditorTab('text')} className={activeEditorTab === 'text' ? styles.activeEditorTab : ''} aria-selected={activeEditorTab === 'text'}>Edit Text</button>
              <button type="button" role="tab" onClick={() => setActiveEditorTab('colors')} className={activeEditorTab === 'colors' ? styles.activeEditorTab : ''} aria-selected={activeEditorTab === 'colors'}>Colors</button>
              <button type="button" role="tab" onClick={() => setActiveEditorTab('size')} className={activeEditorTab === 'size' ? styles.activeEditorTab : ''} aria-selected={activeEditorTab === 'size'}>Print Size</button>
            </div>

            {activeEditorTab === 'text' && (
              <div className={styles.editorGrid}>
                <label>Business / shop name<input maxLength={36} value={businessName} onChange={(event) => setBusinessName(event.target.value)} /></label>
                <label>Headline<input maxLength={34} value={headline} onChange={(event) => setHeadline(event.target.value)} /></label>
                <label>CTA text<input maxLength={42} value={ctaText} onChange={(event) => setCtaText(event.target.value)} /></label>
                <label>Show stars<select value={showStars ? 'show' : 'hide'} onChange={(event) => setShowStars(event.target.value === 'show')}><option value="show">Show stars</option><option value="hide">Hide stars</option></select></label>
                <label>Show logo<select value={showLogo ? 'show' : 'hide'} onChange={(event) => setShowLogo(event.target.value === 'show')}><option value="show">Show logo</option><option value="hide">Hide logo</option></select></label>
              </div>
            )}

            {activeEditorTab === 'colors' && (
              <div className={styles.colorEditor}>
                <div>
                  <label>Accent color</label>
                  <div className={styles.swatches}>{ACCENTS.map((color) => <button key={color} type="button" aria-label={`Use accent ${color}`} onClick={() => setAccent(color)} className={accent === color ? styles.activeSwatch : ''} style={{ backgroundColor: color }} />)}</div>
                </div>
                <p>QR pixels stay black-on-white for scan safety. Accent colors update the frame, badge, signature and template details.</p>
              </div>
            )}

            {activeEditorTab === 'size' && (
              <div className={styles.printSizePanel}>
                {PRINT_SIZES.map((size) => (
                  <button key={size.id} type="button" onClick={() => setPrintSizeId(size.id)} className={printSizeId === size.id ? styles.activeSize : ''} aria-pressed={printSizeId === size.id}>
                    <b>{size.name}</b>
                    <span>{size.mm}</span>
                    <small>{size.inch}</small>
                  </button>
                ))}
              </div>
            )}
          </article>

          <aside className={styles.productPanel} aria-label="Live product preview">
            <div className={styles.productHead}><h2>LIVE PRODUCT PREVIEW</h2><span>LIVE</span></div>
            <div className={styles.canvasShell}><canvas id="templateCanvas" ref={canvasRef} className={styles.templateCanvas} role="img" aria-label="Live Google Review QR product preview" /></div>
            <div className={styles.productMeta}>
              <b>{selectedTemplate.fullName}</b>
              <span>{printSize.mm} <i /> {printSize.inch}</span>
              <small>Template: {selectedTemplate.label}</small>
            </div>
            <div className={styles.finalShare}>
              <button type="button" onClick={shareReviewLink} disabled={!linkIsHttp}>💬 Share Link via WhatsApp</button>
              <button type="button" onClick={shareFinalDesign} disabled={!qrDataUrl || !isCanvasReady}>💬 Share Design via WhatsApp</button>
            </div>
            <div className={styles.finalActions}>
              <button type="button" onClick={downloadFinalPng} disabled={!qrDataUrl || !isCanvasReady}>⇩ Download PNG</button>
              <button type="button" onClick={downloadFinalSvg} disabled={!qrDataUrl || !isCanvasReady}>⇩ Download SVG</button>
              <button type="button" onClick={downloadFinalPdf} disabled={!qrDataUrl || !isCanvasReady}>⇩ Download PDF</button>
            </div>
          </aside>
        </section>

        <section className={styles.featurePanel} aria-label="Generator features">
          <article><span>📱</span><b>Mobile-first</b><p>No cut-off hero, no horizontal overflow and clean stacked controls.</p></article>
          <article><span>🏷️</span><b>Logo-safe</b><p>Uploaded logos stay centered, visible and contain-fit in QR and templates.</p></article>
          <article><span>▦</span><b>Bigger QR preview</b><p>Styled QR preview is large enough to check before printing.</p></article>
          <article><span>⚡</span><b>Live canvas output</b><p>The same visible canvas powers preview, PNG, SVG and PDF exports.</p></article>
          <article><span>🖨️</span><b>Print sizes</b><p>Choose practical mm + inch sizes for cards, stickers and standees.</p></article>
          <article><span>💬</span><b>WhatsApp ready</b><p>Share the review link or share/download the final design with a safe fallback.</p></article>
        </section>

        <section id="finished-products" className={styles.products}>
          <div className={styles.productsHead}><h2>Finished Products You Can Print</h2><a href="#template-studio">View All Templates →</a></div>
          <div className={styles.productGrid}>
            {TEMPLATES.map((template) => <FinishedProductMock key={template.id} template={template} qrDataUrl={qrPreviewDataUrl} />)}
          </div>
        </section>

        <section id="review-guide" className={styles.seoBlock}>
          <div>
            <h2>Free Google Review QR Generator for Indian businesses</h2>
            <p>BharathQR helps clinics, restaurants, salons, shops and local service businesses turn a happy customer moment into a simple scan-to-review action. Add your Google review link, upload your logo, choose a premium template and export print-ready files.</p>
          </div>
          <div>
            <h3>Where to use your review QR</h3>
            <p>Place your Google Review QR on reception counters, tables, billing desks, table tents, acrylic standees, thank-you cards, stickers, packaging and WhatsApp follow-up messages. Always ask for honest customer feedback.</p>
          </div>
          <div>
            <h3>Related Review Growth pages</h3>
            <div className={styles.relatedLinks}>{RELATED_LINKS.map((link) => <Link href={link.href} key={link.href}>{link.title} →</Link>)}</div>
          </div>
          <div className={styles.faqMini}>
            <details><summary>Is this Google Review QR Generator free?</summary><p>Yes. You can create a Google Review QR code and download print-ready files without login.</p></details>
            <details><summary>Can I add my business logo?</summary><p>Yes. The logo is centered, contain-fit and protected with a clean background so it does not crop or merge with the QR.</p></details>
            <details><summary>Do PNG, SVG and PDF downloads match the preview?</summary><p>Yes. The visible live product canvas is used as the source for all final downloads.</p></details>
            <details><summary>Does WhatsApp design sharing work on desktop?</summary><p>Browsers that support Web Share file sharing can share the PNG directly. Other browsers download the PNG and open WhatsApp with a fallback message so you can attach the file manually.</p></details>
          </div>
        </section>
      </main>
      {toast && <div className={styles.toast} role="status" aria-live="polite">{toast}</div>}
    </>
  );
}
