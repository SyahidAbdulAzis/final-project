import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../../../components/common/Navbar';
import { Footer } from '../../../components/common/Footer';
import { getTenantBookings, confirmPayment, rejectPayment, tenantCancelBooking } from '../../booking/services/bookingApi';
import { useAuth } from '../../auth/stores/AuthContext';
import type { BookingResponse } from '../../../types/booking';

function CountdownTimer({ expiresAt, onExpired }: { expiresAt: string; onExpired: () => void }) {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const target = new Date(expiresAt).getTime();

    const tick = () => {
      const now = Date.now();
      const diff = target - now;
      if (diff <= 0) {
        setTimeLeft(0);
        onExpired();
        return;
      }
      setTimeLeft(diff);
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [expiresAt, onExpired]);

  if (timeLeft <= 0) return null;

  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

  const isUrgent = timeLeft < 1000 * 60 * 60 * 24; // less than 1 day

  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      padding: '4px 10px',
      borderRadius: 6,
      fontSize: '0.85rem',
      fontWeight: 600,
      backgroundColor: isUrgent ? '#fff0f0' : '#f0f7ff',
      color: isUrgent ? '#e53935' : '#1976d2',
    }}>
      <span>Sisa waktu: </span>
      {days > 0 && <span>{days}h </span>}
      <span>{String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</span>
    </div>
  );
}

