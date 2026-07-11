import { Dropdown } from '../../../components/common/Dropdown';

interface ReportFiltersProps {
  startDate: string;
  endDate: string;
  sortBy: string;
  loading: boolean;
  showSort: boolean;
  onStartDateChange: (v: string) => void;
  onEndDateChange: (v: string) => void;
  onSortByChange: (v: string) => void;
  onFilter: () => void;
  onReset: () => void;
}

export function ReportFilters({
  startDate, endDate, sortBy, loading, showSort,
  onStartDateChange, onEndDateChange, onSortByChange,
  onFilter, onReset,
}: ReportFiltersProps) {
  return (
    <div style={{ marginBottom: 24, padding: 20, borderRadius: 12, backgroundColor: '#f5f5f5', display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
      <div style={{ flex: 1, minWidth: 200 }}>
        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 8, color: 'var(--text)' }}>
          Tanggal Mulai
        </label>
        <input type="date" value={startDate} onChange={(e) => onStartDateChange(e.target.value)} style={{
          width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--line)', fontSize: '0.9rem',
        }} />
      </div>
      <div style={{ flex: 1, minWidth: 200 }}>
        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 8, color: 'var(--text)' }}>
          Tanggal Akhir
        </label>
        <input type="date" value={endDate} onChange={(e) => onEndDateChange(e.target.value)} style={{
          width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--line)', fontSize: '0.9rem',
        }} />
      </div>
      {showSort && (
        <div style={{ minWidth: 180 }}>
          <Dropdown
            label="Urutkan"
            value={sortBy}
            options={[
              { value: 'date', label: 'Tanggal' },
              { value: 'totalSales', label: 'Total Penjualan' },
            ]}
            onChange={onSortByChange}
            variant="compact"
          />
        </div>
      )}
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={onFilter} disabled={loading} style={{
          padding: '10px 20px', borderRadius: 8, border: 'none',
          background: 'var(--primary)', color: '#fff', fontSize: '0.9rem', fontWeight: 600,
          cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
        }}>
          {loading ? 'Memuat...' : 'Filter'}
        </button>
        <button onClick={onReset} style={{
          padding: '10px 20px', borderRadius: 8, border: '1px solid var(--line)',
          background: '#fff', color: 'var(--text)', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer',
          transition: 'all 0.2s',
        }}>
          Reset
        </button>
      </div>
    </div>
  );
}
