import { Link } from 'react-router-dom';
import type { PropertyItem } from '../../../types/property';
import { formatRupiah } from '../../../lib/utils';

type Props = {
  loading: boolean;
  items: PropertyItem[];
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
};

function Card({ item }: { item: PropertyItem }) {
  const isGuestChoice = item.rating && item.rating >= 4.8;
  return (
    <Link to={`/properties/${item.id}`} className="card-link">
      <article className="card">
        <div className="card-media">
          <img
            src={item.imageUrl}
            alt={item.name}
            onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-property.svg'; }}
          />
          {isGuestChoice && <span className="card-badge">Pilihan Tamu</span>}
          <button className="card-favorite" aria-label="Tambahkan ke Favorit" onClick={(e) => e.preventDefault()}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
        </div>
        <div className="card-body">
          <h3>{item.name}</h3>
          <p className="card-location">{item.city}</p>
          <p className="card-meta">{item.category}</p>
          <p className="card-price">{formatRupiah(item.price)} / malam</p>
          {item.rating && (
            <p className="card-rating">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              {item.rating}
            </p>
          )}
        </div>
      </article>
    </Link>
  );
}

function Skeleton() {
  return (
    <div className="property-grid">
      {Array.from({ length: 4 }).map((_, i) => (
        <article key={i} className="card skeleton">
          <div className="card-media skeleton-media" />
          <div className="card-body skeleton-body">
            <div className="skeleton-line short" />
            <div className="skeleton-line" />
            <div className="skeleton-line half" />
          </div>
        </article>
      ))}
    </div>
  );
}

function Pagination({ page, totalPages, onPageChange }: { page: number; totalPages: number; onPageChange: (page: number) => void }) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  return (
    <div className="pagination">
      <button className="pagination-btn" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
        Sebelumnya
      </button>
      <div className="pagination-pages">
        {pages.map((p) => (
          <button
            key={p}
            className={`pagination-page${p === page ? ' pagination-page--active' : ''}`}
            onClick={() => onPageChange(p)}
          >
            {p}
          </button>
        ))}
      </div>
      <button className="pagination-btn" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
        Berikutnya
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
      </button>
    </div>
  );
}

export function PropertyList({ loading, items, page = 1, totalPages = 1, onPageChange }: Props) {
  return (
    <div className="property-list">
      {loading && <Skeleton />}
      {!loading && items.length === 0 && (
        <p className="empty-state">Belum ada properti yang tersedia.</p>
      )}
      {!loading && items.length > 0 && (
        <>
          <div className="property-grid">
            {items.map((item) => (
              <Card key={item.id} item={item} />
            ))}
          </div>
          {totalPages > 1 && (
            <Pagination page={page} totalPages={totalPages} onPageChange={onPageChange || (() => {})} />
          )}
        </>
      )}
    </div>
  );
}
