import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getProperties, getCategories } from '../services/propertyApi.js';
import { Navbar } from '../../../components/common/Navbar.js';
import { Footer } from '../../../components/common/Footer.js';
import { PropertyList } from '../components/PropertyList.js';
import { Dropdown } from '../../../components/common/Dropdown.js';
import type { PropertyItem } from '../../../types/property';

export function PropertyCatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState<PropertyItem[]>([]);
  const [meta, setMeta] = useState({ page: 1, take: 12, total: 0, totalPages: 1 });
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

  const [nameDraft, setNameDraft] = useState(name);

  useEffect(() => {
    setNameDraft(name);
  }, [name]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (nameDraft !== name) {
        const next = new URLSearchParams(searchParams);
        next.set('name', nameDraft);
        next.set('page', '1');
        setSearchParams(next);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [nameDraft]);

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
      <main className="page-main catalog-page">
        <div className="catalog-hero">
          <h1>Katalog Properti</h1>
          <p>Temukan tempat menginap terbaik sesuai kebutuhan Anda</p>
        </div>

        <div className="catalog-filter-panel">
          <div className="filter-field">
            <label htmlFor="catalog-name">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              Nama
            </label>
            <input
              id="catalog-name"
              type="text"
              placeholder="Cari nama properti..."
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
            />
          </div>
          <div className="filter-field">
            <Dropdown
              id="catalog-city"
              label="Kota"
              value={city}
              options={[
                { value: 'Semua', label: 'Semua Kota' },
                { value: 'Jakarta', label: 'Jakarta' },
                { value: 'Bali', label: 'Bali' },
                { value: 'Bandung', label: 'Bandung' },
                { value: 'Yogyakarta', label: 'Yogyakarta' },
                { value: 'Surabaya', label: 'Surabaya' },
              ]}
              onChange={(value) => updateParam('city', value)}
              variant="default"
            />
          </div>
          <div className="filter-field">
            <Dropdown
              id="catalog-category"
              label="Kategori"
              value={category}
              options={[
                { value: 'Semua', label: 'Semua Kategori' },
                ...categories.map((c) => ({ value: c.name, label: c.name })),
              ]}
              onChange={(value) => updateParam('category', value)}
              variant="default"
            />
          </div>
          <div className="filter-field">
            <Dropdown
              id="catalog-sort"
              label="Urutkan"
              value={`${sortBy}-${order}`}
              options={[
                { value: 'name-asc', label: 'Nama (A-Z)' },
                { value: 'name-desc', label: 'Nama (Z-A)' },
                { value: 'price-asc', label: 'Harga (Termurah)' },
                { value: 'price-desc', label: 'Harga (Termahal)' },
              ]}
              onChange={(value) => {
                const [sb, ord] = value.split('-');
                const next = new URLSearchParams(searchParams);
                next.set('sortBy', sb);
                next.set('order', ord);
                next.set('page', '1');
                setSearchParams(next);
              }}
              variant="default"
            />
          </div>
        </div>

        <div className="catalog-results">
          {!loading && (
            <p className="catalog-count">
              {meta.total} properti ditemukan
            </p>
          )}
          <PropertyList
            loading={loading}
            items={items}
            page={meta.page}
            totalPages={meta.totalPages}
            onPageChange={(p) => updateParam('page', String(p))}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}
