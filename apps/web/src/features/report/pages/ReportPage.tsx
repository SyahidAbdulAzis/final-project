import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../../../components/common/Navbar';
import { Footer } from '../../../components/common/Footer';
import { useAuth } from '../../auth/stores/AuthContext';
import {
  getSalesReportByProperty,
  getSalesReportByUser,
  getSalesReportByTransaction,
  getSalesChartData,
  type SalesReportByProperty,
  type SalesReportByUser,
  type SalesReportByTransaction,
  type SalesChartItem,
} from '../services/reportApi';
import { DonutChart } from '../components/DonutChart';
import { ReportFilters } from '../components/ReportFilters';
import { PropertyReportCard } from '../components/PropertyReportCard';
import { UserReportCard } from '../components/UserReportCard';
import { TransactionTable } from '../components/TransactionTable';

type ReportType = 'property' | 'user' | 'transaction' | 'chart';

export function ReportPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useAuth();

  const [reportType, setReportType] = useState<ReportType>('chart');
  const [sortBy, setSortBy] = useState<string>('date');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [propertyReport, setPropertyReport] = useState<SalesReportByProperty[]>([]);
  const [userReport, setUserReport] = useState<SalesReportByUser[]>([]);
  const [transactionReport, setTransactionReport] = useState<SalesReportByTransaction[]>([]);
  const [chartReport, setChartReport] = useState<SalesChartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated || !user) { navigate('/login/tenant'); return; }
    if (user.role !== 'tenant') { navigate('/'); return; }
  }, [isAuthenticated, user, navigate, isLoading]);

  const fetchReport = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      if (reportType === 'property') setPropertyReport(await getSalesReportByProperty(user.id, startDate || undefined, endDate || undefined, sortBy as any));
      else if (reportType === 'user') setUserReport(await getSalesReportByUser(user.id, startDate || undefined, endDate || undefined, sortBy as any));
      else if (reportType === 'transaction') setTransactionReport(await getSalesReportByTransaction(user.id, startDate || undefined, endDate || undefined, sortBy as any));
      else setChartReport(await getSalesChartData(user.id, startDate || undefined, endDate || undefined));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat laporan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'tenant') fetchReport();
  }, [reportType, sortBy, user]);

  const formatCurrency = (amount: number) => `Rp ${amount.toLocaleString('id-ID')}`;
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

  const emptyMsg = reportType === 'property' ? 'Belum ada transaksi yang berhasil untuk properti Anda'
    : reportType === 'user' ? 'Belum ada transaksi yang berhasil dari user'
    : 'Belum ada transaksi yang berhasil';

  const showSort = reportType !== 'chart';

  return (
    <div className="layout">
      <Navbar />
      <main style={{ padding: '28px 32px', maxWidth: 1360, margin: '0 auto' }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: 6, color: 'var(--text)' }}>Report Penjualan</h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Analisis penjualan</p>
        </div>

        {error && (
          <div style={{ padding: 16, borderRadius: 8, backgroundColor: '#fee', color: '#c33', marginBottom: 24 }}>{error}</div>
        )}

        <div style={{ marginBottom: 24, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {(['chart', 'property', 'user', 'transaction'] as ReportType[]).map((type) => (
            <button key={type} onClick={() => setReportType(type)} style={{
              padding: '10px 20px', borderRadius: 8,
              border: reportType === type ? '2px solid var(--primary)' : '1px solid var(--line)',
              background: reportType === type ? 'var(--primary)' : '#fff',
              color: reportType === type ? '#fff' : 'var(--text)',
              fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
            }}>
              {type === 'property' ? 'Berdasarkan Properti' : type === 'user' ? 'Berdasarkan User' : type === 'transaction' ? 'Berdasarkan Transaksi' : 'Grafik Penjualan'}
            </button>
          ))}
        </div>

        <ReportFilters
          startDate={startDate} endDate={endDate} sortBy={sortBy} loading={loading} showSort={showSort}
          onStartDateChange={setStartDate} onEndDateChange={setEndDate}
          onSortByChange={setSortBy} onFilter={fetchReport}
          onReset={() => { setStartDate(''); setEndDate(''); setSortBy('date'); }}
        />

        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>Memuat laporan...</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {reportType === 'property' && (propertyReport.length === 0 ? (
              <div className="empty-state"><p>{emptyMsg}</p></div>
            ) : propertyReport.map((item) => (
              <PropertyReportCard key={item.propertyId} item={item} formatCurrency={formatCurrency} formatDate={formatDate} />
            )))}

            {reportType === 'user' && (userReport.length === 0 ? (
              <div className="empty-state"><p>{emptyMsg}</p></div>
            ) : userReport.map((item) => (
              <UserReportCard key={item.userId} item={item} formatCurrency={formatCurrency} formatDate={formatDate} />
            )))}

            {reportType === 'chart' && (chartReport.length === 0 ? (
              <div className="empty-state"><p>{emptyMsg}</p></div>
            ) : (
              <div style={{ border: '1px solid var(--line)', borderRadius: 16, padding: 32, backgroundColor: '#fff' }}>
                <DonutChart data={chartReport} formatCurrency={formatCurrency} />
              </div>
            ))}

            {reportType === 'transaction' && (transactionReport.length === 0 ? (
              <div className="empty-state"><p>{emptyMsg}</p></div>
            ) : (
              <TransactionTable data={transactionReport} formatCurrency={formatCurrency} formatDate={formatDate} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
