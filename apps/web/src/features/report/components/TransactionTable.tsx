interface TransactionItem {
  id: string;
  propertyName: string;
  userName: string;
  checkIn: string;
  checkOut: string;
  totalPrice: number;
}

export function TransactionTable({ data, formatCurrency, formatDate }: {
  data: TransactionItem[];
  formatCurrency: (n: number) => string;
  formatDate: (s: string) => string;
}) {
  return (
    <div style={{ border: '1px solid var(--line)', borderRadius: 16, backgroundColor: '#fff', overflow: 'hidden' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#f5f5f5' }}>
            {['ID', 'Properti', 'User', 'Check-in', 'Check-out', 'Total'].map((h) => (
              <th key={h} style={{ padding: 12, textAlign: h === 'Total' ? 'right' : 'left', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)' }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.id} style={{ borderBottom: '1px solid var(--line)' }}>
              <td style={{ padding: 12, fontSize: '0.9rem', wordBreak: 'break-all' }}>{item.id}</td>
              <td style={{ padding: 12, fontSize: '0.9rem' }}>{item.propertyName}</td>
              <td style={{ padding: 12, fontSize: '0.9rem' }}>{item.userName}</td>
              <td style={{ padding: 12, fontSize: '0.9rem' }}>{formatDate(item.checkIn)}</td>
              <td style={{ padding: 12, fontSize: '0.9rem' }}>{formatDate(item.checkOut)}</td>
              <td style={{ padding: 12, textAlign: 'right', fontSize: '0.9rem', fontWeight: 600, color: 'var(--primary)' }}>{formatCurrency(item.totalPrice)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
