interface BookingSummaryProps {
  roomName: string;
  basePrice: number;
  totalPrice: number;
  checkIn: string;
  checkOut: string;
  loading: boolean;
  error: string | null;
  onCheckout: () => void;
}

export function BookingSummary({
  roomName, basePrice, totalPrice, checkIn, checkOut,
  loading, error, onCheckout,
}: BookingSummaryProps) {
  const nights = checkIn && checkOut
    ? Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div style={{
      border: '1px solid var(--line)', borderRadius: 24, padding: 24,
      height: 'fit-content', position: 'sticky', top: 100, background: 'var(--card)',
    }}>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 16, color: 'var(--text)' }}>
        Ringkasan Harga
      </h3>

      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.9rem', color: 'var(--muted)' }}>
          <span>{roomName} x 1 kamar</span>
          <span>Rp {basePrice.toLocaleString('id-ID')} / malam</span>
        </div>
        {nights > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.9rem', color: 'var(--muted)' }}>
            <span>Durasi</span>
            <span>{nights} malam</span>
          </div>
        )}
      </div>

      <div style={{ borderTop: '1px solid var(--line)', paddingTop: 16, marginTop: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.1rem', color: 'var(--text)', marginBottom: 16 }}>
          <span>Total</span>
          <span style={{ color: 'var(--primary)' }}>Rp {totalPrice.toLocaleString('id-ID')}</span>
        </div>

        <button
          onClick={onCheckout}
          disabled={loading || totalPrice === 0}
          style={{
            width: '100%', padding: 14, borderRadius: 12, border: 'none',
            background: loading || totalPrice === 0 ? 'var(--muted)' : 'var(--primary)',
            color: '#fff', fontSize: '1rem', fontWeight: 600,
            cursor: loading || totalPrice === 0 ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
          }}
        >
          {loading ? 'Memproses...' : 'Checkout'}
        </button>

        {error && (
          <p style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: 12, textAlign: 'center' }}>
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
