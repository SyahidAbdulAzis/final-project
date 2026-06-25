import { useState, useEffect } from 'react';
import { TenantLayout } from '../components/TenantLayout.js';
import {
  getTenantProperties,
  getCategories,
  createProperty,
  updateProperty,
  deleteProperty,
} from '../../services/propertyApi.js';
import { uploadImage } from '../../services/uploadApi.js';
import { TenantPagination } from '../../../../components/common/TenantPagination.js';
import { Dropdown } from '../../../../components/common/Dropdown.js';

const PAGE_SIZE = 10;
const EMPTY_META = { page: 1, take: PAGE_SIZE, total: 0, totalPages: 1 };

interface PropertyForm {
  name: string;
  city: string;
  address: string;
  description: string;
  categoryId: string;
  images: string[];
}

export function TenantPropertiesPage() {
  const [properties, setProperties] = useState<any[]>([]);
  const [meta, setMeta] = useState(EMPTY_META);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<PropertyForm>({
    name: '', city: '', address: '', description: '', categoryId: '', images: [],
  });
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    loadData();
    getCategories().then(setCategories).catch(() => {});
  }, []);

  const loadData = (p = page) => {
    getTenantProperties(p, PAGE_SIZE)
      .then((res) => { setProperties(res?.data ?? []); setMeta(res?.meta ?? EMPTY_META); })
      .catch(() => {});
  };

  useEffect(() => { loadData(page); }, [page]);

  const resetForm = () => {
    setForm({ name: '', city: '', address: '', description: '', categoryId: '', images: [] });
    setEditingId(null);
    setShowForm(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1 * 1024 * 1024) { alert('Ukuran gambar maksimal 1MB.'); return; }
    setUploadingImage(true);
    try {
      const url = await uploadImage(file);
      setForm((f) => ({ ...f, images: [...f.images, url] }));
    } catch {
      alert('Gagal mengupload gambar.');
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateProperty(editingId, form);
      } else {
        await createProperty(form);
      }
      resetForm();
      loadData(1);
      setPage(1);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Gagal menyimpan properti';
      alert(msg);
    }
  };

  const handleEdit = (p: any) => {
    setForm({
      name: p.name,
      city: p.city,
      address: p.address,
      description: p.description,
      categoryId: p.categoryId,
      images: p.images.map((img: any) => img.url),
    });
    setEditingId(p.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus properti ini?')) return;
    try {
      await deleteProperty(id);
      loadData(page);
    } catch {
      alert('Gagal menghapus properti');
    }
  };

  return (
    <TenantLayout>
      <div className="tenant-card-header">
        <h2>Daftar Properti</h2>
        <button className="btn-tenant btn-tenant-primary" onClick={() => { resetForm(); setShowForm(true); }}>
          + Tambah Properti
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="tenant-form">
          <div className="tenant-form-grid">
            <div className="tenant-form-group">
              <label>Nama Properti</label>
              <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
            </div>
            <div className="tenant-form-group">
              <label>Kota</label>
              <input value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} required />
            </div>
            <div className="tenant-form-group full">
              <label>Alamat</label>
              <input value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} required />
            </div>
            <div className="tenant-form-group">
              <label>Kategori</label>
              <Dropdown
                value={form.categoryId}
                options={[
                  { value: '', label: 'Pilih kategori' },
                  ...categories.map((c) => ({ value: c.id, label: c.name })),
                ]}
                onChange={(value) => setForm((f) => ({ ...f, categoryId: value }))}
                variant="pill"
              />
            </div>
            <div className="tenant-form-group full">
              <label>Deskripsi</label>
              <textarea rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="tenant-form-group full">
              <label>Foto Properti</label>
              <label className="btn-tenant btn-tenant-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer', width: 'fit-content' }}>
                {uploadingImage ? 'Mengupload...' : '+ Upload Gambar'}
                <input type="file" accept=".jpg,.jpeg,.png,.gif" hidden disabled={uploadingImage} onChange={handleImageUpload} />
              </label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                {form.images.map((url, i) => (
                  <div key={i} style={{ position: 'relative', width: 72, height: 72, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--line)' }}>
                    <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button type="button" onClick={() => setForm((f) => ({ ...f, images: f.images.filter((_, idx) => idx !== i) }))}
                      style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '50%', width: 20, height: 20, cursor: 'pointer', fontSize: '0.75rem', lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                  </div>
                ))}
              </div>
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
                <th>Kota</th>
                <th>Kategori</th>
                <th>Kamar</th>
                <th style={{ textAlign: 'right' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {properties.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>{p.city}</td>
                  <td>{p.category?.name}</td>
                  <td>{p.rooms?.length || 0}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="btn-tenant btn-tenant-ghost" onClick={() => handleEdit(p)}>Edit</button>
                    <button className="btn-tenant btn-tenant-danger" onClick={() => handleDelete(p.id)}>Hapus</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <TenantPagination page={meta.page} totalPages={meta.totalPages} onPageChange={setPage} />
        </div>
      </div>
    </TenantLayout>
  );
}
