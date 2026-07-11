import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../../../components/common/Navbar';
import { Footer } from '../../../components/common/Footer';
import { getUserBookings, cancelBooking } from '../../booking/services/bookingApi';
import { useAuth } from '../../auth/stores/AuthContext';
import { BookingCard } from '../components/BookingCard';
import type { BookingResponse } from '../../../types/booking';

export function TransactionPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useAuth();

  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchBookings = async (page: number, isInitial: boolean) => {
    if (!user) return;
    if (isInitial) setInitialLoading(true);
    try {
      const data = await getUserBookings(user.id, page, 5);
      setBookings(data.bookings);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat transaksi');
    } finally {
      if (isInitial) setInitialLoading(false);
    }
  };

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated || !user) { navigate('/login/user'); return; }
    if (user.role !== 'user') { navigate('/'); return; }
    fetchBookings(currentPage, true);
  }, [isAuthenticated, user, navigate, isLoading]);

  useEffect(() => {
    if (isLoading || !user) return;
    fetchBookings(currentPage, false);
  }, [currentPage]);

  const handleCancel = async (bookingId: string) => {
    if (!confirm('Apakah Anda yakin ingin membatalkan booking ini?')) return;
    setCancelling(bookingId);
    try {
      await cancelBooking(bookingId);
      await fetchBookings(currentPage, false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal membatalkan booking');
    } finally {
      setCancelling(null);
    }
  };

  if (initialLoading) {
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
          <div style={{ padding: 48, borderRadius: 16, backgroundColor: '#f5f5f5', textAlign: 'center', color: 'var(--muted)' }}>
            <p style={{ fontSize: '1.1rem', marginBottom: 8 }}>Belum ada transaksi</p>
            <p style={{ fontSize: '0.9rem' }}>Mulai booking properti untuk melihat riwayat transaksi Anda</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {bookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} cancelling={cancelling} onCancel={handleCancel} />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, marginTop: 24, padding: 16 }}>
            <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} style={{
              padding: '10px 20px', borderRadius: 8, border: '1px solid var(--line)',
              background: currentPage === 1 ? '#f5f5f5' : '#fff',
              color: currentPage === 1 ? 'var(--muted)' : 'var(--text)',
              fontSize: '0.9rem', fontWeight: 600, cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
            }}>
              Previous
            </button>
            <span style={{ fontSize: '0.9rem', color: 'var(--text)' }}>
              Halaman {currentPage} dari {totalPages} ({total} total)
            </span>
            <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} style={{
              padding: '10px 20px', borderRadius: 8, border: '1px solid var(--line)',
              background: currentPage === totalPages ? '#f5f5f5' : '#fff',
              color: currentPage === totalPages ? 'var(--muted)' : 'var(--text)',
              fontSize: '0.9rem', fontWeight: 600, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
            }}>
              Next
            </button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
