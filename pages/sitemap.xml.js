import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export default function Sitemap() {
  return null;
}

function xmlEscape(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export async function getServerSideProps({ res }) {
  const domain = 'https://bharathqr.com';
  const today = new Date().toISOString().split('T')[0];

  const staticRoutes = [
    { url: '/', priority: '1.0', changefreq: 'daily' },
    { url: '/tools', priority: '0.9', changefreq: 'weekly' },
    { url: '/tools/google-review-qr-generator', priority: '0.9', changefreq: 'weekly' },
    { url: '/blog', priority: '0.8', changefreq: 'daily' },
    { url: '/about', priority: '0.7', changefreq: 'monthly' },
    { url: '/privacy', priority: '0.7', changefreq: 'monthly' },
    { url: '/terms', priority: '0.7', changefreq: 'monthly' },
    { url: '/contact', priority: '0.7', changefreq: 'monthly' },
    { url: '/faq', priority: '0.8', changefreq: 'monthly' }
  ];

  let qrRoutes = [];
  try {
    const data = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'seo_updates.json'), 'utf8'));
    qrRoutes = (data.optimized_data?.suggested_routes || [])
      .filter((route) => route?.slug && !route.slug.includes(' '))
      .map((route) => ({ url: `/qr-for/${route.slug}`, priority: '0.8', changefreq: 'weekly' }));
  } catch (e) {
    console.error('Sitemap qr route error:', e);
  }

  let blogRoutes = [];
  try {
    const postsDir = path.join(process.cwd(), 'posts');
    if (fs.existsSync(postsDir)) {
      blogRoutes = fs.readdirSync(postsDir)
        .filter((file) => file.endsWith('.md'))
        .map((file) => {
          let date = today;
          try {
            const parsed = matter(fs.readFileSync(path.join(postsDir, file), 'utf8'));
            if (parsed.data?.date) date = parsed.data.date;
          } catch (_) {}
          return { url: `/blog/${file.replace(/\.md$/, '')}`, priority: '0.7', changefreq: 'monthly', lastmod: date };
        });
    }
  } catch (e) {
    console.error('Sitemap blog route error:', e);
  }

  const allRoutes = [...staticRoutes, ...qrRoutes, ...blogRoutes];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allRoutes.map((route) => `  <url>
    <loc>${domain}${xmlEscape(route.url)}</loc>
    <lastmod>${xmlEscape(route.lastmod || today)}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  res.setHeader('Content-Type', 'text/xml');
  res.write(xml);
  res.end();

  return { props: {} };
}
