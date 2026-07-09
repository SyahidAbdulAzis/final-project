import type { PropertyAvailabilityData } from '../services/reportApi';

function getStatusColor(status: string) {
  switch (status) {
    case 'DIKONFIRMASI': return '#4caf50';
    case 'MENUNGGU_KONFIRMASI': return '#2196f3';
    case 'MENUNGGU_PEMBAYARAN': return '#ff9800';
    default: return '#9e9e9e';
  }
}

interface PropertyAvailabilityCardProps {
  property: PropertyAvailabilityData;
  days: Date[];
}

export function PropertyAvailabilityCard({ property, days }: PropertyAvailabilityCardProps) {
  const isBooked = (room: typeof property.rooms[0], date: Date) => {
    return room.bookings.some((b) => date >= new Date(b.checkIn) && date < new Date(b.checkOut));
  };

  const getStatus = (room: typeof property.rooms[0], date: Date) => {
    const booking = room.bookings.find((b) => date >= new Date(b.checkIn) && date < new Date(b.checkOut));
    return booking?.status ?? null;
  };

  return (
    <div style={{ border: '1px solid var(--line)', borderRadius: 16, padding: 24, backgroundColor: '#fff' }}>
      <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 4, color: 'var(--text)' }}>{property.propertyName}</h3>
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
                <th style={{ padding: 12, textAlign: 'left', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)', minWidth: 150 }}>Kamar</th>
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
                  <td style={{ padding: 12, fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)' }}>{room.roomName}</td>
                  {days.map((day) => {
                    const booked = isBooked(room, day);
                    const status = getStatus(room, day);
                    return (
                      <td key={day.toISOString()} style={{ padding: 4, textAlign: 'center' }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: 4,
                          backgroundColor: booked ? getStatusColor(status || '') : '#f5f5f5',
                          border: booked ? 'none' : '1px solid var(--line)',
                          margin: '0 auto',
                        }} title={booked ? status || '' : 'Tersedia'} />
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
  );
}
