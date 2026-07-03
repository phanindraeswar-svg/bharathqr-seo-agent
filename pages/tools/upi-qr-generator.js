import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import QRCode from 'qrcode';
import styles from '../../styles/UpiQRGenerator.module.css';

const CANONICAL_URL = 'https://www.bharathqr.com/tools/upi-qr-generator';
const BHARATHQR_UTM = `${CANONICAL_URL}?utm_source=whatsapp&utm_medium=share&utm_campaign=upi_qr_generator_v7`;
const CANVAS_SCALE = 3;
const DEFAULT_UPI_ID = 'jainsocialgroup@idfcbank';
const DEFAULT_PAYEE = 'Sunrise Cafe';

const TEMPLATES = [
  {
    id: 'counter-standee',
    name: 'Counter Standee',
    size: '4 × 6 inch / A6',
    bestFor: 'Best for billing counters, cashier desks, clinics and small shops',
    width: 420,
    height: 620,
    shape: 'portrait',
    accent: '#ff4f23',
    surface: '#ffffff',
    shell: '#fffdf9',
  },
  {
    id: 'table-tent',
    name: 'Table Tent',
    size: '6 × 4 inch',
    bestFor: 'Ideal for restaurants, cafes, retail counters and billing tables',
    width: 640,
    height: 420,
    shape: 'landscape',
    accent: '#ff4f23',
    surface: '#ffffff',
    shell: '#fffdf9',
  },
  {
    id: 'payment-card',
    name: 'Payment Card',
    size: '85 × 55 mm',
    bestFor: 'Best for auto drivers, delivery partners, wallets and parcel inserts',
    width: 680,
    height: 430,
    shape: 'card',
    accent: '#ff4f23',
    surface: '#ffffff',
    shell: '#ffffff',
  },
  {
    id: 'round-sticker',
    name: 'Round Sticker',
    size: '3 inch circle',
    bestFor: 'Best for autos, counters, jars, boxes, packaging and takeaway bags',
    width: 560,
    height: 560,
    shape: 'round',
    accent: '#ff4f23',
    surface: '#ffffff',
    shell: '#ffffff',
  },
];

const LAYOUTS = {
  'counter-standee': {
    margin: 31,
    radius: 26,
    logoSize: 38,
    headerY: 70,
    titleSize: 23,
    scanY: 124,
    scanSize: 18,
    qrSize: 246,
    qrY: 156,
    upiY: 430,
    upiSize: 11.5,
    brandY: 486,
    brandScale: 0.86,
    appsY: 548,
    appSize: 13.5,
    appWidth: 320,
  },
  'table-tent': {
    margin: 28,
    radius: 24,
    logoSize: 34,
    headerY: 58,
    titleSize: 21,
    scanY: 98,
    scanSize: 16,
    qrSize: 188,
    qrY: 124,
    upiY: 334,
    upiSize: 10.8,
    brandY: 366,
    brandScale: 0.72,
    appsY: 397,
    appSize: 12,
    appWidth: 430,
  },
  'payment-card': {
    margin: 30,
    radius: 26,
    logoSize: 34,
    headerY: 58,
    titleSize: 21,
    scanY: 96,
    scanSize: 16,
    qrSize: 184,
    qrY: 122,
    upiY: 326,
    upiSize: 10.8,
    brandY: 362,
    brandScale: 0.72,
    appsY: 397,
    appSize: 12,
    appWidth: 450,
  },
  'round-sticker': {
    margin: 0,
    radius: 280,
    logoSize: 32,
    headerY: 86,
    titleSize: 19,
    scanY: 128,
    scanSize: 15,
    qrSize: 214,
    qrY: 166,
    upiY: 406,
    upiSize: 8.6,
    brandY: 444,
    brandScale: 0.62,
    appsY: 487,
    appSize: 9.4,
    appWidth: 330,
  },
};

function encodeXml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function sanitizeFileName(value) {
  return String(value || 'bharathqr-upi-qr')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60) || 'bharathqr-upi-qr';
}

function formatAmount(value) {
  const clean = String(value || '').trim();
  if (!clean) return '';
  const num = Number(clean);
  if (!Number.isFinite(num) || num <= 0) return '';
  return num.toFixed(2);
}

function isValidUpiId(value) {
  return /^[a-zA-Z0-9._-]{2,256}@[a-zA-Z][a-zA-Z0-9._-]{2,64}$/.test(String(value || '').trim());
}

