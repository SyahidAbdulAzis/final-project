import { useState } from 'react';
import { createSeasonalRate, deleteSeasonalRate } from '../../services/propertyApi.js';

interface Props {
  selectedRoom: string;
  seasonalRates: any[];
  refresh: () => void;
}

export function SeasonalTab({ selectedRoom, seasonalRates, refresh }: Props) {
  const [rateName, setRateName] = useState('');
  const [rateStart, setRateStart] = useState('');
  const [rateEnd, setRateEnd] = useState('');
  const [rateType, setRateType] = useState<'NOMINAL' | 'PERCENTAGE'>('PERCENTAGE');
  const [rateValue, setRateValue] = useState(0);

  const handleCreate = async () => {
    if (!selectedRoom || !rateName || !rateStart || !rateEnd) return;
    try {
      await createSeasonalRate({ roomId: selectedRoom, name: rateName, startDate: rateStart, endDate: rateEnd, adjustmentType: rateType, adjustmentValue: rateValue });
      refresh();
      setRateName(''); setRateStart(''); setRateEnd(''); setRateValue(0);
      alert('Tarif musim berhasil ditambahkan');
    } catch { alert('Gagal menambahkan tarif'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus tarif ini?')) return;
    try { await deleteSeasonalRate(id); refresh(); }
    catch { alert('Gagal menghapus tarif'); }
  };

  return (
    <div>
      <div className="tenant-form">
        <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 16px' }}>Tambah Tarif Musim</h3>
        <div className="tenant-form-group full">
          <label>Nama Tarif</label>
          <input value={rateName} onChange={(e) => setRateName(e.target.value)} placeholder="e.g. Lebaran 2026" />
        </div>
        <div className="tenant-form-grid">
          <div className="tenant-form-group"><label>Mulai</label><input type="date" value={rateStart} onChange={(e) => setRateStart(e.target.value)} /></div>
          <div className="tenant-form-group"><label>Selesai</label><input type="date" value={rateEnd} onChange={(e) => setRateEnd(e.target.value)} /></div>
          <div className="tenant-form-group">
            <label>Tipe</label>
            <select value={rateType} onChange={(e) => setRateType(e.target.value as 'NOMINAL' | 'PERCENTAGE')}>
              <option value="PERCENTAGE">Persentase (%)</option>
              <option value="NOMINAL">Nominal (Rp)</option>
            </select>
          </div>
          <div className="tenant-form-group"><label>Nilai</label><input type="number" value={rateValue} onChange={(e) => setRateValue(Number(e.target.value))} /></div>
        </div>
        <button className="btn-tenant btn-tenant-primary" onClick={handleCreate}>Tambah Tarif</button>
      </div>

      <div className="tenant-card" style={{ padding: 0 }}>
        <div className="tenant-table-wrap">
          <table className="tenant-table">
            <thead><tr><th>Nama</th><th>Periode</th><th>Nilai</th><th style={{ textAlign: 'right' }}>Aksi</th></tr></thead>
            <tbody>
              {seasonalRates.map((r) => (
                <tr key={r.id}>
                  <td>{r.name}</td>
                  <td>{new Date(r.startDate).toLocaleDateString('id-ID')} - {new Date(r.endDate).toLocaleDateString('id-ID')}</td>
                  <td>{r.adjustmentType === 'PERCENTAGE' ? `${r.adjustmentValue}%` : `Rp ${r.adjustmentValue.toLocaleString('id-ID')}`}</td>
                  <td style={{ textAlign: 'right' }}><button className="btn-tenant btn-tenant-danger" onClick={() => handleDelete(r.id)}>Hapus</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
