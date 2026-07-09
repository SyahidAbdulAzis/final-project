interface AvailabilityFiltersProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (v: string) => void;
  onEndDateChange: (v: string) => void;
}

export function AvailabilityFilters({ startDate, endDate, onStartDateChange, onEndDateChange }: AvailabilityFiltersProps) {
  const inputStyle = {
    width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--line)', fontSize: '0.9rem',
  };

  return (
    <div style={{ marginBottom: 24, padding: 20, borderRadius: 12, backgroundColor: '#f5f5f5', display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
      <div style={{ flex: 1, minWidth: 200 }}>
        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 8, color: 'var(--text)' }}>Tanggal Mulai</label>
        <input type="date" value={startDate} onChange={(e) => onStartDateChange(e.target.value)} style={inputStyle} />
      </div>
      <div style={{ flex: 1, minWidth: 200 }}>
        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 8, color: 'var(--text)' }}>Tanggal Akhir</label>
        <input type="date" value={endDate} onChange={(e) => onEndDateChange(e.target.value)} style={inputStyle} />
      </div>
    </div>
  );
}
