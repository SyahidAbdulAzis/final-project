import prisma from '../lib/prisma.js';
import { buildTenantWhere } from './report.service.js';

interface PropertyAvailabilityData {
  propertyId: string;
  propertyName: string;
  propertyCity: string;
  rooms: Array<{
    roomId: string;
    roomName: string;
    bookings: Array<{ id: string; checkIn: Date; checkOut: Date; status: string }>;
  }>;
}

interface SalesChartItem {
  propertyId: string;
  propertyName: string;
  totalSales: number;
  percentage: number;
}

export { type SalesChartItem, type PropertyAvailabilityData };

export async function getSalesChartData(
  tenantId: string,
  startDate?: Date,
  endDate?: Date,
): Promise<SalesChartItem[]> {
  const where = buildTenantWhere(tenantId, startDate, endDate);

  const bookings = await prisma.booking.findMany({
    where,
    include: {
      room: {
        include: {
          property: { select: { id: true, name: true } },
        },
      },
    },
  });

  const propertyMap = new Map<string, { name: string; totalSales: number }>();
  let grandTotal = 0;

  for (const booking of bookings) {
    const propertyId = (booking.room as any).property.id;
    const propertyName = (booking.room as any).property.name;

    if (!propertyMap.has(propertyId)) {
      propertyMap.set(propertyId, { name: propertyName, totalSales: 0 });
    }
    propertyMap.get(propertyId)!.totalSales += booking.totalPrice;
    grandTotal += booking.totalPrice;
  }

  const result: SalesChartItem[] = [];
  for (const [propertyId, data] of propertyMap.entries()) {
    result.push({
      propertyId,
      propertyName: data.name,
      totalSales: data.totalSales,
      percentage: grandTotal > 0 ? parseFloat(((data.totalSales / grandTotal) * 100).toFixed(1)) : 0,
    });
  }

  result.sort((a, b) => b.totalSales - a.totalSales);
  return result;
}

export async function getPropertyAvailabilityCalendar(
  tenantId: string,
  startDate: Date,
  endDate: Date
): Promise<PropertyAvailabilityData[]> {
  const properties = await prisma.property.findMany({
    where: { tenantId },
    include: {
      rooms: {
        include: {
          bookings: {
            where: {
              OR: [
                { checkIn: { gte: startDate, lte: endDate } },
                { checkOut: { gte: startDate, lte: endDate } },
                { checkIn: { lte: startDate }, checkOut: { gte: endDate } },
              ],
            },
            orderBy: { checkIn: 'asc' },
          },
        },
      },
    },
  });

  return properties.map((property: any) => ({
    propertyId: property.id,
    propertyName: property.name,
    propertyCity: property.city,
    rooms: property.rooms.map((room: any) => ({
      roomId: room.id,
      roomName: room.name,
      bookings: room.bookings.map((booking: any) => ({
        id: booking.id,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        status: booking.status,
      })),
    })),
  }));
}
