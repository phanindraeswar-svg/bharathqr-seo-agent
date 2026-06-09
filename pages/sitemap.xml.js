import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import toolClusters from '../data/tool_clusters.json';
import industryClusters from '../data/industry_clusters.json';
import useCaseClusters from '../data/use_case_clusters.json';
import trustClusters from '../data/trust_clusters.json';
import materialClusters from '../data/material_clusters.json';
import comparisonClusters from '../data/comparison_clusters.json';
import templateClusters from '../data/template_clusters.json';
import aiBusinessClusters from '../data/ai_business_clusters.json';

export default function Sitemap() { return null; }
function xmlEscape(value) { return String(value || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

export async function getServerSideProps({ res }) {
  const domain = 'https://bharathqr.com';
  const today = new Date().toISOString().split('T')[0];
  const staticRoutes = [
    { url: '/', priority: '1.0', changefreq: 'daily' },
    { url: '/tools', priority: '0.9', changefreq: 'weekly' },
    { url: '/solutions', priority: '0.9', changefreq: 'weekly' },
    { url: '/use-cases', priority: '0.9', changefreq: 'weekly' },
    { url: '/trust', priority: '0.8', changefreq: 'weekly' },
    { url: '/materials', priority: '0.85', changefreq: 'weekly' },
    { url: '/comparisons', priority: '0.75', changefreq: 'monthly' },
    { url: '/templates', priority: '0.75', changefreq: 'monthly' },
    { url: '/cases', priority: '0.85', changefreq: 'weekly' },
    { url: '/qr-for', priority: '0.8', changefreq: 'weekly' },
    { url: '/ai-tools', priority: '0.75', changefreq: 'monthly' },
    { url: '/hi', priority: '0.8', changefreq: 'weekly' },
    { url: '/hi/tools/upi-qr-generator', priority: '0.8', changefreq: 'weekly' },
    { url: '/hi/tools/google-review-qr-generator', priority: '0.75', changefreq: 'weekly' },
    { url: '/hi/solutions/kirana-store', priority: '0.75', changefreq: 'weekly' },
    { url: '/hi/trust/upi-qr-safety', priority: '0.7', changefreq: 'monthly' },
    { url: '/hi/blog', priority: '0.7', changefreq: 'weekly' },
    { url: '/blog', priority: '0.8', changefreq: 'daily' },
    { url: '/about', priority: '0.7', changefreq: 'monthly' },
    { url: '/privacy', priority: '0.7', changefreq: 'monthly' },
    { url: '/terms', priority: '0.7', changefreq: 'monthly' },
    { url: '/contact', priority: '0.7', changefreq: 'monthly' },
    { url: '/faq', priority: '0.8', changefreq: 'monthly' },
    { url: '/editorial-policy', priority: '0.65', changefreq: 'monthly' },
    { url: '/content-policy', priority: '0.65', changefreq: 'monthly' },
    { url: '/advertising-disclosure', priority: '0.6', changefreq: 'monthly' },
  ];
  const toolRoutes = Object.values(toolClusters).map((t) => ({ url: t.tool_url, priority: '0.9', changefreq: 'weekly' }));
  const solutionRoutes = Object.values(industryClusters).map((i) => ({ url: `/solutions/${i.slug}`, priority: '0.85', changefreq: 'weekly' }));
  const useCaseRoutes = Object.values(useCaseClusters).map((i) => ({ url: `/use-cases/${i.slug}`, priority: '0.85', changefreq: 'weekly' }));
  const trustRoutes = Object.values(trustClusters).map((i) => ({ url: `/trust/${i.slug}`, priority: '0.75', changefreq: 'monthly' }));
  const materialRoutes = Object.values(materialClusters).map((i) => ({ url: `/materials/${i.slug}`, priority: '0.8', changefreq: 'weekly' }));
  const comparisonRoutes = Object.values(comparisonClusters).map((i) => ({ url: `/comparisons/${i.slug}`, priority: '0.7', changefreq: 'monthly' }));
  const templateRoutes = Object.values(templateClusters).map((i) => ({ url: `/templates/${i.slug}`, priority: '0.7', changefreq: 'monthly' }));
  const aiRoutes = Object.values(aiBusinessClusters).map((i) => ({ url: `/ai-tools/${i.slug}`, priority: '0.65', changefreq: 'monthly' }));
  let qrRoutes = [];
  try {
    const data = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'seo_updates.json'), 'utf8'));
    qrRoutes = (data.optimized_data?.suggested_routes || []).filter((route) => route?.slug && !route.slug.includes(' ')).map((route) => ({ url: `/qr-for/${route.slug}`, priority: '0.7', changefreq: 'weekly' }));
  } catch (e) { console.error('Sitemap qr route error:', e); }
  let blogRoutes = [];
  try {
    const postsDir = path.join(process.cwd(), 'posts');
    if (fs.existsSync(postsDir)) {
      blogRoutes = fs.readdirSync(postsDir).filter((file) => file.endsWith('.md')).map((file) => {
        let date = today;
        try { const parsed = matter(fs.readFileSync(path.join(postsDir, file), 'utf8')); if (parsed.data?.date) date = parsed.data.date; } catch (_) {}
        return { url: `/blog/${file.replace(/\.md$/, '')}`, priority: '0.7', changefreq: 'monthly', lastmod: date };
      });
    }
  } catch (e) { console.error('Sitemap blog route error:', e); }
  const dedupe = new Map();
  [...staticRoutes, ...toolRoutes, ...solutionRoutes, ...useCaseRoutes, ...trustRoutes, ...materialRoutes, ...comparisonRoutes, ...templateRoutes, ...aiRoutes, ...qrRoutes, ...blogRoutes].forEach((r) => dedupe.set(r.url, r));
  const allRoutes = [...dedupe.values()];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${allRoutes.map((route) => `  <url>\n    <loc>${domain}${xmlEscape(route.url)}</loc>\n    <lastmod>${xmlEscape(route.lastmod || today)}</lastmod>\n    <changefreq>${route.changefreq}</changefreq>\n    <priority>${route.priority}</priority>\n  </url>`).join('\n')}\n</urlset>`;
  res.setHeader('Content-Type', 'text/xml'); res.write(xml); res.end(); return { props: {} };
}