function buildUpiPayload({ upiId, payeeName, amount }) {
  const params = new URLSearchParams();
  params.set('pa', String(upiId || '').trim());
  params.set('pn', String(payeeName || 'Business').trim() || 'Business');
  params.set('cu', 'INR');
  const cleanAmount = formatAmount(amount);
  if (cleanAmount) params.set('am', cleanAmount);
  return `upi://pay?${params.toString()}`;
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
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

function drawContainImage(ctx, image, x, y, w, h) {
  const ratio = Math.min(w / image.width, h / image.height);
  const drawW = image.width * ratio;
  const drawH = image.height * ratio;
  ctx.drawImage(image, x + (w - drawW) / 2, y + (h - drawH) / 2, drawW, drawH);
}

function drawTriangle(ctx, x, y, size, color) {
  ctx.beginPath();
  ctx.moveTo(x, y - size);
  ctx.lineTo(x + size * 1.36, y);
  ctx.lineTo(x, y + size);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

function drawDefaultLogo(ctx, cx, cy, size, accent = '#ff4f23') {
  ctx.save();
  ctx.fillStyle = '#fff3ed';
  ctx.strokeStyle = accent;
  ctx.lineWidth = Math.max(1.5, size * 0.055);
  ctx.beginPath();
  ctx.arc(cx, cy, size / 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.font = `900 ${size * 0.52}px Inter, Arial, sans-serif`;
  ctx.fillStyle = accent;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('₹', cx, cy + size * 0.04);
  ctx.restore();
}

function drawLogoBadge(ctx, cx, cy, size, logo, accent = '#ff4f23') {
  if (!logo) {
    drawDefaultLogo(ctx, cx, cy, size, accent);
    return;
  }
  ctx.save();
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#ffe0d4';
  ctx.lineWidth = Math.max(1.3, size * 0.045);
  ctx.beginPath();
  ctx.arc(cx, cy, size / 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.39, 0, Math.PI * 2);
  ctx.clip();
  drawContainImage(ctx, logo, cx - size * 0.37, cy - size * 0.37, size * 0.74, size * 0.74);
  ctx.restore();
}

function fitFont(ctx, text, maxWidth, start, min, weight = 900) {
  let size = start;
  const value = String(text || '').trim();
  while (size > min) {
    ctx.font = `${weight} ${size}px Inter, Arial, sans-serif`;
    if (ctx.measureText(value).width <= maxWidth) break;
    size -= 1;
  }
  return size;
}

function drawCenteredText(ctx, text, x, y, maxWidth, start, min, color = '#111827', weight = 900) {
  const clean = String(text || '').replace(/\s+/g, ' ').trim();
  const size = fitFont(ctx, clean, maxWidth, start, min, weight);
  ctx.save();
  ctx.font = `${weight} ${size}px Inter, Arial, sans-serif`;
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(clean, x, y);
  ctx.restore();
}

function drawBrandHeader(ctx, width, layout, name, logo, accent) {
  const title = String(name || 'Your Business').replace(/\s+/g, ' ').trim().slice(0, 34) || 'Your Business';
  const maxWidth = Math.min(width - 96, layout.appWidth || width - 100);
  const titleSize = fitFont(ctx, title, maxWidth - layout.logoSize - 14, layout.titleSize, 11, 950);
  ctx.font = `950 ${titleSize}px Inter, Arial, sans-serif`;
  const textWidth = ctx.measureText(title).width;
  const total = layout.logoSize + 11 + textWidth;
  const logoX = width / 2 - total / 2 + layout.logoSize / 2;
  const textX = logoX + layout.logoSize / 2 + 11;
  drawLogoBadge(ctx, logoX, layout.headerY, layout.logoSize, logo, accent);
  ctx.fillStyle = accent;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(title, textX, layout.headerY + 1);
}

function drawBhimUpiStrip(ctx, width, y, scale) {
  const center = width / 2;
  ctx.save();
  ctx.textBaseline = 'middle';
  ctx.font = `950 italic ${32 * scale}px Inter, Arial, sans-serif`;
  ctx.fillStyle = '#4b5563';
  ctx.textAlign = 'right';
  ctx.fillText('BHIM', center - 29 * scale, y);
  drawTriangle(ctx, center - 21 * scale, y, 12 * scale, '#ff7a1a');
  drawTriangle(ctx, center - 11 * scale, y, 12 * scale, '#159447');
  ctx.textAlign = 'left';
  ctx.fillText('UPI', center + 31 * scale, y);
  drawTriangle(ctx, center + 91 * scale, y, 12 * scale, '#ff7a1a');
  drawTriangle(ctx, center + 101 * scale, y, 12 * scale, '#159447');
  ctx.restore();
}

function drawAppStrip(ctx, width, y, appWidth, fontSize) {
  const items = [
    { label: 'G Pay', color: '#4285f4' },
    { label: 'PhonePe', color: '#5f259f' },
    { label: 'Paytm', color: '#00a9e8' },
    { label: 'AmazonPay', color: '#111827' },
    { label: 'CRED', color: '#111827' },
    { label: 'MobiKwik', color: '#2563eb' },
  ];
  const x = (width - appWidth) / 2;
  const gap = appWidth / items.length;
  ctx.save();
  ctx.font = `950 ${fontSize}px Inter, Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  items.forEach((item, index) => {
    ctx.fillStyle = item.color;
    ctx.fillText(item.label, x + gap * index + gap / 2, y);
  });
  ctx.restore();
}

function paintTemplateShell(ctx, template, layout) {
  const { width, height, accent } = template;
  ctx.save();
  const bg = ctx.createLinearGradient(0, 0, width, height);
  bg.addColorStop(0, '#ffffff');
  bg.addColorStop(0.66, '#ffffff');
  bg.addColorStop(1, '#fff7ed');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);
  if (template.shape === 'round') {
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, width / 2 - 17, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 5;
    ctx.strokeStyle = accent;
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, width / 2 - 27, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
    return;
  }
  const x = layout.margin;
  const y = layout.margin;
  const w = width - layout.margin * 2;
  const h = height - layout.margin * 2;
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = 'rgba(15, 23, 42, .10)';
  ctx.shadowBlur = 12;
  ctx.shadowOffsetY = 5;
  roundRect(ctx, x, y, w, h, layout.radius);
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.lineWidth = template.shape === 'portrait' ? 5 : 4.5;
  ctx.strokeStyle = accent;
  roundRect(ctx, x + 7, y + 7, w - 14, h - 14, layout.radius - 7);
  ctx.stroke();
  ctx.restore();
}

async function drawTemplateCanvas(canvas, options) {
  const { template, qrDataUrl, logoDataUrl, businessName, upiId } = options;
  if (!canvas || !template || !qrDataUrl) return;
  const layout = LAYOUTS[template.id];
  const { width, height, accent } = template;
  canvas.width = width * CANVAS_SCALE;
  canvas.height = height * CANVAS_SCALE;
  canvas.style.aspectRatio = `${width} / ${height}`;
  const ctx = canvas.getContext('2d');
  ctx.setTransform(CANVAS_SCALE, 0, 0, CANVAS_SCALE, 0, 0);
  ctx.clearRect(0, 0, width, height);

  const [qrImage, logo] = await Promise.all([
    loadImage(qrDataUrl),
    logoDataUrl ? loadImage(logoDataUrl).catch(() => null) : Promise.resolve(null),
  ]);

  ctx.save();
  if (template.shape === 'round') {
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, width / 2 - 8, 0, Math.PI * 2);
    ctx.clip();
  }

  paintTemplateShell(ctx, template, layout);
  drawBrandHeader(ctx, width, layout, businessName, logo, accent);
  drawCenteredText(ctx, 'SCAN & PAY', width / 2, layout.scanY, width - 90, layout.scanSize, 10, '#111827', 950);

  const qrSize = layout.qrSize;
  const qrX = Math.round((width - qrSize) / 2);
  const qrY = layout.qrY;
  ctx.save();
  ctx.shadowColor = 'rgba(15, 23, 42, .10)';
  ctx.shadowBlur = 10;
  ctx.fillStyle = '#ffffff';
  roundRect(ctx, qrX - 13, qrY - 13, qrSize + 26, qrSize + 26, template.shape === 'round' ? 18 : 14);
  ctx.fill();
  ctx.restore();
  ctx.strokeStyle = '#a8b3c3';
  ctx.lineWidth = 1.4;
  roundRect(ctx, qrX - 10, qrY - 10, qrSize + 20, qrSize + 20, template.shape === 'round' ? 16 : 12);
  ctx.stroke();
  // Clean UPI QR: never draw uploaded logo inside the QR center.
  ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize);

  const upiText = `UPI ID: ${String(upiId || DEFAULT_UPI_ID).replace(/\s+/g, '').slice(0, template.shape === 'round' ? 31 : 42)}`;
  drawCenteredText(ctx, upiText, width / 2, layout.upiY, Math.min(width - 80, layout.appWidth), layout.upiSize, 6.8, '#111827', 850);
  drawBhimUpiStrip(ctx, width, layout.brandY, layout.brandScale);
  drawAppStrip(ctx, width, layout.appsY, layout.appWidth, layout.appSize);
  ctx.restore();
}

function makeTemplateSvg({ template, qrDataUrl, logoDataUrl, businessName, upiId }) {
  const layout = LAYOUTS[template.id];
  const { width, height, accent } = template;
  const qrSize = layout.qrSize;
  const qrX = (width - qrSize) / 2;
  const title = encodeXml(String(businessName || 'Your Business').replace(/\s+/g, ' ').trim().slice(0, 34) || 'Your Business');
  const upiText = encodeXml(`UPI ID: ${String(upiId || DEFAULT_UPI_ID).replace(/\s+/g, '').slice(0, 42)}`);
  const isRound = template.shape === 'round';
  const logoSize = layout.logoSize;
  const logoX = width / 2 - 115;
  const logoMarkup = logoDataUrl
    ? `<circle cx="${logoX}" cy="${layout.headerY}" r="${logoSize / 2}" fill="#fff" stroke="#ffe0d4" stroke-width="1.5"/><image href="${logoDataUrl}" x="${logoX - logoSize * 0.37}" y="${layout.headerY - logoSize * 0.37}" width="${logoSize * 0.74}" height="${logoSize * 0.74}" preserveAspectRatio="xMidYMid meet"/>`
    : `<circle cx="${logoX}" cy="${layout.headerY}" r="${logoSize / 2}" fill="#fff3ed" stroke="${accent}" stroke-width="1.5"/><text x="${logoX}" y="${layout.headerY + 5}" text-anchor="middle" font-size="${logoSize * 0.52}" font-weight="900" fill="${accent}">₹</text>`;
  const shell = isRound
    ? `<circle cx="${width / 2}" cy="${height / 2}" r="${width / 2 - 17}" fill="#fff"/><circle cx="${width / 2}" cy="${height / 2}" r="${width / 2 - 27}" fill="none" stroke="${accent}" stroke-width="5"/>`
    : `<rect x="${layout.margin}" y="${layout.margin}" width="${width - layout.margin * 2}" height="${height - layout.margin * 2}" rx="${layout.radius}" fill="#fff"/><rect x="${layout.margin + 7}" y="${layout.margin + 7}" width="${width - layout.margin * 2 - 14}" height="${height - layout.margin * 2 - 14}" rx="${layout.radius - 7}" fill="none" stroke="${accent}" stroke-width="4.8"/>`;
  const clip = isRound ? `<clipPath id="roundClip"><circle cx="${width / 2}" cy="${height / 2}" r="${width / 2 - 8}"/></clipPath>` : '';
  const group = isRound ? '<g clip-path="url(#roundClip)">' : '<g>';
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>${clip}</defs>
  ${group}
    <rect width="${width}" height="${height}" fill="#ffffff"/>
    ${shell}
    ${logoMarkup}
    <text x="${width / 2 - 90}" y="${layout.headerY + 7}" font-family="Inter, Arial, sans-serif" font-size="${layout.titleSize}" font-weight="950" fill="${accent}">${title}</text>
    <text x="${width / 2}" y="${layout.scanY + 5}" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="${layout.scanSize}" font-weight="950" fill="#111827">SCAN &amp; PAY</text>
    <rect x="${qrX - 13}" y="${layout.qrY - 13}" width="${qrSize + 26}" height="${qrSize + 26}" rx="14" fill="#fff" stroke="#a8b3c3"/>
    <image href="${qrDataUrl}" x="${qrX}" y="${layout.qrY}" width="${qrSize}" height="${qrSize}"/>
    <text x="${width / 2}" y="${layout.upiY + 4}" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="${layout.upiSize}" font-weight="850" fill="#111827">${upiText}</text>
    <text x="${width / 2 - 35 * layout.brandScale}" y="${layout.brandY + 5}" text-anchor="end" font-family="Inter, Arial, sans-serif" font-size="${32 * layout.brandScale}" font-style="italic" font-weight="950" fill="#4b5563">BHIM</text>
    <text x="${width / 2 + 35 * layout.brandScale}" y="${layout.brandY + 5}" text-anchor="start" font-family="Inter, Arial, sans-serif" font-size="${32 * layout.brandScale}" font-style="italic" font-weight="950" fill="#4b5563">UPI</text>
    <text x="${width / 2}" y="${layout.appsY + 4}" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="${layout.appSize}" font-weight="950" fill="#2563eb">G Pay · PhonePe · Paytm · AmazonPay · CRED · MobiKwik</text>
  </g>
</svg>`;
}

function downloadDataUrl(dataUrl, fileName) {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function textBytes(value) {
  return new TextEncoder().encode(value);
}

function concatBytes(parts) {
  const total = parts.reduce((sum, part) => sum + part.length, 0);
  const result = new Uint8Array(total);
  let offset = 0;
  parts.forEach((part) => {
    result.set(part, offset);
    offset += part.length;
  });
  return result;
}

function canvasToPdfBlob(canvas) {
  const dataUrl = canvas.toDataURL('image/jpeg', 0.94);
  const binary = atob(dataUrl.split(',')[1]);
  const imageBytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) imageBytes[i] = binary.charCodeAt(i);
  const landscape = canvas.width > canvas.height;
  const pageW = landscape ? 842 : 595;
  const pageH = landscape ? 595 : 842;
  const margin = 36;
  const scale = Math.min((pageW - margin * 2) / canvas.width, (pageH - margin * 2) / canvas.height);
  const imgW = canvas.width * scale;
  const imgH = canvas.height * scale;
  const x = (pageW - imgW) / 2;
  const y = (pageH - imgH) / 2;
  const content = `q\n${imgW.toFixed(2)} 0 0 ${imgH.toFixed(2)} ${x.toFixed(2)} ${y.toFixed(2)} cm\n/Im0 Do\nQ\n`;
  const objects = [
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
    '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n',
    `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageW} ${pageH}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>\nendobj\n`,
    `4 0 obj\n<< /Type /XObject /Subtype /Image /Width ${canvas.width} /Height ${canvas.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${imageBytes.length} >>\nstream\n`,
    imageBytes,
    '\nendstream\nendobj\n',
    `5 0 obj\n<< /Length ${content.length} >>\nstream\n${content}endstream\nendobj\n`,
  ];
  const parts = [];
  const offsets = [0];
  let position = 0;
  const add = (part, countOffset = false) => {
    const bytes = typeof part === 'string' ? textBytes(part) : part;
    if (countOffset) offsets.push(position);
    parts.push(bytes);
    position += bytes.length;
  };
  add('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n');
  add(objects[0], true);
  add(objects[1], true);
  add(objects[2], true);
  add(objects[3], true);
  add(objects[4]);
  add(objects[5]);
  add(objects[6], true);
  const xrefOffset = position;
  const xref = `xref\n0 6\n0000000000 65535 f \n${offsets.slice(1).map((n) => `${String(n).padStart(10, '0')} 00000 n `).join('\n')}\ntrailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  add(xref);
  return new Blob([concatBytes(parts)], { type: 'application/pdf' });
}

function WhatsAppIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 32 32" focusable="false">
      <path fill="currentColor" d="M16.02 3.2A12.66 12.66 0 0 0 5.3 22.6L3.8 28.8l6.35-1.45A12.68 12.68 0 1 0 16.02 3.2Zm0 22.95c-2.08 0-4.02-.62-5.65-1.68l-.4-.25-3.72.85.88-3.62-.27-.42A10.22 10.22 0 1 1 16.02 26.15Zm5.86-7.64c-.32-.16-1.9-.94-2.2-1.05-.3-.1-.52-.16-.74.16-.22.32-.84 1.05-1.03 1.27-.19.22-.38.24-.7.08-.32-.16-1.36-.5-2.59-1.6-.96-.86-1.6-1.92-1.79-2.24-.19-.32-.02-.5.14-.66.15-.15.32-.38.48-.57.16-.19.22-.32.32-.54.11-.22.05-.4-.03-.56-.08-.16-.74-1.78-1.01-2.43-.27-.64-.54-.55-.74-.56h-.63c-.22 0-.56.08-.86.4-.3.32-1.13 1.1-1.13 2.68s1.16 3.12 1.32 3.33c.16.22 2.28 3.48 5.52 4.88.77.33 1.37.53 1.84.68.77.25 1.48.21 2.04.13.62-.09 1.9-.78 2.17-1.53.27-.75.27-1.4.19-1.53-.08-.13-.3-.21-.62-.37Z" />
    </svg>
  );
}

function TemplateFallback({ template }) {
  return (
    <span className={styles.fallbackArt} data-template={template.id}>
      <span className={styles.fakeBrand}>₹ Sunrise Cafe</span>
      <span className={styles.fakeScan}>SCAN &amp; PAY</span>
      <span className={styles.fakeQr} />
      <span className={styles.fakeApps}>BHIM · UPI</span>
    </span>
  );
}

export default function UpiQRGenerator() {
  const [upiId, setUpiId] = useState(DEFAULT_UPI_ID);
  const [businessName, setBusinessName] = useState(DEFAULT_PAYEE);
  const [amount, setAmount] = useState('');
  const [logoDataUrl, setLogoDataUrl] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState(TEMPLATES[0].id);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [templatePreviewUrls, setTemplatePreviewUrls] = useState({});
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const templateCanvasRef = useRef(null);

  const selectedTemplate = useMemo(
    () => TEMPLATES.find((template) => template.id === selectedTemplateId) || TEMPLATES[0],
    [selectedTemplateId]
  );

  const upiPayload = useMemo(
    () => buildUpiPayload({ upiId, payeeName: businessName || 'Business', amount }),
    [upiId, businessName, amount]
  );

  useEffect(() => {
    let active = true;
    async function generateQr() {
      const cleanUpi = upiId.trim();
      if (!isValidUpiId(cleanUpi)) {
        setError('Enter a valid UPI ID like name@bank or business@okicici.');
        setQrDataUrl('');
        return;
      }
      if (amount.trim() && !formatAmount(amount)) {
        setError('Amount must be a positive number, or leave it blank.');
        setQrDataUrl('');
        return;
      }
      setError('');
      try {
        const dataUrl = await QRCode.toDataURL(upiPayload, {
          width: 940,
          margin: 2,
          errorCorrectionLevel: 'H',
          color: { dark: '#111827', light: '#ffffff' },
        });
        if (active) setQrDataUrl(dataUrl);
      } catch {
        if (active) setError('Could not generate the UPI QR. Please check the details and try again.');
      }
    }
    generateQr();
    return () => { active = false; };
  }, [upiId, amount, upiPayload]);

  useEffect(() => {
    if (!qrDataUrl || typeof document === 'undefined') return;
    let active = true;
    async function generateTemplatePreviews() {
      const entries = await Promise.all(TEMPLATES.map(async (template) => {
        const canvas = document.createElement('canvas');
        await drawTemplateCanvas(canvas, {
          template,
          qrDataUrl,
          logoDataUrl,
          businessName,
          upiId,
        });
        return [template.id, canvas.toDataURL('image/png')];
      }));
      if (active) setTemplatePreviewUrls(Object.fromEntries(entries));
    }
    generateTemplatePreviews().catch(() => {});
    return () => { active = false; };
  }, [qrDataUrl, logoDataUrl, businessName, upiId]);

  useEffect(() => {
    if (!qrDataUrl) return;
    drawTemplateCanvas(templateCanvasRef.current, {
      template: selectedTemplate,
      qrDataUrl,
      logoDataUrl,
      businessName,
      upiId,
    }).catch(() => {});
  }, [selectedTemplate, qrDataUrl, logoDataUrl, businessName, upiId]);

  function handleLogoUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setLogoDataUrl(String(reader.result || ''));
    reader.readAsDataURL(file);
  }

  const fileBaseName = sanitizeFileName(`${businessName || 'business'}-upi-qr`);
  const cleanAmount = formatAmount(amount);
  const amountText = cleanAmount ? ` for ₹${cleanAmount}` : '';

  function getShareMessage(kind = 'qr') {
    const name = businessName || 'this business';
    if (kind === 'design') return `Print-ready UPI payment QR design for ${name}${amountText}. UPI ID: ${upiId}. Created with BharathQR: ${BHARATHQR_UTM}`;
    return `Pay ${name}${amountText} using UPI. UPI ID: ${upiId}. Created with BharathQR: ${BHARATHQR_UTM}`;
  }

  function downloadQrPng() {
    if (!qrDataUrl) return;
    downloadDataUrl(qrDataUrl, `${fileBaseName}-clean-upi-qr.png`);
  }

  function shareQrViaWhatsApp() {
    window.open(`https://wa.me/?text=${encodeURIComponent(getShareMessage('qr'))}`, '_blank', 'noopener,noreferrer');
  }

  async function copyPaymentLink() {
    try {
      await navigator.clipboard?.writeText(upiPayload);
      setNotice('UPI payment link copied.');
    } catch {
      setNotice('UPI payment link is ready to copy from the QR.');
    }
  }

  function downloadTemplatePng() {
    const canvas = templateCanvasRef.current;
    if (!canvas) return;
    downloadDataUrl(canvas.toDataURL('image/png'), `${fileBaseName}-${selectedTemplate.id}.png`);
  }

  function downloadTemplateSvg() {
    if (!qrDataUrl) return;
    const svg = makeTemplateSvg({ template: selectedTemplate, qrDataUrl, logoDataUrl, businessName, upiId });
    downloadBlob(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }), `${fileBaseName}-${selectedTemplate.id}.svg`);
  }

  function downloadTemplatePdf() {
    const canvas = templateCanvasRef.current;
    if (!canvas) return;
    downloadBlob(canvasToPdfBlob(canvas), `${fileBaseName}-${selectedTemplate.id}-print-ready.pdf`);
  }

  async function shareDesignViaWhatsApp() {
    const canvas = templateCanvasRef.current;
    const message = getShareMessage('design');
    if (!canvas) {
      window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
      return;
    }
    try {
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png', 1));
      if (blob && navigator.share && navigator.canShare) {
        const file = new File([blob], `${fileBaseName}-${selectedTemplate.id}.png`, { type: 'image/png' });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({ title: 'UPI QR Design by BharathQR', text: message, files: [file] });
          return;
        }
      }
    } catch {}
    downloadTemplatePng();
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
  }

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'UPI QR Code Generator',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
    url: CANONICAL_URL,
    description: 'Create a free clean UPI payment QR code and print-ready payment templates for Indian businesses.',
  };

  const heroPreview = templatePreviewUrls['counter-standee'];

  return (
    <>
      <Head>
        <title>Free UPI QR Code Generator for Indian Businesses | BharathQR</title>
        <meta name="description" content="Create a free UPI QR code for shops, restaurants, clinics, autos and small businesses. Add UPI ID, optional amount, logo and print-ready templates." />
        <link rel="canonical" href={CANONICAL_URL} />
        <meta property="og:title" content="Free UPI QR Code Generator" />
        <meta property="og:description" content="Generate clean UPI QR codes and print-ready payment templates. Free, no login required." />
        <meta property="og:url" content={CANONICAL_URL} />
        <meta property="og:type" content="website" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      </Head>

      <main className={styles.pageShell}>
        <section className={styles.toolHeader}>
          <Link href="/" className={styles.brandMark} aria-label="BharathQR home"><span />Bharath<span>QR</span></Link>
          <div className={styles.headerActions}>
            <Link href="/templates" className={styles.templateButton}>▦ View Templates</Link>
            <button type="button" aria-label="Open menu" className={styles.menuButton}>☰</button>
          </div>
        </section>

        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>FREE UPI QR TOOL FOR INDIAN BUSINESSES</p>
            <h1>Accept Payments Instantly with <span>UPI QR Code</span></h1>
            <p className={styles.heroText}>Create a clean UPI payment QR with optional fixed amount. Choose a premium print-ready template for your counter, auto, shop, clinic or restaurant.</p>
            <div className={styles.trustPills}><span>🎁 100% Free</span><span>👤 No Sign-up</span><span>🖨️ Print Ready</span></div>
          </div>
          <div className={styles.heroVisual}>
            <div className={styles.heroScene}>
              <div className={styles.heroChips}><span>UPI</span><span>BHIM</span><span>GPay</span></div>
              <div className={styles.heroBoard}>{heroPreview ? <img src={heroPreview} alt="UPI QR counter standee preview" /> : <TemplateFallback template={TEMPLATES[0]} />}</div>
              <div className={styles.heroSide} />
            </div>
          </div>
        </section>

        <section className={styles.workflow} aria-label="How it works">
          <article><span>1</span><i>💳</i><div><h2>Enter UPI Details</h2><p>Add your UPI ID and optional amount.</p></div></article>
          <article><span>2</span><i>▦</i><div><h2>Choose Template</h2><p>Pick a merchant-friendly print size.</p></div></article>
          <article><span>3</span><i>🖨️</i><div><h2>Download &amp; Display</h2><p>Print, place and start accepting payments.</p></div></article>
        </section>

        <section className={`${styles.panel} ${styles.generatorPanel}`}>
          <div className={styles.inputColumn}>
            <div className={styles.sectionTitle}><span>1</span><div><h2>UPI QR Generator</h2><p>Core payment details</p></div></div>
            <label>UPI ID / VPA <b>*</b></label>
            <div className={styles.upiInputWrap}><input value={upiId} onChange={(event) => setUpiId(event.target.value)} placeholder="name@upi (eg: bharathqr@okicici)" /><span>UPI</span></div>
            <label>Business / Payee Name <em>(Optional)</em></label>
            <input value={businessName} onChange={(event) => setBusinessName(event.target.value)} placeholder="Your business name" />
            <label>Amount <em>(Optional)</em></label>
            <input value={amount} onChange={(event) => setAmount(event.target.value.replace(/[^0-9.]/g, ''))} inputMode="decimal" placeholder="₹ 0.00" />
            {error && <p className={styles.errorText}>{error}</p>}
            {!error && notice && <p className={styles.noticeText}>{notice}</p>}
          </div>

          <div className={styles.qrColumn}>
            <h2>Preview</h2>
            <div className={styles.qrFrame}>{qrDataUrl ? <img src={qrDataUrl} alt="Generated clean UPI payment QR code" /> : <span />}</div>
            <p>Clean QR only — no logo inside the payment QR</p>
            <div className={styles.qrBrandStrip}><b>BHIM</b><b>UPI</b><span>G Pay</span><span>PhonePe</span><span>Paytm</span></div>
            <div className={styles.qrActions}><button type="button" onClick={downloadQrPng}>⌄ Download QR PNG</button><button type="button" onClick={shareQrViaWhatsApp}><WhatsAppIcon /> Share via WhatsApp</button></div>
          </div>

          <div className={styles.logoColumn}>
            <h2>Template Logo</h2>
            <label>Upload Business Logo <em>(Optional)</em></label>
            <label className={styles.logoDrop}>
              <input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={handleLogoUpload} />
              <span>⇧</span><strong>{logoDataUrl ? 'Logo Added' : 'Upload Logo'}</strong><small>Only appears at top of template</small>
            </label>
            <div className={styles.hintBox}><strong>{cleanAmount ? `Fixed amount QR: ₹${cleanAmount}` : 'Open amount QR'}</strong><small>{cleanAmount ? 'Customer scans and amount is pre-filled.' : 'Customer scans and enters the amount.'}</small></div>
          </div>
        </section>

        <section className={styles.studioGrid}>
          <div className={`${styles.panel} ${styles.studioPanel}`}>
            <div className={styles.sectionTitle}><span>2</span><div><h2>Template Studio</h2><p>Choose a payment QR template and customize it</p></div></div>
            <div className={styles.templateCards}>
              {TEMPLATES.map((template) => (
                <button key={template.id} type="button" className={`${styles.templateCard} ${selectedTemplate.id === template.id ? styles.activeTemplate : ''}`} onClick={() => setSelectedTemplateId(template.id)}>
                  <span className={styles.templateThumb} data-template={template.id}>{templatePreviewUrls[template.id] ? <img src={templatePreviewUrls[template.id]} alt={`${template.name} preview`} /> : <TemplateFallback template={template} />}</span>
                  <strong>{template.name}</strong><small>{template.size}</small>
                </button>
              ))}
            </div>
            <div className={styles.templateEditBar}>
              <label><span>Business Name on Template</span><input value={businessName} onChange={(event) => setBusinessName(event.target.value)} placeholder="Your business name" /></label>
              <label className={styles.inlineLogoUpload}><input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={handleLogoUpload} /><span>⇧</span><strong>{logoDataUrl ? 'Logo Added' : 'Upload Logo'}</strong></label>
            </div>
          </div>

          <aside className={`${styles.panel} ${styles.livePreviewPanel}`}>
            <div className={styles.liveHeader}><div><h2>Live Product Preview</h2><p>This is how your print design will look</p></div><span>LIVE</span></div>
            <div className={styles.liveStage} data-template={selectedTemplate.id}><canvas ref={templateCanvasRef} aria-label="Live UPI payment product preview" /></div>
            <div className={styles.liveActions}>
              <button type="button" onClick={shareDesignViaWhatsApp}><WhatsAppIcon /> Design Share</button>
              <button type="button" onClick={downloadTemplatePng}>▣ PNG</button>
              <button type="button" onClick={downloadTemplateSvg}>◇ SVG</button>
              <button type="button" onClick={downloadTemplatePdf}>▤ PDF</button>
              <button type="button" onClick={copyPaymentLink}>🔗 Copy Link</button>
            </div>
            <div className={styles.previewMeta}><strong>{selectedTemplate.name}</strong><span>{selectedTemplate.size}</span><p>{selectedTemplate.bestFor}</p></div>
          </aside>
        </section>

        <section className={styles.finishedSection}>
          <div className={styles.finishedHeader}><div><h2>Finished Products You Can Print</h2><p>Four practical UPI payment display formats for Indian merchants</p></div><Link href="/templates">View All Templates →</Link></div>
          <div className={styles.productRow}>
            {TEMPLATES.map((template) => (
              <article key={template.id} className={styles.productCard}>
                <div className={styles.productPhoto} data-template={template.id}><span>{templatePreviewUrls[template.id] ? <img src={templatePreviewUrls[template.id]} alt={`${template.name} print preview`} /> : <TemplateFallback template={template} />}</span></div>
                <strong>{template.name}</strong><b>{template.size}</b><p>{template.bestFor}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.moreTools}>
          <h2>More Tools &amp; Guides</h2>
          <div><Link href="/tools/google-review-qr-generator">⭐ Google Review QR</Link><Link href="/tools/whatsapp-qr-generator">🟢 WhatsApp QR Generator</Link><Link href="/tools/url-qr-generator">🔗 URL QR Generator</Link><Link href="/templates">🧾 Payment QR Templates</Link></div>
        </section>

        <section className={styles.seoBlock}>
          <div><h2>Free UPI QR Code Generator for shops and small businesses</h2><p>BharathQR helps Indian businesses create a clean UPI payment QR code for counters, reception desks, delivery parcels, billing tables and printed displays. Enter your UPI ID, optional payee name and optional fixed amount, then download a clean QR or a ready-to-print payment display.</p></div>
          <div className={styles.infoGrid}><article><h3>Fixed or open amount</h3><p>Leave amount blank when customers should enter the amount. Add an amount when you want a fixed payment QR.</p></article><article><h3>Clean UPI QR</h3><p>The payment QR remains plain and scannable. Your logo is used only on the printed template header.</p></article><article><h3>Print-ready templates</h3><p>Use standees, table tents, cards and stickers so customers can notice the QR quickly.</p></article></div>
        </section>
      </main>
    </>
  );
}
