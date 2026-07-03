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

function drawAppStrip(ctx, x, y, width, dark = false, scale = 1) {
  const labels = [
    { text: 'G Pay', color: '#4285f4' },
    { text: 'PhonePe', color: '#5f259f' },
    { text: 'Paytm', color: '#00baf2' },
    { text: 'Amazon Pay', color: '#111827' },
    { text: 'CRED', color: '#111827' },
    { text: 'MobiKwik', color: '#2563eb' },
  ];
  const gap = width / labels.length;
  labels.forEach((item, index) => {
    const cx = x + gap * index + gap / 2;
    ctx.save();
    ctx.textAlign = 'center';
    ctx.font = `900 ${9.5 * scale}px Inter, Arial, sans-serif`;
    ctx.fillStyle = dark ? '#ffffff' : item.color;
    ctx.fillText(item.text, cx, y);
    ctx.restore();
  });
}

function drawBhimUpiStrip(ctx, x, y, width, dark = false, scale = 1) {
  ctx.save();
  drawUPIWordmark(ctx, x + width * 0.58, y, 0.82 * scale, dark);
  ctx.font = `900 italic ${34 * scale}px Inter, Arial, sans-serif`;
  ctx.fillStyle = dark ? '#ffffff' : '#4a4f57';
  ctx.fillText('BHIM', x + 5 * scale, y);
  ctx.beginPath();
  ctx.moveTo(x + 130 * scale, y - 29 * scale);
  ctx.lineTo(x + 156 * scale, y - 9 * scale);
  ctx.lineTo(x + 130 * scale, y + 10 * scale);
  ctx.closePath();
  ctx.fillStyle = '#ff7a1a';
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + 142 * scale, y - 23 * scale);
  ctx.lineTo(x + 164 * scale, y - 9 * scale);
  ctx.lineTo(x + 142 * scale, y + 5 * scale);
  ctx.closePath();
  ctx.fillStyle = '#178f4b';
  ctx.fill();
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

