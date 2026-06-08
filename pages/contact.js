import Head from 'next/head';

const sections = [{"heading": "We read every message", "text": "BharathQR is a small project focused on useful free tools for India."}, {"heading": "Email", "text": "For general questions, write to hello@bharathqr.com."}, {"heading": "GitHub", "text": "For bugs or technical issues, use the GitHub repository linked from the project."}, {"heading": "Response time", "text": "We typically respond within 2–3 business days."}];

export default function Page() {
  return (
    <>
      <Head>
        <title>Contact BharathQR — Free Digital Tools for India</title>
        <meta name="description" content="Contact the BharathQR team. We are building free tools for Indian merchants and creators." />
        <link rel="canonical" href="https://bharathqr.com/contact" />
      </Head>
      <main style={{ maxWidth: 860, margin: '0 auto', padding: '2rem 1rem', lineHeight: 1.7 }}>
        <h1 style={{ fontSize: 'clamp(2rem, 6vw, 3rem)', marginBottom: 8 }}>Contact BharathQR</h1>
        <p style={{ color: '#4B5563', fontSize: 18 }}>Contact the BharathQR team. We are building free tools for Indian merchants and creators.</p>
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
