import prisma from '../lib/prisma.js';

export async function createAvailability(data: { roomId: string; date: Date; isAvailable: boolean }) {
  return await prisma.roomAvailability.upsert({
    where: { roomId_date: { roomId: data.roomId, date: data.date } },
    update: { isAvailable: data.isAvailable },
    create: data,
  });
}

export async function bulkAvailability(data: { roomId: string; dates: Date[]; isAvailable: boolean }) {
  const results = [];
  for (const date of data.dates) {
    const item = await prisma.roomAvailability.upsert({
      where: { roomId_date: { roomId: data.roomId, date } },
      update: { isAvailable: data.isAvailable },
      create: { roomId: data.roomId, date, isAvailable: data.isAvailable },
    });
    results.push(item);
  }
  return results;
}

export async function getAvailabilitiesByRoom(roomId: string) {
  return await prisma.roomAvailability.findMany({
    where: { roomId },
    orderBy: { date: 'asc' },
  });
}

export async function createSeasonalRate(data: {
  roomId: string; name: string; startDate: Date; endDate: Date;
  adjustmentType: 'NOMINAL' | 'PERCENTAGE'; adjustmentValue: number;
}) {
  return await prisma.seasonalRate.create({ data });
}

export async function getSeasonalRatesByRoom(roomId: string) {
  return await prisma.seasonalRate.findMany({
    where: { roomId },
    orderBy: { startDate: 'asc' },
  });
}

export async function updateSeasonalRate(id: string, data: Partial<{
  name: string; startDate: Date; endDate: Date;
  adjustmentType: 'NOMINAL' | 'PERCENTAGE'; adjustmentValue: number;
}>) {
  return await prisma.seasonalRate.update({ where: { id }, data });
}

export async function deleteSeasonalRate(id: string) {
  return await prisma.seasonalRate.delete({ where: { id } });
}