async function drawTemplateCanvas(canvas, options) {
  const { template, qrDataUrl, logoDataUrl, businessName, upiId } = options;
  if (!canvas || !qrDataUrl) return;
  const width = template.width;
  const height = template.height;
  const isLandscape = width > height;
  const canvasScale = CANVAS_SCALE;
  canvas.width = width * canvasScale;
  canvas.height = height * canvasScale;
  canvas.style.aspectRatio = `${width} / ${height}`;
  const ctx = canvas.getContext('2d');
  ctx.setTransform(canvasScale, 0, 0, canvasScale, 0, 0);
  ctx.clearRect(0, 0, width, height);

  if (template.round) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, width / 2 - 6, 0, Math.PI * 2);
    ctx.clip();
  }

  ctx.fillStyle = template.background;
  ctx.fillRect(0, 0, width, height);
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, template.surface);
  gradient.addColorStop(1, '#ffffff');
  ctx.fillStyle = gradient;
  if (template.round) {
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, width / 2 - 14, 0, Math.PI * 2);
    ctx.fill();
  } else {
    roundRect(ctx, 14, 14, width - 28, height - 28, isLandscape ? 22 : 24);
    ctx.fill();
  }

  ctx.strokeStyle = template.accent;
  ctx.lineWidth = template.round ? 5 : 4;
  if (template.round) {
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, width / 2 - 18, 0, Math.PI * 2);
    ctx.stroke();
  } else {
    roundRect(ctx, 16, 16, width - 32, height - 32, isLandscape ? 20 : 22);
    ctx.stroke();
  }

  const qrImage = await loadImage(qrDataUrl);
  const logo = logoDataUrl ? await loadImage(logoDataUrl) : null;
  const title = String(businessName || 'Your Business').slice(0, 34);
  const upiText = `UPI ID: ${String(upiId || DEFAULT_UPI_ID).slice(0, 42)}`;

  let headerY = template.round ? 72 : 54;
  let logoSize = template.round ? 34 : isLandscape ? 34 : 38;
  let qrSize = template.round ? 210 : isLandscape ? 182 : 238;
  let qrX = (width - qrSize) / 2;
  let qrY = template.round ? 152 : isLandscape ? 112 : 206;

  if (isLandscape) {
    headerY = 52;
    qrY = 112;
  }

  ctx.save();
  const logoX = width / 2 - (title.length * (isLandscape ? 4.8 : 5.5)) - logoSize - 8;
  const logoY = headerY - logoSize + 5;
  if (logo) {
    roundRect(ctx, logoX, logoY, logoSize, logoSize, 8);
    ctx.clip();
    drawContainImage(ctx, logo, logoX, logoY, logoSize, logoSize);
  } else {
    ctx.fillStyle = template.accent;
    ctx.font = `900 ${logoSize * 0.75}px Inter, Arial, sans-serif`;
    ctx.fillText('☕', logoX + logoSize / 2 - 11, logoY + logoSize - 6);
  }
  ctx.restore();

  ctx.textAlign = 'center';
  ctx.fillStyle = template.accent;
  ctx.font = `900 ${template.round ? 17 : isLandscape ? 18 : 21}px Inter, Arial, sans-serif`;
  ctx.fillText(title, width / 2 + 16, headerY);

  ctx.fillStyle = template.text;
  ctx.font = `900 ${template.round ? 13 : isLandscape ? 15 : 17}px Inter, Arial, sans-serif`;
  ctx.fillText('SCAN & PAY', width / 2, template.round ? 116 : isLandscape ? 88 : 138);

  ctx.save();
  ctx.shadowColor = 'rgba(15,23,42,.14)';
  ctx.shadowBlur = 14;
  ctx.fillStyle = '#ffffff';
  roundRect(ctx, qrX - 10, qrY - 10, qrSize + 20, qrSize + 20, template.round ? 18 : 14);
  ctx.fill();
  ctx.restore();
  ctx.strokeStyle = '#9aa4b2';
  ctx.lineWidth = 1.2;
  roundRect(ctx, qrX - 8, qrY - 8, qrSize + 16, qrSize + 16, template.round ? 16 : 12);
  ctx.stroke();
  ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize);

  ctx.fillStyle = template.text;
  ctx.font = `800 ${template.round ? 8.5 : isLandscape ? 10.5 : 11.5}px Inter, Arial, sans-serif`;
  ctx.fillText(upiText, width / 2, qrY + qrSize + (template.round ? 22 : 28));

  const stripY = template.round ? height - 96 : isLandscape ? height - 86 : height - 104;
  const stripW = template.round ? width - 190 : isLandscape ? width - 285 : width - 130;
  drawBhimUpiStrip(ctx, (width - stripW) / 2, stripY, stripW, template.dark, isLandscape ? 0.86 : template.round ? 0.7 : 0.82);
  drawAppStrip(ctx, template.round ? 92 : 50, template.round ? height - 50 : height - 44, template.round ? width - 184 : width - 100, template.dark, template.round ? 0.72 : isLandscape ? 0.86 : 0.82);

  if (template.round) ctx.restore();
}

