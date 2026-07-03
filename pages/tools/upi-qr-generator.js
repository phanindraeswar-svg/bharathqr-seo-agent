import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import QRCode from 'qrcode';
import styles from '../../styles/UpiQRGenerator.module.css';

const CANONICAL_URL = 'https://www.bharathqr.com/tools/upi-qr-generator';
const BHARATHQR_UTM = `${CANONICAL_URL}?utm_source=whatsapp&utm_medium=share&utm_campaign=upi_qr_generator`;
const CANVAS_SCALE = 3;
const DEFAULT_UPI_ID = 'jainsocialgroup@idfcbank';
const DEFAULT_PAYEE = 'Sunrise Cafe';
const DEFAULT_NOTE = 'Payment via UPI';

const TEMPLATES = [
  {
    id: 'counter-standee',
    name: 'Counter Standee',
    shortName: 'Counter Standee',
    size: '4 × 6 inch / A6',
    bestFor: 'Best for billing counters, cashier desks, clinics and small shops',
    width: 420,
    height: 620,
    background: '#ffffff',
    surface: '#fffdfb',
    accent: '#ff4f23',
    accent2: '#f97316',
    text: '#111827',
    muted: '#667085',
    dark: false,
    round: false,
  },
  {
    id: 'table-tent',
    name: 'Table Tent',
    shortName: 'Table Tent',
    size: '6 × 4 inch',
    bestFor: 'Ideal for restaurants, cafes, retail counters and billing tables',
    width: 620,
    height: 420,
    background: '#ffffff',
    surface: '#fffaf5',
    accent: '#ff4f23',
    accent2: '#f97316',
    text: '#111827',
    muted: '#667085',
    dark: false,
    round: false,
  },
  {
    id: 'payment-card',
    name: 'Payment Card',
    shortName: 'Payment Card',
    size: '85 × 55 mm',
    bestFor: 'Best for auto drivers, delivery partners, wallets and parcel inserts',
    width: 680,
    height: 430,
    background: '#ffffff',
    surface: '#ffffff',
    accent: '#ff4f23',
    accent2: '#f97316',
    text: '#111827',
    muted: '#667085',
    dark: false,
    round: false,
  },
  {
    id: 'round-sticker',
    name: 'Round Sticker',
    shortName: 'Round Sticker',
    size: '3 inch circle',
    bestFor: 'Best for autos, counters, jars, boxes, packaging and takeaway bags',
    width: 560,
    height: 560,
    background: '#ffffff',
    surface: '#ffffff',
    accent: '#ff4f23',
    accent2: '#20a86b',
    text: '#111827',
    muted: '#667085',
    dark: false,
    round: true,
  },
];

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
  const trimmed = String(value || '').trim();
  if (!trimmed) return '';
  const number = Number(trimmed);
  if (!Number.isFinite(number) || number <= 0) return '';
  return number.toFixed(2);
}

function isValidUpiId(value) {
  return /^[a-zA-Z0-9._-]{2,256}@[a-zA-Z][a-zA-Z0-9._-]{2,64}$/.test(String(value || '').trim());
}

