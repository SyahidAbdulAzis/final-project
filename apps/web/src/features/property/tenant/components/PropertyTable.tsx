import { TenantPagination } from '../../../../components/common/TenantPagination.js';

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

interface PropertyTableProps {
  properties: PropertyData[];
  meta: { page: number; totalPages: number };
  loading: boolean;
  onPageChange: (page: number) => void;
  onEdit: (p: PropertyData) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
}

export function PropertyTable({ properties, meta, loading, onPageChange, onEdit, onDelete, onAdd }: PropertyTableProps) {
  if (properties.length === 0 && !loading) {
    return (
      <div className="tenant-card">
        <div className="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <h3>Belum Ada Properti</h3>
          <p>Anda belum menambahkan properti. Mulai dengan menambah properti pertama Anda.</p>
          <button type="button" className="btn-primary" onClick={onAdd}>+ Tambah Properti</button>
        </div>
      </div>
    );
  }

  return (
    <div className="tenant-card tenant-card--flush">
      <div className="tenant-table-wrap">
        <table className="tenant-table">
          <thead>
            <tr><th>Nama</th><th>Kota</th><th>Kategori</th><th>Kamar</th><th className="tenant-table-action">Aksi</th></tr>
          </thead>
          <tbody>
            {properties.map((p) => (
              <tr key={p.id}>
                <td>{p.name}</td><td>{p.city}</td><td>{p.category?.name}</td><td>{p.rooms?.length || 0}</td>
                <td className="tenant-table-action">
                  <button className="btn-tenant btn-tenant-ghost" onClick={() => onEdit(p)}>Edit</button>
                  <button className="btn-tenant btn-tenant-danger" onClick={() => onDelete(p.id)}>Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <TenantPagination page={meta.page} totalPages={meta.totalPages} onPageChange={onPageChange} />
      </div>
    </div>
  );
}
