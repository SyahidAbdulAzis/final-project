import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../../../components/common/Navbar';
import { Footer } from '../../../components/common/Footer';
import { getUserBookings, cancelBooking } from '../../booking/services/bookingApi';
import { useAuth } from '../../auth/stores/AuthContext';
import type { BookingResponse } from '../../../types/booking';

export function TransactionPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useAuth();
  
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<Record<string, number>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

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
    getUserBookings(user.id, currentPage, 5)
      .then((data) => {
        setBookings(data.bookings);
        setTotalPages(data.totalPages);
        setTotal(data.total);
        setLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Gagal memuat transaksi');
        setLoading(false);
      });
  }, [isAuthenticated, user, navigate, isLoading, currentPage]);

  // Countdown timer for each booking
  useEffect(() => {
    // Initialize time remaining immediately
    const newTimeRemaining: Record<string, number> = {};
    bookings.forEach((booking) => {
      if (booking.status === 'MENUNGGU_PEMBAYARAN' || booking.status === 'KADALUARSA') {
        const oneHourInMs = 60 * 60 * 1000;
        const timeElapsed = Date.now() - new Date(booking.createdAt).getTime();
        const remaining = oneHourInMs - timeElapsed;
        newTimeRemaining[booking.id] = remaining;
      }
    });
    setTimeRemaining(newTimeRemaining);

    // Update countdown every second
    const interval = setInterval(() => {
      const newTimeRemaining: Record<string, number> = {};
      bookings.forEach((booking) => {
        if (booking.status === 'MENUNGGU_PEMBAYARAN' || booking.status === 'KADALUARSA') {
          const oneHourInMs = 60 * 60 * 1000;
          const timeElapsed = Date.now() - new Date(booking.createdAt).getTime();
          const remaining = oneHourInMs - timeElapsed;
          newTimeRemaining[booking.id] = remaining;
        }
      });
      setTimeRemaining(newTimeRemaining);
    }, 1000);

    return () => clearInterval(interval);
  }, [bookings]);

  const formatTime = (ms: number) => {
    if (ms <= 0) return '0 menit 0 detik';
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours} jam ${minutes % 60} menit`;
    }
    return `${minutes} menit ${seconds % 60} detik`;
  };

  const handleCancel = async (bookingId: string) => {
    if (!confirm('Apakah Anda yakin ingin membatalkan booking ini?')) return;
    
    setCancelling(bookingId);
    try {
      await cancelBooking(bookingId);
      // Refresh bookings after cancel
      if (user) {
        const updatedData = await getUserBookings(user.id, currentPage, 5);
        setBookings(updatedData.bookings);
        setTotalPages(updatedData.totalPages);
        setTotal(updatedData.total);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal membatalkan booking');
    } finally {
      setCancelling(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'MENUNGGU_PEMBAYARAN':
        return '#ff9800';
      case 'MENUNGGU_KONFIRMASI':
        return '#2196f3';
      case 'DIKONFIRMASI':
        return '#4caf50';
      case 'DIBATALKAN':
        return '#f44336';
      case 'KADALUARSA':
        return '#9e9e9e';
      default:
        return '#757575';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'MENUNGGU_PEMBAYARAN':
        return 'Menunggu Pembayaran';
      case 'MENUNGGU_KONFIRMASI':
        return 'Menunggu Konfirmasi';
      case 'DIKONFIRMASI':
        return 'Dikonfirmasi';
      case 'DIBATALKAN':
        return 'Dibatalkan';
      case 'KADALUARSA':
        return 'Kadaluarsa';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="layout">
        <Navbar />
        <main style={{ padding: 40, maxWidth: 1360, margin: '0 auto' }}>
          <p>Memuat transaksi...</p>
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
            Transaksi Saya
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
            Riwayat booking dan pembayaran Anda
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
            <p style={{ fontSize: '1.1rem', marginBottom: 8 }}>Belum ada transaksi</p>
            <p style={{ fontSize: '0.9rem' }}>Mulai booking properti untuk melihat riwayat transaksi Anda</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {bookings.map((booking) => (
              <div
                key={booking.id}
                style={{
                  border: '1px solid var(--line)',
                  borderRadius: 16,
                  padding: 24,
                  backgroundColor: '#fff',
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
                  <div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                      Booking pada {new Date(booking.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                    {(booking.status === 'MENUNGGU_PEMBAYARAN' || booking.status === 'KADALUARSA') && (
                      <div style={{ fontSize: '0.85rem', marginTop: 4 }}>
                        {timeRemaining[booking.id] !== undefined && (
                          <span style={{ 
                            color: timeRemaining[booking.id] <= 0 ? '#f44336' : '#ff9800',
                            fontWeight: 600 
                          }}>
                            {timeRemaining[booking.id] <= 0 
                              ? 'Waktu habis' 
                              : `Sisa waktu: ${formatTime(timeRemaining[booking.id])}`
                            }
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {booking.status === 'MENUNGGU_PEMBAYARAN' && timeRemaining[booking.id] > 0 && (
                      <>
                        <button
                          onClick={() => handleCancel(booking.id)}
                          disabled={cancelling === booking.id}
                          style={{
                            padding: '10px 20px',
                            borderRadius: 8,
                            border: '1px solid #f44336',
                            background: '#fff',
                            color: '#f44336',
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            cursor: cancelling === booking.id ? 'not-allowed' : 'pointer',
                            transition: 'all 0.2s',
                          }}
                        >
                          {cancelling === booking.id ? 'Membatalkan...' : 'Batalkan'}
                        </button>
                        <button
                          onClick={() => navigate(`/payment/${booking.id}`)}
                          style={{
                            padding: '10px 20px',
                            borderRadius: 8,
                            border: 'none',
                            background: 'var(--primary)',
                            color: '#fff',
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
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
      </main>
      <Footer />
    </div>
  );
}
