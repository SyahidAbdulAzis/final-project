const items = [
  { color: '#4caf50', label: 'Dikonfirmasi' },
  { color: '#2196f3', label: 'Menunggu Konfirmasi' },
  { color: '#ff9800', label: 'Menunggu Pembayaran' },
  { color: '#f5f5f5', label: 'Tersedia', border: '1px solid var(--line)' },
];

export function AvailabilityLegend() {
  return (
    <div style={{ marginBottom: 24, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
      {items.map((item) => (
        <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 16, height: 16, borderRadius: 4, backgroundColor: item.color, border: 'border' in item ? item.border as string : 'none' }} />
          <span style={{ fontSize: '0.85rem', color: 'var(--text)' }}>{item.label}</span>
        </div>
      ))}
    </div>
  );
}
