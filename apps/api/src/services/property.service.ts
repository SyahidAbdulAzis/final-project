import prisma from '../lib/prisma.js';
import type { PropertyItem, PropertyQuery } from '../types/property.type.js';

export async function listProperties(query: PropertyQuery) {
  const where: any = {};
  if (query.city && query.city !== 'Semua') where.city = query.city;
  if (query.name) where.name = { contains: query.name, mode: 'insensitive' };
  if (query.category && query.category !== 'Semua') {
    where.category = { name: query.category };
  }

  const hasDates = query.checkIn && query.checkOut;
  const roomFilter: any = {};
  if (query.guests > 1) roomFilter.maxGuests = { gte: query.guests };
  if (hasDates) {
    const start = new Date(query.checkIn!);
    const end = new Date(query.checkOut!);
    roomFilter.availabilities = {
      none: {
        date: { gte: start, lte: end },
        isAvailable: false,
      },
    };
  }
  if (Object.keys(roomFilter).length > 0) {
    where.rooms = { some: roomFilter };
  }

  const skip = (query.page - 1) * query.take;
  const sortByPrice = query.sortBy === 'price';

  // When sorting by price, fetch all to calculate lowest room price correctly
  const [properties, total] = await Promise.all([
    prisma.property.findMany({
      where,
      include: {
        category: true,
        rooms: {
          orderBy: { basePrice: 'asc' },
          include: hasDates ? {
            availabilities: {
              where: {
                date: { gte: new Date(query.checkIn!), lte: new Date(query.checkOut!) },
              },
            },
          } : undefined,
        },
        images: { orderBy: { order: 'asc' }, take: 1 },
      },
      orderBy: sortByPrice ? undefined : ({ name: query.order } as any),
      skip: sortByPrice ? undefined : skip,
      take: sortByPrice ? undefined : query.take,
    }),
    prisma.property.count({ where }),
  ]);

  let props = properties as any[];

  // Fetch real ratings and reviews from reviews
  const propertyIds = props.map((p: any) => p.id);
  const [ratingRowsRaw, reviewRowsRaw] = propertyIds.length > 0
    ? await Promise.all([
        prisma.$queryRaw`
          SELECT rm."propertyId", ROUND(AVG(r.rating)::numeric, 1) as "avgRating", COUNT(r.id)::int as "count"
          FROM "Review" r
          JOIN "Booking" b ON b.id = r."bookingId"
          JOIN "Room" rm ON rm.id = b."roomId"
          WHERE rm."propertyId" = ANY(${propertyIds})
          GROUP BY rm."propertyId"
        `,
        prisma.$queryRaw`
          SELECT rm."propertyId", r.rating, r.comment
          FROM "Review" r
          JOIN "Booking" b ON b.id = r."bookingId"
          JOIN "Room" rm ON rm.id = b."roomId"
          WHERE rm."propertyId" = ANY(${propertyIds})
          ORDER BY r."createdAt" DESC
        `,
      ])
    : [[], []];
  const ratingRows = ratingRowsRaw as Array<{ propertyId: string; avgRating: number; count: number }>;
  const reviewRows = reviewRowsRaw as Array<{ propertyId: string; rating: number; comment: string }>;
  const ratingMap = new Map(ratingRows.map((r) => [r.propertyId, { rating: Number(r.avgRating), count: r.count }]));
  const reviewsMap = new Map<string, Array<{ rating: number; comment: string }>>();
  for (const rev of reviewRows) {
    if (!reviewsMap.has(rev.propertyId)) reviewsMap.set(rev.propertyId, []);
    reviewsMap.get(rev.propertyId)!.push({ rating: rev.rating, comment: rev.comment });
  }

  const items: PropertyItem[] = props.map((prop: any) => {
    let lowestPrice = 0;
    let isAvailable = false;
    if (prop.rooms?.length) {
      for (const room of prop.rooms) {
        const blocked = hasDates && room.availabilities?.some((a: any) => !a.isAvailable);
        if (!blocked) {
          lowestPrice = room.basePrice;
          isAvailable = true;
          break;
        }
      }
    }
    return {
      id: prop.id,
      name: prop.name,
      city: prop.city,
      category: prop.category?.name || '',
      description: prop.description,
      price: lowestPrice,
      imageUrl: prop.images?.[0]?.url || '',
      available: isAvailable,
      reviewCount: ratingMap.get(prop.id)?.count || 0,
      reviews: reviewsMap.get(prop.id) || [],
      ...(ratingMap.has(prop.id) ? { rating: ratingMap.get(prop.id)!.rating } : {}),
    };
  });

  let sortedItems = items;
  if (sortByPrice) {
    sortedItems = [...items].sort((a, b) => {
      return query.order === 'asc' ? a.price - b.price : b.price - a.price;
    });
    // Manual pagination after sorting by price
    const start = (query.page - 1) * query.take;
    sortedItems = sortedItems.slice(start, start + query.take);
  }

  return { data: sortedItems, meta: { page: query.page, take: query.take, total, totalPages: Math.max(1, Math.ceil(total / query.take)) } };
}

export async function createProperty(data: {
  name: string; city: string; address: string; province?: string;
  latitude: number; longitude: number; description: string;
  categoryId: string; tenantId: string; images: string[];
}) {
  return await prisma.property.create({
    data: {
      name: data.name,
      city: data.city,
      address: data.address,
      province: data.province || '',
      latitude: data.latitude,
      longitude: data.longitude,
      description: data.description,
      categoryId: data.categoryId,
      tenantId: data.tenantId,
      images: {
        create: data.images.map((url, index) => ({ url, order: index })),
      },
    },
    include: { category: true, images: true, rooms: true },
  });
}

export async function getPropertyById(id: string) {
  return await prisma.property.findUnique({
    where: { id },
    include: {
      category: true,
      images: true,
      rooms: {
        include: {
          availabilities: true,
          seasonalRates: true,
        },
      },
      tenant: { select: { id: true, fullName: true, email: true } },
    },
  });
}

export async function getTenantProperties(tenantId: string) {
  return await prisma.property.findMany({
    where: { tenantId },
    include: { category: true, images: true, rooms: true },
    orderBy: { createdAt: 'desc' },
  });
}

export async function updateProperty(id: string, data: Partial<{
  name: string; city: string; address: string; province: string;
  latitude: number; longitude: number; description: string; categoryId: string;
}> & { images?: string[] }) {
  const { images, ...rest } = data;

  const updated = await prisma.property.update({
    where: { id },
    data: rest,
    include: { category: true, images: true, rooms: true },
  });

  if (images && images.length > 0) {
    await prisma.propertyImage.deleteMany({ where: { propertyId: id } });
    await prisma.propertyImage.createMany({
      data: images.map((url, index) => ({ propertyId: id, url, order: index })),
    });
  }

  return prisma.property.findUnique({
    where: { id },
    include: { category: true, images: true, rooms: true },
  });
}

export async function deleteProperty(id: string) {
  return await prisma.property.delete({ where: { id } });
}
