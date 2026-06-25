import prisma from '../lib/prisma.js';
import type { CreateBookingInput, UpdateBookingInput, ManualPaymentInput } from '../validations/booking.validation.js';
import { sendPaymentConfirmationEmail, sendPaymentRejectionEmail } from './email.service.js';

export async function createBooking(data: CreateBookingInput) {
  const { userId, roomId, checkIn, checkOut, totalPrice, proofUrl } = data;

  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);

  // Check for booking conflicts
  const conflictingBookings = await prisma.booking.findMany({
    where: {
      roomId,
      status: {
        in: ['MENUNGGU_PEMBAYARAN', 'MENUNGGU_KONFIRMASI', 'DIKONFIRMASI'],
      },
      OR: [
        {
          // New booking starts during an existing booking
          checkIn: {
            lte: checkInDate,
          },
          checkOut: {
            gt: checkInDate,
          },
        },
        {
          // New booking ends during an existing booking
          checkIn: {
            lt: checkOutDate,
          },
          checkOut: {
            gte: checkOutDate,
          },
        },
        {
          // New booking completely contains an existing booking
          checkIn: {
            gte: checkInDate,
          },
          checkOut: {
            lte: checkOutDate,
          },
        },
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

export async function getSuccessfulBookingsByUserId(userId: string) {
  return await prisma.booking.findMany({
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

export async function getRoomAvailability(roomId: string, startDate: Date, endDate: Date) {
  const bookings = await prisma.booking.findMany({
    where: {
      roomId,
      status: {
        in: ['MENUNGGU_PEMBAYARAN', 'MENUNGGU_KONFIRMASI', 'DIKONFIRMASI'],
      },
      OR: [
        {
          checkIn: {
            lte: endDate,
          },
          checkOut: {
            gt: startDate,
          },
        },
      ],
    },
    select: {
      checkIn: true,
      checkOut: true,
    },
  });

  return bookings.map((booking) => ({
    checkIn: booking.checkIn,
    checkOut: booking.checkOut,
  }));
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

export async function getBookingsByTenantId(tenantId: string, page: number = 1, limit: number = 5) {
  // Get all properties owned by the tenant
  const properties = await prisma.property.findMany({
    where: { tenantId },
    select: { id: true },
  });

  const propertyIds = properties.map((p) => p.id);

  // Get all rooms in those properties
  const rooms = await prisma.room.findMany({
    where: { propertyId: { in: propertyIds } },
    select: { id: true },
  });

  const roomIds = rooms.map((r) => r.id);

  const skip = (page - 1) * limit;

  // Get all bookings for those rooms with pagination
  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where: { roomId: { in: roomIds } },
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
      skip,
      take: limit,
    }),
    prisma.booking.count({
      where: { roomId: { in: roomIds } },
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

export async function confirmPayment(bookingId: string, tenantId: string) {
  // Check if booking exists
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      room: {
        include: {
          property: true,
        },
      },
      user: true,
      payment: true,
    },
  });

  if (!booking) {
    throw new Error('Booking tidak ditemukan');
  }

  // Check if the booking belongs to the tenant's property
  if (booking.room.property.tenantId !== tenantId) {
    throw new Error('Anda tidak memiliki akses untuk mengkonfirmasi booking ini');
  }

  // Check if booking is in MENUNGGU_KONFIRMASI status
  if (booking.status !== 'MENUNGGU_KONFIRMASI') {
    throw new Error('Booking tidak dapat dikonfirmasi karena status tidak valid');
  }

  // Update booking status to DIKONFIRMASI
  const updatedBooking = await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: 'DIKONFIRMASI',
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

  // Kirim email konfirmasi ke customer yang melakukan booking
  await sendPaymentConfirmationEmail(
    updatedBooking.user.email,
    updatedBooking.user.fullName,
    updatedBooking
  );

  return updatedBooking;
}

export async function rejectPayment(bookingId: string, tenantId: string) {
  // Check if booking exists
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      room: {
        include: {
          property: true,
        },
      },
      user: true,
      payment: true,
    },
  });

  if (!booking) {
    throw new Error('Booking tidak ditemukan');
  }

  // Check if the booking belongs to the tenant's property
  if (booking.room.property.tenantId !== tenantId) {
    throw new Error('Anda tidak memiliki akses untuk menolak booking ini');
  }

  // Check if booking is in MENUNGGU_KONFIRMASI status
  if (booking.status !== 'MENUNGGU_KONFIRMASI') {
    throw new Error('Booking tidak dapat ditolak karena status tidak valid');
  }

  // Update booking status to CANCEL
  const updatedBooking = await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: 'CANCEL',
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

  // Kirim email pemberitahuan penolakan ke customer
  await sendPaymentRejectionEmail(
    updatedBooking.user.email,
    updatedBooking.user.fullName,
    updatedBooking
  );

  return updatedBooking;
}

export async function tenantCancelBooking(bookingId: string, tenantId: string) {
  // Check if booking exists
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      room: {
        include: {
          property: true,
        },
      },
      user: true,
      payment: true,
    },
  });

  if (!booking) {
    throw new Error('Booking tidak ditemukan');
  }

  // Check if the booking belongs to the tenant's property
  if (booking.room.property.tenantId !== tenantId) {
    throw new Error('Anda tidak memiliki akses untuk membatalkan booking ini');
  }

  // Check if payment proof has been uploaded
  if (booking.payment) {
    throw new Error('Booking tidak dapat dibatalkan karena bukti pembayaran sudah diupload');
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
