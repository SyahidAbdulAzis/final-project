import { useState, useEffect } from 'react';
import { TenantLayout } from '../components/TenantLayout.js';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../../services/propertyApi.js';

export function TenantCategoriesPage() {
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');

  const load = () => getCategories().then(setCategories).catch(() => {});

  useEffect(() => { load(); }, []);

  const reset = () => { setName(''); setEditingId(null); setShowForm(false); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) await updateCategory(editingId, name);
      else await createCategory(name);
      reset(); load();
    } catch { alert('Gagal menyimpan kategori'); }
  };

  const handleEdit = (c: { id: string; name: string }) => { setName(c.name); setEditingId(c.id); setShowForm(true); };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus kategori ini?')) return;
    try { await deleteCategory(id); load(); } catch { alert('Gagal menghapus kategori'); }
  };

  return (
    <TenantLayout>
      <div className="tenant-card-header">
        <h2>Kategori Properti</h2>
        <button className="btn-tenant btn-tenant-primary" onClick={() => { reset(); setShowForm(true); }}>
          + Tambah Kategori
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="tenant-form">
          <div className="tenant-form-group full">
            <label>Nama Kategori</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <button type="button" className="btn-tenant btn-tenant-secondary" onClick={reset}>Batal</button>
            <button type="submit" className="btn-tenant btn-tenant-primary">Simpan</button>
          </div>
        </form>
      )}

      <div className="tenant-card" style={{ padding: 0 }}>
        <div className="tenant-table-wrap">
          <table className="tenant-table">
            <thead>
              <tr>
                <th>Nama Kategori</th>
                <th style={{ textAlign: 'right' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="btn-tenant btn-tenant-ghost" onClick={() => handleEdit(c)}>Edit</button>
                    <button className="btn-tenant btn-tenant-danger" onClick={() => handleDelete(c.id)}>Hapus</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </TenantLayout>
  );
}
