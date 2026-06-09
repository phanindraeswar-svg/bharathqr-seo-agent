import Link from 'next/link';

export default function RelatedLinks({ title = 'Related BharathQR pages', links = [] }) {
  const safeLinks = (links || []).filter((link) => link && link.href && link.label).slice(0, 8);
  if (!safeLinks.length) return null;
  return (
    <section style={{ marginTop: 32, borderTop: '1px solid #E5E7EB', paddingTop: 24 }}>
      <h2 style={{ marginTop: 0 }}>{title}</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
        {safeLinks.map((link) => (
          <Link key={link.href} href={link.href} style={{ border: '1px solid #D1FAE5', borderRadius: 16, padding: 16, textDecoration: 'none', color: '#111827', background: '#F0FDF4' }}>
            <strong style={{ color: '#065F46' }}>{link.label}</strong>
            {link.note && <p style={{ color: '#4B5563', marginBottom: 0, lineHeight: 1.5 }}>{link.note}</p>}
          </Link>
        ))}
      </div>
    </section>
  );
}
