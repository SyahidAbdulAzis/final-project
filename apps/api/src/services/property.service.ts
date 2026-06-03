import prisma from '../lib/prisma.js';
import type { PropertyItem, PropertyQuery } from '../types/property.type.js';

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

export async function listProperties(query: PropertyQuery) {
  const properties = await prisma.property.findMany({
    include: {
      category: true,
      rooms: true
    }
  });

  // Transform Prisma models to PropertyItem format
  const items: PropertyItem[] = properties.map((prop) => ({
    id: Number(prop.id),
    name: prop.name,
    city: prop.city,
    category: prop.category.name,
    description: prop.description,
    price: prop.rooms[0]?.basePrice || 0,
    imageUrl: prop.imageUrl,
    available: true
  }));

  const filtered = filterItems(items, query);
  const sorted = sortItems(filtered, query);
  const data = paginateItems(sorted, query);
  const total = filtered.length;
  return { data, meta: { page: query.page, take: query.take, total, totalPages: Math.max(1, Math.ceil(total / query.take)) } };
}
