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

interface BookingFormSectionProps {
  room: Room;
  checkIn: string;
  checkOut: string;
  datesLocked: boolean;
  onCheckInChange: (v: string) => void;
  onCheckOutChange: (v: string) => void;
}

export function BookingFormSection({
  room, checkIn, checkOut, datesLocked,
  onCheckInChange, onCheckOutChange,
}: BookingFormSectionProps) {
  const mainImage = room.property.images?.[0]?.url || '';

  return (
    <div>
      {mainImage && (
        <div style={{
          height: 400, borderRadius: 16,
          background: `url(${mainImage}) center/cover`,
          backgroundColor: '#eee', marginBottom: 24,
        }} />
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
              type="date" value={checkIn}
              onChange={(e) => onCheckInChange(e.target.value)}
              disabled={datesLocked}
              style={{
                width: '100%', padding: 12, borderRadius: 8, border: '1px solid var(--line)',
                fontSize: '0.95rem', backgroundColor: datesLocked ? '#f5f5f5' : '#fff',
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
              type="date" value={checkOut}
              onChange={(e) => onCheckOutChange(e.target.value)}
              disabled={datesLocked}
              style={{
                width: '100%', padding: 12, borderRadius: 8, border: '1px solid var(--line)',
                fontSize: '0.95rem', backgroundColor: datesLocked ? '#f5f5f5' : '#fff',
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
  );
}
