import prisma from '../lib/prisma.js';

export async function getAllUsers() {
  return await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      fullName: true,
      photoUrl: true,
      role: true,
      isVerified: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

export async function getUserById(id: string) {
  return await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      fullName: true,
      photoUrl: true,
      role: true,
      isVerified: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}