function makeTemplateSvg({ template, qrDataUrl, logoDataUrl, businessName, upiId }) {
  const width = template.width;
  const height = template.height;
  const isLandscape = width > height;
  const qrSize = template.round ? 210 : isLandscape ? 182 : 238;
  const qrX = (width - qrSize) / 2;
  const qrY = template.round ? 152 : isLandscape ? 112 : 206;
  const headerY = template.round ? 72 : isLandscape ? 52 : 54;
  const title = encodeXml(String(businessName || 'Your Business').slice(0, 34));
  const upiText = encodeXml(`UPI ID: ${String(upiId || DEFAULT_UPI_ID).slice(0, 42)}`);
  const clip = template.round ? `<clipPath id="roundClip"><circle cx="${width / 2}" cy="${height / 2}" r="${width / 2 - 6}"/></clipPath>` : '';
  const groupStart = template.round ? '<g clip-path="url(#roundClip)">' : '<g>';
  const shell = template.round
    ? `<circle cx="${width / 2}" cy="${height / 2}" r="${width / 2 - 14}" fill="${template.surface}"/><circle cx="${width / 2}" cy="${height / 2}" r="${width / 2 - 18}" fill="none" stroke="${template.accent}" stroke-width="5"/>`
    : `<rect x="14" y="14" width="${width - 28}" height="${height - 28}" rx="22" fill="${template.surface}"/><rect x="16" y="16" width="${width - 32}" height="${height - 32}" rx="20" fill="none" stroke="${template.accent}" stroke-width="4"/>`;
  const logo = logoDataUrl ? `<image href="${logoDataUrl}" x="${width / 2 - 96}" y="${headerY - 30}" width="34" height="34" preserveAspectRatio="xMidYMid meet"/>` : `<text x="${width / 2 - 78}" y="${headerY}" text-anchor="middle" font-size="24">☕</text>`;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>${clip}</defs>
  ${groupStart}
    <rect width="${width}" height="${height}" fill="${template.background}"/>
    ${shell}
    ${logo}
    <text x="${width / 2 + 16}" y="${headerY}" text-anchor="middle" font-size="${isLandscape ? 18 : 21}" font-weight="900" fill="${template.accent}">${title}</text>
    <text x="${width / 2}" y="${template.round ? 116 : isLandscape ? 88 : 138}" text-anchor="middle" font-size="${isLandscape ? 15 : 17}" font-weight="900" fill="${template.text}">SCAN &amp; PAY</text>
    <rect x="${qrX - 10}" y="${qrY - 10}" width="${qrSize + 20}" height="${qrSize + 20}" rx="14" fill="#fff" stroke="#9aa4b2"/>
    <image href="${qrDataUrl}" x="${qrX}" y="${qrY}" width="${qrSize}" height="${qrSize}"/>
    <text x="${width / 2}" y="${qrY + qrSize + 28}" text-anchor="middle" font-size="11" font-weight="800" fill="${template.text}">${upiText}</text>
    <text x="${width / 2}" y="${template.round ? height - 96 : isLandscape ? height - 86 : height - 104}" text-anchor="middle" font-size="34" font-style="italic" font-weight="900" fill="#4a4f57">BHIM   UPI</text>
    <text x="${width / 2}" y="${template.round ? height - 50 : height - 44}" text-anchor="middle" font-size="10" font-weight="900" fill="#2563eb">G Pay · PhonePe · Paytm · Amazon Pay · CRED · MobiKwik</text>
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
  const [error, setError] = useState('');
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
        return;
      }
      if (amount.trim() && !formatAmount(amount)) {
        setError('Amount must be a positive number, or leave it blank.');
        return;
      }
      setError('');
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


  function shareViaWhatsApp() {
    const amountText = formatAmount(amount) ? ` for ₹${formatAmount(amount)}` : '';
    const message = `Pay ${businessName || 'this business'}${amountText} using UPI. Created with BharathQR: ${BHARATHQR_UTM}`;
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
                <TemplateMini template={TEMPLATES[0]} qrDataUrl={brandedQrDataUrl} logoDataUrl={logoDataUrl} businessName={businessName} upiId={upiId} />
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
                    <TemplateMini template={template} qrDataUrl={brandedQrDataUrl} logoDataUrl={logoDataUrl} businessName={businessName} upiId={upiId} />
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
              <button type="button" onClick={shareViaWhatsApp}><WhatsAppIcon />WhatsApp</button>
              <button type="button" onClick={downloadTemplatePng}>▣ PNG</button>
              <button type="button" onClick={downloadTemplateSvg}>◇ SVG</button>
              <button type="button" onClick={downloadTemplatePdf}>▤ PDF</button>
              <button type="button" onClick={shareViaWhatsApp}>🔗 Share Link</button>
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
                    <TemplateMini template={template} qrDataUrl={brandedQrDataUrl} logoDataUrl={logoDataUrl} businessName={businessName} upiId={upiId} />
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
