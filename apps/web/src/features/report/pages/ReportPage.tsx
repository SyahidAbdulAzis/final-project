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

type ReportType = 'property' | 'user' | 'transaction' | 'chart';
type SortBy = 'date' | 'totalSales';

export function ReportPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useAuth();
  
  const [reportType, setReportType] = useState<ReportType>('chart');
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  
  const [propertyReport, setPropertyReport] = useState<SalesReportByProperty[]>([]);
  const [userReport, setUserReport] = useState<SalesReportByUser[]>([]);
  const [transactionReport, setTransactionReport] = useState<SalesReportByTransaction[]>([]);
  const [chartReport, setChartReport] = useState<SalesChartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoading) return;
    
    if (!isAuthenticated || !user) {
      navigate('/login/tenant');
      return;
    }

    if (user.role !== 'tenant') {
      navigate('/');
      return;
    }
  }, [isAuthenticated, user, navigate, isLoading]);

  const fetchReport = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      if (reportType === 'property') {
        const data = await getSalesReportByProperty(user.id, startDate || undefined, endDate || undefined, sortBy);
        setPropertyReport(data);
      } else if (reportType === 'user') {
        const data = await getSalesReportByUser(user.id, startDate || undefined, endDate || undefined, sortBy);
        setUserReport(data);
      } else if (reportType === 'transaction') {
        const data = await getSalesReportByTransaction(user.id, startDate || undefined, endDate || undefined, sortBy);
        setTransactionReport(data);
      } else if (reportType === 'chart') {
        const data = await getSalesChartData(user.id, startDate || undefined, endDate || undefined);
        setChartReport(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat laporan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'tenant') {
      fetchReport();
    }
  }, [reportType, sortBy, user]);

  const handleFilter = () => {
    fetchReport();
  };

  const handleReset = () => {
    setStartDate('');
    setEndDate('');
    setSortBy('date');
  };

  const formatCurrency = (amount: number) => {
    return `Rp ${amount.toLocaleString('id-ID')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="layout">
      <Navbar />
      <main style={{ padding: '28px 32px', maxWidth: 1360, margin: '0 auto' }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: 6, color: 'var(--text)' }}>
            Report Penjualan
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
            Analisis penjualan 
          </p>
        </div>

        {error && (
          <div style={{ padding: 16, borderRadius: 8, backgroundColor: '#fee', color: '#c33', marginBottom: 24 }}>
            {error}
          </div>
        )}

        {/* Report Type Selection */}
        <div style={{ marginBottom: 24, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {(['chart', 'property', 'user', 'transaction'] as ReportType[]).map((type) => (
            <button
              key={type}
              onClick={() => setReportType(type)}
              style={{
                padding: '10px 20px',
                borderRadius: 8,
                border: reportType === type ? '2px solid var(--primary)' : '1px solid var(--line)',
                background: reportType === type ? 'var(--primary)' : '#fff',
                color: reportType === type ? '#fff' : 'var(--text)',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {type === 'property' ? 'Berdasarkan Properti' : type === 'user' ? 'Berdasarkan User' : type === 'transaction' ? 'Berdasarkan Transaksi' : 'Grafik Penjualan'}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div style={{ marginBottom: 24, padding: 20, borderRadius: 12, backgroundColor: '#f5f5f5', display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 8, color: 'var(--text)' }}>
              Tanggal Mulai
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 8,
                border: '1px solid var(--line)',
                fontSize: '0.9rem',
              }}
            />
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 8, color: 'var(--text)' }}>
              Tanggal Akhir
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 8,
                border: '1px solid var(--line)',
                fontSize: '0.9rem',
              }}
            />
          </div>
          <div style={{ minWidth: 150 }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 8, color: 'var(--text)' }}>
              Urutkan
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 8,
                border: '1px solid var(--line)',
                fontSize: '0.9rem',
              }}
            >
              <option value="date">Tanggal</option>
              <option value="totalSales">Total Penjualan</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={handleFilter}
              disabled={loading}
              style={{
                padding: '10px 20px',
                borderRadius: 8,
                border: 'none',
                background: 'var(--primary)',
                color: '#fff',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {loading ? 'Memuat...' : 'Filter'}
            </button>
            <button
              onClick={handleReset}
              style={{
                padding: '10px 20px',
                borderRadius: 8,
                border: '1px solid var(--line)',
                background: '#fff',
                color: 'var(--text)',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              Reset
            </button>
          </div>
        </div>

        {/* Report Content */}
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>
            Memuat laporan...
          </div>
        ) : reportType === 'property' && propertyReport.length === 0 ? (
          <div style={{ padding: 48, borderRadius: 16, backgroundColor: '#f5f5f5', textAlign: 'center', color: 'var(--muted)' }}>
            <p style={{ fontSize: '1.1rem', marginBottom: 8 }}>Tidak ada data penjualan</p>
            <p style={{ fontSize: '0.9rem' }}>Belum ada transaksi yang berhasil untuk properti Anda</p>
          </div>
        ) : reportType === 'user' && userReport.length === 0 ? (
          <div style={{ padding: 48, borderRadius: 16, backgroundColor: '#f5f5f5', textAlign: 'center', color: 'var(--muted)' }}>
            <p style={{ fontSize: '1.1rem', marginBottom: 8 }}>Tidak ada data penjualan</p>
            <p style={{ fontSize: '0.9rem' }}>Belum ada transaksi yang berhasil dari user</p>
          </div>
        ) : reportType === 'chart' && chartReport.length === 0 ? (
          <div style={{ padding: 48, borderRadius: 16, backgroundColor: '#f5f5f5', textAlign: 'center', color: 'var(--muted)' }}>
            <p style={{ fontSize: '1.1rem', marginBottom: 8 }}>Tidak ada data grafik</p>
            <p style={{ fontSize: '0.9rem' }}>Belum ada transaksi yang berhasil</p>
          </div>
        ) : reportType === 'transaction' && transactionReport.length === 0 ? (
          <div style={{ padding: 48, borderRadius: 16, backgroundColor: '#f5f5f5', textAlign: 'center', color: 'var(--muted)' }}>
            <p style={{ fontSize: '1.1rem', marginBottom: 8 }}>Tidak ada data transaksi</p>
            <p style={{ fontSize: '0.9rem' }}>Belum ada transaksi yang berhasil</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {reportType === 'property' && propertyReport.map((item) => (
              <div key={item.propertyId} style={{ border: '1px solid var(--line)', borderRadius: 16, padding: 24, backgroundColor: '#fff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)' }}>{item.propertyName}</h3>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--primary)' }}>{formatCurrency(item.totalSales)}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>{item.transactionCount} transaksi</div>
                  </div>
                </div>
                <div style={{ borderTop: '1px solid var(--line)', paddingTop: 12 }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: 8, color: 'var(--text)' }}>
                    Transaksi Terakhir
                  </div>
                  {item.bookings.slice(0, 3).map((booking) => (
                    <div key={booking.id} style={{ padding: '8px 0', borderBottom: '1px solid #f0f0f0', fontSize: '0.9rem' }}>
                      <div style={{ fontWeight: 600 }}>{booking.userName}</div>
                      <div style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
                        {formatDate(booking.checkIn)} - {formatDate(booking.checkOut)} • {formatCurrency(booking.totalPrice)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {reportType === 'user' && userReport.map((item) => (
              <div key={item.userId} style={{ border: '1px solid var(--line)', borderRadius: 16, padding: 24, backgroundColor: '#fff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)' }}>{item.userName}</h3>
                    <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>{item.userEmail}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--primary)' }}>{formatCurrency(item.totalSales)}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>{item.transactionCount} transaksi</div>
                  </div>
                </div>
                <div style={{ borderTop: '1px solid var(--line)', paddingTop: 12 }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: 8, color: 'var(--text)' }}>
                    Transaksi Terakhir
                  </div>
                  {item.bookings.slice(0, 3).map((booking) => (
                    <div key={booking.id} style={{ padding: '8px 0', borderBottom: '1px solid #f0f0f0', fontSize: '0.9rem' }}>
                      <div style={{ fontWeight: 600 }}>{booking.propertyName}</div>
                      <div style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
                        {formatDate(booking.checkIn)} - {formatDate(booking.checkOut)} • {formatCurrency(booking.totalPrice)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {reportType === 'chart' && (
              <div style={{ border: '1px solid var(--line)', borderRadius: 16, padding: 32, backgroundColor: '#fff' }}>
                <DonutChart data={chartReport} formatCurrency={formatCurrency} />
              </div>
            )}
            {reportType === 'transaction' && (
              <div style={{ border: '1px solid var(--line)', borderRadius: 16, backgroundColor: '#fff', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f5f5f5' }}>
                      <th style={{ padding: 12, textAlign: 'left', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)' }}>ID</th>
                      <th style={{ padding: 12, textAlign: 'left', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)' }}>Properti</th>
                      <th style={{ padding: 12, textAlign: 'left', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)' }}>User</th>
                      <th style={{ padding: 12, textAlign: 'left', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)' }}>Check-in</th>
                      <th style={{ padding: 12, textAlign: 'left', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)' }}>Check-out</th>
                      <th style={{ padding: 12, textAlign: 'right', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)' }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactionReport.map((item) => (
                      <tr key={item.id} style={{ borderBottom: '1px solid var(--line)' }}>
                        <td style={{ padding: 12, fontSize: '0.9rem', wordBreak: 'break-all' }}>{item.id}</td>
                        <td style={{ padding: 12, fontSize: '0.9rem' }}>{item.propertyName}</td>
                        <td style={{ padding: 12, fontSize: '0.9rem' }}>{item.userName}</td>
                        <td style={{ padding: 12, fontSize: '0.9rem' }}>{formatDate(item.checkIn)}</td>
                        <td style={{ padding: 12, fontSize: '0.9rem' }}>{formatDate(item.checkOut)}</td>
                        <td style={{ padding: 12, textAlign: 'right', fontSize: '0.9rem', fontWeight: 600, color: 'var(--primary)' }}>{formatCurrency(item.totalPrice)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
