import type { BookingResponse } from '../../../types/booking';
import { CountdownTimer } from './CountdownTimer';

function getStatusColor(status: string) {
  switch (status) {
    case 'MENUNGGU_PEMBAYARAN': return '#ff9800';
    case 'MENUNGGU_KONFIRMASI': return '#2196f3';
    case 'DIKONFIRMASI': return '#4caf50';
    case 'DIBATALKAN': return '#f44336';
    case 'KADALUARSA': return '#9e9e9e';
    default: return '#757575';
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case 'MENUNGGU_PEMBAYARAN': return 'Menunggu Pembayaran';
    case 'MENUNGGU_KONFIRMASI': return 'Menunggu Konfirmasi';
    case 'DIKONFIRMASI': return 'Dikonfirmasi';
    case 'DIBATALKAN': return 'Dibatalkan';
    case 'KADALUARSA': return 'Kadaluarsa';
    default: return status;
  }
}

interface TransactionCardProps {
  booking: BookingResponse;
  confirming: string | null;
  rejecting: string | null;
  cancelling: string | null;
  onConfirm: (id: string) => void;
  onReject: (id: string) => void;
  onCancel: (id: string) => void;
  onExpired: () => void;
}

export function TransactionCard({
  booking, confirming, rejecting, cancelling,
  onConfirm, onReject, onCancel, onExpired,
}: TransactionCardProps) {
  return (
    <div style={{
      border: '1px solid var(--line)', borderRadius: 16, padding: 24, backgroundColor: '#fff',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 4, color: 'var(--text)' }}>
            {booking.room?.name || 'Unknown Room'}
          </h3>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
            {booking.room?.property?.name || 'Unknown Property'} - {booking.room?.property?.city || 'Unknown City'}
          </p>
          <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginTop: 4 }}>
            Penyewa: {booking.user?.fullName || booking.user?.email || 'Unknown User'}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            padding: '6px 12px', borderRadius: 20,
            backgroundColor: `${getStatusColor(booking.status)}20`,
            color: getStatusColor(booking.status), fontSize: '0.85rem', fontWeight: 600,
          }}>
            {getStatusLabel(booking.status)}
          </div>
          {booking.status === 'MENUNGGU_KONFIRMASI' && booking.expiresAt && (
            <CountdownTimer expiresAt={booking.expiresAt} onExpired={onExpired} />
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: 4 }}>Booking ID</div>
          <div style={{ fontWeight: 600, fontSize: '0.95rem', wordBreak: 'break-all' }}>{booking.id}</div>
        </div>
        <div>
          <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: 4 }}>Check-in</div>
          <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>
            {new Date(booking.checkIn).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
          </div>
        </div>
        <div>
          <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: 4 }}>Check-out</div>
          <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>
            {new Date(booking.checkOut).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
          </div>
        </div>
        <div>
          <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: 4 }}>Total Harga</div>
          <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--primary)' }}>
            Rp {booking.totalPrice.toLocaleString('id-ID')}
          </div>
        </div>
      </div>

      {booking.payment && booking.payment.proofUrl && (
        <div style={{ marginBottom: 16, padding: 16, backgroundColor: '#f5f5f5', borderRadius: 8 }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: 8, color: 'var(--text)' }}>
            Bukti Pembayaran
          </div>
          <img src={booking.payment.proofUrl} alt="Bukti pembayaran" style={{
            width: '100%', maxWidth: 300, borderRadius: 8, border: '1px solid var(--line)',
          }} />
          <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: 8 }}>
            Diupload pada {booking.payment.uploadedAt
              ? new Date(booking.payment.uploadedAt).toLocaleDateString('id-ID', {
                  day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
                })
              : 'N/A'}
          </div>
        </div>
      )}

      <div style={{ borderTop: '1px solid var(--line)', paddingTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
          Booking pada {new Date(booking.createdAt).toLocaleDateString('id-ID', {
            day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
          })}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {booking.status === 'MENUNGGU_KONFIRMASI' && (
            <>
              <button
                onClick={() => onReject(booking.id)}
                disabled={rejecting === booking.id}
                style={{
                  padding: '10px 20px', borderRadius: 8, border: '1px solid #f44336',
                  background: '#fff', color: '#f44336', fontSize: '0.9rem', fontWeight: 600,
                  cursor: rejecting === booking.id ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
                }}
              >
                {rejecting === booking.id ? 'Menolak...' : 'Tolak'}
              </button>
              <button
                onClick={() => onConfirm(booking.id)}
                disabled={confirming === booking.id}
                style={{
                  padding: '10px 20px', borderRadius: 8, border: 'none',
                  background: 'var(--primary)', color: '#fff', fontSize: '0.9rem', fontWeight: 600,
                  cursor: confirming === booking.id ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
                }}
              >
                {confirming === booking.id ? 'Mengkonfirmasi...' : 'Konfirmasi'}
              </button>
            </>
          )}
          {booking.status === 'MENUNGGU_PEMBAYARAN' && !booking.payment && (
            <button
              onClick={() => onCancel(booking.id)}
              disabled={cancelling === booking.id}
              style={{
                padding: '10px 20px', borderRadius: 8, border: '1px solid #f44336',
                background: '#fff', color: '#f44336', fontSize: '0.9rem', fontWeight: 600,
                cursor: cancelling === booking.id ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
              }}
            >
              {cancelling === booking.id ? 'Membatalkan...' : 'Batalkan Pesanan'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