export function TenantTransactionPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useAuth();
  
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [refreshCount, setRefreshCount] = useState(0);

  const handleExpired = useCallback(() => {
    setRefreshCount((c) => c + 1);
  }, []);

  useEffect(() => {
    if (isLoading) return;
    
    if (!isAuthenticated || !user) {
      navigate('/login/tenant');
      return;
    }

    if (!user.role || user.role !== 'tenant') {
      navigate('/');
      return;
    }

    setLoading(true);
    getTenantBookings(user.id, currentPage, 5)
      .then((data) => {
        setBookings(data.bookings);
        setTotalPages(data.totalPages);
        setTotal(data.total);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error loading tenant bookings:', err);
        setError(err instanceof Error ? err.message : 'Gagal memuat transaksi');
        setLoading(false);
      });
  }, [isAuthenticated, user, navigate, isLoading, currentPage, refreshCount]);

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

  const handleConfirm = async (bookingId: string) => {
    if (!user) return;
    
    if (!confirm('Apakah Anda yakin ingin mengkonfirmasi pembayaran ini?')) return;
    
    setConfirming(bookingId);
    try {
      await confirmPayment(bookingId, user.id);
      // Refresh bookings after confirm
      const updatedData = await getTenantBookings(user.id, currentPage, 5);
      setBookings(updatedData.bookings);
      setTotalPages(updatedData.totalPages);
      setTotal(updatedData.total);
    } catch (err) {
      console.error('Error confirming payment:', err);
      setError(err instanceof Error ? err.message : 'Gagal mengkonfirmasi pembayaran');
    } finally {
      setConfirming(null);
    }
  };

  const handleReject = async (bookingId: string) => {
    if (!user) return;
    
    if (!confirm('Apakah Anda yakin ingin menolak pembayaran ini? Status akan kembali ke Menunggu Pembayaran.')) return;
    
    setRejecting(bookingId);
    try {
      await rejectPayment(bookingId, user.id);
      // Refresh bookings after reject
      const updatedData = await getTenantBookings(user.id, currentPage, 5);
      setBookings(updatedData.bookings);
      setTotalPages(updatedData.totalPages);
      setTotal(updatedData.total);
    } catch (err) {
      console.error('Error rejecting payment:', err);
      setError(err instanceof Error ? err.message : 'Gagal menolak pembayaran');
    } finally {
      setRejecting(null);
    }
  };

  const handleCancel = async (bookingId: string) => {
    if (!user) return;
    
    if (!confirm('Apakah Anda yakin ingin membatalkan pesanan ini?')) return;
    
    setCancelling(bookingId);
    try {
      await tenantCancelBooking(bookingId, user.id);
      // Refresh bookings after cancel
      const updatedData = await getTenantBookings(user.id, currentPage, 5);
      setBookings(updatedData.bookings);
      setTotalPages(updatedData.totalPages);
      setTotal(updatedData.total);
    } catch (err) {
      console.error('Error cancelling booking:', err);
      setError(err instanceof Error ? err.message : 'Gagal membatalkan pesanan');
    } finally {
      setCancelling(null);
    }
  };

  const filteredBookings = filterStatus === 'ALL' 
    ? bookings 
    : bookings.filter(b => b.status === filterStatus);

  // Add error boundary handling
  if (error && bookings.length === 0) {
    return (
      <div className="layout">
        <Navbar />
        <main style={{ padding: 40, maxWidth: 1360, margin: '0 auto' }}>
          <div style={{ padding: 16, borderRadius: 8, backgroundColor: '#fee', color: '#c33', marginBottom: 24 }}>
            {error}
          </div>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 20px',
              borderRadius: 8,
              border: '1px solid var(--primary)',
              background: 'var(--primary)',
              color: '#fff',
              fontSize: '0.9rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Reload Page
          </button>
        </main>
        <Footer />
      </div>
    );
  }

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
            Manajemen Transaksi Tenant
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
            Kelola pesanan dan konfirmasi pembayaran untuk properti Anda
          </p>
        </div>

        {error && (
          <div style={{ padding: 16, borderRadius: 8, backgroundColor: '#fee', color: '#c33', marginBottom: 24 }}>
            {error}
          </div>
        )}

        {/* Status Filter */}
        <div style={{ marginBottom: 24, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {['ALL', 'MENUNGGU_PEMBAYARAN', 'MENUNGGU_KONFIRMASI', 'DIKONFIRMASI', 'DIBATALKAN', 'KADALUARSA'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              style={{
                padding: '8px 16px',
                borderRadius: 20,
                border: filterStatus === status ? '2px solid var(--primary)' : '1px solid var(--line)',
                background: filterStatus === status ? 'var(--primary)' : '#fff',
                color: filterStatus === status ? '#fff' : 'var(--text)',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {status === 'ALL' ? 'Semua' : getStatusLabel(status)}
            </button>
          ))}
        </div>

        {filteredBookings.length === 0 ? (
          <div style={{ 
            padding: 48, 
            borderRadius: 16, 
            backgroundColor: '#f5f5f5', 
            textAlign: 'center',
            color: 'var(--muted)'
          }}>
            <p style={{ fontSize: '1.1rem', marginBottom: 8 }}>Tidak ada transaksi</p>
            <p style={{ fontSize: '0.9rem' }}>
              {filterStatus === 'ALL' 
                ? 'Belum ada pesanan untuk properti Anda' 
                : `Tidak ada pesanan dengan status ${getStatusLabel(filterStatus)}`
              }
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {filteredBookings.map((booking) => (
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
                    {booking.status === 'MENUNGGU_KONFIRMASI' && booking.expiresAt && (
                      <CountdownTimer expiresAt={booking.expiresAt} onExpired={handleExpired} />
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

                {/* Payment Proof Section */}
                {booking.payment && booking.payment.proofUrl && (
                  <div style={{ marginBottom: 16, padding: 16, backgroundColor: '#f5f5f5', borderRadius: 8 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: 8, color: 'var(--text)' }}>
                      Bukti Pembayaran
                    </div>
                    <img
                      src={booking.payment.proofUrl}
                      alt="Bukti pembayaran"
                      style={{
                        width: '100%',
                        maxWidth: 300,
                        borderRadius: 8,
                        border: '1px solid var(--line)',
                      }}
                    />
                    <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: 8 }}>
                      Diupload pada {booking.payment.uploadedAt ? new Date(booking.payment.uploadedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                    </div>
                  </div>
                )}

                <div style={{ borderTop: '1px solid var(--line)', paddingTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                    Booking pada {new Date(booking.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {booking.status === 'MENUNGGU_KONFIRMASI' && (
                      <>
                        <button
                          onClick={() => handleReject(booking.id)}
                          disabled={rejecting === booking.id}
                          style={{
                            padding: '10px 20px',
                            borderRadius: 8,
                            border: '1px solid #f44336',
                            background: '#fff',
                            color: '#f44336',
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            cursor: rejecting === booking.id ? 'not-allowed' : 'pointer',
                            transition: 'all 0.2s',
                          }}
                        >
                          {rejecting === booking.id ? 'Menolak...' : 'Tolak'}
                        </button>
                        <button
                          onClick={() => handleConfirm(booking.id)}
                          disabled={confirming === booking.id}
                          style={{
                            padding: '10px 20px',
                            borderRadius: 8,
                            border: 'none',
                            background: 'var(--primary)',
                            color: '#fff',
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            cursor: confirming === booking.id ? 'not-allowed' : 'pointer',
                            transition: 'all 0.2s',
                          }}
                        >
                          {confirming === booking.id ? 'Mengkonfirmasi...' : 'Konfirmasi'}
                        </button>
                      </>
                    )}
                    {booking.status === 'MENUNGGU_PEMBAYARAN' && !booking.payment && (
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
                        {cancelling === booking.id ? 'Membatalkan...' : 'Batalkan Pesanan'}
                      </button>
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
