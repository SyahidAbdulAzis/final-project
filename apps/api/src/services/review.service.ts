import prisma from '../lib/prisma.js';
import type { CreateReviewInput, ReplyReviewInput } from '../validations/review.validation.js';

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

export async function replyToReview(reviewId: string, tenantId: string, data: ReplyReviewInput) {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    include: {
      booking: {
        include: {
          room: {
            include: {
              property: true,
            },
          },
        },
      },
    },
  });

  if (!review) throw new Error('Review tidak ditemukan');
  if (review.booking.room.property.tenantId !== tenantId) {
    throw new Error('Anda tidak memiliki akses untuk membalas review ini');
  }
  if (review.tenantReply) throw new Error('Review sudah memiliki balasan');

  return prisma.review.update({
    where: { id: reviewId },
    data: {
      tenantReply: data.reply,
      repliedAt: new Date(),
    },
  });
}

export async function getTenantReviews(tenantId: string) {
  const properties = await prisma.property.findMany({
    where: { tenantId },
    select: { id: true, name: true },
  });

  const propertyIds = properties.map((p) => p.id);

  if (propertyIds.length === 0) return [];

  const reviews = await prisma.review.findMany({
    where: {
      booking: {
        room: {
          propertyId: { in: propertyIds },
        },
      },
    },
    include: {
      user: {
        select: { id: true, fullName: true, photoUrl: true },
      },
      booking: {
        include: {
          room: {
            include: {
              property: {
                select: { id: true, name: true },
              },
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return reviews;
}

export async function getPropertyWithReviews(propertyId: string) {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    include: {
      category: true,
      images: true,
      rooms: {
        include: {
          availabilities: true,
          seasonalRates: true,
        },
      },
      tenant: { select: { id: true, fullName: true, email: true } },
    },
  });

  if (!property) return null;

  const reviews = await prisma.review.findMany({
    where: {
      booking: {
        room: {
          propertyId,
        },
      },
    },
    include: {
      user: {
        select: { id: true, fullName: true, photoUrl: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return { ...property, reviews };
}
