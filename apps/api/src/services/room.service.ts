import prisma from '../lib/prisma.js';

export async function getAllRooms() {
  return await prisma.room.findMany({
    include: {
      property: {
        include: { category: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getRoomById(id: string) {
  return await prisma.room.findUnique({
    where: { id },
    include: {
      property: { include: { category: true, images: true } },
      availabilities: true,
      seasonalRates: true,
    },
  });
}

async function assertRoomOwner(id: string, tenantId: string) {
  const room = await prisma.room.findUnique({
    where: { id },
    include: { property: { select: { tenantId: true } } },
  });
  if (!room || room.property.tenantId !== tenantId) {
    throw new Error('Kamar tidak ditemukan atau bukan milik Anda');
  }
}

export async function createRoom(tenantId: string, data: {
  propertyId: string; name: string; description: string;
  basePrice: number; maxGuests: number;
}) {
  const property = await prisma.property.findUnique({
    where: { id: data.propertyId },
    select: { tenantId: true },
  });
  if (!property || property.tenantId !== tenantId) {
    throw new Error('Properti tidak ditemukan atau bukan milik Anda');
  }
  return await prisma.room.create({
    data,
    include: { property: { include: { category: true } } },
  });
}

export async function updateRoom(id: string, tenantId: string, data: Partial<{
  name: string; description: string; basePrice: number; maxGuests: number;
}>) {
  await assertRoomOwner(id, tenantId);
  return await prisma.room.update({
    where: { id },
    data,
    include: { property: { include: { category: true } } },
  });
}

export async function deleteRoom(id: string, tenantId: string) {
  await assertRoomOwner(id, tenantId);
  return await prisma.room.delete({ where: { id } });
}

export async function getRoomsByProperty(propertyId: string) {
  return await prisma.room.findMany({
    where: { propertyId },
    include: { availabilities: true, seasonalRates: true },
    orderBy: { createdAt: 'desc' },
  });
}
