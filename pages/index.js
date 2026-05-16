import React, { useState, useEffect, useRef } from 'react';

export default function Home() {
  const [vpa, setVpa] = useState('');
  const [pname, setPname] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [qrGenerated, setQrGenerated] = useState(false);
  const [copyText, setCopyText] = useState('⎘ Copy UPI ID');
  const qrRef = useRef(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
    script.async = true;
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, []);

  const generateQR = () => {
    if (!vpa.trim()) {
      alert('Please enter a UPI ID');
      return;
    }
    if (!window.QRCode) return;

    const qrBox = qrRef.current;
    qrBox.innerHTML = '';

    let upiStr = `upi://pay?pa=${encodeURIComponent(vpa.trim())}`;
    if (pname.trim()) upiStr += `&pn=${encodeURIComponent(pname.trim())}`;
    if (amount && parseFloat(amount) > 0) upiStr += `&am=${parseFloat(amount).toFixed(2)}`;
    upiStr += `&cu=INR`;
    if (note.trim()) upiStr += `&tn=${encodeURIComponent(note.trim())}`;

    new window.QRCode(qrBox, {
      text: upiStr,
      width: 206,
      height: 206,
      colorDark: '#111111',
      colorLight: '#ffffff',
    });

    setQrGenerated(true);
  };

  const resetForm = () => {
    setVpa('');
    setPname('');
    setAmount('');
    setNote('');
    setQrGenerated(false);
    if (qrRef.current) qrRef.current.innerHTML = '';
  };

  const copyUPI = () => {
    if (!vpa.trim()) return;
    navigator.clipboard.writeText(vpa.trim()).then(() => {
      setCopyText('✓ Copied!');
      setTimeout(() => setCopyText('⎘ Copy UPI ID'), 2000);
    });
  };

  return (
    <div style={{ fontFamily: 'sans-serif', backgroundColor: '#f5f5f0', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
      <header style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', color: '#111' }}>UPI QR Generator</h1>
        <p style={{ color: '#666', marginTop: '0.5rem' }}>Create a scannable payment QR for GPay, PhonePe, Paytm &amp; all UPI apps</p>
      </header>

      <div style={{ backgroundColor: '#fff', borderRadius: '20px', border: '1px solid #e8e8e4', display: 'grid', gridTemplateColumns: '1fr 1fr', maxWidth: '780px', width: '100%', overflow: 'hidden', boxShadow: '0 4px 32px rgba(0,0,0,.06)' }}>
        <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <h2>Your payment details</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '11px', color: '#888' }}>UPI ID (VPA) *</label>
            <input type="text" value={vpa} onChange={(e) => setVpa(e.target.value)} placeholder="yourname@upi" style={{ padding: '10px', borderRadius: '10px', border: '1px solid #ddd' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '11px', color: '#888' }}>Payee name</label>
            <input type="text" value={pname} onChange={(e) => setPname(e.target.value)} placeholder="Rahul Sharma" style={{ padding: '10px', borderRadius: '10px', border: '1px solid #ddd' }} />
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '11px', color: '#888' }}>Amount (₹)</label>
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" style={{ padding: '10px', borderRadius: '10px', border: '1px solid #ddd' }} />
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '11px', color: '#888' }}>Note / Remark</label>
            <input type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Invoice #42" style={{ padding: '10px', borderRadius: '10px', border: '1px solid #ddd' }} />
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: 'auto' }}>
            <button onClick={generateQR} style={{ background: '#1D9E75', color: '#fff', padding: '11px', borderRadius: '10px', cursor: 'pointer', border: 'none', width: '100%' }}>⬛ Generate QR</button>
            <button onClick={resetForm} style={{ background: 'transparent', border: '1px solid #ddd', padding: '11px', borderRadius: '10px', cursor: 'pointer', width: '100%' }}>Clear</button>
          </div>
        </div>

        <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.25rem', background: '#fafaf8' }}>
          <div ref={qrRef} style={{ width: '210px', height: '210px', background: '#fff', border: '1px solid #e8e8e4', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#aaa', fontSize: '12px' }}>QR appears here</span>
          </div>
          {qrGenerated && (
            <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
              <button onClick={copyUPI} style={{ width: '100%', padding: '9px', borderRadius: '10px', border: '1px solid #ddd', background: '#fff', cursor: 'pointer' }}>{copyText}</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
