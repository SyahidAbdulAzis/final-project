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
import { showToast } from '../../../../components/common/Toast.js';

const PAGE_SIZE = 10;
const EMPTY_META = { page: 1, take: PAGE_SIZE, total: 0, totalPages: 1 };

interface PropertyData {
  id: string;
  name: string;
  city: string;
  address: string;
  description: string;
  categoryId: string;
  category?: { id: string; name: string };
  rooms?: { id: string }[];
  images: { url: string }[];
}

interface PropertyForm {
  name: string;
  city: string;
  address: string;
  description: string;
  categoryId: string;
  images: string[];
}

export function TenantPropertiesPage() {
  const [properties, setProperties] = useState<PropertyData[]>([]);
  const [meta, setMeta] = useState(EMPTY_META);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<PropertyForm>({
    name: '', city: '', address: '', description: '', categoryId: '', images: [],
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
    getCategories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const loadData = (p = page) => {
    setLoading(true);
    getTenantProperties(p, PAGE_SIZE)
      .then((res) => { setProperties(res?.data ?? []); setMeta(res?.meta ?? EMPTY_META); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadData(page); }, [page]);

  const resetForm = () => {
    setForm({ name: '', city: '', address: '', description: '', categoryId: '', images: [] });
    setEditingId(null);
    setShowForm(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1 * 1024 * 1024) { showToast('Ukuran gambar maksimal 1MB', 'error'); return; }
    const previewUrl = URL.createObjectURL(file);
    setForm((f) => ({ ...f, images: [...f.images, previewUrl] }));
    e.target.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setUploadingImage(true);
      
      // Upload images to Cloudinary first
      const cloudinaryUrls: string[] = [];
      for (const img of form.images) {
        if (img.startsWith('blob:')) {
          // This is a blob URL, need to upload to Cloudinary
          const file = await fetch(img).then(r => r.blob());
          const url = await uploadImage(new File([file], 'image.jpg'));
          cloudinaryUrls.push(url);
        } else {
          // Already a Cloudinary URL, keep as is
          cloudinaryUrls.push(img);
        }
      }
      
      const formWithCloudinaryUrls = { ...form, images: cloudinaryUrls };
      
      if (editingId) {
        await updateProperty(editingId, formWithCloudinaryUrls);
      } else {
        await createProperty(formWithCloudinaryUrls);
      }
      resetForm();
      loadData(1);
      setPage(1);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } }; message?: string };
      const msg = e?.response?.data?.message || e?.message || 'Gagal menyimpan properti';
      showToast(msg, 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleEdit = (p: PropertyData) => {
    setForm({
      name: p.name,
      city: p.city,
      address: p.address,
      description: p.description,
      categoryId: p.categoryId,
      images: p.images.map((img) => img.url),
    });
    setEditingId(p.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus properti ini?')) return;
    try {
      await deleteProperty(id);
      loadData(page);
      showToast('Properti berhasil dihapus', 'success');
    } catch {
      showToast('Gagal menghapus properti', 'error');
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
              <label className="btn-tenant btn-tenant-secondary tenant-upload-label">
                {uploadingImage ? 'Mengupload...' : '+ Upload Gambar'}
                <input type="file" accept=".jpg,.jpeg,.png,.gif" hidden disabled={uploadingImage} onChange={handleImageUpload} />
              </label>
              <div className="tenant-upload-grid">
                {form.images.map((url, i) => (
                  <div key={i} className="tenant-upload-thumb">
                    <img src={url} alt="" />
                    <button type="button" onClick={() => setForm((f) => ({ ...f, images: f.images.filter((_, idx) => idx !== i) }))}
                      className="tenant-upload-remove">×</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="tenant-form-actions">
            <button type="button" className="btn-tenant btn-tenant-secondary" onClick={resetForm}>Batal</button>
            <button type="submit" className="btn-tenant btn-tenant-primary">Simpan</button>
          </div>
        </form>
      )}

      {properties.length === 0 && !loading ? (
        <div className="tenant-card">
          <div className="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            <h3>Belum Ada Properti</h3>
            <p>Anda belum menambahkan properti. Mulai dengan menambah properti pertama Anda.</p>
            <button type="button" className="btn-primary" onClick={() => setShowForm(true)}>
              + Tambah Properti
            </button>
          </div>
        </div>
      ) : (
        <div className="tenant-card tenant-card--flush">
          <div className="tenant-table-wrap">
            <table className="tenant-table">
              <thead>
                <tr>
                  <th>Nama</th>
                  <th>Kota</th>
                  <th>Kategori</th>
                  <th>Kamar</th>
                  <th className="tenant-table-action">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {properties.map((p) => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td>{p.city}</td>
                    <td>{p.category?.name}</td>
                    <td>{p.rooms?.length || 0}</td>
                    <td className="tenant-table-action">
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
      )}
    </TenantLayout>
  );
}