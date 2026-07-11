import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Navbar } from '../../../components/common/Navbar';
import { Footer } from '../../../components/common/Footer';
import { getRoomById } from '../../property/services/propertyApi';
import { useBooking } from '../hooks/useBooking';
import { useAuth } from '../../auth/stores/AuthContext';
import { getRoomAvailability } from '../services/bookingApi';
import { showToast } from '../../../components/common/Toast';
import { BookingFormSection } from '../components/BookingFormSection';
import { BookingSummary } from '../components/BookingSummary';

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
  const datesLocked = !!(searchParams.get('checkIn') && searchParams.get('checkOut'));

  useEffect(() => {
    if (!roomId) return;
    getRoomById(roomId).then(setRoom).catch(() => {}).finally(() => setLoadingRoom(false));
  }, [roomId]);

  useEffect(() => {
    if (!room || !checkIn || !checkOut) { setTotalPrice(0); return; }
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    setTotalPrice(nights > 0 ? nights * room.basePrice : 0);
  }, [room, checkIn, checkOut]);

  const handleCheckout = async () => {
    if (!user) { navigate('/login/user'); return; }
    if (user.role === 'tenant') { showToast('Pemilik properti tidak dapat melakukan booking', 'error'); navigate('/'); return; }
    if (!room || !checkIn || !checkOut || totalPrice === 0) { showToast('Mohon lengkapi tanggal check-in dan check-out', 'error'); return; }

    try {
      const unavailableDates = await getRoomAvailability(room.id, checkIn, checkOut);
      if (unavailableDates.length > 0) {
        showToast('Kamar sudah dibooking untuk tanggal tersebut. Silakan pilih tanggal lain.', 'error');
        return;
      }
    } catch (err) {}

    const result = await submitBooking({ userId: user.id, roomId: room.id, checkIn, checkOut, totalPrice });
    if (result) { showToast('Booking berhasil! Silakan lanjut ke pembayaran', 'success'); navigate(`/payment/${result.id}`); }
    else if (error) showToast(error, 'error');
  };

  if (loadingRoom) {
    return (
      <div className="layout">
        <Navbar />
        <main style={{ padding: 40, maxWidth: 1360, margin: '0 auto' }}><p>Memuat...</p></main>
        <Footer />
      </div>
    );
  }

  if (!room) {
    return (
      <div className="layout">
        <Navbar />
        <main style={{ padding: 40, maxWidth: 1360, margin: '0 auto' }}><p>Kamar tidak ditemukan.</p></main>
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
            {room.property.name}
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
            {room.property.city} · {room.property.address}
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 32 }}>
          <BookingFormSection
            room={room}
            checkIn={checkIn}
            checkOut={checkOut}
            datesLocked={datesLocked}
            onCheckInChange={setCheckIn}
            onCheckOutChange={setCheckOut}
          />
          <BookingSummary
            roomName={room.name}
            basePrice={room.basePrice}
            totalPrice={totalPrice}
            checkIn={checkIn}
            checkOut={checkOut}
            loading={loading}
            error={error}
            onCheckout={handleCheckout}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}
