import fs from 'fs';
import path from 'path';
import matter from 'gray-matter'; 

export default function SitemapSitePlaceholder() {
  return null;
}

export async function getServerSideProps({ res }) {
  const domainName = 'https://bharathqr.com';
  const fallbackDate = new Date().toISOString().split('T')[0];
  
  // 1. Map programmatic segment slugs and filter out empty fields
  let landingRoutes = [];
  try {
    const updatesPath = path.join(process.cwd(), 'seo_updates.json');
    if (fs.existsSync(updatesPath)) {
      const fileData = JSON.parse(fs.readFileSync(updatesPath, 'utf8'));
      
      // Filter out undefined or empty objects from json schema mapping array
      landingRoutes = (fileData.optimized_data?.suggested_routes || [])
        .filter(route => route && typeof route.slug === 'string' && route.slug.trim() !== '');
    }
  } catch (e) {
    console.error("Sitemap compilation lookup gap notice:", e);
  }

  // 2. Map Dynamic Long-Form Content Entries with reliable frontmatter readers
  let blogRoutes = [];
  try {
    const postsDirectory = path.join(process.cwd(), 'posts');
    if (fs.existsSync(postsDirectory)) {
      blogRoutes = fs.readdirSync(postsDirectory)
        .filter(file => file.endsWith('.md'))
        .map(file => {
          const slug = file.replace(/\.md$/, '');
          const fullPath = path.join(postsDirectory, file);
          let articleDate = fallbackDate;
          
          try {
            const fileContents = fs.readFileSync(fullPath, 'utf8');
            const { data } = matter(fileContents); 
            if (data && data.date) {
              articleDate = data.date;
            }
          } catch (_) {}
          
          return { slug, date: articleDate };
        });
    }
  } catch (e) {
    console.error("Sitemap content folder extraction notice:", e);
  }

  // 3. Assemble complete raw XML data sheet strings with fully escaped dynamic tokens
  const xmlSitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${domainName}</loc>
    <lastmod>${fallbackDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${domainName}/blog</loc>
    <lastmod>${fallbackDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>

  ${landingRoutes.map(route => `
  <url>
    <loc>${domainName}/qr-for/${encodeURIComponent(route.slug)}</loc>
    <lastmod>${fallbackDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('')}

  ${blogRoutes.map(item => `
  <url>
    <loc>${domainName}/blog/${encodeURIComponent(item.slug)}</loc>
    <lastmod>${item.date}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`).join('')}
</urlset>`;

  res.setHeader('Content-Type', 'text/xml');
  res.write(xmlSitemapContent);
  res.end();

  return {
    props: {},
  };
}
