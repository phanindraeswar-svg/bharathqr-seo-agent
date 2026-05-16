import fs from 'fs';
import path from 'path';

export default function SeoPage({ content, title }) {
  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto', padding: '40px' }}>
      <a href="/" style={{ color: '#0070f3', textDecoration: 'none' }}>← Back Home</a>
      <hr style={{ margin: '20px 0', borderColor: '#eaeaea' }} />
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  );
}

export async function getStaticPaths() {
  const directory = path.join(process.cwd(), 'pages/seo');
  const files = fs.readdirSync(directory);
  
  const paths = files
    .filter(file => file.endsWith('.md'))
    .map(file => ({
      params: { slug: file.replace('.md', '') }
    }));

  return { paths, fallback: false };
}

export async function getStaticProps({ params }) {
  const filePath = path.join(process.cwd(), 'pages/seo', `${params.slug}.md`);
  const fileContent = fs.readFileSync(filePath, 'utf8');

  const cleanContent = fileContent
    .replace(/#/g, '')
    .replace(/\n/g, '<br />');

  return {
    props: {
      title: params.slug,
      content: cleanContent
    }
  };
}
