import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../../../components/common/Navbar';
import { Footer } from '../../../components/common/Footer';
import { getTenantBookings, confirmPayment, rejectPayment, tenantCancelBooking } from '../../booking/services/bookingApi';
import { useAuth } from '../../auth/stores/AuthContext';
import { TransactionCard } from '../components/TransactionCard';
import type { BookingResponse } from '../../../types/booking';

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

export function TenantTransactionPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useAuth();

  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
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

  const fetchBookings = useCallback(async (page: number, isInitial: boolean) => {
    if (!user) return;
    if (isInitial) setInitialLoading(true);
    try {
      const data = await getTenantBookings(user.id, page, 5);
      setBookings(data.bookings);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat transaksi');
    } finally {
      if (isInitial) setInitialLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated || !user) { navigate('/login/tenant'); return; }
    if (user.role !== 'tenant') { navigate('/'); return; }
    fetchBookings(currentPage, true);
  }, [isAuthenticated, user, navigate, isLoading]); // only on auth change

  useEffect(() => {
    if (isLoading || !user) return;
    fetchBookings(currentPage, false);
  }, [currentPage, refreshCount]); // silent refresh

  const handleAction = async (
    action: 'confirm' | 'reject' | 'cancel',
    bookingId: string,
    apiCall: () => Promise<any>,
    setter: (v: string | null) => void,
    confirmMsg: string,
  ) => {
    if (!confirm(confirmMsg)) return;
    setter(bookingId);
    try {
      await apiCall();
      await fetchBookings(currentPage, false);
    } catch (err) {
      setError(err instanceof Error ? err.message : `Gagal ${action === 'confirm' ? 'mengkonfirmasi' : action === 'reject' ? 'menolak' : 'membatalkan'} pembayaran`);
    } finally {
      setter(null);
    }
  };

  const filteredBookings = filterStatus === 'ALL'
    ? bookings
    : bookings.filter(b => b.status === filterStatus);

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

        <div style={{ marginBottom: 24, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {['ALL', 'MENUNGGU_PEMBAYARAN', 'MENUNGGU_KONFIRMASI', 'DIKONFIRMASI', 'DIBATALKAN', 'KADALUARSA'].map((status) => (
            <button key={status} onClick={() => setFilterStatus(status)} style={{
              padding: '8px 16px', borderRadius: 20,
              border: filterStatus === status ? '2px solid var(--primary)' : '1px solid var(--line)',
              background: filterStatus === status ? 'var(--primary)' : '#fff',
              color: filterStatus === status ? '#fff' : 'var(--text)',
              fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
            }}>
              {status === 'ALL' ? 'Semua' : getStatusLabel(status)}
            </button>
          ))}
        </div>

        {filteredBookings.length === 0 && !error ? (
          <div style={{ padding: 48, borderRadius: 16, backgroundColor: '#f5f5f5', textAlign: 'center', color: 'var(--muted)' }}>
            <p style={{ fontSize: '1.1rem', marginBottom: 8 }}>Tidak ada transaksi</p>
            <p style={{ fontSize: '0.9rem' }}>
              {filterStatus === 'ALL' ? 'Belum ada pesanan untuk properti Anda' : `Tidak ada pesanan dengan status ${getStatusLabel(filterStatus)}`}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {filteredBookings.map((booking) => (
              <TransactionCard
                key={booking.id}
                booking={booking}
                confirming={confirming}
                rejecting={rejecting}
                cancelling={cancelling}
                onConfirm={(id) => handleAction('confirm', id, () => confirmPayment(id, user!.id), setConfirming, 'Apakah Anda yakin ingin mengkonfirmasi pembayaran ini?')}
                onReject={(id) => handleAction('reject', id, () => rejectPayment(id, user!.id), setRejecting, 'Apakah Anda yakin ingin menolak pembayaran ini? Status akan kembali ke Menunggu Pembayaran.')}
                onCancel={(id) => handleAction('cancel', id, () => tenantCancelBooking(id, user!.id), setCancelling, 'Apakah Anda yakin ingin membatalkan pesanan ini?')}
                onExpired={handleExpired}
              />
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