function buildUpiPayload({ upiId, payeeName, amount, note }) {
  const params = new URLSearchParams();
  params.set('pa', String(upiId || '').trim());
  params.set('pn', String(payeeName || 'Business').trim());
  params.set('cu', 'INR');
  const cleanAmount = formatAmount(amount);
  if (cleanAmount) params.set('am', cleanAmount);
  const cleanNote = String(note || '').trim();
  if (cleanNote) params.set('tn', cleanNote);
  return `upi://pay?${params.toString()}`;
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
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

function drawBharathMark(ctx, x, y, size, color = '#ff4f23') {
  const s = size;
  const t = s * 0.2;
  ctx.fillStyle = color;
  ctx.fillRect(x, y, s * 0.38, t);
  ctx.fillRect(x, y, t, s * 0.38);
  ctx.fillRect(x + s * 0.62, y, s * 0.38, t);
  ctx.fillRect(x + s * 0.8, y, t, s * 0.38);
  ctx.fillRect(x, y + s * 0.8, s * 0.38, t);
  ctx.fillRect(x, y + s * 0.62, t, s * 0.38);
  ctx.fillRect(x + s * 0.62, y + s * 0.8, s * 0.38, t);
  ctx.fillRect(x + s * 0.8, y + s * 0.62, t, s * 0.38);
}

function drawUPIWordmark(ctx, x, y, scale = 1, dark = false) {
  ctx.save();
  ctx.translate(x, y);
  ctx.font = `900 italic ${42 * scale}px Inter, Arial, sans-serif`;
  ctx.fillStyle = dark ? '#ffffff' : '#3f464d';
  ctx.fillText('UPI', 0, 0);
  ctx.beginPath();
  ctx.moveTo(101 * scale, -35 * scale);
  ctx.lineTo(135 * scale, -10 * scale);
  ctx.lineTo(101 * scale, 13 * scale);
  ctx.closePath();
  ctx.fillStyle = '#ff7a1a';
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(116 * scale, -27 * scale);
  ctx.lineTo(142 * scale, -10 * scale);
  ctx.lineTo(116 * scale, 7 * scale);
  ctx.closePath();
  ctx.fillStyle = '#178f4b';
  ctx.fill();
  ctx.restore();
}

function drawSmallTriangle(ctx, x, y, size, color) {
  ctx.beginPath();
  ctx.moveTo(x, y - size);
  ctx.lineTo(x + size * 1.35, y);
  ctx.lineTo(x, y + size);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

function drawAppStrip(ctx, x, y, width, dark = false, scale = 1, compact = false) {
  const labels = compact
    ? [
        { text: 'GPay', color: '#4285f4' },
        { text: 'PhonePe', color: '#5f259f' },
        { text: 'Paytm', color: '#00baf2' },
        { text: 'BHIM', color: '#111827' },
      ]
    : [
        { text: 'G Pay', color: '#4285f4' },
        { text: 'PhonePe', color: '#5f259f' },
        { text: 'Paytm', color: '#00baf2' },
        { text: 'AmazonPay', color: '#111827' },
        { text: 'CRED', color: '#111827' },
        { text: 'MobiKwik', color: '#2563eb' },
      ];
  const gap = width / labels.length;
  labels.forEach((item, index) => {
    const cx = x + gap * index + gap / 2;
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `900 ${Math.max(6, 10.5 * scale)}px Inter, Arial, sans-serif`;
    ctx.fillStyle = dark ? '#ffffff' : item.color;
    ctx.fillText(item.text, cx, y);
    ctx.restore();
  });
}

function drawBhimUpiStrip(ctx, x, y, width, dark = false, scale = 1) {
  ctx.save();
  const center = x + width / 2;
  ctx.textBaseline = 'middle';
  ctx.font = `900 italic ${30 * scale}px Inter, Arial, sans-serif`;
  ctx.fillStyle = dark ? '#fff' : '#4b5563';
  ctx.textAlign = 'right';
  ctx.fillText('BHIM', center - 24 * scale, y);
  drawSmallTriangle(ctx, center - 16 * scale, y, 11 * scale, '#ff7a1a');
  drawSmallTriangle(ctx, center - 7 * scale, y, 11 * scale, '#178f4b');
  ctx.textAlign = 'left';
  ctx.fillText('UPI', center + 26 * scale, y);
  drawSmallTriangle(ctx, center + 88 * scale, y, 11 * scale, '#ff7a1a');
  drawSmallTriangle(ctx, center + 97 * scale, y, 11 * scale, '#178f4b');
  ctx.restore();
}

async function createBrandedQrDataUrl(qrDataUrl, logoDataUrl) {
  const qrImage = await loadImage(qrDataUrl);
  const size = 900;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, size, size);
  ctx.drawImage(qrImage, 0, 0, size, size);

  if (logoDataUrl) {
    const logo = await loadImage(logoDataUrl);
    const box = 178;
    const x = (size - box) / 2;
    const y = (size - box) / 2;
    ctx.save();
    ctx.shadowColor = 'rgba(15,23,42,.16)';
    ctx.shadowBlur = 18;
    ctx.fillStyle = '#ffffff';
    roundRect(ctx, x, y, box, box, 34);
    ctx.fill();
    ctx.restore();
    roundRect(ctx, x + 18, y + 18, box - 36, box - 36, 24);
    ctx.clip();
    drawContainImage(ctx, logo, x + 22, y + 22, box - 44, box - 44);
  }
  return canvas.toDataURL('image/png');
}

function fittedFontSize(ctx, text, maxWidth, start, min, weight = 900) {
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
  const value = String(text || '').replace(/\s+/g, ' ').trim();
  const size = fittedFontSize(ctx, value, maxWidth, start, min, weight);
  ctx.save();
  ctx.font = `${weight} ${size}px Inter, Arial, sans-serif`;
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(value, x, y);
  ctx.restore();
}

function drawLogoBadge(ctx, cx, cy, size, logo, accent = '#ff4f23') {
  ctx.save();
  ctx.fillStyle = '#fff7ed';
  ctx.strokeStyle = accent;
  ctx.lineWidth = Math.max(1.3, size * 0.055);
  ctx.beginPath();
  ctx.arc(cx, cy, size / 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  if (logo) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, size * 0.39, 0, Math.PI * 2);
    ctx.clip();
    drawContainImage(ctx, logo, cx - size * 0.36, cy - size * 0.36, size * 0.72, size * 0.72);
    ctx.restore();
  } else {
    ctx.font = `900 ${size * 0.52}px Inter, Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = accent;
    ctx.fillText('₹', cx, cy + size * 0.02);
  }
  ctx.restore();
}

function drawBrandHeader(ctx, xCenter, y, maxWidth, name, logo, template) {
  const title = String(name || 'Your Business').replace(/\s+/g, ' ').trim().slice(0, 34) || 'Your Business';
  const logoSize = template.round ? 30 : template.width > template.height ? 30 : 34;
  const fontSize = fittedFontSize(ctx, title, maxWidth - logoSize - 12, template.round ? 17 : template.width > template.height ? 17 : 20, 11, 900);
  ctx.font = `900 ${fontSize}px Inter, Arial, sans-serif`;
  const textW = ctx.measureText(title).width;
  const totalW = logoSize + 8 + textW;
  const logoCx = xCenter - totalW / 2 + logoSize / 2;
  drawLogoBadge(ctx, logoCx, y - 1, logoSize, logo, template.accent);
  ctx.save();
  ctx.font = `900 ${fontSize}px Inter, Arial, sans-serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = template.accent;
  ctx.fillText(title, logoCx + logoSize / 2 + 8, y);
  ctx.restore();
}

function drawPaymentLogos(ctx, x, y, width, template, scale = 1) {
  drawBhimUpiStrip(ctx, x, y, width, template.dark, scale);
}

function getTemplateLayout(template) {
  if (template.id === 'counter-standee') {
    return {
      margin: 28,
      borderRadius: 28,
      headerY: 62,
      scanY: 118,
      qrSize: 214,
      qrY: 164,
      upiY: 408,
      logosY: 476,
      appsY: 538,
      logoWidth: 292,
      appWidth: 300,
      logoScale: 0.74,
      appScale: 0.70,
    };
  }
  if (template.id === 'table-tent') {
    return {
      margin: 30,
      borderRadius: 26,
      headerY: 56,
      scanY: 94,
      qrSize: 150,
      qrY: 122,
      upiY: 300,
      logosY: 342,
      appsY: 384,
      logoWidth: 300,
      appWidth: 350,
      logoScale: 0.62,
      appScale: 0.60,
    };
  }
  if (template.id === 'payment-card') {
    return {
      margin: 28,
      borderRadius: 24,
      headerY: 56,
      scanY: 94,
      qrSize: 144,
      qrY: 124,
      upiY: 294,
      logosY: 338,
      appsY: 378,
      logoWidth: 316,
      appWidth: 366,
      logoScale: 0.60,
      appScale: 0.58,
    };
  }
  return {
    margin: 24,
    borderRadius: 999,
    headerY: 88,
    scanY: 136,
    qrSize: 168,
    qrY: 176,
    upiY: 372,
    logosY: 420,
    appsY: 468,
    logoWidth: 240,
    appWidth: 240,
    logoScale: 0.52,
    appScale: 0.52,
  };
}

function paintTemplateBackground(ctx, width, height, template, layout) {
  ctx.save();
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  if (template.round) {
    const r = width / 2 - 10;
    const bg = ctx.createRadialGradient(width * 0.35, height * 0.25, width * 0.05, width / 2, height / 2, r);
    bg.addColorStop(0, '#ffffff');
    bg.addColorStop(1, '#fff8f1');
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, r, 0, Math.PI * 2);
    ctx.fillStyle = bg;
    ctx.fill();
    ctx.lineWidth = 5;
    ctx.strokeStyle = template.accent;
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, r - 9, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
    return;
  }

  const x = layout.margin;
  const y = layout.margin;
  const w = width - layout.margin * 2;
  const h = height - layout.margin * 2;
  const surface = ctx.createLinearGradient(0, 0, width, height);
  surface.addColorStop(0, '#ffffff');
  surface.addColorStop(0.58, '#ffffff');
  surface.addColorStop(1, '#fff7ed');
  ctx.fillStyle = surface;
  roundRect(ctx, x, y, w, h, layout.borderRadius);
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = template.accent;
  roundRect(ctx, x + 5, y + 5, w - 10, h - 10, layout.borderRadius - 5);
  ctx.stroke();
  ctx.restore();
}

