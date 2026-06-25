import prisma from '../lib/prisma.js';

async function assertRoomOwner(roomId: string, tenantId: string) {
  const room = await prisma.room.findUnique({
    where: { id: roomId },
    include: { property: { select: { tenantId: true } } },
  });
  if (!room || room.property.tenantId !== tenantId) {
    throw new Error('Kamar tidak ditemukan atau bukan milik Anda');
  }
}

async function assertSeasonalRateOwner(id: string, tenantId: string) {
  const rate = await prisma.seasonalRate.findUnique({
    where: { id },
    include: { room: { include: { property: { select: { tenantId: true } } } } },
  });
  if (!rate || rate.room.property.tenantId !== tenantId) {
    throw new Error('Tarif musim tidak ditemukan atau bukan milik Anda');
  }
}

export async function createAvailability(tenantId: string, data: { roomId: string; date: Date; isAvailable: boolean }) {
  await assertRoomOwner(data.roomId, tenantId);
  return await prisma.roomAvailability.upsert({
    where: { roomId_date: { roomId: data.roomId, date: data.date } },
    update: { isAvailable: data.isAvailable },
    create: data,
  });
}

export async function bulkAvailability(tenantId: string, data: { roomId: string; dates: Date[]; isAvailable: boolean }) {
  await assertRoomOwner(data.roomId, tenantId);
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

export async function createSeasonalRate(tenantId: string, data: {
  roomId: string; name: string; startDate: Date; endDate: Date;
  adjustmentType: 'NOMINAL' | 'PERCENTAGE'; adjustmentValue: number;
}) {
  await assertRoomOwner(data.roomId, tenantId);
  return await prisma.seasonalRate.create({ data });
}

export async function getSeasonalRatesByRoom(roomId: string) {
  return await prisma.seasonalRate.findMany({
    where: { roomId },
    orderBy: { startDate: 'asc' },
  });
}

export async function updateSeasonalRate(id: string, tenantId: string, data: Partial<{
  name: string; startDate: Date; endDate: Date;
  adjustmentType: 'NOMINAL' | 'PERCENTAGE'; adjustmentValue: number;
}>) {
  await assertSeasonalRateOwner(id, tenantId);
  return await prisma.seasonalRate.update({ where: { id }, data });
}

export async function deleteSeasonalRate(id: string, tenantId: string) {
  await assertSeasonalRateOwner(id, tenantId);
  return await prisma.seasonalRate.delete({ where: { id } });
}
