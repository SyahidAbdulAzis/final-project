import prisma from '../lib/prisma.js';
import type { ManualPaymentInput } from '../validations/booking.validation.js';
import { sendPaymentConfirmationEmail, sendPaymentRejectionEmail } from './email.service.js';
import { bookingUserRoomPaymentInclude } from './booking-includes.js';
import type { BookingStatus } from '@prisma/client';

const CONFIRMATION_EXPIRY_MS = 2 * 24 * 60 * 60 * 1000;

export async function expirePendingConfirmations() {
  await prisma.booking.updateMany({
    where: {
      status: 'MENUNGGU_KONFIRMASI',
      expiresAt: { lt: new Date() },
    },
    data: { status: 'KADALUARSA' },
  });
}

export async function submitManualPayment(bookingId: string, data: ManualPaymentInput) {
  const { proofUrl } = data;

  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) throw new Error('Booking tidak ditemukan');

  const oneHourInMs = 60 * 60 * 1000;
  if (Date.now() - booking.createdAt.getTime() > oneHourInMs) {
    await prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'KADALUARSA' },
    });
    throw new Error('Waktu pembayaran telah habis (1 jam). Booking telah kadaluarsa.');
  }

  await prisma.payment.upsert({
    where: { bookingId },
    create: { bookingId, proofUrl },
    update: { proofUrl },
  });

  return await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: 'MENUNGGU_KONFIRMASI',
      expiresAt: new Date(Date.now() + CONFIRMATION_EXPIRY_MS),
    },
    include: bookingUserRoomPaymentInclude,
  }) as any;
}

export async function confirmPayment(bookingId: string, tenantId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      user: true,
      room: { include: { property: true } },
      payment: true,
    },
  }) as any;

  if (!booking) throw new Error('Booking tidak ditemukan');
  if (booking.room.property.tenantId !== tenantId) {
    throw new Error('Anda tidak memiliki akses untuk mengkonfirmasi booking ini');
  }
  if (booking.status !== 'MENUNGGU_KONFIRMASI') {
    throw new Error('Booking tidak dapat dikonfirmasi karena status tidak valid');
  }
  if (booking.expiresAt && booking.expiresAt < new Date()) {
    await prisma.booking.update({ where: { id: bookingId }, data: { status: 'KADALUARSA' } });
    throw new Error('Waktu konfirmasi telah habis (2 hari). Booking telah kadaluarsa.');
  }

  const updatedBooking = await prisma.booking.update({
    where: { id: bookingId },
    data: { status: 'DIKONFIRMASI' },
    include: bookingUserRoomPaymentInclude,
  }) as any;

  await sendPaymentConfirmationEmail(
    updatedBooking.user.email,
    updatedBooking.user.fullName,
    updatedBooking
  );

  return updatedBooking;
}

export async function rejectPayment(bookingId: string, tenantId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      user: true,
      room: { include: { property: true } },
      payment: true,
    },
  }) as any;

  if (!booking) throw new Error('Booking tidak ditemukan');
  if (booking.room.property.tenantId !== tenantId) {
    throw new Error('Anda tidak memiliki akses untuk menolak booking ini');
  }
  if (booking.status !== 'MENUNGGU_KONFIRMASI') {
    throw new Error('Booking tidak dapat ditolak karena status tidak valid');
  }
  if (booking.expiresAt && booking.expiresAt < new Date()) {
    await prisma.booking.update({ where: { id: bookingId }, data: { status: 'KADALUARSA' } });
    throw new Error('Waktu konfirmasi telah habis (2 hari). Booking telah kadaluarsa.');
  }

  const updatedBooking = await prisma.booking.update({
    where: { id: bookingId },
    data: { status: 'CANCEL' },
    include: bookingUserRoomPaymentInclude,
  }) as any;

  await sendPaymentRejectionEmail(
    updatedBooking.user.email,
    updatedBooking.user.fullName,
    updatedBooking
  );

  return updatedBooking;
}

export async function tenantCancelBooking(bookingId: string, tenantId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      room: { include: { property: true } },
      payment: true,
    },
  }) as any;

  if (!booking) throw new Error('Booking tidak ditemukan');
  if (booking.room.property.tenantId !== tenantId) {
    throw new Error('Anda tidak memiliki akses untuk membatalkan booking ini');
  }
  if (booking.payment) {
    throw new Error('Booking tidak dapat dibatalkan karena bukti pembayaran sudah diupload');
  }

  return await prisma.booking.update({
    where: { id: bookingId },
    data: { status: 'DIBATALKAN' },
    include: bookingUserRoomPaymentInclude,
  }) as any;
}
