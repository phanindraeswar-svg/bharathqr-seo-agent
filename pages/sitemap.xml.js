export async function getServerSideProps({ res }) {
  res.writeHead(301, {
    Location: '/sitemap.xml',
  });
  res.end();

  return {
    props: {},
  };
}

export default function SitemapRedirect() {
  return null;
}