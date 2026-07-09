interface BookingItem {
  id: string;
  propertyName: string;
  checkIn: string;
  checkOut: string;
  totalPrice: number;
}

interface UserReportItem {
  userId: string;
  userName: string;
  userEmail: string;
  totalSales: number;
  transactionCount: number;
  bookings: BookingItem[];
}

export function UserReportCard({ item, formatCurrency, formatDate }: {
  item: UserReportItem;
  formatCurrency: (n: number) => string;
  formatDate: (s: string) => string;
}) {
  return (
    <div style={{ border: '1px solid var(--line)', borderRadius: 16, padding: 24, backgroundColor: '#fff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)' }}>{item.userName}</h3>
          <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>{item.userEmail}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--primary)' }}>{formatCurrency(item.totalSales)}</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>{item.transactionCount} transaksi</div>
        </div>
      </div>
      <div style={{ borderTop: '1px solid var(--line)', paddingTop: 12 }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: 8, color: 'var(--text)' }}>
          Transaksi Terakhir
        </div>
        {item.bookings.slice(0, 3).map((booking) => (
          <div key={booking.id} style={{ padding: '8px 0', borderBottom: '1px solid #f0f0f0', fontSize: '0.9rem' }}>
            <div style={{ fontWeight: 600 }}>{booking.propertyName}</div>
            <div style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
              {formatDate(booking.checkIn)} - {formatDate(booking.checkOut)} • {formatCurrency(booking.totalPrice)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
