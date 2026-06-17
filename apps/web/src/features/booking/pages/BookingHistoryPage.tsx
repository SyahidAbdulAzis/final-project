import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import QRCode from 'react-qr-code';
import { Navbar } from '../../../components/common/Navbar';
import { Footer } from '../../../components/common/Footer';
import { getSuccessfulBookings } from '../services/bookingApi';
import { useAuth } from '../../auth/stores/AuthContext';
import type { BookingResponse } from '../../../types/booking';

export function BookingHistoryPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useAuth();
  
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<BookingResponse | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);

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
    getSuccessfulBookings(user.id)
      .then((data) => {
        setBookings(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Gagal memuat riwayat pemesanan');
        setLoading(false);
      });
  }, [isAuthenticated, user, navigate, isLoading]);

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
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
