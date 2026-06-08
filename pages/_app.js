import Head from 'next/head';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:site_name" content="BharathQR" />
        <link rel="icon" href="/favicon.svg" />
      </Head>
      <Navbar />
      <Component {...pageProps} />
      <Footer />
      <style jsx global>{`
        * { box-sizing: border-box; }
        html, body, #__next { margin: 0; min-height: 100%; font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
        body { background: #ffffff; color: #111827; }
        input, textarea, select, button { font: inherit; font-size: 16px; }
        button { min-height: 48px; cursor: pointer; }
        img, canvas { max-width: 100%; height: auto; }
        a { overflow-wrap: anywhere; }
      `}</style>
    </>
  );
}
