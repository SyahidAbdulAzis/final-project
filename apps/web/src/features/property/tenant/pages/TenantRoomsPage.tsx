import { useState, useEffect } from 'react';
import { TenantLayout } from '../components/TenantLayout.js';
import { RoomForm } from '../components/RoomForm.js';
import { RoomTable } from '../components/RoomTable.js';
import { getTenantProperties, getRoomsByProperty, createRoom, updateRoom, deleteRoom } from '../../services/propertyApi.js';
import { Dropdown } from '../../../../components/common/Dropdown.js';
import { showToast } from '../../../../components/common/Toast.js';

const PAGE_SIZE = 10;
const EMPTY_META = { page: 1, take: PAGE_SIZE, total: 0, totalPages: 1 };

interface Property { id: string; name: string; }
interface Room { id: string; propertyId: string; name: string; description: string; basePrice: number; maxGuests: number; }
interface RoomFormState { propertyId: string; name: string; description: string; basePrice: number; maxGuests: number; }

export function TenantRoomsPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [meta, setMeta] = useState(EMPTY_META);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('createdAt');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedProperty, setSelectedProperty] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<RoomFormState>({ propertyId: '', name: '', description: '', basePrice: 0, maxGuests: 2 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTenantProperties()
      .then((res) => {
        const props = res.data || [];
        setProperties(props);
        if (props[0]) setSelectedProperty(props[0].id);
        else setLoading(false);
      })
      .catch(() => { setLoading(false); showToast('Gagal memuat properti', 'error'); });
  }, []);

  useEffect(() => { window.scrollTo(0, 0); }, []);
  useEffect(() => { if (selectedProperty) setPage(1); }, [selectedProperty]);

  useEffect(() => {
    if (!selectedProperty) return;
    setLoading(true);
    getRoomsByProperty(selectedProperty, page, PAGE_SIZE, sortBy, order)
      .then((res) => { setRooms(res?.data ?? []); setMeta(res?.meta ?? EMPTY_META); setLoading(false); })
      .catch(() => { setLoading(false); showToast('Gagal memuat kamar', 'error'); });
  }, [selectedProperty, page, sortBy, order]);

  const resetForm = () => {
    setForm({ propertyId: selectedProperty, name: '', description: '', basePrice: 0, maxGuests: 2 });
    setEditingId(null); setShowForm(false);
  };

  const refreshRooms = () => {
    getRoomsByProperty(selectedProperty, page, PAGE_SIZE, sortBy, order)
      .then((res) => { setRooms(res?.data ?? []); setMeta(res?.meta ?? EMPTY_META); })
      .catch(() => {});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) await updateRoom(editingId, form);
      else await createRoom(form);
      resetForm(); refreshRooms();
    } catch { showToast('Gagal menyimpan kamar', 'error'); }
  };

  const handleEdit = (r: Room) => {
    setForm({ propertyId: r.propertyId, name: r.name, description: r.description, basePrice: r.basePrice, maxGuests: r.maxGuests });
    setEditingId(r.id); setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus kamar ini?')) return;
    try { await deleteRoom(id); refreshRooms(); showToast('Kamar berhasil dihapus', 'success'); }
    catch { showToast('Gagal menghapus kamar', 'error'); }
  };

  if (loading) return <TenantLayout><div className="tenant-loading"><p>Memuat data...</p></div></TenantLayout>;

  return (
    <TenantLayout>
      <div className="tenant-card-header">
        <h2>Daftar Kamar</h2>
        <button className="btn-tenant btn-tenant-primary" onClick={() => { resetForm(); setShowForm(true); }}>+ Tambah Kamar</button>
      </div>
      <div className="tenant-dropdown-row">
        <Dropdown label="Properti" value={selectedProperty} options={properties.map((p) => ({ value: p.id, label: p.name }))} onChange={setSelectedProperty} variant="pill" />
        <Dropdown label="Urutkan" value={`${sortBy}-${order}`} options={[
          { value: 'createdAt-desc', label: 'Terbaru' }, { value: 'createdAt-asc', label: 'Terlama' },
          { value: 'name-asc', label: 'Nama (A-Z)' }, { value: 'name-desc', label: 'Nama (Z-A)' },
          { value: 'basePrice-asc', label: 'Harga (Termurah)' }, { value: 'basePrice-desc', label: 'Harga (Termahal)' },
        ]} onChange={(v) => { const [sb, ord] = v.split('-'); setSortBy(sb); setOrder(ord as 'asc' | 'desc'); setPage(1); }} variant="pill" />
      </div>
      {showForm && <RoomForm form={form} setForm={setForm} onSubmit={handleSubmit} onCancel={resetForm} />}
      <RoomTable rooms={rooms} meta={meta} onPageChange={setPage} onEdit={handleEdit} onDelete={handleDelete} />
    </TenantLayout>
  );
}
