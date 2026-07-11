import type { BookingResponse } from '../../../types/booking';

export function BookingDetailCard({ booking }: { booking: BookingResponse }) {
  return (
    <div style={{ border: '1px solid var(--line)', borderRadius: 16, padding: 24, marginBottom: 24 }}>
      <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 16, color: 'var(--text)' }}>Detail Booking</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {[
          ['Booking ID', booking.id],
          ['Kamar', booking.room.name],
          ['Properti', booking.room.property.name],
          ['Check-in', new Date(booking.checkIn).toLocaleDateString('id-ID')],
          ['Check-out', new Date(booking.checkOut).toLocaleDateString('id-ID')],
        ].map(([label, value]) => (
          <div key={label as string} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
            <span style={{ color: 'var(--muted)' }}>{label}</span>
            <span style={{ fontWeight: 600 }}>{value}</span>
          </div>
        ))}
        <div style={{ borderTop: '1px solid var(--line)', paddingTop: 12, marginTop: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 700 }}>
            <span>Total</span>
            <span style={{ color: 'var(--primary)' }}>Rp {booking.totalPrice.toLocaleString('id-ID')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
