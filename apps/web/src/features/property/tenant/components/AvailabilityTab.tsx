import { useState } from 'react';
import { bulkAvailability } from '../../services/propertyApi.js';
import { TenantPagination } from '../../../../components/common/TenantPagination.js';

const PAGE_SIZE = 10;

interface Props {
  selectedRoom: string;
  availabilities: any[];
  refresh: () => void;
}

export function AvailabilityTab({ selectedRoom, availabilities, refresh }: Props) {
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  const [page, setPage] = useState(1);

  const sorted = [...availabilities].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paged = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleBulk = async () => {
    if (!dateStart || !dateEnd || !selectedRoom) return;
    const dates: string[] = [];
    const start = new Date(dateStart);
    const end = new Date(dateEnd);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      dates.push(d.toISOString().split('T')[0]);
    }
    try {
      await bulkAvailability({ roomId: selectedRoom, dates, isAvailable });
      refresh();
      alert('Ketersediaan berhasil diperbarui');
    } catch { alert('Gagal memperbarui ketersediaan'); }
  };

  return (
    <div>
      <div className="tenant-form">
        <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 16px' }}>Atur Ketersediaan</h3>
        <div className="tenant-form-grid">
          <div className="tenant-form-group">
            <label>Dari Tanggal</label>
            <input type="date" value={dateStart} onChange={(e) => setDateStart(e.target.value)} />
          </div>
          <div className="tenant-form-group">
            <label>Sampai Tanggal</label>
            <input type="date" value={dateEnd} onChange={(e) => setDateEnd(e.target.value)} />
          </div>
        </div>
        <div className="tenant-form-group" style={{ marginBottom: 12 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <input type="checkbox" checked={isAvailable} onChange={(e) => setIsAvailable(e.target.checked)} />
            <span>Tersedia</span>
          </label>
        </div>
        <button className="btn-tenant btn-tenant-primary" onClick={handleBulk}>Simpan Ketersediaan</button>
      </div>

      <div className="tenant-card" style={{ padding: 0 }}>
        <div className="tenant-table-wrap">
          <table className="tenant-table">
            <thead><tr><th>Tanggal</th><th>Status</th></tr></thead>
            <tbody>
              {paged.map((a) => (
                <tr key={a.id}>
                  <td>{new Date(a.date).toLocaleDateString('id-ID')}</td>
                  <td><span className={`badge ${a.isAvailable ? 'badge-green' : 'badge-red'}`}>{a.isAvailable ? 'Tersedia' : 'Tidak Tersedia'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
          <TenantPagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </div>
    </div>
  );
}
