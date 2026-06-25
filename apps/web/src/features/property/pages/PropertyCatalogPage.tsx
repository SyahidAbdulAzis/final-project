import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { getProperties, getCategories } from '../services/propertyApi.js';
import { Navbar } from '../../../components/common/Navbar.js';
import { Footer } from '../../../components/common/Footer.js';

interface ReviewItem {
  rating: number;
  comment: string;
}

interface PropertyItem {
  id: string;
  name: string;
  city: string;
  category: string;
  description: string;
  price: number;
  imageUrl: string;
  available: boolean;
  rating?: number;
  reviewCount: number;
  reviews: ReviewItem[];
}

interface Meta {
  page: number;
  take: number;
  total: number;
  totalPages: number;
}

export function PropertyCatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState<PropertyItem[]>([]);
  const [meta, setMeta] = useState<Meta>({ page: 1, take: 6, total: 0, totalPages: 1 });
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);

  const page = Number(searchParams.get('page') || '1');
  const city = searchParams.get('city') || 'Semua';
  const name = searchParams.get('name') || '';
  const category = searchParams.get('category') || 'Semua';
  const sortBy = searchParams.get('sortBy') || 'name';
  const order = searchParams.get('order') || 'asc';
  const checkIn = searchParams.get('checkIn') || '';
  const checkOut = searchParams.get('checkOut') || '';
  const guests = Number(searchParams.get('guests') || '1');

  useEffect(() => {
    getCategories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    getProperties({ page, take: 12, city, name, category, sortBy, order, checkIn, checkOut, guests })
      .then((res) => {
        setItems(res.data || []);
        setMeta(res.meta || { page: 1, take: 12, total: 0, totalPages: 1 });
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [page, city, name, category, sortBy, order, checkIn, checkOut, guests]);

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    next.set(key, value);
    if (key !== 'page') next.set('page', '1');
    setSearchParams(next);
  };

  return (
    <div className="layout">
      <Navbar />
      <main style={{ maxWidth: 1360, margin: '0 auto', padding: '28px 32px' }}>
        <div className="tenant-page-header">
          <h1>Katalog Properti</h1>
          <p>Temukan tempat menginap terbaik</p>
        </div>

        <div className="tenant-filter-bar">
          <input
            type="text"
            placeholder="Cari nama properti..."
            value={name}
            onChange={(e) => updateParam('name', e.target.value)}
          />
          <select value={city} onChange={(e) => updateParam('city', e.target.value)}>
            <option value="Semua">Semua Kota</option>
            <option value="Jakarta">Jakarta</option>
            <option value="Bali">Bali</option>
            <option value="Bandung">Bandung</option>
            <option value="Yogyakarta">Yogyakarta</option>
            <option value="Surabaya">Surabaya</option>
          </select>
          <select value={category} onChange={(e) => updateParam('category', e.target.value)}>
            <option value="Semua">Semua Kategori</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>
          <select value={`${sortBy}-${order}`} onChange={(e) => {
            const [sb, ord] = e.target.value.split('-');
            const next = new URLSearchParams(searchParams);
            next.set('sortBy', sb);
            next.set('order', ord);
            next.set('page', '1');
            setSearchParams(next);
          }}>
            <option value="name-asc">Nama (A-Z)</option>
            <option value="name-desc">Nama (Z-A)</option>
            <option value="price-asc">Harga (Termurah)</option>
            <option value="price-desc">Harga (Termahal)</option>
          </select>
        </div>

        {loading ? (
          <p style={{ color: 'var(--muted)' }}>Memuat...</p>
        ) : items.length === 0 ? (
          <p style={{ color: 'var(--muted)' }}>Tidak ada properti yang tersedia.</p>
        ) : (
          <div className="catalog-grid">
            {items.map((item) => (
              <Link to={`/properties/${item.id}`} key={item.id} className="catalog-card">
                <div className="catalog-card-image" style={{ backgroundImage: item.imageUrl ? `url(${item.imageUrl})` : undefined }} />
                <div className="catalog-card-body">
                  <div className="catalog-card-title">{item.name}</div>
                  <div className="catalog-card-meta">{item.city} · {item.category}</div>
                  <div className="catalog-card-rating" style={{ fontSize: '0.85rem', color: '#f5a623', marginBottom: 4 }}>
                    {item.rating ? (
                      <span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ verticalAlign: 'middle', marginRight: 2 }}>
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                        {item.rating} ({item.reviewCount})
                      </span>
                    ) : (
                      <span style={{ color: 'var(--muted)' }}>Belum ada rating</span>
                    )}
                  </div>
                  {item.reviews.length > 0 && (
                    <div style={{ marginTop: 6, borderTop: '1px solid var(--border)', paddingTop: 6 }}>
                      {item.reviews.slice(0, 2).map((rev, i) => (
                        <div key={i} style={{ fontSize: '0.78rem', color: 'var(--text)', marginBottom: 4, lineHeight: 1.4 }}>
                          <span style={{ color: '#f5a623' }}>
                            {'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}
                          </span>
                          <span style={{ color: 'var(--muted)', marginLeft: 4 }}>— {rev.comment}</span>
                        </div>
                      ))}
                      {item.reviews.length > 2 && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>+{item.reviews.length - 2} ulasan lainnya</div>
                      )}
                    </div>
                  )}
                  <div className="catalog-card-price">
                    Rp {item.price.toLocaleString('id-ID')} <span>/malam</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {meta.totalPages > 1 && (
          <div className="tenant-pagination">
            {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                className={p === page ? 'active' : ''}
                onClick={() => updateParam('page', String(p))}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