async function drawTemplateCanvas(canvas, options) {
  const { template, qrDataUrl, logoDataUrl, businessName, upiId } = options;
  if (!canvas || !qrDataUrl) return;
  const width = template.width;
  const height = template.height;
  const isLandscape = width > height;
  const layout = getTemplateLayout(template);
  const canvasScale = CANVAS_SCALE;
  canvas.width = width * canvasScale;
  canvas.height = height * canvasScale;
  canvas.style.aspectRatio = `${width} / ${height}`;
  const ctx = canvas.getContext('2d');
  ctx.setTransform(canvasScale, 0, 0, canvasScale, 0, 0);
  ctx.clearRect(0, 0, width, height);

  const qrImage = await loadImage(qrDataUrl);
  const logo = logoDataUrl ? await loadImage(logoDataUrl) : null;
  const upiText = `UPI ID: ${String(upiId || DEFAULT_UPI_ID).slice(0, template.round ? 30 : isLandscape ? 38 : 34)}`;
  const contentWidth = template.round ? 330 : width - layout.margin * 2 - 42;

  ctx.save();
  if (template.round) {
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, width / 2 - 8, 0, Math.PI * 2);
    ctx.clip();
  }

  paintTemplateBackground(ctx, width, height, template, layout);
  drawBrandHeader(ctx, width / 2, layout.headerY, contentWidth, businessName, logo, template);
  drawCenteredText(ctx, 'SCAN & PAY', width / 2, layout.scanY, contentWidth, template.round ? 14 : isLandscape ? 15 : 17, 10, template.text, 950);

  const qrSize = layout.qrSize;
  const qrX = Math.round((width - qrSize) / 2);
  const qrY = layout.qrY;
  ctx.save();
  ctx.shadowColor = 'rgba(15, 23, 42, .13)';
  ctx.shadowBlur = 10;
  ctx.fillStyle = '#fff';
  roundRect(ctx, qrX - 11, qrY - 11, qrSize + 22, qrSize + 22, template.round ? 18 : 14);
  ctx.fill();
  ctx.restore();
  ctx.strokeStyle = '#9aa8ba';
  ctx.lineWidth = 1.2;
  roundRect(ctx, qrX - 8, qrY - 8, qrSize + 16, qrSize + 16, template.round ? 16 : 12);
  ctx.stroke();
  ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize);

  drawCenteredText(ctx, upiText, width / 2, layout.upiY, contentWidth, template.round ? 7.4 : isLandscape ? 9.4 : 10.2, 6.4, template.text, 850);
  drawPaymentLogos(ctx, (width - layout.logoWidth) / 2, layout.logosY, layout.logoWidth, template, layout.logoScale);
  drawAppStrip(ctx, (width - layout.appWidth) / 2, layout.appsY, layout.appWidth, template.dark, layout.appScale, template.round);

  ctx.restore();
}

