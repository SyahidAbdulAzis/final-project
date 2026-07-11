import prisma from '../lib/prisma.js';

interface SalesReportData {
  propertyId: string;
  propertyName: string;
  totalSales: number;
  transactionCount: number;
  bookings: Array<{
    id: string;
    userId: string;
    userName: string;
    checkIn: Date;
    checkOut: Date;
    totalPrice: number;
    status: string;
    createdAt: Date;
  }>;
}

export { type SalesReportData };

export function buildTenantWhere(tenantId: string, startDate?: Date, endDate?: Date) {
  const where: any = {
    room: { property: { tenantId } },
    status: 'DIKONFIRMASI',
  };

  if (startDate && endDate) {
    where.createdAt = { gte: startDate, lte: endDate };
  }

  return where;
}

const bookingInclude = {
  room: { include: { property: true } },
  user: { select: { id: true, fullName: true, email: true } },
};

export async function getSalesReportByProperty(
  tenantId: string,
  startDate?: Date,
  endDate?: Date,
  sortBy?: 'date' | 'totalSales'
): Promise<SalesReportData[]> {
  const where = buildTenantWhere(tenantId, startDate, endDate);

  const bookings = await prisma.booking.findMany({
    where,
    include: bookingInclude,
    orderBy: sortBy === 'totalSales' ? { totalPrice: 'desc' } : { createdAt: 'desc' },
  });

  const propertyMap = new Map<string, SalesReportData>();
  bookings.forEach((booking: any) => {
    const propertyId = booking.room.property.id;
    const propertyName = booking.room.property.name;

    if (!propertyMap.has(propertyId)) {
      propertyMap.set(propertyId, {
        propertyId, propertyName, totalSales: 0, transactionCount: 0, bookings: [],
      });
    }

    const entry = propertyMap.get(propertyId)!;
    entry.totalSales += booking.totalPrice;
    entry.transactionCount += 1;
    entry.bookings.push({
      id: booking.id,
      userId: booking.userId,
      userName: booking.user.fullName,
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      totalPrice: booking.totalPrice,
      status: booking.status,
      createdAt: booking.createdAt,
    });
  });

  return Array.from(propertyMap.values());
}

export async function getSalesReportByUser(
  tenantId: string,
  startDate?: Date,
  endDate?: Date,
  sortBy?: 'date' | 'totalSales'
) {
  const where = buildTenantWhere(tenantId, startDate, endDate);

  const bookings = await prisma.booking.findMany({
    where,
    include: bookingInclude,
    orderBy: sortBy === 'totalSales' ? { totalPrice: 'desc' } : { createdAt: 'desc' },
  });

  const userMap = new Map<string, any>();
  bookings.forEach((booking: any) => {
    const userId = booking.userId;
    const userName = booking.user.fullName;
    const userEmail = booking.user.email;

    if (!userMap.has(userId)) {
      userMap.set(userId, {
        userId, userName, userEmail, totalSales: 0, transactionCount: 0, bookings: [],
      });
    }

    const entry = userMap.get(userId)!;
    entry.totalSales += booking.totalPrice;
    entry.transactionCount += 1;
    entry.bookings.push({
      id: booking.id,
      propertyName: booking.room.property.name,
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      totalPrice: booking.totalPrice,
      status: booking.status,
      createdAt: booking.createdAt,
    });
  });

  return Array.from(userMap.values());
}

export async function getSalesReportByTransaction(
  tenantId: string,
  startDate?: Date,
  endDate?: Date,
  sortBy?: 'date' | 'totalSales'
) {
  const where = buildTenantWhere(tenantId, startDate, endDate);

  const bookings = await prisma.booking.findMany({
    where,
    include: bookingInclude,
    orderBy: sortBy === 'totalSales' ? { totalPrice: 'desc' } : { createdAt: 'desc' },
  });

  return bookings.map((booking) => ({
    id: booking.id,
    propertyName: booking.room.property.name,
    userName: booking.user.fullName,
    userEmail: booking.user.email,
    checkIn: booking.checkIn,
    checkOut: booking.checkOut,
    totalPrice: booking.totalPrice,
    status: booking.status,
    createdAt: booking.createdAt,
  }));
}
