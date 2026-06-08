import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import Head from 'next/head';

export default function BlogPost({ articleMetadata, htmlContent, slug }) {
  const structuredArticleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": articleMetadata.title,
    "datePublished": articleMetadata.date,
    "description": articleMetadata.description,
    "url": `https://bharathqr.com/blog/${slug}`,
    "publisher": {
      "@type": "Organization",
      "name": "BharathQR",
      "logo": {
        "@type": "ImageObject",
        "url": "https://bharathqr.com/logo.png"
      }
    },
    "author": {
      "@type": "Organization",
      "name": "BharathQR Automated SEO Core Engine"
    }
  };

  const displayFormattedDate = articleMetadata.date
    ? new Date(articleMetadata.date).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '2rem', fontFamily: 'system-ui, sans-serif', lineHeight: '1.7' }}>
      <Head>
        <title>{articleMetadata.title} | BharathQR</title>
        <meta name="description" content={articleMetadata.description} />
        <meta property="og:title" content={articleMetadata.title} />
        <meta property="og:description" content={articleMetadata.description} />
        <meta property="og:url" content={`https://bharathqr.com/blog/${slug}`} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="keywords" content={articleMetadata.keywords?.join(', ')} />
        <link rel="canonical" href={`https://bharathqr.com/blog/${slug}`} />
        
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredArticleSchema) }}
        />
      </Head>

      <nav style={{ marginBottom: '2rem' }}>
        <Link href="/blog" style={{ color: '#0070f3', textDecoration: 'none', fontWeight: '500' }}>
          ← Back to Blog
        </Link>
      </nav>

      <main>
        <article>
          <header style={{ marginBottom: '2.5rem' }}>
            {displayFormattedDate && (
              <span style={{ color: '#666', fontSize: '0.9rem', display: 'block', marginBottom: '0.5rem' }}>
                Published on {displayFormattedDate}
              </span>
            )}
            <h1 style={{ fontSize: '2.5rem', lineHeight: '1.2', color: '#111', margin: '0 0 1rem 0' }}>
              {articleMetadata.title}
            </h1>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {articleMetadata.keywords?.map(tag => (
                <span key={tag} style={{ background: '#f0f0f0', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', color: '#555' }}>
                  #{tag}
                </span>
              ))}
            </div>
          </header>

          <div 
            className="blog-body-content"
            style={{ color: '#222', fontSize: '1.1rem' }}
            dangerouslySetInnerHTML={{ __html: htmlContent }} 
          />
        </article>
      </main>

      <footer style={{ marginTop: '4rem', paddingTop: '2rem', borderTop: '1px solid #eaeaea', textAlign: 'center' }}>
        <h3>Need instant zero-fee customer collections?</h3>
        <p style={{ color: '#666', marginBottom: '1.5rem' }}>Generate your localized dynamic UPI custom merchant asset matching parameters directly via our application layout core.</p>
        <Link href="/" style={{ background: '#0070f3', color: '#fff', padding: '0.75rem 1.5rem', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold' }}>
          Generate Free BharathQR Now
        </Link>
      </footer>
    </div>
  );
}

export async function getStaticPaths() {
  const postsDirectory = path.join(process.cwd(), 'posts');
  
  if (!fs.existsSync(postsDirectory)) {
    return { paths: [], fallback: 'blocking' };
  }

  const fileNames = fs.readdirSync(postsDirectory);
  const paths = fileNames
    .filter(fileName => fileName.endsWith('.md'))
    .map(fileName => ({
      params: {
        slug: fileName.replace(/\.md$/, ''),
      },
    }));

  return {
    paths,
    fallback: 'blocking',
  };
}

export async function getStaticProps({ params }) {
  try {
    const postsDirectory = path.join(process.cwd(), 'posts');
    const fullPath = path.join(postsDirectory, `${params.slug}.md`);
    const fileContents = fs.readFileSync(fullPath, 'utf8');

    const { data, content } = matter(fileContents);

    const processedContent = await remark().use(html).process(content);
    const htmlContent = processedContent.toString();

    const normalizedKeywords = Array.isArray(data.keywords)
      ? data.keywords
      : typeof data.keywords === 'string'
        ? data.keywords.split(',').map(k => k.trim()).filter(Boolean)
        : ['bharathqr', 'UPI framework'];

    const articleMetadata = {
      title: data.title || 'Untitled Insight',
      date: data.date || '',
      description: data.description || '',
      keywords: normalizedKeywords,
    };

    return {
      props: {
        articleMetadata,
        htmlContent,
        slug: params.slug,
      },
      revalidate: 3600,
    };
  } catch (err) {
    return { notFound: true };
  }
}
