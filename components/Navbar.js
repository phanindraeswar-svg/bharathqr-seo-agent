import Link from 'next/link';

export default function Navbar() {
  const linkStyle = { color: '#374151', textDecoration: 'none', fontWeight: 600, fontSize: 14 };
  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 20, background: 'rgba(255,255,255,0.96)', borderBottom: '1px solid #E5E7EB', backdropFilter: 'blur(10px)' }}>
      <nav style={{ maxWidth: 1120, margin: '0 auto', padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <Link href="/" style={{ color: '#1D9E75', textDecoration: 'none', fontWeight: 900, fontSize: 20 }}>BharathQR</Link>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
          <Link href="/tools" style={linkStyle}>Tools</Link>
          <Link href="/blog" style={linkStyle}>Blog</Link>
          <Link href="/faq" style={linkStyle}>FAQ</Link>
          <Link href="/" style={{ ...linkStyle, background: '#1D9E75', color: '#fff', padding: '0.55rem 0.8rem', borderRadius: 999 }}>Generate QR</Link>
        </div>
      </nav>
    </header>
  );
}
