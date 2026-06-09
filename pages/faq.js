import Head from 'next/head';

const faqs = [
  ['Is BharathQR really free?', 'Yes. BharathQR tools are free to use without login.'],
  ['Which UPI apps work with BharathQR?', 'Generated UPI QR codes work with apps such as GPay, PhonePe, Paytm, BHIM and other UPI apps.'],
  ['Do I need to create an account?', 'No. BharathQR does not require signup for the current tools.'],
  ['Is my UPI ID safe?', 'Your QR code is generated in your browser. BharathQR is designed to avoid storing your tool inputs.'],
  ['Can I create QR codes for business reviews?', 'Yes. Use the Google Review QR Generator to create a scannable review QR code.'],
  ['Can I use BharathQR on mobile?', 'Yes. BharathQR is designed mobile-first for Android and iPhone browsers.']
];

export default function FAQ() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } }))
  };
  return (
    <>
      <Head>
        <title>FAQ — BharathQR Free QR Code and UPI Tools</title>
        <meta name="description" content="Answers to common questions about BharathQR — UPI QR codes, supported apps, privacy, mobile use and free QR tools." />
        <link rel="canonical" href="https://bharathqr.com/faq" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <meta property="og:title" content="FAQ — BharathQR Free QR Code and UPI Tools" /><meta property="og:description" content="Answers to common questions about BharathQR — UPI QR codes, supported apps, privacy, mobile use and free QR tools." /><meta property="og:url" content="https://bharathqr.com/faq" /><meta name="twitter:title" content="FAQ — BharathQR Free QR Code and UPI Tools" /><meta name="twitter:description" content="Answers to common questions about BharathQR — UPI QR codes, supported apps, privacy, mobile use and free QR tools." /></Head>
      <main style={{ maxWidth: 860, margin: '0 auto', padding: '2rem 1rem' }}>
        <h1 style={{ fontSize: 'clamp(2rem, 6vw, 3rem)' }}>Frequently Asked Questions</h1>
        <div style={{ display: 'grid', gap: 14 }}>
          {faqs.map(([q, a]) => (
            <section key={q} style={{ border: '1px solid #E5E7EB', borderRadius: 16, padding: 18 }}>
              <h2 style={{ marginTop: 0, fontSize: 20 }}>{q}</h2>
              <p style={{ color: '#4B5563', lineHeight: 1.6 }}>{a}</p>
            </section>
          ))}
        </div>
      </main>
    </>
  );
}
