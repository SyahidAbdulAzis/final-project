export function PaymentInfo() {
  return (
    <div style={{ border: '1px solid var(--line)', borderRadius: 16, padding: 24, position: 'sticky', top: 100 }}>
      <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 16, color: 'var(--text)' }}>Informasi Pembayaran</h2>
      <div style={{ fontSize: '0.9rem', color: 'var(--muted)', lineHeight: 1.7 }}>
        <p style={{ marginBottom: 12 }}>Silakan transfer ke rekening berikut:</p>
        <div style={{ backgroundColor: '#f5f5f5', padding: 12, borderRadius: 8, marginBottom: 12 }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: 4 }}>Bank</div>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>BCA</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: 4 }}>Nomor Rekening</div>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>123-456-7890</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: 4 }}>Atas Nama</div>
          <div style={{ fontWeight: 600 }}>PT Villa Stay Indonesia</div>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
          Setelah transfer, upload bukti transfer di form di sebelah kiri. Status booking akan berubah menjadi "Menunggu Konfirmasi".
        </p>
      </div>
    </div>
  );
}
