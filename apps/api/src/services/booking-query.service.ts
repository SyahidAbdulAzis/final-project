import prisma from '../lib/prisma.js';
import { bookingUserRoomPaymentInclude } from './booking-includes.js';
import { expirePendingConfirmations } from './booking-payment.service.js';

export async function getBookingById(id: string) {
  const oneHourInMs = 60 * 60 * 1000;
  await prisma.booking.updateMany({
    where: {
      id,
      status: 'MENUNGGU_PEMBAYARAN',
      createdAt: { lt: new Date(Date.now() - oneHourInMs) },
    },
    data: { status: 'KADALUARSA' },
  });

  return await prisma.booking.findUnique({
    where: { id },
    include: bookingUserRoomPaymentInclude,
  });
}

export async function getBookingsByUserId(userId: string, page: number = 1, limit: number = 5) {
  const oneHourInMs = 60 * 60 * 1000;
  await prisma.booking.updateMany({
    where: {
      userId,
      status: 'MENUNGGU_PEMBAYARAN',
      createdAt: { lt: new Date(Date.now() - oneHourInMs) },
    },
    data: { status: 'KADALUARSA' },
  });

  const skip = (page - 1) * limit;
  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where: { userId },
      include: bookingUserRoomPaymentInclude,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.booking.count({ where: { userId } }),
  ]);

  return { bookings, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getSuccessfulBookingsByUserId(userId: string) {
  return await prisma.booking.findMany({
    where: { userId, status: 'DIKONFIRMASI' },
    include: bookingUserRoomPaymentInclude,
    orderBy: { createdAt: 'desc' },
  });
}

export async function getBookingsByRoomId(roomId: string) {
  return await prisma.booking.findMany({
    where: { roomId },
    include: {
      user: { select: { id: true, email: true, fullName: true, photoUrl: true } },
      payment: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getRoomAvailability(roomId: string, startDate: Date, endDate: Date) {
  const bookings = await prisma.booking.findMany({
    where: {
      roomId,
      status: { in: ['MENUNGGU_PEMBAYARAN', 'MENUNGGU_KONFIRMASI', 'DIKONFIRMASI'] },
      OR: [{ checkIn: { lte: endDate }, checkOut: { gt: startDate } }],
    },
    select: { checkIn: true, checkOut: true },
  });

  return bookings.map((b) => ({ checkIn: b.checkIn, checkOut: b.checkOut }));
}

export async function getAllBookings() {
  const oneHourInMs = 60 * 60 * 1000;
  await prisma.booking.updateMany({
    where: {
      status: 'MENUNGGU_PEMBAYARAN',
      createdAt: { lt: new Date(Date.now() - oneHourInMs) },
    },
    data: { status: 'KADALUARSA' },
  });

  return await prisma.booking.findMany({
    include: bookingUserRoomPaymentInclude,
    orderBy: { createdAt: 'desc' },
  });
}

export async function getBookingsByTenantId(tenantId: string, page: number = 1, limit: number = 5) {
  await expirePendingConfirmations();

  const properties = await prisma.property.findMany({
    where: { tenantId },
    select: { id: true },
  });
  const propertyIds = properties.map((p) => p.id);

  const rooms = await prisma.room.findMany({
    where: { propertyId: { in: propertyIds } },
    select: { id: true },
  });
  const roomIds = rooms.map((r) => r.id);

  const skip = (page - 1) * limit;
  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where: { roomId: { in: roomIds } },
      include: bookingUserRoomPaymentInclude,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.booking.count({ where: { roomId: { in: roomIds } } }),
  ]);

  return { bookings, total, page, limit, totalPages: Math.ceil(total / limit) };
}
