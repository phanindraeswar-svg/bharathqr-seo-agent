import Link from 'next/link';

export default function Footer() {
  const linkStyle = { color: '#4B5563', textDecoration: 'none', fontWeight: 600 };
  return (
    <footer style={{ marginTop: 48, borderTop: '1px solid #E5E7EB', background: '#F9FAFB' }}>
      <div style={{ maxWidth: 1120, margin: '0 auto', padding: '2rem 1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))', gap: 20 }}>
        <div><strong style={{ color: '#1D9E75', fontSize: 20 }}>BharathQR</strong><p style={{ color: '#6B7280', lineHeight: 1.6 }}>India's AI-powered QR and business growth platform for payments, reviews, WhatsApp, WiFi, menus and print-ready QR use cases.</p></div>
        <div><h3>Explore</h3><p><Link href="/tools" style={linkStyle}>Tools</Link></p><p><Link href="/solutions" style={linkStyle}>Solutions</Link></p><p><Link href="/use-cases" style={linkStyle}>Use Cases</Link></p><p><Link href="/materials" style={linkStyle}>Materials</Link></p><p><Link href="/cases" style={linkStyle}>Cases</Link></p></div>
        <div><h3>Guides</h3><p><Link href="/trust" style={linkStyle}>Trust & Safety</Link></p><p><Link href="/comparisons" style={linkStyle}>Comparisons</Link></p><p><Link href="/templates" style={linkStyle}>Templates</Link></p><p><Link href="/blog" style={linkStyle}>Blog</Link></p><p><Link href="/ai-tools" style={linkStyle}>AI Business</Link></p><p><Link href="/hi" style={linkStyle}>Hindi</Link></p></div>
        <div><h3>Company</h3><p><Link href="/about" style={linkStyle}>About</Link></p><p><Link href="/privacy" style={linkStyle}>Privacy</Link></p><p><Link href="/terms" style={linkStyle}>Terms</Link></p><p><Link href="/contact" style={linkStyle}>Contact</Link></p><p><Link href="/faq" style={linkStyle}>FAQ</Link></p><p><Link href="/editorial-policy" style={linkStyle}>Editorial Policy</Link></p><p><Link href="/content-policy" style={linkStyle}>Content Policy</Link></p><p><Link href="/advertising-disclosure" style={linkStyle}>Advertising</Link></p></div>
      </div>
    </footer>
  );
}
