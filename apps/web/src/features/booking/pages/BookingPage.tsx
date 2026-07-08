import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Navbar } from '../../../components/common/Navbar';
import { Footer } from '../../../components/common/Footer';
import { getRoomById } from '../../property/services/propertyApi';
import { useBooking } from '../hooks/useBooking';
import { useAuth } from '../../auth/stores/AuthContext';
import { getRoomAvailability } from '../services/bookingApi';
import { showToast } from '../../../components/common/Toast';

interface Room {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  maxGuests: number;
  property: {
    id: string;
    name: string;
    city: string;
    address: string;
    images: { url: string }[];
  };
}

export function BookingPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { submitBooking, loading, error } = useBooking();
  const [searchParams] = useSearchParams();
  
  const [room, setRoom] = useState<Room | null>(null);
  const [loadingRoom, setLoadingRoom] = useState(true);
  const [checkIn, setCheckIn] = useState(searchParams.get('checkIn') || '');
  const [checkOut, setCheckOut] = useState(searchParams.get('checkOut') || '');
  const [totalPrice, setTotalPrice] = useState(0);
  
  // Check if dates are locked (provided from URL params)
  const datesLocked = !!(searchParams.get('checkIn') && searchParams.get('checkOut'));

  useEffect(() => {
    if (!roomId) return;
    setLoadingRoom(true);
    getRoomById(roomId)
      .then((data) => {
        setRoom(data);
        setLoadingRoom(false);
      })
      .catch(() => {
        setLoadingRoom(false);
      });
  }, [roomId]);

  useEffect(() => {
    if (!room || !checkIn || !checkOut) {
      setTotalPrice(0);
      return;
    }
    
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    
    if (nights > 0) {
      // Calculate price for each night considering seasonal rates if available
      let total = 0;
      for (let i = 0; i < nights; i++) {
        const currentDate = new Date(start);
        currentDate.setDate(currentDate.getDate() + i);
        // For now, use basePrice since seasonal rates might not be available in room data from API
        total += room.basePrice;
      }
      setTotalPrice(total);
    } else {
      setTotalPrice(0);
    }
  }, [room, checkIn, checkOut]);

  const handleCheckout = async () => {
    if (!user) {
      navigate('/login/user');
      return;
    }
    if (user.role === 'tenant') {
      showToast('Pemilik properti tidak dapat melakukan booking', 'error');
      navigate('/');
      return;
    }
    
    if (!room || !checkIn || !checkOut || totalPrice === 0) {
      showToast('Mohon lengkapi tanggal check-in dan check-out', 'error');
      return;
    }

    // Check room availability before booking
    try {
      const unavailableDates = await getRoomAvailability(room.id, checkIn, checkOut);
      if (unavailableDates.length > 0) {
        showToast('Kamar sudah dibooking untuk tanggal tersebut. Silakan pilih tanggal lain.', 'error');
        return;
      }
    } catch (err) {
      console.error('Error checking availability:', err);
      // Continue with booking attempt even if availability check fails
    }

    const bookingData = {
      userId: user.id,
      roomId: room.id,
      checkIn,
      checkOut,
      totalPrice,
    };

    const result = await submitBooking(bookingData);
    if (result) {
      showToast('Booking berhasil! Silakan lanjut ke pembayaran', 'success');
      navigate(`/payment/${result.id}`);
    } else if (error) {
      showToast(error, 'error');
    }
  };

  if (loadingRoom) {
    return (
      <div className="layout">
        <Navbar />
        <main style={{ padding: 40, maxWidth: 1360, margin: '0 auto' }}>
          <p>Memuat...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!room) {
    return (
      <div className="layout">
        <Navbar />
        <main style={{ padding: 40, maxWidth: 1360, margin: '0 auto' }}>
          <p>Kamar tidak ditemukan.</p>
        </main>
        <Footer />
      </div>
    );
  }

  const mainImage = room.property.images?.[0]?.url || '';

  return (
    <div className="layout">
      <Navbar />
      <main style={{ padding: '28px 32px', maxWidth: 1360, margin: '0 auto' }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: 6, color: 'var(--text)' }}>
            {room.property.name}
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
            {room.property.city} · {room.property.address}
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 32 }}>
          <div>
            {mainImage && (
              <div
                style={{
                  height: 400,
                  borderRadius: 16,
                  background: `url(${mainImage}) center/cover`,
                  backgroundColor: '#eee',
                  marginBottom: 24,
                }}
              />
            )}

            <div style={{ marginBottom: 24 }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 12, color: 'var(--text)' }}>
                {room.name}
              </h2>
              <p style={{ color: 'var(--muted)', lineHeight: 1.7, marginBottom: 16 }}>
                {room.description}
              </p>
              <div style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
                Maks {room.maxGuests} tamu
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 12, color: 'var(--text)' }}>
                Detail Booking
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6, color: 'var(--muted)' }}>
                    Check-in {datesLocked && '(Terkunci)'}
                  </label>
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    disabled={datesLocked}
                    style={{
                      width: '100%',
                      padding: 12,
                      borderRadius: 8,
                      border: '1px solid var(--line)',
                      fontSize: '0.95rem',
                      backgroundColor: datesLocked ? '#f5f5f5' : '#fff',
                      cursor: datesLocked ? 'not-allowed' : 'pointer',
                    }}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6, color: 'var(--muted)' }}>
                    Check-out {datesLocked && '(Terkunci)'}
                  </label>
                  <input
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    disabled={datesLocked}
                    style={{
                      width: '100%',
                      padding: 12,
                      borderRadius: 8,
                      border: '1px solid var(--line)',
                      fontSize: '0.95rem',
                      backgroundColor: datesLocked ? '#f5f5f5' : '#fff',
                      cursor: datesLocked ? 'not-allowed' : 'pointer',
                    }}
                    min={checkIn || new Date().toISOString().split('T')[0]}
                  />
                </div>
                {datesLocked && (
                  <p style={{ fontSize: '0.8rem', color: 'var(--muted)', fontStyle: 'italic' }}>
                    Tanggal sudah dipilih dari halaman properti. Kembali ke halaman properti untuk mengubah tanggal.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div
            style={{
              border: '1px solid var(--line)',
              borderRadius: 24,
              padding: 24,
              height: 'fit-content',
              position: 'sticky',
              top: 100,
              background: 'var(--card)',
            }}
          >
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 16, color: 'var(--text)' }}>
              Ringkasan Harga
            </h3>
            
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.9rem', color: 'var(--muted)' }}>
                <span>Harga per malam</span>
                <span>Rp {room.basePrice.toLocaleString('id-ID')}</span>
              </div>
              {checkIn && checkOut && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.9rem', color: 'var(--muted)' }}>
                  <span>Durasi</span>
                  <span>
                    {Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24))} malam
                  </span>
                </div>
              )}
            </div>

            <div style={{ borderTop: '1px solid var(--line)', paddingTop: 16, marginTop: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.1rem', color: 'var(--text)', marginBottom: 16 }}>
                <span>Total</span>
                <span style={{ color: 'var(--primary)' }}>Rp {totalPrice.toLocaleString('id-ID')}</span>
              </div>

              <button
                onClick={handleCheckout}
                disabled={loading || totalPrice === 0}
                style={{
                  width: '100%',
                  padding: 14,
                  borderRadius: 12,
                  border: 'none',
                  background: loading || totalPrice === 0 ? 'var(--muted)' : 'var(--primary)',
                  color: '#fff',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: loading || totalPrice === 0 ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {loading ? 'Memproses...' : 'Checkout'}
              </button>

              {error && (
                <p style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: 12, textAlign: 'center' }}>
                  {error}
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
