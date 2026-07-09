import { useState, useEffect } from 'react';
import { TenantLayout } from '../components/TenantLayout.js';
import { PropertyForm } from '../components/PropertyForm.js';
import { PropertyTable } from '../components/PropertyTable.js';
import { getTenantProperties, getCategories, createProperty, updateProperty, deleteProperty } from '../../services/propertyApi.js';
import { uploadImage } from '../../services/uploadApi.js';
import { showToast } from '../../../../components/common/Toast.js';

const PAGE_SIZE = 10;
const EMPTY_META = { page: 1, take: PAGE_SIZE, total: 0, totalPages: 1 };

interface PropertyData { id: string; name: string; city: string; address: string; description: string; categoryId: string; category?: { id: string; name: string }; rooms?: { id: string }[]; images: { url: string }[]; }
interface PropertyFormState { name: string; city: string; address: string; description: string; categoryId: string; images: string[]; }

export function TenantPropertiesPage() {
  const [properties, setProperties] = useState<PropertyData[]>([]);
  const [meta, setMeta] = useState(EMPTY_META);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<PropertyFormState>({ name: '', city: '', address: '', description: '', categoryId: '', images: [] });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => { loadData(); getCategories().then(setCategories).catch(() => {}); }, []);
  useEffect(() => { window.scrollTo(0, 0); }, []);
  useEffect(() => { loadData(page); }, [page]);

  const loadData = (p = page) => {
    setLoading(true);
    getTenantProperties(p, PAGE_SIZE)
      .then((res) => { setProperties(res?.data ?? []); setMeta(res?.meta ?? EMPTY_META); })
      .catch(() => {}).finally(() => setLoading(false));
  };

  const resetForm = () => { setForm({ name: '', city: '', address: '', description: '', categoryId: '', images: [] }); setEditingId(null); setShowForm(false); };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1 * 1024 * 1024) { showToast('Ukuran gambar maksimal 1MB', 'error'); return; }
    setForm((f) => ({ ...f, images: [...f.images, URL.createObjectURL(file)] }));
    e.target.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setUploadingImage(true);
      const cloudinaryUrls: string[] = [];
      for (const img of form.images) {
        if (img.startsWith('blob:')) {
          const file = await fetch(img).then(r => r.blob());
          cloudinaryUrls.push(await uploadImage(new File([file], 'image.jpg')));
        } else { cloudinaryUrls.push(img); }
      }
      const payload = { ...form, images: cloudinaryUrls };
      if (editingId) await updateProperty(editingId, payload);
      else await createProperty(payload);
      resetForm(); loadData(1); setPage(1);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } }; message?: string };
      showToast(e?.response?.data?.message || e?.message || 'Gagal menyimpan properti', 'error');
    } finally { setUploadingImage(false); }
  };

  const handleEdit = (p: PropertyData) => {
    setForm({ name: p.name, city: p.city, address: p.address, description: p.description, categoryId: p.categoryId, images: p.images.map((img) => img.url) });
    setEditingId(p.id); setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus properti ini?')) return;
    try { await deleteProperty(id); loadData(page); showToast('Properti berhasil dihapus', 'success'); }
    catch { showToast('Gagal menghapus properti', 'error'); }
  };

  return (
    <TenantLayout>
      <div className="tenant-card-header">
        <h2>Daftar Properti</h2>
        <button className="btn-tenant btn-tenant-primary" onClick={() => { resetForm(); setShowForm(true); }}>+ Tambah Properti</button>
      </div>
      {showForm && <PropertyForm form={form} setForm={setForm} categories={categories} uploading={uploadingImage} onSubmit={handleSubmit} onCancel={resetForm} onImageUpload={handleImageUpload} />}
      <PropertyTable properties={properties} meta={meta} loading={loading} onPageChange={setPage} onEdit={handleEdit} onDelete={handleDelete} onAdd={() => setShowForm(true)} />
    </TenantLayout>
  );
}