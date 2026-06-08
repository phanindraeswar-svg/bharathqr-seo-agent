import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import matter from 'gray-matter';
import Head from 'next/head';

export default function BlogHub({ staticPosts }) {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem', fontFamily: 'system-ui, sans-serif' }}>
      <Head>
        <title>BharathQR Blog — Free QR, WhatsApp and Digital Tool Guides</title>
        <meta name="description" content="Free guides on UPI payments, QR codes, WhatsApp tools and digital business tips for Indian merchants and creators." />
        <meta property="og:title" content="BharathQR Blog" />
        <meta property="og:description" content="Free guides on UPI payments, QR codes, WhatsApp tools and digital business tips for Indian merchants and creators." />
        <meta property="og:url" content="https://bharathqr.com/blog" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="https://bharathqr.com/blog" />
      </Head>

      <header style={{ marginBottom: '3rem', borderBottom: '1px solid #eaeaea', paddingBottom: '1.5rem' }}>
        <Link href="/" style={{ color: '#1D9E75', textDecoration: 'none', fontWeight: 'bold' }}>← Back to QR Generator</Link>
        <h1 style={{ fontSize: 'clamp(2rem, 6vw, 2.8rem)', marginTop: '1rem', color: '#111' }}>BharathQR Blog</h1>
        <p style={{ color: '#4B5563', fontSize: '1.05rem', lineHeight: 1.6 }}>Practical guides for Indian merchants, creators and small businesses.</p>
      </header>

      <main style={{ display: 'grid', gap: '2rem' }}>
        {staticPosts.length === 0 ? (
          <p style={{ color: '#888', fontStyle: 'italic' }}>Fresh guides are currently being prepared. Check back soon.</p>
        ) : (
          staticPosts.map(({ slug, title, date, description }) => (
            <article key={slug} style={{ padding: '1.5rem', border: '1px solid #eaeaea', borderRadius: '12px', backgroundColor: '#fff' }}>
              <small style={{ color: '#6B7280', display: 'block', marginBottom: '0.5rem' }}>{date}</small>
              <h2 style={{ margin: '0 0 0.75rem 0', fontSize: '1.45rem' }}>
                <Link href={`/blog/${slug}`} style={{ color: '#111827', textDecoration: 'none' }}>
                  {title}
                </Link>
              </h2>
              <p style={{ color: '#4B5563', margin: '0 0 1rem 0', lineHeight: '1.6' }}>{description}</p>
              <Link href={`/blog/${slug}`} style={{ fontSize: '0.95rem', fontWeight: '700', color: '#1D9E75', textDecoration: 'none' }}>
                Read Full Article →
              </Link>
            </article>
          ))
        )}
      </main>
    </div>
  );
}

export async function getStaticProps() {
  const postsDirectory = path.join(process.cwd(), 'posts');

  if (!fs.existsSync(postsDirectory)) {
    return { props: { staticPosts: [] }, revalidate: 3600 };
  }

  const staticPosts = fs.readdirSync(postsDirectory)
    .filter(fileName => fileName.endsWith('.md'))
    .map(fileName => {
      const slug = fileName.replace(/\.md$/, '');
      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const { data } = matter(fileContents);
      return {
        slug,
        title: data.title || 'Untitled Article',
        date: data.date || '',
        description: data.description || '',
      };
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  return {
    props: { staticPosts },
    revalidate: 3600,
  };
}
