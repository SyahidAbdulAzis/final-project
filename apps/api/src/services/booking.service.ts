import prisma from '../lib/prisma.js';
import type { CreateBookingInput, UpdateBookingInput } from '../validations/booking.validation.js';

export async function createBooking(data: CreateBookingInput) {
  const { userId, roomId, checkIn, checkOut, totalPrice, proofUrl } = data;

  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);

  const conflictingBookings = await prisma.booking.findMany({
    where: {
      roomId,
      status: { in: ['MENUNGGU_PEMBAYARAN', 'MENUNGGU_KONFIRMASI', 'DIKONFIRMASI'] },
      OR: [
        { checkIn: { lte: checkInDate }, checkOut: { gt: checkInDate } },
        { checkIn: { lt: checkOutDate }, checkOut: { gte: checkOutDate } },
        { checkIn: { gte: checkInDate }, checkOut: { lte: checkOutDate } },
      ],
    },
  });

  if (conflictingBookings.length > 0) {
    throw new Error('Kamar sudah dibooking untuk tanggal tersebut. Silakan pilih tanggal lain.');
  }

  const booking = await prisma.booking.create({
    data: {
      userId,
      roomId,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      totalPrice,
      status: 'MENUNGGU_PEMBAYARAN',
    },
  });

  if (proofUrl) {
    await prisma.payment.create({
      data: { bookingId: booking.id, proofUrl },
    });
  }

  return booking;
}

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
    include: {
      user: {
        select: {
          id: true,
          email: true,
          fullName: true,
          photoUrl: true,
        },
      },
      room: {
        include: {
          property: true,
        },
      },
      payment: true,
    },
  });
}

export async function getBookingsByUserId(userId: string, page: number = 1, limit: number = 5) {
  // First, check and update expired bookings
  const oneHourInMs = 60 * 60 * 1000;
  await prisma.booking.updateMany({
    where: {
      userId,
      status: 'MENUNGGU_PEMBAYARAN',
      createdAt: {
        lt: new Date(Date.now() - oneHourInMs),
      },
    },
    data: {
      status: 'KADALUARSA',
    },
  });

  const skip = (page - 1) * limit;

  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where: { userId },
      include: {
        room: {
          include: {
            property: true,
          },
        },
        payment: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
    }),
    prisma.booking.count({
      where: { userId },
    }),
  ]);

  return {
    bookings,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getSuccessfulBookingsByUserId(userId: string, page: number = 1, limit: number = 5) {
  const skip = (page - 1) * limit;

  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where: {
        userId,
        status: 'DIKONFIRMASI',
      },
      include: {
        room: {
          include: {
            property: true,
          },
        },
        payment: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
    }),
    prisma.booking.count({
      where: {
        userId,
        status: 'DIKONFIRMASI',
      },
    }),
  ]);

  return {
    bookings,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getBookingsByRoomId(roomId: string) {
  return await prisma.booking.findMany({
    where: { roomId },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          fullName: true,
          photoUrl: true,
        },
      },
      payment: true,
    },
  });
}

export async function updateBooking(id: string, data: UpdateBookingInput) {
  return await prisma.booking.update({ where: { id }, data });
}

export async function deleteBooking(id: string) {
  return await prisma.booking.delete({ where: { id } });
}

export async function cancelBooking(bookingId: string) {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });

  if (!booking) throw new Error('Booking tidak ditemukan');
  if (booking.status !== 'MENUNGGU_PEMBAYARAN') {
    throw new Error('Booking tidak dapat dibatalkan karena sudah diproses');
  }

  const oneHourInMs = 60 * 60 * 1000;
  if (Date.now() - booking.createdAt.getTime() > oneHourInMs) {
    throw new Error('Booking tidak dapat dibatalkan karena sudah melewati batas waktu 1 jam');
  }

  return await prisma.booking.update({
    where: { id: bookingId },
    data: { status: 'DIBATALKAN' },
    include: {
      user: { select: { id: true, email: true, fullName: true, photoUrl: true } },
      room: { include: { property: true } },
      payment: true,
    },
  });
}
