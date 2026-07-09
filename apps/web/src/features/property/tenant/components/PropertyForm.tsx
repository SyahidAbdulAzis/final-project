import { Dropdown } from '../../../../components/common/Dropdown.js';
import { showToast } from '../../../../components/common/Toast.js';

interface PropertyFormProps {
  form: { name: string; city: string; address: string; description: string; categoryId: string; images: string[] };
  setForm: React.Dispatch<React.SetStateAction<{ name: string; city: string; address: string; description: string; categoryId: string; images: string[] }>>;
  categories: { id: string; name: string }[];
  uploading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function PropertyForm({ form, setForm, categories, uploading, onSubmit, onCancel, onImageUpload }: PropertyFormProps) {
  return (
    <form onSubmit={onSubmit} className="tenant-form">
      <div className="tenant-form-grid">
        <div className="tenant-form-group">
          <label>Nama Properti</label>
          <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
        </div>
        <div className="tenant-form-group">
          <label>Kota</label>
          <Dropdown
            value={form.city}
            options={[
              { value: '', label: 'Pilih kota' },
              { value: 'Jakarta', label: 'Jakarta' },
              { value: 'Bali', label: 'Bali' },
              { value: 'Bandung', label: 'Bandung' },
              { value: 'Yogyakarta', label: 'Yogyakarta' },
              { value: 'Surabaya', label: 'Surabaya' },
            ]}
            onChange={(v) => setForm((f) => ({ ...f, city: v }))}
            variant="pill"
          />
        </div>
        <div className="tenant-form-group full">
          <label>Alamat</label>
          <input value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} required />
        </div>
        <div className="tenant-form-group">
          <label>Kategori</label>
          <Dropdown value={form.categoryId} options={[{ value: '', label: 'Pilih kategori' }, ...categories.map((c) => ({ value: c.id, label: c.name }))]} onChange={(v) => setForm((f) => ({ ...f, categoryId: v }))} variant="pill" />
        </div>
        <div className="tenant-form-group full">
          <label>Deskripsi</label>
          <textarea rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
        </div>
        <div className="tenant-form-group full">
          <label>Foto Properti</label>
          <label className="btn-tenant btn-tenant-secondary tenant-upload-label">
            {uploading ? 'Mengupload...' : '+ Upload Gambar'}
            <input type="file" accept=".jpg,.jpeg,.png,.gif" hidden disabled={uploading} onChange={onImageUpload} />
          </label>
          <div className="tenant-upload-grid">
            {form.images.map((url, i) => (
              <div key={i} className="tenant-upload-thumb">
                <img src={url} alt="" />
                <button type="button" onClick={() => setForm((f) => ({ ...f, images: f.images.filter((_, idx) => idx !== i) }))} className="tenant-upload-remove">×</button>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="tenant-form-actions">
        <button type="button" className="btn-tenant btn-tenant-secondary" onClick={onCancel}>Batal</button>
        <button type="submit" className="btn-tenant btn-tenant-primary">Simpan</button>
      </div>
    </form>
  );
}
