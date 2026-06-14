import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPropertyDetail } from '../services/propertyApi.js';
import { Navbar } from '../../../components/common/Navbar.js';
import { Footer } from '../../../components/common/Footer.js';
import { useAuth } from '../../auth/stores/AuthContext.js';

interface Room {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  maxGuests: number;
  availabilities: { date: string; isAvailable: boolean }[];
  seasonalRates: { name: string; startDate: string; endDate: string; adjustmentType: string; adjustmentValue: number }[];
}

interface PropertyDetail {
  id: string;
  name: string;
  city: string;
  address: string;
  description: string;
  category: { name: string };
  images: { url: string }[];
  rooms: Room[];
  tenant: { fullName: string };
}

export function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [property, setProperty] = useState<PropertyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState<string>('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getPropertyDetail(id)
      .then((res) => {
        setProperty(res);
        if (res.rooms?.[0]) setSelectedRoom(res.rooms[0].id);
      })
      .catch(() => setProperty(null))
      .finally(() => setLoading(false));
  }, [id]);

  const getRoomPrice = (room: Room, dateStr: string) => {
    if (!dateStr) return room.basePrice;
    const date = new Date(dateStr);
    const rate = room.seasonalRates.find((r) => {
      const start = new Date(r.startDate);
      const end = new Date(r.endDate);
      return date >= start && date <= end;
    });
    if (!rate) return room.basePrice;
    return rate.adjustmentType === 'PERCENTAGE'
      ? Math.round(room.basePrice * (1 + rate.adjustmentValue / 100))
      : room.basePrice + rate.adjustmentValue;
  };

  const selectedRoomObj = property?.rooms.find((r) => r.id === selectedRoom);
  const nights = checkIn && checkOut
    ? Math.max(1, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)))
    : 1;
  const currentPrice = selectedRoomObj && checkIn ? getRoomPrice(selectedRoomObj, checkIn) : selectedRoomObj?.basePrice || 0;
  const totalPrice = currentPrice * nights;

  if (loading) return (
    <div className="layout">
      <Navbar />
      <main className="property-detail-page"><p>Memuat...</p></main>
      <Footer />
    </div>
  );
  if (!property) return (
    <div className="layout">
      <Navbar />
      <main className="property-detail-page"><p>Properti tidak ditemukan.</p></main>
      <Footer />
    </div>
  );

  const handleDateSelect = (date: string) => {
    if (!checkIn || (checkIn && checkOut)) {
      setCheckIn(date);
      setCheckOut('');
    } else if (new Date(date) > new Date(checkIn)) {
      setCheckOut(date);
    } else {
      setCheckIn(date);
    }
  };

  return (
    <div className="layout">
      <Navbar />
      <main className="property-detail-page">
        <div className="property-detail-header">
          <h1>{property.name}</h1>
          <p className="property-detail-header-meta">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            {property.address}, {property.city} · {property.category.name}
          </p>
        </div>

        <div className="property-gallery">
          {property.images.length === 1 ? (
            <div
              className="property-gallery-img"
              style={{ background: `url(${property.images[0].url}) center/cover`, gridColumn: '1 / -1' }}
            />
          ) : (
            property.images.slice(0, 5).map((img, i) => (
              <div
                key={i}
                className="property-gallery-img"
                style={{ background: `url(${img.url}) center/cover` }}
              />
            ))
          )}
        </div>

        <div className="property-detail-layout">
          <div>
            <div className="property-detail-section">
              <h2>Tentang properti ini</h2>
              <p>{property.description}</p>
            </div>

            <div className="property-detail-section">
              <h2>Pilihan Kamar</h2>
              <div className="room-list">
                {property.rooms.map((room) => (
                  <button
                    key={room.id}
                    type="button"
                    onClick={() => setSelectedRoom(room.id)}
                    className={`room-card${selectedRoom === room.id ? ' selected' : ''}`}
                  >
                    <div className="room-card-name">{room.name}</div>
                    <div className="room-card-desc">{room.description}</div>
                    <div className="room-card-guests">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                      Maks {room.maxGuests} tamu
                    </div>
                    <div className="room-card-price">
                      Rp {room.basePrice.toLocaleString('id-ID')} <span>/malam</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {selectedRoomObj && (
              <div className="calendar-section">
                <h2>Kalender Harga</h2>
                <p>Lihat perbandingan harga tiap tanggal. Pilih tanggal check-in dan check-out.</p>
                <div className="calendar-grid">
                  <PriceCalendar
                    basePrice={selectedRoomObj.basePrice}
                    seasonalRates={selectedRoomObj.seasonalRates}
                    selectedDate={checkIn}
                    checkOutDate={checkOut}
                    onSelect={handleDateSelect}
                    offsetMonths={0}
                  />
                  <PriceCalendar
                    basePrice={selectedRoomObj.basePrice}
                    seasonalRates={selectedRoomObj.seasonalRates}
                    selectedDate={checkIn}
                    checkOutDate={checkOut}
                    onSelect={handleDateSelect}
                    offsetMonths={1}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="booking-card">
            <div className="booking-card-price">
              Rp {currentPrice.toLocaleString('id-ID')} <span>/malam</span>
            </div>
            <div className="booking-card-host">{property.tenant.fullName}</div>

            <div className="booking-inputs">
              <div className="booking-input-row">
                <div className="booking-input-cell">
                  <label>Check-in</label>
                  <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
                </div>
                <div className="booking-input-cell">
                  <label>Check-out</label>
                  <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
                </div>
              </div>
              <div className="booking-input-cell full">
                <label>Tamu</label>
                <select>
                  {[1,2,3,4,5,6,7,8].map((n) => (
                    <option key={n} value={n}>{n} tamu</option>
                  ))}
                </select>
              </div>
            </div>

            <button type="button" className="btn-primary" style={{ width: '100%', marginBottom: 16 }}>
              Pesan Sekarang
            </button>

            {(checkIn || checkOut) && (
              <div className="booking-summary">
                <div className="booking-row">
                  <span>{selectedRoomObj?.name}</span>
                  <span>Rp {currentPrice.toLocaleString('id-ID')} x {nights} malam</span>
                </div>
                <div className="booking-row total">
                  <span>Total</span>
                  <span>Rp {totalPrice.toLocaleString('id-ID')}</span>
                </div>
                <button
                  onClick={handleCheckout}
                  disabled={!checkIn || !checkOut || totalPrice === 0}
                  style={{
                    width: '100%',
                    padding: 14,
                    borderRadius: 12,
                    border: 'none',
                    background: !checkIn || !checkOut || totalPrice === 0 ? 'var(--muted)' : 'var(--primary)',
                    color: '#fff',
                    fontSize: '1rem',
                    fontWeight: 600,
                    cursor: !checkIn || !checkOut || totalPrice === 0 ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  Checkout
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
