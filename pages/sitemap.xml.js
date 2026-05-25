import seoData from '../seo_updates.json';

const EXTERNAL_URL = 'https://bharathqr-seo-agent-9vjm.vercel.app';

function generateSiteMap(data) {
  return `<?xml version="1.0" encoding="UTF-8"?>
   <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
     <url>
       <loc>${EXTERNAL_URL}</loc>
       <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
       <changefreq>daily</changefreq>
       <priority>1.0</priority>
     </url>
     ${data.optimized_data.suggested_routes
       .map(({ slug }) => {
         return `
       <url>
           <loc>${`${EXTERNAL_URL}/qr-for/${slug.trim()}`}</loc>
           <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
           <changefreq>weekly</changefreq>
           <priority>0.8</priority>
       </url>
     `;
       })
       .join('')}
   </urlset>
 `;
}

export async function getServerSideProps({ res }) {
  // Pass the raw text data inside your json matrix
  const sitemap = generateSiteMap(seoData);

  res.setHeader('Content-Type', 'text/xml');
  // Send the XML data directly to the browser or search engine bot
  res.write(sitemap);
  res.end();

  return {
    props: {},
  };
}

export default function Sitemap() {}
