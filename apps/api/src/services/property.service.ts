import type { PropertyItem, PropertyQuery } from '../types/property.type.js';

const properties: PropertyItem[] = [
  { id: 1, name: 'Mentari Suites', city: 'Jakarta', category: 'Apartment', description: 'Dekat pusat bisnis', price: 550000, imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200', available: true },
  { id: 2, name: 'Braga Urban Stay', city: 'Bandung', category: 'Hotel', description: 'Area wisata kuliner', price: 430000, imageUrl: 'https://images.unsplash.com/photo-1468824357306-a439d58ccb1c?w=1200', available: true },
  { id: 3, name: 'Laut Biru Residence', city: 'Bali', category: 'Villa', description: 'Dekat pantai', price: 920000, imageUrl: 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=1200', available: true },
  { id: 4, name: 'Malioboro Nook', city: 'Yogyakarta', category: 'Guest House', description: 'Dekat pusat kota', price: 360000, imageUrl: 'https://images.unsplash.com/photo-1496417263034-38ec4f0b665a?w=1200', available: true },
  { id: 5, name: 'Tunjungan Corner', city: 'Surabaya', category: 'Apartment', description: 'Akses transport mudah', price: 480000, imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200', available: true },
  { id: 6, name: 'Batu Highland Lodge', city: 'Malang', category: 'Villa', description: 'Udara sejuk', price: 640000, imageUrl: 'https://images.unsplash.com/photo-1501183638710-841dd1904471?w=1200', available: true },
  { id: 7, name: 'Senayan Pod Stay', city: 'Jakarta', category: 'Hotel', description: 'Budget-friendly', price: 310000, imageUrl: 'https://images.unsplash.com/photo-1521783593447-5702b9bfd267?w=1200', available: true },
  { id: 8, name: 'Cihampelas View', city: 'Bandung', category: 'Guest House', description: 'View kota', price: 390000, imageUrl: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200', available: true }
];

function filterItems(items: PropertyItem[], q: PropertyQuery) {
  return items.filter((item) => {
    const cityOk = q.city === 'Semua' || item.city === q.city;
    const nameOk = !q.name || item.name.toLowerCase().includes(q.name.toLowerCase());
    const categoryOk = q.category === 'Semua' || item.category === q.category;
    return cityOk && nameOk && categoryOk && item.available;
  });
}

function sortItems(items: PropertyItem[], q: PropertyQuery) {
  const sorted = [...items].sort((a, b) => q.sortBy === 'price' ? a.price - b.price : a.name.localeCompare(b.name));
  return q.order === 'asc' ? sorted : sorted.reverse();
}

function paginateItems(items: PropertyItem[], q: PropertyQuery) {
  const start = (q.page - 1) * q.take;
  return items.slice(start, start + q.take);
}

export function listProperties(query: PropertyQuery) {
  const filtered = filterItems(properties, query);
  const sorted = sortItems(filtered, query);
  const data = paginateItems(sorted, query);
  const total = filtered.length;
  return { data, meta: { page: query.page, take: query.take, total, totalPages: Math.max(1, Math.ceil(total / query.take)) } };
}
