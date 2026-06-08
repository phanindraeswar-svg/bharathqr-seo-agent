import Link from 'next/link';

export default function Footer() {
  const linkStyle = { color: '#6EE7B7', textDecoration: 'none' };
  return (
    <footer style={{ background: '#064E3B', color: '#D1FAE5', marginTop: 48 }}>
      <div style={{ maxWidth: 1120, margin: '0 auto', padding: '2rem 1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 24 }}>
        <div>
          <div style={{ color: '#fff', fontWeight: 900, fontSize: 22, marginBottom: 8 }}>BharathQR</div>
          <p style={{ lineHeight: 1.6, margin: 0 }}>India's fast, free digital tools platform for QR, UPI, WhatsApp and business workflows.</p>
        </div>
        <div>
          <div style={{ color: '#fff', fontWeight: 800, marginBottom: 10 }}>Tools</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Link href="/" style={linkStyle}>UPI QR Generator</Link>
            <Link href="/tools/google-review-qr-generator" style={linkStyle}>Google Review QR</Link>
            <Link href="/tools" style={linkStyle}>All Tools</Link>
          </div>
        </div>
        <div>
          <div style={{ color: '#fff', fontWeight: 800, marginBottom: 10 }}>Company</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Link href="/about" style={linkStyle}>About</Link>
            <Link href="/privacy" style={linkStyle}>Privacy</Link>
            <Link href="/terms" style={linkStyle}>Terms</Link>
            <Link href="/contact" style={linkStyle}>Contact</Link>
            <Link href="/faq" style={linkStyle}>FAQ</Link>
          </div>
        </div>
      </div>
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.15)', padding: '1rem', textAlign: 'center', fontSize: 13 }}>
        © {new Date().getFullYear()} BharathQR. Not affiliated with NPCI, UPI, BHIM or any bank.
      </div>
    </footer>
  );
}
