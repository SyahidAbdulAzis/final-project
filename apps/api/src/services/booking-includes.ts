import type { Prisma } from '@prisma/client';

export const userSelect: Prisma.UserSelect = {
  id: true, email: true, fullName: true, photoUrl: true,
};

export const bookingUserRoomPaymentInclude: Prisma.BookingInclude = {
  user: { select: userSelect },
  room: { include: { property: true } },
  payment: true,
};

export const bookingUserRoomPaymentUserInclude: Prisma.BookingInclude = {
  user: true,
  room: { include: { property: true } },
  payment: true,
};
