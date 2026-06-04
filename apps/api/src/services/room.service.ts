import prisma from '../lib/prisma.js';

export async function getAllRooms() {
  return await prisma.room.findMany({
    include: {
      property: {
        include: {
          category: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

export async function getRoomById(id: string) {
  return await prisma.room.findUnique({
    where: { id },
    include: {
      property: {
        include: {
          category: true,
          images: true,
        },
      },
      availabilities: true,
      seasonalRates: true,
    },
  });
}
