import { useState, useEffect } from 'react';
import { bulkAvailability, getAvailabilities } from '../../services/propertyApi.js';
import { TenantPagination } from '../../../../components/common/TenantPagination.js';
import { showToast } from '../../../../components/common/Toast.js';

const PAGE_SIZE = 10;
const EMPTY_META = { page: 1, take: PAGE_SIZE, total: 0, totalPages: 1 };

interface Availability {
  id: string;
  roomId: string;
  date: string;
  isAvailable: boolean;
}

interface Props {
  selectedRoom: string;
}

export function AvailabilityTab({ selectedRoom }: Props) {
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  const [page, setPage] = useState(1);
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [meta, setMeta] = useState(EMPTY_META);

  const loadData = (p = page) => {
    getAvailabilities(selectedRoom, p, PAGE_SIZE)
      .then((res) => { setAvailabilities(res?.data ?? []); setMeta(res?.meta ?? EMPTY_META); })
      .catch(() => {});
  };

  useEffect(() => { setPage(1); }, [selectedRoom]);

  useEffect(() => { if (selectedRoom) loadData(page); }, [selectedRoom, page]);

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
      loadData(page);
      showToast('Ketersediaan berhasil diperbarui', 'success');
    } catch { showToast('Gagal memperbarui ketersediaan', 'error'); }
  };

  return (
    <div>
      <div className="tenant-form">
        <h3 className="tenant-form-header">Atur Ketersediaan</h3>
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
        <div className="tenant-form-group tenant-form-group--tight">
          <label className="tenant-checkbox-label">
            <input type="checkbox" checked={isAvailable} onChange={(e) => setIsAvailable(e.target.checked)} />
            <span>Tersedia</span>
          </label>
        </div>
        <button className="btn-tenant btn-tenant-primary" onClick={handleBulk}>Simpan Ketersediaan</button>
      </div>

      <div className="tenant-card tenant-card--flush">
        <div className="tenant-table-wrap">
          <table className="tenant-table">
            <thead><tr><th>Tanggal</th><th>Status</th></tr></thead>
            <tbody>
              {availabilities.map((a) => (
                <tr key={a.id}>
                  <td>{new Date(a.date).toLocaleDateString('id-ID')}</td>
                  <td><span className={`badge ${a.isAvailable ? 'badge-green' : 'badge-red'}`}>{a.isAvailable ? 'Tersedia' : 'Tidak Tersedia'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
          <TenantPagination page={meta.page} totalPages={meta.totalPages} onPageChange={setPage} />
        </div>
      </div>
    </div>
  );
}