function makeTemplateSvg({ template, qrDataUrl, logoDataUrl, businessName, upiId }) {
  const width = template.width;
  const height = template.height;
  const isLandscape = width > height;
  const layout = getTemplateLayout(template);
  const qrSize = layout.qrSize;
  const qrX = (width - qrSize) / 2;
  const qrY = layout.qrY;
  const title = encodeXml(String(businessName || 'Your Business').replace(/\s+/g, ' ').trim().slice(0, 34) || 'Your Business');
  const upiText = encodeXml(`UPI ID: ${String(upiId || DEFAULT_UPI_ID).slice(0, 42)}`);
  const clip = template.round ? `<clipPath id="roundClip"><circle cx="${width / 2}" cy="${height / 2}" r="${width / 2 - 8}"/></clipPath>` : '';
  const groupStart = template.round ? '<g clip-path="url(#roundClip)">' : '<g>';
  const shell = template.round
    ? `<circle cx="${width / 2}" cy="${height / 2}" r="${width / 2 - 18}" fill="${template.surface}"/><circle cx="${width / 2}" cy="${height / 2}" r="${width / 2 - 24}" fill="none" stroke="${template.accent}" stroke-width="5"/>`
    : `<rect x="18" y="18" width="${width - 36}" height="${height - 36}" rx="${isLandscape ? 22 : 26}" fill="${template.surface}"/><rect x="22" y="22" width="${width - 44}" height="${height - 44}" rx="${isLandscape ? 18 : 22}" fill="none" stroke="${template.accent}" stroke-width="4"/>`;
  const logoSize = template.round ? 30 : isLandscape ? 30 : 34;
  const logoX = width / 2 - 92;
  const logo = logoDataUrl
    ? `<circle cx="${logoX}" cy="${layout.headerY}" r="${logoSize / 2}" fill="#fff7ed" stroke="${template.accent}" stroke-width="1.6"/><image href="${logoDataUrl}" x="${logoX - logoSize * 0.34}" y="${layout.headerY - logoSize * 0.34}" width="${logoSize * 0.68}" height="${logoSize * 0.68}" preserveAspectRatio="xMidYMid meet"/>`
    : `<circle cx="${logoX}" cy="${layout.headerY}" r="${logoSize / 2}" fill="#fff7ed" stroke="${template.accent}" stroke-width="1.6"/><text x="${logoX}" y="${layout.headerY + logoSize * 0.16}" text-anchor="middle" font-size="${logoSize * 0.5}" font-weight="900" fill="${template.accent}">₹</text>`;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>${clip}</defs>
  ${groupStart}
    <rect width="${width}" height="${height}" fill="${template.background}"/>
    ${shell}
    ${logo}
    <text x="${width / 2 + 14}" y="${layout.headerY + 1}" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="${template.round ? 16 : isLandscape ? 17 : 20}" font-weight="900" fill="${template.accent}">${title}</text>
    <text x="${width / 2}" y="${layout.scanY}" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="${template.round ? 14 : isLandscape ? 15 : 17}" font-weight="900" fill="${template.text}">SCAN &amp; PAY</text>
    <rect x="${qrX - 13}" y="${qrY - 13}" width="${qrSize + 26}" height="${qrSize + 26}" rx="${template.round ? 18 : 14}" fill="#fff" stroke="#a8b3c3"/>
    <image href="${qrDataUrl}" x="${qrX}" y="${qrY}" width="${qrSize}" height="${qrSize}"/>
    <text x="${width / 2}" y="${layout.upiY}" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="${template.round ? 7.4 : isLandscape ? 9.3 : 10.6}" font-weight="800" fill="${template.text}">${upiText}</text>
    <text x="${width / 2 - 42}" y="${layout.logosY}" text-anchor="end" font-family="Inter, Arial, sans-serif" font-size="${30 * layout.logoScale}" font-style="italic" font-weight="900" fill="#4a4f57">BHIM</text>
    <text x="${width / 2 + 42}" y="${layout.logosY}" text-anchor="start" font-family="Inter, Arial, sans-serif" font-size="${30 * layout.logoScale}" font-style="italic" font-weight="900" fill="#4a4f57">UPI</text>
    <text x="${width / 2}" y="${layout.appsY}" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="${template.round ? 6.2 : isLandscape ? 7.2 : 8.2}" font-weight="900" fill="#2563eb">G Pay · PhonePe · Paytm · Amazon Pay · CRED · MobiKwik</text>
  </g>
</svg>`;
}

function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function downloadDataUrl(dataUrl, fileName) {
  const anchor = document.createElement('a');
  anchor.href = dataUrl;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
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


function TemplateMini({ template, qrDataUrl, logoDataUrl, businessName, upiId }) {
  const cleanName = String(businessName || 'Your Business').trim() || 'Your Business';
  const cleanUpi = String(upiId || DEFAULT_UPI_ID).trim() || DEFAULT_UPI_ID;
  return (
    <span className={styles.miniDesign} data-template={template.id}>
      <span className={styles.miniBrandRow}>
        <span className={styles.miniLogoMark}>
          {logoDataUrl ? <img src={logoDataUrl} alt="" /> : <span>₹</span>}
        </span>
        <b>{cleanName}</b>
      </span>
      <span className={styles.miniHeading}>SCAN &amp; PAY</span>
      <span className={styles.miniQrBox}>{qrDataUrl ? <img src={qrDataUrl} alt="" /> : null}</span>
      <span className={styles.miniUpiId}>UPI ID: {cleanUpi.slice(0, 30)}</span>
      <span className={styles.miniBhimUpi}><b>BHIM</b><i>UPI</i></span>
      <span className={styles.miniApps}>G Pay · PhonePe · Paytm · BHIM</span>
    </span>
  );
}

function WhatsAppIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 32 32" focusable="false">
      <path fill="currentColor" d="M16.02 3.2A12.66 12.66 0 0 0 5.3 22.6L3.8 28.8l6.35-1.45A12.68 12.68 0 1 0 16.02 3.2Zm0 22.95c-2.08 0-4.02-.62-5.65-1.68l-.4-.25-3.72.85.88-3.62-.27-.42A10.22 10.22 0 1 1 16.02 26.15Zm5.86-7.64c-.32-.16-1.9-.94-2.2-1.05-.3-.1-.52-.16-.74.16-.22.32-.84 1.05-1.03 1.27-.19.22-.38.24-.7.08-.32-.16-1.36-.5-2.59-1.6-.96-.86-1.6-1.92-1.79-2.24-.19-.32-.02-.5.14-.66.15-.15.32-.38.48-.57.16-.19.22-.32.32-.54.11-.22.05-.4-.03-.56-.08-.16-.74-1.78-1.01-2.43-.27-.64-.54-.55-.74-.56h-.63c-.22 0-.56.08-.86.4-.3.32-1.13 1.1-1.13 2.68s1.16 3.12 1.32 3.33c.16.22 2.28 3.48 5.52 4.88.77.33 1.37.53 1.84.68.77.25 1.48.21 2.04.13.62-.09 1.9-.78 2.17-1.53.27-.75.27-1.4.19-1.53-.08-.13-.3-.21-.62-.37Z" />
    </svg>
  );
}

export default function UpiQRGenerator() {
  const [upiId, setUpiId] = useState(DEFAULT_UPI_ID);
  const [businessName, setBusinessName] = useState(DEFAULT_PAYEE);
  const [amount, setAmount] = useState('');
  const [logoDataUrl, setLogoDataUrl] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState(TEMPLATES[0].id);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [brandedQrDataUrl, setBrandedQrDataUrl] = useState('');
  const [templatePreviewUrls, setTemplatePreviewUrls] = useState({});
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const templateCanvasRef = useRef(null);

  const selectedTemplate = useMemo(
    () => TEMPLATES.find((template) => template.id === selectedTemplateId) || TEMPLATES[0],
    [selectedTemplateId]
  );

  const upiPayload = useMemo(
    () => buildUpiPayload({ upiId, payeeName: businessName || 'Business', amount, note: DEFAULT_NOTE }),
    [upiId, businessName, amount]
  );

  useEffect(() => {
    let active = true;
    async function generate() {
      const cleanUpi = upiId.trim();
      if (!isValidUpiId(cleanUpi)) {
        setError('Enter a valid UPI ID like name@bank or business@okicici.');
        setNotice('');
        return;
      }
      if (amount.trim() && !formatAmount(amount)) {
        setError('Amount must be a positive number, or leave it blank.');
        setNotice('');
        return;
      }
      setError('');
      setNotice('');
      try {
        const dataUrl = await QRCode.toDataURL(upiPayload, {
          width: 900,
          margin: 2,
          errorCorrectionLevel: 'H',
          color: { dark: '#111827', light: '#ffffff' },
        });
        if (!active) return;
        setQrDataUrl(dataUrl);
      } catch (err) {
        if (active) setError('Could not generate the UPI QR. Please check the details and try again.');
      }
    }
    generate();
    return () => {
      active = false;
    };
  }, [upiId, businessName, amount, upiPayload]);

  useEffect(() => {
    let active = true;
    async function brandQr() {
      if (!qrDataUrl) return;
      try {
        const dataUrl = await createBrandedQrDataUrl(qrDataUrl, logoDataUrl);
        if (active) setBrandedQrDataUrl(dataUrl);
      } catch {
        if (active) setBrandedQrDataUrl(qrDataUrl);
      }
    }
    brandQr();
    return () => { active = false; };
  }, [qrDataUrl, logoDataUrl]);


  useEffect(() => {
    if (!brandedQrDataUrl || typeof document === 'undefined') return;
    let active = true;
    async function generateTemplatePreviews() {
      const entries = await Promise.all(TEMPLATES.map(async (template) => {
        const previewCanvas = document.createElement('canvas');
        await drawTemplateCanvas(previewCanvas, {
          template,
          qrDataUrl: brandedQrDataUrl,
          logoDataUrl,
          businessName,
          upiId,
        });
        return [template.id, previewCanvas.toDataURL('image/png')];
      }));
      if (active) setTemplatePreviewUrls(Object.fromEntries(entries));
    }
    generateTemplatePreviews().catch(() => {});
    return () => { active = false; };
  }, [brandedQrDataUrl, logoDataUrl, businessName, upiId]);

  useEffect(() => {
    if (!brandedQrDataUrl) return;
    drawTemplateCanvas(templateCanvasRef.current, {
      template: selectedTemplate,
      qrDataUrl: brandedQrDataUrl,
      logoDataUrl,
      businessName,
      upiId,
    }).catch(() => {});
  }, [selectedTemplate, brandedQrDataUrl, logoDataUrl, businessName, upiId]);

  const fileBaseName = sanitizeFileName(`${businessName}-upi-qr`);


  function handleLogoUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setLogoDataUrl(String(reader.result || ''));
    reader.readAsDataURL(file);
  }


  function getShareMessage(kind = 'qr') {
    const amountText = formatAmount(amount) ? ` for ₹${formatAmount(amount)}` : '';
    const name = businessName || 'this business';
    const upiText = upiId ? `UPI ID: ${upiId}. ` : '';
    if (kind === 'design') {
      return `Here is the print-ready UPI payment QR design for ${name}${amountText}. ${upiText}Created with BharathQR: ${BHARATHQR_UTM}`;
    }
    return `Pay ${name}${amountText} using UPI. ${upiText}Created with BharathQR: ${BHARATHQR_UTM}`;
  }

  function shareViaWhatsApp() {
    window.open(`https://wa.me/?text=${encodeURIComponent(getShareMessage('qr'))}`, '_blank', 'noopener,noreferrer');
  }

  async function sharePaymentLink() {
    const shareText = `UPI payment link for ${businessName || 'this business'}: ${upiPayload}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'UPI payment link', text: shareText });
        return;
      }
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(upiPayload);
        setNotice('UPI payment link copied.');
        return;
      }
    } catch {}
    setNotice('UPI payment link is ready to copy from the QR.');
  }

  async function shareDesignViaWhatsApp() {
    const canvas = templateCanvasRef.current;
    if (!canvas) { shareViaWhatsApp(); return; }
    const message = getShareMessage('design');
    try {
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png', 1));
      if (blob && navigator.canShare && navigator.share) {
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

  function downloadQrPng() {
    if (!brandedQrDataUrl) return;
    downloadDataUrl(brandedQrDataUrl, `${fileBaseName}-payment-qr.png`);
  }

  function downloadTemplatePng() {
    const canvas = templateCanvasRef.current;
    if (!canvas) return;
    downloadDataUrl(canvas.toDataURL('image/png'), `${fileBaseName}-${selectedTemplate.id}.png`);
  }

  function downloadTemplateSvg() {
    if (!brandedQrDataUrl) return;
    const svg = makeTemplateSvg({
      template: selectedTemplate,
      qrDataUrl: brandedQrDataUrl,
      logoDataUrl,
      businessName,
      upiId,
    });
    downloadBlob(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }), `${fileBaseName}-${selectedTemplate.id}.svg`);
  }

  function downloadTemplatePdf() {
    const canvas = templateCanvasRef.current;
    if (!canvas) return;
    downloadBlob(canvasToPdfBlob(canvas), `${fileBaseName}-${selectedTemplate.id}-print-ready.pdf`);
  }

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'UPI QR Code Generator',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
    url: CANONICAL_URL,
    description: 'Create a free print-ready UPI payment QR code for Indian businesses with optional amount, payment note and print-ready templates.',
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Is this UPI QR Code Generator free?',
        acceptedAnswer: { '@type': 'Answer', text: 'Yes. BharathQR lets Indian businesses create and download UPI payment QR codes for free without login.' },
      },
      {
        '@type': 'Question',
        name: 'Can I create a fixed amount UPI QR code?',
        acceptedAnswer: { '@type': 'Answer', text: 'Yes. Enter an amount to create a fixed amount UPI QR, or leave amount blank so customers can type the amount while paying.' },
      },
      {
        '@type': 'Question',
        name: 'Which apps can scan this UPI QR?',
        acceptedAnswer: { '@type': 'Answer', text: 'The QR uses the standard UPI payment link format and can be scanned by common UPI apps such as Google Pay, PhonePe, Paytm, BHIM and bank UPI apps.' },
      },
    ],
  };

  return (
    <>
      <Head>
        <title>Free UPI QR Code Generator for Business — BharathQR</title>
        <meta
          name="description"
          content="Create a free UPI QR code for your shop, restaurant, clinic, salon or small business. Add UPI ID, amount, note and print-ready payment templates."
        />
        <link rel="canonical" href={CANONICAL_URL} />
        <meta property="og:title" content="Free UPI QR Code Generator for Business — BharathQR" />
        <meta property="og:description" content="Generate a professional UPI payment QR code with amount, note and print-ready templates. Free, no login required." />
        <meta property="og:url" content={CANONICAL_URL} />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      </Head>

      <main className={styles.pageShell}>
        <header className={styles.topbar}>
          <Link href="/" className={styles.brand} aria-label="BharathQR home">
            <span className={styles.logoMark} aria-hidden="true" />
            <strong>Bharath<span>QR</span></strong>
          </Link>
          <nav className={styles.headerActions} aria-label="Primary navigation">
            <Link href="/templates"><span className={styles.gridIcon} aria-hidden="true" />View Templates</Link>
            <button type="button" className={styles.menuButton} aria-label="Open menu"><span /><span /><span /></button>
          </nav>
        </header>

        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>Free UPI QR tool for Indian businesses</p>
            <h1>Accept Payments Instantly with <span>UPI QR Code</span></h1>
            <p className={styles.heroLead}>Create a professional UPI payment QR with optional amount and note. Choose a print-ready template and start accepting payments at your counter in seconds.</p>
            <div className={styles.trustPills}>
              <span>🎁 100% Free</span>
              <span>👤 No Sign-up</span>
              <span>🖨️ Print Ready</span>
            </div>
          </div>
          <div className={styles.heroVisual} aria-hidden="true">
            <div className={styles.heroGlow} />
            <div className={styles.heroSceneCard}>
              <div className={styles.heroStandee}>
                {templatePreviewUrls['counter-standee'] ? <img className={styles.heroDesignImage} src={templatePreviewUrls['counter-standee']} alt="" /> : <TemplateMini template={TEMPLATES[0]} qrDataUrl={brandedQrDataUrl} logoDataUrl={logoDataUrl} businessName={businessName} upiId={upiId} />}
              </div>
              <div className={styles.heroStandeeSide} />
              <div className={styles.heroDeskLine} />
              <div className={styles.heroBadgeStack}>
                <span>UPI</span>
                <span>BHIM</span>
                <span>GPay</span>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.workflow} aria-label="How the UPI QR generator works">
          <article>
            <span className={styles.stepNo}>1</span>
            <div className={styles.stepIcon}>💳</div>
            <div><h2>Enter UPI Details</h2><p>Add your UPI ID and business information.</p></div>
          </article>
          <article>
            <span className={styles.stepNo}>2</span>
            <div className={styles.stepIcon}>▦</div>
            <div><h2>Choose Template</h2><p>Pick a print-ready payment design.</p></div>
          </article>
          <article>
            <span className={styles.stepNo}>3</span>
            <div className={styles.stepIcon}>🖨️</div>
            <div><h2>Download &amp; Display</h2><p>Print and start accepting payments.</p></div>
          </article>
        </section>

        <section className={`${styles.panel} ${styles.generatorPanel}`}>
          <div className={styles.generatorColumn}>
            <div className={styles.sectionTitle}><span>1</span><div><h2>UPI QR Generator</h2><p>Core payment details</p></div></div>
            <label className={styles.fieldLabel}>UPI ID / VPA <span className={styles.required}>*</span></label>
            <div className={styles.upiInputWrap}>
              <input value={upiId} onChange={(event) => setUpiId(event.target.value)} placeholder="name@upi (eg: bharathqr@okicici)" />
              <span>UPI</span>
            </div>
            <label className={styles.fieldLabel}>Business / Payee Name <span>(Optional)</span></label>
            <input value={businessName} onChange={(event) => setBusinessName(event.target.value)} placeholder="Your business name" />
            <label className={styles.fieldLabel}>Amount (Optional)</label>
            <input value={amount} onChange={(event) => setAmount(event.target.value.replace(/[^0-9.]/g, ''))} inputMode="decimal" placeholder="₹ 0.00" />
            {error && <p className={styles.errorText}>{error}</p>}
            {!error && notice && <p className={styles.noticeText}>{notice}</p>}
          </div>

          <div className={styles.qrPreviewColumn}>
            <h2>Preview</h2>
            <div className={styles.qrFrame}>{brandedQrDataUrl ? <img src={brandedQrDataUrl} alt="Generated UPI payment QR code" /> : <span />}</div>
            <div className={styles.scanLine}><i />Scan &amp; Pay<i /></div>
            <div className={styles.appLogos}><span>G Pay</span><span>PhonePe</span><span>paytm</span><span>amazon pay</span><span>CRED</span><span>MobiKwik</span></div>
          </div>

          <div className={styles.enhancementColumn}>
            <h2>Logo &amp; Quick Actions</h2>
            <label className={styles.fieldLabel}>Upload Business Logo <span>(Optional)</span></label>
            <label className={styles.logoDrop}>
              <input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={handleLogoUpload} />
              <span className={styles.uploadIcon}>⇧</span>
              <strong>{logoDataUrl ? 'Logo Added' : 'Upload Logo'}</strong>
              <small>PNG, JPG, SVG, WEBP</small>
            </label>
            <div className={styles.paymentHintCard}>
              <strong>{formatAmount(amount) ? `Fixed amount QR: ₹${formatAmount(amount)}` : 'Open amount QR'}</strong>
              <small>{formatAmount(amount) ? 'Customer scans and sees the amount pre-filled.' : 'Customer scans and enters the amount while paying.'}</small>
            </div>
            <div className={styles.compactQrActions}>
              <button type="button" onClick={downloadQrPng}>⌄ QR PNG</button>
              <button type="button" onClick={shareViaWhatsApp}><WhatsAppIcon /> WhatsApp</button>
            </div>
          </div>
        </section>

        <section className={styles.studioGrid}>
          <div className={`${styles.panel} ${styles.studioPanel}`}>
            <div className={styles.sectionTitle}><span>2</span><div><h2>Template Studio</h2><p>Choose a payment QR template and customize it</p></div></div>
            <div className={styles.templateCards}>
              {TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  className={`${styles.templateCard} ${selectedTemplate.id === template.id ? styles.activeTemplate : ''}`}
                  onClick={() => setSelectedTemplateId(template.id)}
                >
                  <span className={styles.templateThumb} data-template={template.id}>
                    {templatePreviewUrls[template.id] ? <img className={styles.templatePreviewImage} src={templatePreviewUrls[template.id]} alt={`${template.name} preview`} /> : <TemplateMini template={template} qrDataUrl={brandedQrDataUrl} logoDataUrl={logoDataUrl} businessName={businessName} upiId={upiId} />}
                  </span>
                  <strong>{template.shortName}</strong>
                  <small>{template.size}</small>
                </button>
              ))}
            </div>

            <div className={styles.templateEditBar}>
              <label><span>Business Name on Template</span><input value={businessName} onChange={(event) => setBusinessName(event.target.value)} placeholder="Your business name" /></label>
              <label className={styles.inlineLogoUpload}>
                <input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={handleLogoUpload} />
                <span>⇧</span>
                <strong>{logoDataUrl ? 'Logo Added' : 'Upload Logo'}</strong>
              </label>
            </div>
          </div>

          <aside className={`${styles.panel} ${styles.livePreviewPanel}`}>
            <div className={styles.liveHeader}><h2>Live Product Preview</h2><span>LIVE</span></div>
            <div className={styles.canvasStage} data-round={selectedTemplate.round ? 'true' : 'false'}>
              <canvas ref={templateCanvasRef} aria-label="Live UPI payment product preview" />
            </div>
            <div className={styles.liveActions}>
              <button type="button" onClick={shareDesignViaWhatsApp}><WhatsAppIcon />Design Share</button>
              <button type="button" onClick={downloadTemplatePng}>▣ PNG</button>
              <button type="button" onClick={downloadTemplateSvg}>◇ SVG</button>
              <button type="button" onClick={downloadTemplatePdf}>▤ PDF</button>
              <button type="button" onClick={sharePaymentLink}>🔗 Copy Link</button>
            </div>
            <div className={styles.previewMeta}>
              <strong>{selectedTemplate.name}</strong>
              <span>{selectedTemplate.size}</span>
              <p>{selectedTemplate.bestFor}</p>
            </div>
          </aside>
        </section>

        <section className={styles.finishedSection}>
          <div className={styles.finishedHeader}><h2>Finished Products You Can Print</h2><Link href="/templates">View All Templates →</Link></div>
          <div className={styles.productRow}>
            {TEMPLATES.map((template) => (
              <article key={template.id}>
                <div className={styles.productMock} data-template={template.id}>
                  <span className={styles.productSheet}>
                    {templatePreviewUrls[template.id] ? <img src={templatePreviewUrls[template.id]} alt={`${template.name} print preview`} /> : <TemplateMini template={template} qrDataUrl={brandedQrDataUrl} logoDataUrl={logoDataUrl} businessName={businessName} upiId={upiId} />}
                  </span>
                </div>
                <strong>{template.name}</strong>
                <span>{template.size}</span>
                <p>{template.bestFor}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.moreTools}>
          <h2>More Tools &amp; Guides</h2>
          <div>
            <Link href="/tools/google-review-qr-generator">⭐ Google Review QR</Link>
            <Link href="/tools/whatsapp-qr-generator">🟢 WhatsApp QR Generator</Link>
            <Link href="/tools/url-qr-generator">🔗 URL QR Generator</Link>
            <Link href="/templates">🧾 Payment QR Templates</Link>
            <Link href="/hi/tools/upi-qr-generator">हिंदी UPI QR Guide</Link>
          </div>
        </section>

        <section className={styles.seoBlock}>
          <div>
            <h2>Free UPI QR Code Generator for shops and small businesses</h2>
            <p>BharathQR helps Indian businesses create a clean UPI payment QR code for counters, reception desks, delivery parcels, billing tables and printed displays. Add your UPI ID, payee name, optional fixed amount and payment note, then download a payment QR or a ready-to-print design.</p>
          </div>
          <div className={styles.infoGrid}>
            <article><h3>Fixed or open amount</h3><p>Leave amount blank when customers should enter the amount. Add an amount when you want a fixed payment QR for menus, services, tickets or packages.</p></article>
            <article><h3>Made for UPI apps</h3><p>The QR uses a UPI payment link format that common UPI apps can scan for fast checkout at your business counter.</p></article>
            <article><h3>Print-ready templates</h3><p>Use standees, payment cards, round stickers and mini cards so customers can notice the QR quickly and pay without typing your UPI ID.</p></article>
          </div>
        </section>
      </main>
    </>
  );
}
