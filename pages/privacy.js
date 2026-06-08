import Head from 'next/head';

const sections = [{"heading": "What data we collect", "text": "BharathQR tools are designed to run in your browser. QR inputs are used to generate the code and are not stored by BharathQR."}, {"heading": "Cookies and ads", "text": "We do not require tracking cookies for tool usage. If ads are enabled in the future, ad partners may use cookies according to their own privacy policies."}, {"heading": "Third parties", "text": "The website is hosted on Vercel and source code may be maintained on GitHub. AI content generation uses Groq for backend automation, not for user tool inputs."}, {"heading": "Contact", "text": "For privacy questions, contact privacy@bharathqr.com."}];

export default function Page() {
  return (
    <>
      <Head>
        <title>Privacy Policy — BharathQR</title>
        <meta name="description" content="BharathQR does not collect, store, or share your personal data. QR codes are generated in your browser." />
        <link rel="canonical" href="https://bharathqr.com/privacy" />
      </Head>
      <main style={{ maxWidth: 860, margin: '0 auto', padding: '2rem 1rem', lineHeight: 1.7 }}>
        <h1 style={{ fontSize: 'clamp(2rem, 6vw, 3rem)', marginBottom: 8 }}>Privacy Policy</h1>
        <p style={{ color: '#4B5563', fontSize: 18 }}>BharathQR does not collect, store, or share your personal data. QR codes are generated in your browser.</p>
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
