import { useState, useEffect } from 'react';
import QRCode from 'react-qr-code';
import { StarInput } from './StarInput';
import { createReview, getReview } from '../services/reviewApi';
import type { BookingResponse } from '../../../types/booking';
import type { ReviewResponse } from '../services/reviewApi';

function getStatusLabel(status: string) {
  switch (status) {
    case 'DIKONFIRMASI': return 'Dikonfirmasi';
    default: return status;
  }
}

function canReview(checkOut: string) {
  const checkOutDate = new Date(checkOut);
  checkOutDate.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today >= checkOutDate;
}

interface QRViewModalProps {
  booking: BookingResponse;
  onClose: () => void;
}

export function QRViewModal({ booking, onClose }: QRViewModalProps) {
  const [existing, setExisting] = useState<ReviewResponse | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getReview(booking.id).then((r) => {
      if (r) {
        setExisting(r);
        setRating(r.rating);
        setComment(r.comment);
        setSubmitted(true);
      }
    }).catch(() => {});
  }, [booking.id]);

  const handleSubmitReview = async () => {
    if (rating === 0 || !comment.trim()) {
      setError('Rating dan komentar wajib diisi');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await createReview(booking.id, { rating, comment });
      setSubmitting(false);
      setSubmitted(true);
    } catch (err) {
      setSubmitting(false);
      setError((err as Error).message);
    }
  };

  return (
    <div
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center',
        alignItems: 'center', zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#fff', borderRadius: 16, padding: 32, maxWidth: 400,
          width: '90%', maxHeight: '90vh', overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text)' }}>QR Transaksi</h2>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--muted)',
          }}>×</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div style={{ padding: 16, backgroundColor: '#fff', borderRadius: 8, border: '1px solid var(--line)' }}>
            <QRCode
              value={JSON.stringify({
                bookingId: booking.id, userId: booking.userId, roomId: booking.roomId,
                checkIn: booking.checkIn, checkOut: booking.checkOut,
                totalPrice: booking.totalPrice, status: booking.status,
              })}
              size={200}
              level="H"
            />
          </div>

          <div style={{ textAlign: 'center', width: '100%' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: 4 }}>Booking ID</div>
            <div style={{ fontWeight: 600, fontSize: '0.9rem', wordBreak: 'break-all', marginBottom: 12 }}>{booking.id}</div>

            <div style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: 4 }}>Properti</div>
            <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: 12 }}>{booking.room.name}</div>

            <div style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: 4 }}>Check-in</div>
            <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: 12 }}>
              {new Date(booking.checkIn).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
            </div>

            <div style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: 4 }}>Check-out</div>
            <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: 12 }}>
              {new Date(booking.checkOut).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
            </div>

            <div style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: 4 }}>Total Harga</div>
            <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--primary)', marginBottom: 16 }}>
              Rp {booking.totalPrice.toLocaleString('id-ID')}
            </div>

            <div style={{
              padding: '8px 16px', borderRadius: 20, backgroundColor: '#4caf5020',
              color: '#4caf50', fontSize: '0.85rem', fontWeight: 600, display: 'inline-block',
            }}>
              ✓ {getStatusLabel(booking.status)}
            </div>
          </div>

          <div style={{ fontSize: '0.8rem', color: 'var(--muted)', textAlign: 'center', marginTop: 8 }}>
            Tunjukkan QR code ini kepada tenant saat check-in
          </div>

          {canReview(booking.checkOut) && (
            <div style={{ marginTop: 24, borderTop: '1px solid var(--line)', paddingTop: 20 }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 16, color: 'var(--text)', textAlign: 'center' }}>
                {submitted ? 'Rating Anda' : 'Berikan Rating'}
              </h3>
              {submitted ? (
                <div style={{ textAlign: 'center' }}>
                  <StarInput value={rating} onChange={() => {}} />
                  <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginTop: 8, fontStyle: 'italic' }}>"{comment}"</p>
                  {!existing && (
                    <p style={{ color: '#4caf50', fontSize: '0.85rem', marginTop: 8 }}>Rating berhasil dikirim</p>
                  )}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <StarInput value={rating} onChange={setRating} />
                  <textarea
                    placeholder="Tulis komentar Anda..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={3}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--line)', fontSize: '0.9rem', fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' }}
                  />
                  {error && <p style={{ color: '#c33', fontSize: '0.85rem' }}>{error}</p>}
                  <button onClick={handleSubmitReview} disabled={submitting} style={{
                    padding: '10px 0', borderRadius: 8, border: 'none',
                    backgroundColor: submitting ? '#ccc' : 'var(--primary)', color: '#fff',
                    fontSize: '0.95rem', fontWeight: 600, cursor: submitting ? 'not-allowed' : 'pointer',
                  }}>
                    {submitting ? 'Mengirim...' : 'Kirim Rating'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
