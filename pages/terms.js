import Head from 'next/head';

const sections = [{"heading": "Use of tools", "text": "BharathQR tools are free to use for personal and commercial purposes."}, {"heading": "No guarantees", "text": "Tools are provided as-is without uptime, accuracy or business outcome guarantees."}, {"heading": "UPI disclaimer", "text": "BharathQR is not affiliated with NPCI, BHIM, UPI, any bank or any payment app. UPI is a trademark of NPCI."}, {"heading": "User responsibility", "text": "Users are responsible for entering correct UPI IDs, links and other information."}, {"heading": "Prohibited uses", "text": "Do not use BharathQR to create fraudulent QR codes or mislead users."}];

export default function Page() {
  return (
    <>
      <Head>
        <title>Terms of Use — BharathQR</title>
        <meta name="description" content="Terms of use for bharathqr.com. Free tools for Indian merchants. Not affiliated with NPCI, BHIM, UPI, or any bank." />
        <link rel="canonical" href="https://bharathqr.com/terms" />
      <meta property="og:title" content="Terms of Use — BharathQR" /><meta property="og:description" content="Terms of use for bharathqr.com. Free tools for Indian merchants. Not affiliated with NPCI, BHIM, UPI, or any bank." /><meta property="og:url" content="https://bharathqr.com/terms" /><meta name="twitter:title" content="Terms of Use — BharathQR" /><meta name="twitter:description" content="Terms of use for bharathqr.com. Free tools for Indian merchants. Not affiliated with NPCI, BHIM, UPI, or any bank." /></Head>
      <main style={{ maxWidth: 860, margin: '0 auto', padding: '2rem 1rem', lineHeight: 1.7 }}>
        <h1 style={{ fontSize: 'clamp(2rem, 6vw, 3rem)', marginBottom: 8 }}>Terms of Use</h1>
        <p style={{ color: '#4B5563', fontSize: 18 }}>Terms of use for bharathqr.com. Free tools for Indian merchants. Not affiliated with NPCI, BHIM, UPI, or any bank.</p>
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
