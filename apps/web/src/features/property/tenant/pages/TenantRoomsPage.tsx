import { useState, useEffect } from 'react';
import { TenantLayout } from '../components/TenantLayout.js';
import { getTenantProperties, getRoomsByProperty, createRoom, updateRoom, deleteRoom } from '../../services/propertyApi.js';
import { TenantPagination } from '../../../../components/common/TenantPagination.js';
import { Dropdown } from '../../../../components/common/Dropdown.js';

const PAGE_SIZE = 10;

interface RoomForm {
  propertyId: string;
  name: string;
  description: string;
  basePrice: number;
  maxGuests: number;
}

export function TenantRoomsPage() {
  const [properties, setProperties] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [selectedProperty, setSelectedProperty] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<RoomForm>({ propertyId: '', name: '', description: '', basePrice: 0, maxGuests: 2 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const totalPages = Math.max(1, Math.ceil(rooms.length / PAGE_SIZE));
  const pagedRooms = rooms.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setLoading(true);
    getTenantProperties()
      .then((response) => {
        const props = response.data || [];
        setProperties(props);
        if (props[0]) { setSelectedProperty(props[0].id); }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error loading properties:', err);
        setError('Gagal memuat properti');
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!selectedProperty) return;
    setPage(1);
    setLoading(true);
    getRoomsByProperty(selectedProperty)
      .then((r) => {
        setRooms(r);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error loading rooms:', err);
        setError('Gagal memuat kamar');
        setLoading(false);
      });
  }, [selectedProperty]);

  const resetForm = () => {
    setForm({ propertyId: selectedProperty, name: '', description: '', basePrice: 0, maxGuests: 2 });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) { await updateRoom(editingId, form); }
      else { await createRoom(form); }
      resetForm();
      getRoomsByProperty(selectedProperty).then(setRooms).catch(() => {});
    } catch { alert('Gagal menyimpan kamar'); }
  };

  const handleEdit = (r: any) => {
    setForm({ propertyId: r.propertyId, name: r.name, description: r.description, basePrice: r.basePrice, maxGuests: r.maxGuests });
    setEditingId(r.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus kamar ini?')) return;
    try { await deleteRoom(id); getRoomsByProperty(selectedProperty).then(setRooms).catch(() => {}); }
    catch { alert('Gagal menghapus kamar'); }
  };

  if (loading) {
    return (
      <TenantLayout>
        <div style={{ padding: 40, textAlign: 'center' }}>
          <p>Memuat data...</p>
        </div>
      </TenantLayout>
    );
  }

  if (error) {
    return (
      <TenantLayout>
        <div style={{ padding: 40, textAlign: 'center' }}>
          <p style={{ color: '#f44336' }}>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              marginTop: 16,
              padding: '10px 20px',
              borderRadius: 8,
              border: '1px solid var(--primary)',
              background: 'var(--primary)',
              color: '#fff',
              cursor: 'pointer'
            }}
          >
            Reload
          </button>
        </div>
      </TenantLayout>
    );
  }

  return (
    <TenantLayout>
      <div className="tenant-card-header">
        <h2>Daftar Kamar</h2>
        <button className="btn-tenant btn-tenant-primary" onClick={() => { resetForm(); setShowForm(true); }}>
          + Tambah Kamar
        </button>
      </div>

      <div style={{ maxWidth: 300, marginBottom: 16 }}>
        <Dropdown
          label="Properti"
          value={selectedProperty}
          options={properties.map((p) => ({ value: p.id, label: p.name }))}
          onChange={(value) => setSelectedProperty(value)}
          variant="pill"
        />
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="tenant-form">
          <div className="tenant-form-grid">
            <div className="tenant-form-group">
              <label>Nama Kamar</label>
              <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
            </div>
            <div className="tenant-form-group">
              <label>Harga Dasar (Rp)</label>
              <input type="number" value={form.basePrice} onChange={(e) => setForm((f) => ({ ...f, basePrice: Number(e.target.value) }))} required />
            </div>
            <div className="tenant-form-group">
              <label>Maksimal Tamu</label>
              <input type="number" value={form.maxGuests} onChange={(e) => setForm((f) => ({ ...f, maxGuests: Number(e.target.value) }))} required />
            </div>
            <div className="tenant-form-group full">
              <label>Deskripsi</label>
              <textarea rows={2} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" className="btn-tenant btn-tenant-secondary" onClick={resetForm}>Batal</button>
            <button type="submit" className="btn-tenant btn-tenant-primary">Simpan</button>
          </div>
        </form>
      )}

      <div className="tenant-card" style={{ padding: 0 }}>
        <div className="tenant-table-wrap">
          <table className="tenant-table">
            <thead>
              <tr>
                <th>Nama</th>
                <th>Harga</th>
                <th>Max Tamu</th>
                <th style={{ textAlign: 'right' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {pagedRooms.map((r) => (
                <tr key={r.id}>
                  <td>{r.name}</td>
                  <td>Rp {r.basePrice.toLocaleString('id-ID')}</td>
                  <td>{r.maxGuests}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="btn-tenant btn-tenant-ghost" onClick={() => handleEdit(r)}>Edit</button>
                    <button className="btn-tenant btn-tenant-danger" onClick={() => handleDelete(r.id)}>Hapus</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <TenantPagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </div>
    </TenantLayout>
  );
}
