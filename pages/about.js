import Head from 'next/head';

const sections = [{"heading": "Free tools for every Indian business", "text": "BharathQR helps Indian merchants, creators, students and professionals create useful digital assets in seconds. The platform focuses on QR codes, UPI payment QR codes, WhatsApp tools, barcode tools and future AI business tools."}, {"heading": "What we do", "text": "Our tools are browser-based and mobile-first. You can create a UPI QR code, Google review QR, WhatsApp link QR and other business QR formats without installing software."}, {"heading": "Why free", "text": "BharathQR is designed to stay free through simple, non-intrusive monetization such as ads. The goal is to keep useful digital tools accessible to Indian users."}, {"heading": "Our principles", "text": "No login. No unnecessary data storage. Mobile-first design. India-first examples. White-hat SEO only."}];

export default function Page() {
  return (
    <>
      <Head>
        <title>About BharathQR — India's Free Digital Tools Platform</title>
        <meta name="description" content="BharathQR is a free browser-based platform for Indian merchants and creators. Generate UPI QR codes, WhatsApp links, barcodes and more. No account needed." />
        <link rel="canonical" href="https://bharathqr.com/about" />
      </Head>
      <main style={{ maxWidth: 860, margin: '0 auto', padding: '2rem 1rem', lineHeight: 1.7 }}>
        <h1 style={{ fontSize: 'clamp(2rem, 6vw, 3rem)', marginBottom: 8 }}>About BharathQR</h1>
        <p style={{ color: '#4B5563', fontSize: 18 }}>BharathQR is a free browser-based platform for Indian merchants and creators. Generate UPI QR codes, WhatsApp links, barcodes and more. No account needed.</p>
        {sections.map((section) => (
          <section key={section.heading} style={{ marginTop: 24 }}>
            <h2>{section.heading}</h2>
            <p>{section.text}</p>
          </section>
        ))}
      </main>
    </>
  );
}
