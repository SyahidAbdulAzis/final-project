import prisma from '../lib/prisma.js';
import type { CreateBookingInput, UpdateBookingInput, ManualPaymentInput } from '../validations/booking.validation.js';

export async function createBooking(data: CreateBookingInput) {
  const { userId, roomId, checkIn, checkOut, totalPrice, proofUrl } = data;

  const booking = await prisma.booking.create({
    data: {
      userId,
      roomId,
      checkIn: new Date(checkIn),
      checkOut: new Date(checkOut),
      totalPrice,
      status: 'MENUNGGU_PEMBAYARAN',
    },
  });

  // Create payment if proofUrl is provided
  if (proofUrl) {
    await prisma.payment.create({
      data: {
        bookingId: booking.id,
        proofUrl,
      },
    });
  }

  return booking;
}

export async function getBookingById(id: string) {
  // Check and update expired booking
  const oneHourInMs = 60 * 60 * 1000;
  await prisma.booking.updateMany({
    where: {
      id,
      status: 'MENUNGGU_PEMBAYARAN',
      createdAt: {
        lt: new Date(Date.now() - oneHourInMs),
      },
    },
    data: {
      status: 'KADALUARSA',
    },
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

export async function getBookingsByUserId(userId: string) {
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

  return await prisma.booking.findMany({
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
  });
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
    orderBy: {
      createdAt: 'desc',
    },
  });
}

export async function updateBooking(id: string, data: UpdateBookingInput) {
  return await prisma.booking.update({
    where: { id },
    data,
  });
}

export async function deleteBooking(id: string) {
  // Payment will be deleted automatically due to onDelete: Cascade
  return await prisma.booking.delete({
    where: { id },
  });
}

export async function getAllBookings() {
  // Check and update all expired bookings
  const oneHourInMs = 60 * 60 * 1000;
  await prisma.booking.updateMany({
    where: {
      status: 'MENUNGGU_PEMBAYARAN',
      createdAt: {
        lt: new Date(Date.now() - oneHourInMs),
      },
    },
    data: {
      status: 'KADALUARSA',
    },
  });

  return await prisma.booking.findMany({
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
    orderBy: {
      createdAt: 'desc',
    },
  });
}

export async function cancelBooking(bookingId: string) {
  // Check if booking exists
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking) {
    throw new Error('Booking tidak ditemukan');
  }

  // Check if booking can be cancelled (only MENUNGGU_PEMBAYARAN)
  if (booking.status !== 'MENUNGGU_PEMBAYARAN') {
    throw new Error('Booking tidak dapat dibatalkan karena sudah diproses');
  }

  // Check if booking is within 1 hour
  const oneHourInMs = 60 * 60 * 1000;
  const timeElapsed = Date.now() - booking.createdAt.getTime();
  if (timeElapsed > oneHourInMs) {
    throw new Error('Booking tidak dapat dibatalkan karena sudah melewati batas waktu 1 jam');
  }

  // Update booking status to DIBATALKAN
  const updatedBooking = await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: 'DIBATALKAN',
    },
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

  return updatedBooking;
}

export async function submitManualPayment(bookingId: string, data: ManualPaymentInput) {
  const { proofUrl } = data;

  // Check if booking exists
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking) {
    throw new Error('Booking tidak ditemukan');
  }

  // Check if booking is within 1 hour
  const oneHourInMs = 60 * 60 * 1000;
  const timeElapsed = Date.now() - booking.createdAt.getTime();
  if (timeElapsed > oneHourInMs) {
    // Update booking status to KADALUARSA
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: 'KADALUARSA',
      },
    });
    throw new Error('Waktu pembayaran telah habis (1 jam). Booking telah kadaluarsa.');
  }

  // Create or update payment record
  await prisma.payment.upsert({
    where: { bookingId },
    create: {
      bookingId,
      proofUrl,
    },
    update: {
      proofUrl,
    },
  });

  // Update booking status to MENUNGGU_KONFIRMASI
  const updatedBooking = await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: 'MENUNGGU_KONFIRMASI',
    },
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

  return updatedBooking;
}
