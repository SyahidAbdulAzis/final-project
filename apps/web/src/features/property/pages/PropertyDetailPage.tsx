import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getPropertyDetail } from '../services/propertyApi.js';
import { PriceCalendar } from '../components/PriceCalendar.js';
import { Navbar } from '../../../components/common/Navbar.js';
import { Footer } from '../../../components/common/Footer.js';

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
  const [property, setProperty] = useState<PropertyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState<string>('');
  const [checkDate, setCheckDate] = useState('');

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
  const currentPrice = selectedRoomObj && checkDate ? getRoomPrice(selectedRoomObj, checkDate) : selectedRoomObj?.basePrice || 0;

  if (loading) return <div className="layout"><Navbar /><main style={{ padding: 40, maxWidth: 1360, margin: '0 auto' }}><p>Memuat...</p></main><Footer /></div>;
  if (!property) return <div className="layout"><Navbar /><main style={{ padding: 40, maxWidth: 1360, margin: '0 auto' }}><p>Properti tidak ditemukan.</p></main><Footer /></div>;

  return (
    <div className="layout">
      <Navbar />
      <main style={{ padding: '28px 32px', maxWidth: 1360, margin: '0 auto' }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: 6, color: 'var(--text)' }}>{property.name}</h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>{property.city} · {property.category.name}</p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 8,
          marginBottom: 28,
        }}>
          {property.images.map((img, i) => (
            <div key={i} style={{
              height: 260,
              borderRadius: 16,
              background: `url(${img.url}) center/cover`,
              backgroundColor: '#eee',
            }} />
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 32 }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 12, color: 'var(--text)' }}>Deskripsi</h2>
            <p style={{ color: 'var(--muted)', lineHeight: 1.7, marginBottom: 28 }}>{property.description}</p>

            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 16, color: 'var(--text)' }}>Pilihan Kamar</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {property.rooms.map((room) => (
                <button
                  key={room.id}
                  onClick={() => setSelectedRoom(room.id)}
                  style={{
                    textAlign: 'left',
                    padding: 18,
                    borderRadius: 14,
                    border: selectedRoom === room.id ? '2px solid var(--primary)' : '1px solid var(--line)',
                    background: '#fff',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{ fontWeight: 700, marginBottom: 4, color: 'var(--text)' }}>{room.name}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: 8 }}>Maks {room.maxGuests} tamu</div>
                  <div style={{ fontWeight: 700, color: 'var(--primary)' }}>Rp {room.basePrice.toLocaleString('id-ID')} <span style={{ fontWeight: 400, fontSize: '0.8rem', color: 'var(--muted)' }}>/malam</span></div>
                </button>
              ))}
            </div>
          </div>

          <div style={{
            border: '1px solid var(--line)',
            borderRadius: 24,
            padding: 24,
            height: 'fit-content',
            position: 'sticky',
            top: 100,
            background: 'var(--card)',
          }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 16, color: 'var(--text)' }}>Perkiraan Harga</h3>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: 6, color: 'var(--muted)', textTransform: 'uppercase' }}>Pilih Tanggal</label>
              {selectedRoomObj && (
                <PriceCalendar
                  basePrice={selectedRoomObj.basePrice}
                  seasonalRates={selectedRoomObj.seasonalRates}
                  selectedDate={checkDate}
                  onSelect={(date) => setCheckDate(date)}
                />
              )}
            </div>
            {selectedRoomObj && (
              <div style={{ borderTop: '1px solid var(--line)', paddingTop: 16, marginTop: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.9rem', color: 'var(--muted)' }}>
                  <span>{selectedRoomObj.name}</span>
                  <span>Rp {currentPrice.toLocaleString('id-ID')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.1rem', color: 'var(--text)' }}>
                  <span>Total</span>
                  <span style={{ color: 'var(--primary)' }}>Rp {currentPrice.toLocaleString('id-ID')}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
