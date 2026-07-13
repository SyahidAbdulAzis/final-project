import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import QRCode from 'react-qr-code';
import { Navbar } from '../../../components/common/Navbar';
import { Footer } from '../../../components/common/Footer';
import { getSuccessfulBookings } from '../services/bookingApi';
import { createReview, getReview } from '../services/reviewApi';
import { useAuth } from '../../auth/stores/AuthContext';
import type { BookingResponse } from '../../../types/booking';
import type { ReviewResponse } from '../services/reviewApi';


function StarInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          style={{ background: 'none', border: 'none', fontSize: '2rem', cursor: 'pointer', color: star <= value ? '#f5a623' : '#ddd', transition: 'color 0.15s', padding: '0 2px' }}
          onMouseEnter={(e) => { if (star > value) (e.target as HTMLElement).style.color = '#f5a623'; }}
          onMouseLeave={(e) => { if (star > value) (e.target as HTMLElement).style.color = '#ddd'; }}
        >
          ★
        </button>
      ))}
    </div>
  );
}

type ReviewState = {
  existing: ReviewResponse | null;
  rating: number;
  comment: string;
  submitting: boolean;
  submitted: boolean;
  error: string | null;
};

export function BookingHistoryPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useAuth();
  
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedBooking, setSelectedBooking] = useState<BookingResponse | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [review, setReview] = useState<ReviewState>({
    existing: null,
    rating: 0,
    comment: "",
    submitting: false,
    submitted: false,
    error: null,
  });

  useEffect(() => {
    if (isLoading) return;
    
    if (!isAuthenticated || !user) {
      navigate('/login/user');
      return;
    }

    if (user.role !== 'user') {
      navigate('/');
      return;
    }

    setLoading(true);
    getSuccessfulBookings(user.id, currentPage, 5)
      .then((result) => {
        setBookings(result.bookings);
        setTotalPages(result.totalPages);
        setTotal(result.total);
        setLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Gagal memuat riwayat pemesanan');
        setLoading(false);
      });
  }, [isAuthenticated, user, navigate, isLoading, currentPage]);

  useEffect(() => {
    if (!showQRModal || !selectedBooking) return;
    getReview(selectedBooking.id)
      .then((r) => {
        if (r) {
          setReview({ existing: r, rating: r.rating, comment: r.comment, submitting: false, submitted: true, error: null });
        } else {
          setReview({ existing: null, rating: 0, comment: "", submitting: false, submitted: false, error: null });
        }
      })
      .catch(() => {
        setReview({ existing: null, rating: 0, comment: "", submitting: false, submitted: false, error: null });
      });
  }, [showQRModal, selectedBooking]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DIKONFIRMASI':
        return '#4caf50';
      default:
        return '#757575';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'DIKONFIRMASI':
        return 'Dikonfirmasi';
      default:
        return status;
    }
  };

  const handleBookingClick = (booking: BookingResponse) => {
    setSelectedBooking(booking);
    setShowQRModal(true);
  };

  const handleCloseModal = () => {
    setShowQRModal(false);
    setSelectedBooking(null);
    resetReview();
  };

  const canReview = (checkOut: string) => {
    const checkOutDate = new Date(checkOut);
    checkOutDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today >= checkOutDate;
  };

  const handleSubmitReview = async () => {
    if (!selectedBooking || review.rating === 0 || !review.comment.trim()) {
      setReview((prev) => ({ ...prev, error: "Rating dan komentar wajib diisi" }));
      return;
    }
    setReview((prev) => ({ ...prev, submitting: true, error: null }));
    try {
      await createReview(selectedBooking.id, { rating: review.rating, comment: review.comment });
      setReview((prev) => ({ ...prev, submitting: false, submitted: true, error: null }));
    } catch (err) {
      setReview((prev) => ({ ...prev, submitting: false, error: (err as Error).message }));
    }
  };

  const resetReview = () => {
    setReview({ existing: null, rating: 0, comment: "", submitting: false, submitted: false, error: null });
  };

  if (loading) {
    return (
      <div className="layout">
        <Navbar />
        <main style={{ padding: 40, maxWidth: 1360, margin: '0 auto' }}>
          <p>Memuat riwayat pemesanan...</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="layout">
      <Navbar />
      <main style={{ padding: '28px 32px', maxWidth: 1360, margin: '0 auto' }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: 6, color: 'var(--text)' }}>
            Riwayat Pemesanan
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
            Daftar pemesanan yang berhasil Anda lakukan
          </p>
        </div>

        {error && (
          <div style={{ padding: 16, borderRadius: 8, backgroundColor: '#fee', color: '#c33', marginBottom: 24 }}>
            {error}
          </div>
        )}

        {bookings.length === 0 ? (
          <div style={{ 
            padding: 48, 
            borderRadius: 16, 
            backgroundColor: '#f5f5f5', 
            textAlign: 'center',
            color: 'var(--muted)'
          }}>
            <p style={{ fontSize: '1.1rem', marginBottom: 8 }}>Belum ada riwayat pemesanan</p>
            <p style={{ fontSize: '0.9rem' }}>
              Anda belum memiliki pemesanan yang berhasil
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {bookings.map((booking) => (
              <div
                key={booking.id}
                onClick={() => handleBookingClick(booking)}
                style={{
                  border: '1px solid var(--line)',
                  borderRadius: 16,
                  padding: 24,
                  backgroundColor: '#fff',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--primary)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--line)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 4, color: 'var(--text)' }}>
                      {booking.room.name}
                    </h3>
                    <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
                      {booking.room.property.name} - {booking.room.property.city}
                    </p>
                  </div>
                  <div
                    style={{
                      padding: '6px 12px',
                      borderRadius: 20,
                      backgroundColor: `${getStatusColor(booking.status)}20`,
                      color: getStatusColor(booking.status),
                      fontSize: '0.85rem',
                      fontWeight: 600,
                    }}
                  >
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
                  <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                    Booking pada {new Date(booking.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#4caf50', fontWeight: 600 }}>
                    ✓ Pembayaran Berhasil
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, marginTop: 24, padding: 16 }}>
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              style={{
                padding: '10px 20px',
                borderRadius: 8,
                border: '1px solid var(--line)',
                background: currentPage === 1 ? '#f5f5f5' : '#fff',
                color: currentPage === 1 ? 'var(--muted)' : 'var(--text)',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
              }}
            >
              Previous
            </button>
            <span style={{ fontSize: '0.9rem', color: 'var(--text)' }}>
              Halaman {currentPage} dari {totalPages} ({total} total)
            </span>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              style={{
                padding: '10px 20px',
                borderRadius: 8,
                border: '1px solid var(--line)',
                background: currentPage === totalPages ? '#f5f5f5' : '#fff',
                color: currentPage === totalPages ? 'var(--muted)' : 'var(--text)',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
              }}
            >
              Next
            </button>
          </div>
        )}

        {/* QR Code Modal */}
        {showQRModal && selectedBooking && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 1000,
            }}
            onClick={handleCloseModal}
          >
            <div
              style={{
                backgroundColor: '#fff',
                borderRadius: 16,
                padding: 32,
                maxWidth: 400,
                width: '90%',
                maxHeight: '90vh',
                overflowY: 'auto',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text)' }}>
                  QR Transaksi
                </h2>
                <button
                  onClick={handleCloseModal}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '1.5rem',
                    cursor: 'pointer',
                    color: 'var(--muted)',
                  }}
                >
                  ×
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                <div
                  style={{
                    padding: 16,
                    backgroundColor: '#fff',
                    borderRadius: 8,
                    border: '1px solid var(--line)',
                  }}
                >
                  <QRCode
                    value={JSON.stringify({
                      bookingId: selectedBooking.id,
                      userId: selectedBooking.userId,
                      roomId: selectedBooking.roomId,
                      checkIn: selectedBooking.checkIn,
                      checkOut: selectedBooking.checkOut,
                      totalPrice: selectedBooking.totalPrice,
                      status: selectedBooking.status,
                    })}
                    size={200}
                    level="H"
                  />
                </div>

                <div style={{ textAlign: 'center', width: '100%' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: 4 }}>
                    Booking ID
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', wordBreak: 'break-all', marginBottom: 12 }}>
                    {selectedBooking.id}
                  </div>

                  <div style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: 4 }}>
                    Properti
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: 12 }}>
                    {selectedBooking.room.name}
                  </div>

                  <div style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: 4 }}>
                    Check-in
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: 12 }}>
                    {new Date(selectedBooking.checkIn).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>

                  <div style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: 4 }}>
                    Check-out
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: 12 }}>
                    {new Date(selectedBooking.checkOut).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>

                  <div style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: 4 }}>
                    Total Harga
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--primary)', marginBottom: 16 }}>
                    Rp {selectedBooking.totalPrice.toLocaleString('id-ID')}
                  </div>

                  <div
                    style={{
                      padding: '8px 16px',
                      borderRadius: 20,
                      backgroundColor: '#4caf5020',
                      color: '#4caf50',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      display: 'inline-block',
                    }}
                  >
                    ✓ {getStatusLabel(selectedBooking.status)}
                  </div>
                </div>

                <div style={{ fontSize: '0.8rem', color: 'var(--muted)', textAlign: 'center', marginTop: 8 }}>
                  Tunjukkan QR code ini kepada tenant saat check-in
                </div>

                {/* Rating Section */}
                {canReview(selectedBooking.checkOut) && (
                  <div style={{ marginTop: 24, borderTop: "1px solid var(--line)", paddingTop: 20 }}>
                    <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: 16, color: "var(--text)", textAlign: "center" }}>
                      {review.submitted ? "Rating Anda" : "Berikan Rating"}
                    </h3>
                    {review.submitted ? (
                      <div style={{ textAlign: "center" }}>
                        <StarInput value={review.rating} onChange={() => {}} />
                        <p style={{ color: "var(--muted)", fontSize: "0.9rem", marginTop: 8, fontStyle: "italic" }}>"{review.comment}"</p>
                        <p style={{ color: "#4caf50", fontSize: "0.85rem", marginTop: 8 }}>Rating berhasil dikirim</p>
                      </div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        <StarInput value={review.rating} onChange={(v) => setReview((prev) => ({ ...prev, rating: v }))} />
                        <textarea
                          placeholder="Tulis komentar Anda..."
                          value={review.comment}
                          onChange={(e) => setReview((prev) => ({ ...prev, comment: e.target.value }))}
                          rows={3}
                          style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid var(--line)", fontSize: "0.9rem", fontFamily: "inherit", resize: "vertical", boxSizing: "border-box" }}
                        />
                        {review.error && <p style={{ color: "#c33", fontSize: "0.85rem" }}>{review.error}</p>}
                        <button onClick={handleSubmitReview} disabled={review.submitting}
                          style={{ padding: "10px 0", borderRadius: 8, border: "none", backgroundColor: review.submitting ? "#ccc" : "var(--primary)", color: "#fff", fontSize: "0.95rem", fontWeight: 600, cursor: review.submitting ? "not-allowed" : "pointer" }}>
                          {review.submitting ? "Mengirim..." : "Kirim Rating"}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
