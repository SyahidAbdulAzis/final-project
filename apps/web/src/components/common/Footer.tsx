function BrandInfo() {
  return (
    <div className="brand-info">
      <img src="/logo/stacked.svg" alt="StayEase" className="max-w-[80px] h-auto mb-1" />
      <p className="m-0">Solusi pencarian properti dengan harga fleksibel berdasarkan tanggal.</p>
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
