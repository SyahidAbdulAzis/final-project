function BrandInfo() {
  return (
    <div>
      <img src="/logo/stacked.svg" alt="StayEase" style={{ maxWidth: '80px', height: 'auto', marginBottom: '4px' }} />
      <p style={{ margin: 0 }}>Solusi pencarian properti dengan harga fleksibel berdasarkan tanggal.</p>
      <small>© 2026 StayEase. Semua hak dilindungi.</small>
    </div>
  );
}

function FooterBottom() {
  return <p className="footer-bottom">Bahasa Indonesia (ID) • Rp IDR</p>;
}

export function Footer() {
  return (
    <footer className="footer glass-card">
      <BrandInfo />
      <FooterBottom />
    </footer>
  );
}
