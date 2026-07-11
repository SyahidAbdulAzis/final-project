import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPropertyDetail } from '../services/propertyApi.js';
import { Navbar } from '../../../components/common/Navbar.js';
import { Footer } from '../../../components/common/Footer.js';
import { useAuth } from '../../auth/stores/AuthContext.js';
import { PriceCalendar } from '../components/PriceCalendar.js';
import { PropertyGallery } from '../components/PropertyGallery.js';
import { PropertyReviews } from '../components/PropertyReviews.js';
import { BookingSidebar } from '../components/BookingSidebar.js';
import { showToast } from '../../../components/common/Toast.js';
import { buildAvailabilityMap, getDatesInRange, getRoomPrice, type Room } from '../utils/property-detail.helpers.js';
import type { ReviewItem } from '../../../types/property.js';

interface PropertyDetail {
  id: string; name: string; city: string; address: string; description: string;
  category: { name: string }; images: { url: string }[]; rooms: Room[];
  tenant: { fullName: string; photoUrl?: string | null }; reviews: ReviewItem[];
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

  useEffect(() => { window.scrollTo(0, 0); }, []);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getPropertyDetail(id)
      .then((res) => { setProperty(res); if (res.rooms?.[0]) setSelectedRoom(res.rooms[0].id); })
      .catch(() => setProperty(null))
      .finally(() => setLoading(false));
  }, [id]);

  const nights = checkIn && checkOut ? Math.max(1, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24))) : 1;
  const currentPrice = selectedRoomObj && checkIn ? getRoomPrice(selectedRoomObj, checkIn) : selectedRoomObj?.basePrice || 0;
  const totalPrice = currentPrice * nights;

  if (loading) return <div className="layout"><Navbar /><main className="property-detail-page"><p>Memuat...</p></main><Footer /></div>;
  if (!property) return <div className="layout"><Navbar /><main className="property-detail-page"><p>Properti tidak ditemukan.</p></main><Footer /></div>;

  const handleDateSelect = (date: string) => {
    if (date < today || (selectedRoomObj && availabilityMap[date] === false)) return;
    if (!checkIn || (checkIn && checkOut)) { setCheckIn(date); setCheckOut(''); }
    else if (date > checkIn) {
      const between = getDatesInRange(checkIn, date);
      if (selectedRoomObj && between.some((d) => availabilityMap[d] === false)) { showToast('Rentang tanggal mencakup tanggal yang tidak tersedia.', 'error'); return; }
      setCheckOut(date);
    } else { setCheckIn(date); setCheckOut(''); }
  };

  const handleCheckInInput = (value: string) => {
    if (!value) { setCheckIn(''); return; }
    if (value < today) { showToast('Tanggal check-in tidak boleh sebelum hari ini', 'error'); return; }
    if (selectedRoomObj && availabilityMap[value] === false) { showToast('Tanggal tersebut tidak tersedia', 'error'); return; }
    setCheckIn(value); setCheckOut('');
  };

  const handleCheckOutInput = (value: string) => {
    if (!value) { setCheckOut(''); return; }
    if (!checkIn) { showToast('Pilih tanggal check-in terlebih dahulu', 'error'); return; }
    if (value <= checkIn) { showToast('Check-out harus setelah check-in', 'error'); return; }
    if (selectedRoomObj) {
      const between = getDatesInRange(checkIn, value);
      if (between.some((d) => availabilityMap[d] === false)) { showToast('Rentang tanggal mencakup tanggal yang tidak tersedia', 'error'); return; }
    }
    setCheckOut(value);
  };

  const handleCheckout = () => {
    if (!user) { showToast('Silakan login terlebih dahulu untuk melakukan booking', 'error'); navigate('/login/user'); return; }
    if (user.role === 'tenant') { showToast('Pemilik properti tidak dapat melakukan booking', 'error'); return; }
    if (!selectedRoom) { showToast('Silakan pilih kamar terlebih dahulu', 'error'); return; }
    if (!checkIn || !checkOut) { showToast('Silakan pilih tanggal check-in dan check-out', 'error'); return; }
    navigate(`/booking/${selectedRoom}?checkIn=${checkIn}&checkOut=${checkOut}`);
  };

  return (
    <div className="layout">
      <Navbar />
      <main className="pd-page">
        <div className="pd-header">
          <button type="button" className="pd-back" onClick={() => navigate(-1)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
            Kembali
          </button>
          <div className="pd-header-row">
            <h1>{property.name}</h1>
            <div className="pd-header-actions">
              <button type="button" className="pd-action-btn"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>Bagikan</button>
              <button type="button" className="pd-action-btn"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>Simpan</button>
            </div>
          </div>
          <div className="pd-meta-row">
            <span className="pd-badge">{property.category.name}</span>
            <span className="pd-meta-sep">·</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            <span>{property.address}, {property.city}</span>
            {maxGuests > 0 && (<><span className="pd-meta-sep">·</span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg><span>Maks {maxGuests} tamu</span></>)}
          </div>
        </div>

        <PropertyGallery images={property.images} />

        <div className="pd-layout">
          <div className="pd-main">
            <div className="pd-highlights">
              <div className="pd-highlight"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg><div><span className="pd-highlight-label">Dikelola oleh</span><span className="pd-highlight-value">{property.tenant.fullName}</span></div></div>
              <div className="pd-highlight"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg><div><span className="pd-highlight-label">Lokasi</span><span className="pd-highlight-value">{property.city}</span></div></div>
              <div className="pd-highlight"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg><div><span className="pd-highlight-label">Kapasitas</span><span className="pd-highlight-value">Hingga {maxGuests} tamu</span></div></div>
              <div className="pd-highlight"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/></svg><div><span className="pd-highlight-label">Kamar tersedia</span><span className="pd-highlight-value">{property.rooms.length} tipe kamar</span></div></div>
            </div>
            <div className="pd-divider" />
            <section className="pd-section"><h2>Tentang Properti Ini</h2><p>{property.description}</p></section>
            <div className="pd-divider" />
            <section className="pd-section">
              <h2>Pilihan Kamar</h2>
              <p className="pd-section-sub">Pilih kamar yang sesuai kebutuhan Anda</p>
              <div className="pd-room-grid">
                {property.rooms.map((room) => {
                  const isSelected = selectedRoom === room.id;
                  return (
                    <button key={room.id} type="button" onClick={() => setSelectedRoom(room.id)} className={`pd-room-card${isSelected ? ' pd-room-card--active' : ''}`}>
                      <div className="pd-room-card-check" aria-hidden="true">{isSelected && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}</div>
                      <div className="pd-room-card-body">
                        <div className="pd-room-card-name">{room.name}</div>
                        <div className="pd-room-card-desc">{room.description}</div>
                        <div className="pd-room-card-footer">
                          <span className="pd-room-card-guests"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>Maks {room.maxGuests} tamu</span>
                          <span className="pd-room-card-price">Rp {room.basePrice.toLocaleString('id-ID')}<span>/malam</span></span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
            {selectedRoomObj && (
              <>
                <div className="pd-divider" />
                <section className="pd-section pd-section--last">
                  <h2>Kalender Harga & Ketersediaan</h2>
                  <p className="pd-section-sub">Klik tanggal untuk memilih check-in dan check-out. Tanggal merah tidak tersedia.</p>
                  <div className="calendar-grid">
                    <PriceCalendar basePrice={selectedRoomObj.basePrice} seasonalRates={selectedRoomObj.seasonalRates} availabilityMap={availabilityMap} selectedDate={checkIn} checkOutDate={checkOut} onSelect={handleDateSelect} offsetMonths={0} minDate={today} />
                    <PriceCalendar basePrice={selectedRoomObj.basePrice} seasonalRates={selectedRoomObj.seasonalRates} availabilityMap={availabilityMap} selectedDate={checkIn} checkOutDate={checkOut} onSelect={handleDateSelect} offsetMonths={1} minDate={today} />
                  </div>
                </section>
              </>
            )}
            <div className="pd-divider" />
            <PropertyReviews reviews={property.reviews} />
          </div>
          <BookingSidebar room={selectedRoomObj} checkIn={checkIn} checkOut={checkOut} today={today} currentPrice={currentPrice} nights={nights} totalPrice={totalPrice} guestCount={guestCount} tenant={property.tenant} onCheckInChange={handleCheckInInput} onCheckOutChange={handleCheckOutInput} onGuestChange={setGuestCount} onCheckout={handleCheckout} />
        </div>
      </main>
      <Footer />
    </div>
  );
}