import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPropertyDetail } from '../services/propertyApi.js';
import { Navbar } from '../../../components/common/Navbar.js';
import { Footer } from '../../../components/common/Footer.js';
import { useAuth } from '../../auth/stores/AuthContext.js';
import { PriceCalendar } from '../components/PriceCalendar.js';
import { Dropdown } from '../../../components/common/Dropdown.js';
import { showToast } from '../../../components/common/Toast.js';

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

function buildAvailabilityMap(room?: Room) {
  if (!room) return {};
  return Object.fromEntries(room.availabilities.map((a) => [a.date.slice(0, 10), a.isAvailable]));
}

function getDatesInRange(start: string, end: string) {
  const dates: string[] = [];
  const current = new Date(start);
  const last = new Date(end);
  while (current <= last) {
    dates.push(current.toISOString().split('T')[0]);
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

function isRangeAvailable(room: Room | undefined, start: string, end: string) {
  if (!room) return false;
  const map = buildAvailabilityMap(room);
  const dates = getDatesInRange(start, end);
  return dates.every((d) => map[d] !== false);
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
  const [guestCount, setGuestCount] = useState(1);

  const today = useMemo(() => new Date().toISOString().split('T')[0], []);
  const selectedRoomObj = property?.rooms.find((r) => r.id === selectedRoom);
  const availabilityMap = useMemo(() => buildAvailabilityMap(selectedRoomObj), [selectedRoomObj]);
  const maxGuests = selectedRoomObj?.maxGuests || 0;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
    const dateKey = dateStr.slice(0, 10);
    const rate = room.seasonalRates.find((r) => {
      const startKey = r.startDate.slice(0, 10);
      const endKey = r.endDate.slice(0, 10);
      return dateKey >= startKey && dateKey <= endKey;
    });
    if (!rate) return room.basePrice;
    return rate.adjustmentType === 'PERCENTAGE'
      ? Math.round(room.basePrice * (1 + rate.adjustmentValue / 100))
      : room.basePrice + rate.adjustmentValue;
  };

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
    if (date < today) return;
    if (selectedRoomObj && availabilityMap[date] === false) return;
    if (!checkIn || (checkIn && checkOut)) {
      setCheckIn(date);
      setCheckOut('');
    } else if (date > checkIn) {
      const between = getDatesInRange(checkIn, date);
      if (selectedRoomObj && between.some((d) => availabilityMap[d] === false)) {
        showToast('Rentang tanggal mencakup tanggal yang tidak tersedia. Silakan pilih rentang lain.', 'error');
        return;
      }
      setCheckOut(date);
    } else {
      setCheckIn(date);
      setCheckOut('');
    }
  };

  const handleCheckout = () => {
    if (!user) {
      showToast('Silakan login terlebih dahulu untuk melakukan booking', 'error');
      navigate('/login/user');
      return;
    }
    if (!selectedRoom) {
      showToast('Silakan pilih kamar terlebih dahulu', 'error');
      return;
    }
    if (!checkIn || !checkOut) {
      showToast('Silakan pilih tanggal check-in dan check-out', 'error');
      return;
    }
    navigate(`/booking/${selectedRoom}?checkIn=${checkIn}&checkOut=${checkOut}`);
  };

  return (
    <div className="layout">
      <Navbar />
      <main className="pd-page">

        {/* ── Header ── */}
        <div className="pd-header">
          <button type="button" className="pd-back" onClick={() => navigate(-1)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
            Kembali
          </button>
          <div className="pd-header-row">
            <h1>{property.name}</h1>
            <div className="pd-header-actions">
              <button type="button" className="pd-action-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                Bagikan
              </button>
              <button type="button" className="pd-action-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                Simpan
              </button>
            </div>
          </div>
          <div className="pd-meta-row">
            <span className="pd-badge">{property.category.name}</span>
            <span className="pd-meta-sep">·</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            <span>{property.address}, {property.city}</span>
            {maxGuests > 0 && (
              <>
                <span className="pd-meta-sep">·</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                <span>Maks {maxGuests} tamu</span>
              </>
            )}
          </div>
        </div>

        {/* ── Gallery ── */}
        <div className={`pd-gallery pd-gallery--${Math.min(property.images.length, 5)}`}>
          {property.images.slice(0, 5).map((img, i) => (
            <div
              key={i}
              className={`pd-gallery-cell pd-gallery-cell--${i}`}
              style={{ backgroundImage: `url(${img.url})` }}
            />
          ))}
          {property.images.length === 0 && (
            <div className="pd-gallery-cell pd-gallery-cell--0 pd-gallery-empty">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              <span>Foto tidak tersedia</span>
            </div>
          )}
          <button type="button" className="pd-gallery-all-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
            Lihat semua foto
          </button>
        </div>

        {/* ── Two-column layout ── */}
        <div className="pd-layout">

          {/* Left — detail content */}
          <div className="pd-main">

            {/* Host highlights */}
            <div className="pd-highlights">
              <div className="pd-highlight">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                <div>
                  <span className="pd-highlight-label">Dikelola oleh</span>
                  <span className="pd-highlight-value">{property.tenant.fullName}</span>
                </div>
              </div>
              <div className="pd-highlight">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                <div>
                  <span className="pd-highlight-label">Lokasi</span>
                  <span className="pd-highlight-value">{property.city}</span>
                </div>
              </div>
              <div className="pd-highlight">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                <div>
                  <span className="pd-highlight-label">Kapasitas</span>
                  <span className="pd-highlight-value">Hingga {maxGuests} tamu</span>
                </div>
              </div>
              <div className="pd-highlight">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/></svg>
                <div>
                  <span className="pd-highlight-label">Kamar tersedia</span>
                  <span className="pd-highlight-value">{property.rooms.length} tipe kamar</span>
                </div>
              </div>
            </div>

            <div className="pd-divider" />

            {/* Description */}
            <section className="pd-section">
              <h2>Tentang Properti Ini</h2>
              <p>{property.description}</p>
            </section>

            <div className="pd-divider" />

            {/* Rooms */}
            <section className="pd-section">
              <h2>Pilihan Kamar</h2>
              <p className="pd-section-sub">Pilih kamar yang sesuai kebutuhan Anda</p>
              <div className="pd-room-grid">
                {property.rooms.map((room) => {
                  const isSelected = selectedRoom === room.id;
                  return (
                    <button
                      key={room.id}
                      type="button"
                      onClick={() => setSelectedRoom(room.id)}
                      className={`pd-room-card${isSelected ? ' pd-room-card--active' : ''}`}
                    >
                      <div className="pd-room-card-check" aria-hidden="true">
                        {isSelected && (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                        )}
                      </div>
                      <div className="pd-room-card-body">
                        <div className="pd-room-card-name">{room.name}</div>
                        <div className="pd-room-card-desc">{room.description}</div>
                        <div className="pd-room-card-footer">
                          <span className="pd-room-card-guests">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                            Maks {room.maxGuests} tamu
                          </span>
                          <span className="pd-room-card-price">
                            Rp {room.basePrice.toLocaleString('id-ID')}
                            <span>/malam</span>
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Calendar */}
            {selectedRoomObj && (
              <>
                <div className="pd-divider" />
                <section className="pd-section pd-section--last">
                  <h2>Kalender Harga & Ketersediaan</h2>
                  <p className="pd-section-sub">Klik tanggal untuk memilih check-in dan check-out. Tanggal merah tidak tersedia.</p>
                  <div className="calendar-grid">
                    <PriceCalendar
                      basePrice={selectedRoomObj.basePrice}
                      seasonalRates={selectedRoomObj.seasonalRates}
                      availabilityMap={availabilityMap}
                      selectedDate={checkIn}
                      checkOutDate={checkOut}
                      onSelect={handleDateSelect}
                      offsetMonths={0}
                      minDate={today}
                    />
                    <PriceCalendar
                      basePrice={selectedRoomObj.basePrice}
                      seasonalRates={selectedRoomObj.seasonalRates}
                      availabilityMap={availabilityMap}
                      selectedDate={checkIn}
                      checkOutDate={checkOut}
                      onSelect={handleDateSelect}
                      offsetMonths={1}
                      minDate={today}
                    />
                  </div>
                </section>
              </>
            )}
          </div>

          {/* Right — sticky booking card */}
          <div className="pd-sidebar">
            <div className="pd-booking-card">
              <div className="pd-booking-price">
                <span className="pd-booking-price-amount">Rp {currentPrice.toLocaleString('id-ID')}</span>
                <span className="pd-booking-price-unit">/ malam</span>
              </div>
              {selectedRoomObj && (
                <div className="pd-booking-room-label">{selectedRoomObj.name}</div>
              )}

              <div className="pd-booking-inputs">
                <div className="pd-booking-date-row">
                  <div className="pd-booking-date-cell pd-booking-date-cell--left">
                    <label>CHECK-IN</label>
                    <input type="date" min={today} value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
                  </div>
                  <div className="pd-booking-date-divider" />
                  <div className="pd-booking-date-cell pd-booking-date-cell--right">
                    <label>CHECK-OUT</label>
                    <input type="date" min={checkIn || today} value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
                  </div>
                </div>
                <div className="pd-booking-guest-row">
                  <label>TAMU</label>
                  <Dropdown
                    value={String(guestCount)}
                    options={Array.from({ length: selectedRoomObj?.maxGuests || 8 }, (_, i) => i + 1).map((n) => ({
                      value: String(n),
                      label: `${n} tamu`,
                    }))}
                    onChange={(value) => setGuestCount(Number(value))}
                    variant="compact"
                    menuPosition="fixed"
                  />
                </div>
              </div>

              <button
                type="button"
                className={`pd-booking-btn${(!checkIn || !checkOut || totalPrice === 0) ? ' pd-booking-btn--disabled' : ''}`}
                onClick={handleCheckout}
                disabled={!checkIn || !checkOut || totalPrice === 0}
              >
                Pesan Sekarang
              </button>

              {(checkIn && checkOut) && (
                <div className="pd-booking-summary">
                  <div className="pd-booking-row">
                    <span>Rp {currentPrice.toLocaleString('id-ID')} × {nights} malam</span>
                    <span>Rp {(currentPrice * nights).toLocaleString('id-ID')}</span>
                  </div>
                  <div className="pd-booking-row pd-booking-row--total">
                    <span>Total</span>
                    <span>Rp {totalPrice.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              )}

              <div className="pd-booking-host">
                <div className="pd-booking-host-avatar">
                  {property.tenant.fullName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <span className="pd-booking-host-label">Tuan Rumah</span>
                  <span className="pd-booking-host-name">{property.tenant.fullName}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}