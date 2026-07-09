import { TenantPagination } from '../../../../components/common/TenantPagination.js';

interface Room {
  id: string;
  propertyId: string;
  name: string;
  description: string;
  basePrice: number;
  maxGuests: number;
}

interface RoomTableProps {
  rooms: Room[];
  meta: { page: number; totalPages: number };
  onPageChange: (page: number) => void;
  onEdit: (room: Room) => void;
  onDelete: (id: string) => void;
}

export function RoomTable({ rooms, meta, onPageChange, onEdit, onDelete }: RoomTableProps) {
  return (
    <div className="tenant-card tenant-card--flush">
      <div className="tenant-table-wrap">
        <table className="tenant-table">
          <thead>
            <tr>
              <th>Nama</th>
              <th>Harga</th>
              <th>Max Tamu</th>
              <th className="tenant-table-action">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {rooms.map((r) => (
              <tr key={r.id}>
                <td>{r.name}</td>
                <td>Rp {r.basePrice.toLocaleString('id-ID')}</td>
                <td>{r.maxGuests}</td>
                <td className="tenant-table-action">
                  <button className="btn-tenant btn-tenant-ghost" onClick={() => onEdit(r)}>Edit</button>
                  <button className="btn-tenant btn-tenant-danger" onClick={() => onDelete(r.id)}>Hapus</button>
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
