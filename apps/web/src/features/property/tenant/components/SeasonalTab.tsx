import { useState, useEffect } from 'react';
import { createSeasonalRate, deleteSeasonalRate, getSeasonalRates } from '../../services/propertyApi.js';
import { TenantPagination } from '../../../../components/common/TenantPagination.js';
import { Dropdown } from '../../../../components/common/Dropdown.js';
import { showToast } from '../../../../components/common/Toast.js';

const PAGE_SIZE = 10;
const EMPTY_META = { page: 1, take: PAGE_SIZE, total: 0, totalPages: 1 };

interface SeasonalRate {
  id: string;
  roomId: string;
  name: string;
  startDate: string;
  endDate: string;
  adjustmentType: 'NOMINAL' | 'PERCENTAGE';
  adjustmentValue: number;
}

interface Props {
  selectedRoom: string;
}

export function SeasonalTab({ selectedRoom }: Props) {
  const [rateName, setRateName] = useState('');
  const [page, setPage] = useState(1);
  const [seasonalRates, setSeasonalRates] = useState<SeasonalRate[]>([]);
  const [meta, setMeta] = useState(EMPTY_META);
  const [rateStart, setRateStart] = useState('');
  const [rateEnd, setRateEnd] = useState('');
  const [rateType, setRateType] = useState<'NOMINAL' | 'PERCENTAGE'>('PERCENTAGE');
  const [rateValue, setRateValue] = useState(0);

  const loadData = (p = page) => {
    getSeasonalRates(selectedRoom, p, PAGE_SIZE)
      .then((res) => { setSeasonalRates(res?.data ?? []); setMeta(res?.meta ?? EMPTY_META); })
      .catch(() => {});
  };

  useEffect(() => { setPage(1); }, [selectedRoom]);

  useEffect(() => { if (selectedRoom) loadData(page); }, [selectedRoom, page]);

  const handleCreate = async () => {
    if (!selectedRoom || !rateName || !rateStart || !rateEnd) return;
    try {
      await createSeasonalRate({ roomId: selectedRoom, name: rateName, startDate: rateStart, endDate: rateEnd, adjustmentType: rateType, adjustmentValue: rateValue });
      loadData(page);
      setRateName(''); setRateStart(''); setRateEnd(''); setRateValue(0);
      showToast('Tarif musim berhasil ditambahkan', 'success');
    } catch { showToast('Gagal menambahkan tarif', 'error'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus tarif ini?')) return;
    try { await deleteSeasonalRate(id); loadData(page); showToast('Tarif berhasil dihapus', 'success'); }
    catch { showToast('Gagal menghapus tarif', 'error'); }
  };

  return (
    <div>
      <div className="tenant-form">
        <h3 className="tenant-form-header">Tambah Tarif Musim</h3>
        <div className="tenant-form-group full">
          <label>Nama Tarif</label>
          <input value={rateName} onChange={(e) => setRateName(e.target.value)} placeholder="e.g. Lebaran 2026" />
        </div>
        <div className="tenant-form-grid">
          <div className="tenant-form-group"><label>Mulai</label><input type="date" value={rateStart} onChange={(e) => setRateStart(e.target.value)} /></div>
          <div className="tenant-form-group"><label>Selesai</label><input type="date" value={rateEnd} onChange={(e) => setRateEnd(e.target.value)} /></div>
          <div className="tenant-form-group">
            <label>Tipe</label>
            <Dropdown
              value={rateType}
              options={[
                { value: 'PERCENTAGE', label: 'Persentase (%)' },
                { value: 'NOMINAL', label: 'Nominal (Rp)' },
              ]}
              onChange={(value) => setRateType(value as 'NOMINAL' | 'PERCENTAGE')}
              variant="pill"
            />
          </div>
          <div className="tenant-form-group"><label>Nilai</label><input type="number" value={rateValue} onChange={(e) => setRateValue(Number(e.target.value))} /></div>
        </div>
        <button className="btn-tenant btn-tenant-primary" onClick={handleCreate}>Tambah Tarif</button>
      </div>

      <div className="tenant-card tenant-card--flush">
        <div className="tenant-table-wrap">
          <table className="tenant-table">
            <thead><tr><th>Nama</th><th>Periode</th><th>Nilai</th><th className="tenant-table-action">Aksi</th></tr></thead>
            <tbody>
              {seasonalRates.map((r) => (
                <tr key={r.id}>
                  <td>{r.name}</td>
                  <td>{new Date(r.startDate).toLocaleDateString('id-ID')} - {new Date(r.endDate).toLocaleDateString('id-ID')}</td>
                  <td>{r.adjustmentType === 'PERCENTAGE' ? `${r.adjustmentValue}%` : `Rp ${r.adjustmentValue.toLocaleString('id-ID')}`}</td>
                  <td className="tenant-table-action"><button className="btn-tenant btn-tenant-danger" onClick={() => handleDelete(r.id)}>Hapus</button></td>
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
