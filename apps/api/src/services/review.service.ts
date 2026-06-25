import prisma from '../lib/prisma.js';
import type { CreateReviewInput } from '../validations/review.validation.js';

export async function createReview(bookingId: string, userId: string, data: CreateReviewInput) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { room: true },
  });

  if (!booking) throw new Error('Booking tidak ditemukan');
  if (booking.userId !== userId) throw new Error('Anda tidak memiliki akses untuk review ini');
  if (booking.status !== 'DIKONFIRMASI') throw new Error('Booking belum dikonfirmasi');

  const checkInDate = new Date(booking.checkIn);
  checkInDate.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (today < checkInDate) {
    throw new Error('Review hanya bisa diberikan mulai tanggal check-in');
  }

  const existing = await prisma.review.findUnique({ where: { bookingId } });
  if (existing) throw new Error('Anda sudah memberikan review untuk booking ini');

  return prisma.review.create({
    data: {
      bookingId,
      userId,
      rating: data.rating,
      comment: data.comment,
    },
    include: {
      booking: {
        include: {
          room: true,
        },
      },
    },
  });
}

export async function getReviewByBooking(bookingId: string) {
  return prisma.review.findUnique({
    where: { bookingId },
  });
}
