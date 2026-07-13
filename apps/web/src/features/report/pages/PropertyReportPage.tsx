import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../../../components/common/Navbar';
import { Footer } from '../../../components/common/Footer';
import { useAuth } from '../../auth/stores/AuthContext';
import { getPropertyAvailabilityCalendar, type PropertyAvailabilityData } from '../services/reportApi';
import { AvailabilityFilters } from '../components/AvailabilityFilters';
import { AvailabilityLegend } from '../components/AvailabilityLegend';
import { PropertyAvailabilityCard } from '../components/PropertyAvailabilityCard';

export function PropertyReportPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useAuth();

  const [availabilityData, setAvailabilityData] = useState<PropertyAvailabilityData[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated || !user) { navigate('/login/tenant'); return; }
    if (user.role !== 'tenant') { navigate('/'); return; }

    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    setStartDate(firstDay.toISOString().split('T')[0]);
    setEndDate(lastDay.toISOString().split('T')[0]);
  }, [isAuthenticated, user, navigate, isLoading]);

  const fetchAvailability = async () => {
    if (!user || !startDate || !endDate) return;
    setLoading(true);
    setError(null);
    try {
      setAvailabilityData(await getPropertyAvailabilityCalendar(user.id, startDate, endDate));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat ketersediaan properti');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'tenant' && startDate && endDate) fetchAvailability();
  }, [startDate, endDate, user]);

  const getDaysInRange = () => {
    if (!startDate || !endDate) return [];
    const days: Date[] = [];
    const current = new Date(startDate);
    const end = new Date(endDate);
    while (current <= end) { days.push(new Date(current)); current.setDate(current.getDate() + 1); }
    return days;
  };

  const days = getDaysInRange();

  return (
    <div className="layout">
      <Navbar />
      <main style={{ padding: '28px 32px', maxWidth: 1360, margin: '0 auto' }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: 6, color: 'var(--text)' }}>Laporan Properti</h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Kalender ketersediaan kamar berdasarkan status booking</p>
        </div>

        {error && (
          <div style={{ padding: 16, borderRadius: 8, backgroundColor: '#fee', color: '#c33', marginBottom: 24 }}>{error}</div>
        )}

        <AvailabilityFilters startDate={startDate} endDate={endDate} onStartDateChange={setStartDate} onEndDateChange={setEndDate} />
        <AvailabilityLegend />

        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>Memuat ketersediaan properti...</div>
        ) : availabilityData.length === 0 ? (
          <div style={{ padding: 48, borderRadius: 16, backgroundColor: '#f5f5f5', textAlign: 'center', color: 'var(--muted)' }}>
            <p style={{ fontSize: '1.1rem', marginBottom: 8 }}>Tidak ada properti</p>
            <p style={{ fontSize: '0.9rem' }}>Anda belum memiliki properti</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {availabilityData.map((property) => (
              <PropertyAvailabilityCard key={property.propertyId} property={property} days={days} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
