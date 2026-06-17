import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../../../components/common/Navbar';
import { Footer } from '../../../components/common/Footer';
import { useAuth } from '../../auth/stores/AuthContext';
import { getPropertyAvailabilityCalendar, type PropertyAvailabilityData } from '../services/reportApi';

export function PropertyReportPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useAuth();
  
  const [availabilityData, setAvailabilityData] = useState<PropertyAvailabilityData[]>([]);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
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

    // Set default date range (current month)
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
      const data = await getPropertyAvailabilityCalendar(user.id, startDate, endDate);
      setAvailabilityData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat ketersediaan properti');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'tenant' && startDate && endDate) {
      fetchAvailability();
    }
  }, [startDate, endDate, user]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getDaysInRange = () => {
    if (!startDate || !endDate) return [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = [];
    const current = new Date(start);
    
    while (current <= end) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  const isBooked = (room: any, date: Date) => {
    if (!room.bookings) return false;
    return room.bookings.some((booking: any) => {
      const checkIn = new Date(booking.checkIn);
      const checkOut = new Date(booking.checkOut);
      return date >= checkIn && date < checkOut;
    });
  };

  const getBookingStatus = (room: any, date: Date) => {
    if (!room.bookings) return null;
    const booking = room.bookings.find((b: any) => {
      const checkIn = new Date(b.checkIn);
      const checkOut = new Date(b.checkOut);
      return date >= checkIn && date < checkOut;
    });
    return booking ? booking.status : null;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DIKONFIRMASI':
        return '#4caf50';
      case 'MENUNGGU_KONFIRMASI':
        return '#2196f3';
      case 'MENUNGGU_PEMBAYARAN':
        return '#ff9800';
      default:
        return '#9e9e9e';
    }
  };

  const days = getDaysInRange();

  return (
    <div className="layout">
      <Navbar />
      <main style={{ padding: '28px 32px', maxWidth: 1360, margin: '0 auto' }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: 6, color: 'var(--text)' }}>
            Laporan Properti
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
            Kalender ketersediaan kamar berdasarkan status booking
          </p>
        </div>

        {error && (
          <div style={{ padding: 16, borderRadius: 8, backgroundColor: '#fee', color: '#c33', marginBottom: 24 }}>
            {error}
          </div>
        )}

        {/* Date Filter */}
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
        </div>

        {/* Legend */}
        <div style={{ marginBottom: 24, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 16, height: 16, borderRadius: 4, backgroundColor: '#4caf50' }} />
            <span style={{ fontSize: '0.85rem', color: 'var(--text)' }}>Dikonfirmasi</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 16, height: 16, borderRadius: 4, backgroundColor: '#2196f3' }} />
            <span style={{ fontSize: '0.85rem', color: 'var(--text)' }}>Menunggu Konfirmasi</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 16, height: 16, borderRadius: 4, backgroundColor: '#ff9800' }} />
            <span style={{ fontSize: '0.85rem', color: 'var(--text)' }}>Menunggu Pembayaran</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 16, height: 16, borderRadius: 4, backgroundColor: '#f5f5f5', border: '1px solid var(--line)' }} />
            <span style={{ fontSize: '0.85rem', color: 'var(--text)' }}>Tersedia</span>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>
            Memuat ketersediaan properti...
          </div>
        ) : availabilityData.length === 0 ? (
          <div style={{ padding: 48, borderRadius: 16, backgroundColor: '#f5f5f5', textAlign: 'center', color: 'var(--muted)' }}>
            <p style={{ fontSize: '1.1rem', marginBottom: 8 }}>Tidak ada properti</p>
            <p style={{ fontSize: '0.9rem' }}>Anda belum memiliki properti</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {availabilityData.map((property) => (
              <div key={property.propertyId} style={{ border: '1px solid var(--line)', borderRadius: 16, padding: 24, backgroundColor: '#fff' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 4, color: 'var(--text)' }}>
                  {property.propertyName}
                </h3>
                <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: 16 }}>{property.propertyCity}</p>
                
                {property.rooms.length === 0 ? (
                  <div style={{ padding: 24, backgroundColor: '#f5f5f5', borderRadius: 8, textAlign: 'center', color: 'var(--muted)' }}>
                    Tidak ada kamar
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 800 }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f5f5f5' }}>
                          <th style={{ padding: 12, textAlign: 'left', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)', minWidth: 150 }}>
                            Kamar
                          </th>
                          {days.map((day) => (
                            <th key={day.toISOString()} style={{ padding: 8, textAlign: 'center', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text)', minWidth: 40 }}>
                              {day.getDate()}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {property.rooms.map((room) => (
                          <tr key={room.roomId} style={{ borderBottom: '1px solid var(--line)' }}>
                            <td style={{ padding: 12, fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)' }}>
                              {room.roomName}
                            </td>
                            {days.map((day) => {
                              const booked = isBooked(room, day);
                              const status = getBookingStatus(room, day);
                              return (
                                <td key={day.toISOString()} style={{ padding: 4, textAlign: 'center' }}>
                                  <div
                                    style={{
                                      width: 32,
                                      height: 32,
                                      borderRadius: 4,
                                      backgroundColor: booked ? getStatusColor(status || '') : '#f5f5f5',
                                      border: booked ? 'none' : '1px solid var(--line)',
                                      margin: '0 auto',
                                    }}
                                    title={booked ? status : 'Tersedia'}
                                  />
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
