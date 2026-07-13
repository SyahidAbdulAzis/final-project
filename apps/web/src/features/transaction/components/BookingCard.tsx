import { useNavigate } from 'react-router-dom';
import { BookingTimer } from './BookingTimer';
import type { BookingResponse } from '../../../types/booking';

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

interface BookingCardProps {
  booking: BookingResponse;
  cancelling: string | null;
  onCancel: (id: string) => void;
}

export function BookingCard({ booking, cancelling, onCancel }: BookingCardProps) {
  const navigate = useNavigate();

  return (
    <div style={{ border: '1px solid var(--line)', borderRadius: 16, padding: 24, backgroundColor: '#fff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 4, color: 'var(--text)' }}>
            {booking.room.name}
          </h3>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
            {booking.room.property.name} - {booking.room.property.city}
          </p>
        </div>
        <div style={{
          padding: '6px 12px', borderRadius: 20,
          backgroundColor: `${getStatusColor(booking.status)}20`,
          color: getStatusColor(booking.status), fontSize: '0.85rem', fontWeight: 600,
        }}>
          {getStatusLabel(booking.status)}
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

      <div style={{ borderTop: '1px solid var(--line)', paddingTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
            Booking pada {new Date(booking.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </div>
          <div style={{ fontSize: '0.85rem', marginTop: 4 }}>
            <BookingTimer createdAt={booking.createdAt} status={booking.status} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {booking.status === 'MENUNGGU_PEMBAYARAN' && (
            <>
              <button
                onClick={() => onCancel(booking.id)}
                disabled={cancelling === booking.id}
                style={{
                  padding: '10px 20px', borderRadius: 8, border: '1px solid #f44336',
                  background: '#fff', color: '#f44336', fontSize: '0.9rem', fontWeight: 600,
                  cursor: cancelling === booking.id ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
                }}
              >
                {cancelling === booking.id ? 'Membatalkan...' : 'Batalkan'}
              </button>
              <button
                onClick={() => navigate(`/payment/${booking.id}`)}
                style={{
                  padding: '10px 20px', borderRadius: 8, border: 'none',
                  background: 'var(--primary)', color: '#fff', fontSize: '0.9rem', fontWeight: 600,
                  cursor: 'pointer', transition: 'all 0.2s',
                }}
              >
                Bayar Sekarang
              </button>
            </>
          )}
          {booking.status === 'KADALUARSA' && (
            <span style={{ fontSize: '0.85rem', color: '#f44336', fontWeight: 600 }}>
              Booking Kadaluarsa
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
