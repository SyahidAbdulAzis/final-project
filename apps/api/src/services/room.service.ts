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

export async function createRoom(data: {
  propertyId: string; name: string; description: string;
  basePrice: number; maxGuests: number;
}) {
  return await prisma.room.create({
    data,
    include: { property: { include: { category: true } } },
  });
}

export async function updateRoom(id: string, data: Partial<{
  name: string; description: string; basePrice: number; maxGuests: number;
}>) {
  return await prisma.room.update({
    where: { id },
    data,
    include: { property: { include: { category: true } } },
  });
}

export async function deleteRoom(id: string) {
  return await prisma.room.delete({ where: { id } });
}

export async function getRoomsByProperty(propertyId: string) {
  return await prisma.room.findMany({
    where: { propertyId },
    include: { availabilities: true, seasonalRates: true },
    orderBy: { createdAt: 'desc' },
  });
}
