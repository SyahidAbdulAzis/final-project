interface RoomFormProps {
  form: { propertyId: string; name: string; description: string; basePrice: number; maxGuests: number };
  setForm: React.Dispatch<React.SetStateAction<{ propertyId: string; name: string; description: string; basePrice: number; maxGuests: number }>>;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export function RoomForm({ form, setForm, onSubmit, onCancel }: RoomFormProps) {
  return (
    <form onSubmit={onSubmit} className="tenant-form">
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
      <div className="tenant-form-actions">
        <button type="button" className="btn-tenant btn-tenant-secondary" onClick={onCancel}>Batal</button>
        <button type="submit" className="btn-tenant btn-tenant-primary">Simpan</button>
      </div>
    </form>
  );
}
