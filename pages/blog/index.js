import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import matter from 'gray-matter';
import Head from 'next/head';

export default function BlogHub({ staticPosts }) {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <Head>
        <title>Latest Merchant Insights & Updates | BharatQR</title>
        <meta name="description" content="Stay ahead with digital payment workflows, zero-fee UPI collection strategies, and business growth guides from the BharatQR merchant agent." />
        <link rel="canonical" href="https://bharathqr.com/blog" />
      </Head>

      <header style={{ marginBottom: '3rem', borderBottom: '1px solid #eaeaea', paddingBottom: '1.5rem' }}>
        <Link href="/" style={{ color: '#0070f3', textDecoration: 'none', fontWeight: 'bold' }}>← Back to Generator Tool</Link>
        <h1 style={{ fontSize: '2.5rem', marginTop: '1rem', color: '#111' }}>Merchant Resources & Insights</h1>
        <p style={{ color: '#666' }}>Deep-dives into expanding your local retail footprint with automated digital payment collections.</p>
      </header>

      <main style={{ display: 'grid', gap: '2rem' }}>
        {staticPosts.length === 0 ? (
          <p style={{ color: '#888', fontStyle: 'italic' }}>Fresh insights are currently being compiled by the automation engine. Check back soon!</p>
        ) : (
          staticPosts.map(({ slug, title, date, description }) => (
            <article key={slug} style={{ padding: '1.5rem', borderRadius: '8px', border: '1px solid #eaeaea', transition: 'box-shadow 0.2s' }}>
              <span style={{ fontSize: '0.85rem', color: '#999', display: 'block', marginBottom: '0.5rem' }}>{date}</span>
              <h2 style={{ margin: '0 0 0.75rem 0', fontSize: '1.5rem' }}>
                <Link href={`/blog/${slug}`} style={{ color: '#0070f3', textDecoration: 'none' }}>
                  {title}
                </Link>
              </h2>
              <p style={{ color: '#444', margin: '0 0 1rem 0', lineHeight: '1.5' }}>{description}</p>
              <Link href={`/blog/${slug}`} style={{ fontSize: '0.9rem', fontWeight: '600', color: '#0070f3', textDecoration: 'none' }}>
                Read Full Blueprint →
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
    return { props: { staticPosts: [] } };
  }

  const fileNames = fs.readdirSync(postsDirectory);
  const filteredFiles = fileNames.filter(fileName => fileName.endsWith('.md'));

  const staticPosts = filteredFiles.map(fileName => {
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
  });

  const sortedPosts = staticPosts.sort((a, b) => new Date(b.date) - new Date(a.date));

  return {
    props: {
      staticPosts: sortedPosts,
    },
  };
}
