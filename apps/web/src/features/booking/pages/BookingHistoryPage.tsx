import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../../../components/common/Navbar';
import { Footer } from '../../../components/common/Footer';
import { getSuccessfulBookings } from '../services/bookingApi';
import { useAuth } from '../../auth/stores/AuthContext';
import { QRViewModal } from '../components/QRViewModal';
import type { BookingResponse } from '../../../types/booking';

function getStatusColor(status: string) {
  return status === 'DIKONFIRMASI' ? '#4caf50' : '#757575';
}

function getStatusLabel(status: string) {
  return status === 'DIKONFIRMASI' ? 'Dikonfirmasi' : status;
}

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

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated || !user) { navigate('/login/user'); return; }
    if (user.role !== 'user') { navigate('/'); return; }

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

  const handleBookingClick = (booking: BookingResponse) => {
    setSelectedBooking(booking);
    setShowQRModal(true);
  };

  const handleCloseModal = () => {
    setShowQRModal(false);
    setSelectedBooking(null);
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
          <div style={{ padding: 48, borderRadius: 16, backgroundColor: '#f5f5f5', textAlign: 'center', color: 'var(--muted)' }}>
            <p style={{ fontSize: '1.1rem', marginBottom: 8 }}>Belum ada riwayat pemesanan</p>
            <p style={{ fontSize: '0.9rem' }}>Anda belum memiliki pemesanan yang berhasil</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {bookings.map((booking) => (
              <div
                key={booking.id}
                onClick={() => handleBookingClick(booking)}
                style={{
                  border: '1px solid var(--line)', borderRadius: 16, padding: 24,
                  backgroundColor: '#fff', cursor: 'pointer', transition: 'all 0.2s',
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
          <QRViewModal booking={selectedBooking} onClose={handleCloseModal} />
        )}
      </main>
      <Footer />
    </div>
  );
}
