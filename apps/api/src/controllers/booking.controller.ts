import { Request, Response } from 'express';
import {
  createBookingSchema,
  updateBookingSchema,
  bookingIdSchema,
  manualPaymentSchema,
} from '../validations/booking.validation.js';
import {
  createBooking,
  getBookingById,
  getBookingsByUserId,
  getSuccessfulBookingsByUserId,
  getBookingsByRoomId,
  getBookingsByTenantId,
  getRoomAvailability,
  updateBooking,
  deleteBooking,
  getAllBookings,
  submitManualPayment,
  cancelBooking,
  confirmPayment,
  rejectPayment,
  tenantCancelBooking,
} from '../services/booking.service.js';
import { badRequest, parseOrBad, pickParam } from '../utils/controller.utils.js';

export async function createBookingHandler(req: Request, res: Response) {
  const bodyParsed = parseOrBad(res, createBookingSchema, req.body);
  if (!bodyParsed) return;
  try {
    const booking = await createBooking(bodyParsed);
    return res.status(201).json(booking);
  } catch (error) {
    return badRequest(res, (error as Error).message);
  }
}

export async function getBookingHandler(req: Request, res: Response) {
  const paramsParsed = parseOrBad(res, bookingIdSchema, req.params);
  if (!paramsParsed) return;
  try {
    const booking = await getBookingById(paramsParsed.id);
    if (!booking) return badRequest(res, 'Booking tidak ditemukan');
    return res.json(booking);
  } catch (error) {
    return badRequest(res, (error as Error).message);
  }
}

export async function getUserBookingsHandler(req: Request, res: Response) {
  const userId = pickParam(req.params.userId);
  const page = req.query.page ? parseInt(String(req.query.page)) : 1;
  const limit = req.query.limit ? parseInt(String(req.query.limit)) : 5;

  if (!userId) return badRequest(res, 'UserId wajib diisi');
  try {
    const result = await getBookingsByUserId(userId, page, limit);
    return res.json(result);
  } catch (error) {
    return badRequest(res, (error as Error).message);
  }
}

export async function getRoomBookingsHandler(req: Request, res: Response) {
  const roomId = pickParam(req.params.roomId);
  if (!roomId) return badRequest(res, 'RoomId wajib diisi');
  try {
    const bookings = await getBookingsByRoomId(roomId);
    return res.json(bookings);
  } catch (error) {
    return badRequest(res, (error as Error).message);
  }
}

export async function updateBookingHandler(req: Request, res: Response) {
  const paramsParsed = parseOrBad(res, bookingIdSchema, req.params);
  const bodyParsed = parseOrBad(res, updateBookingSchema, req.body);
  if (!paramsParsed || !bodyParsed) return;
  try {
    const booking = await updateBooking(paramsParsed.id, bodyParsed);
    return res.json(booking);
  } catch (error) {
    return badRequest(res, (error as Error).message);
  }
}

export async function deleteBookingHandler(req: Request, res: Response) {
  const paramsParsed = parseOrBad(res, bookingIdSchema, req.params);
  if (!paramsParsed) return;
  try {
    const booking = await deleteBooking(paramsParsed.id);
    return res.json(booking);
  } catch (error) {
    return badRequest(res, (error as Error).message);
  }
}

export async function getAllBookingsHandler(req: Request, res: Response) {
  try {
    const bookings = await getAllBookings();
    return res.json(bookings);
  } catch (error) {
    return badRequest(res, (error as Error).message);
  }
}

export async function submitManualPaymentHandler(req: Request, res: Response) {
  const paramsParsed = parseOrBad(res, bookingIdSchema, req.params);
  const bodyParsed = parseOrBad(res, manualPaymentSchema, req.body);
  if (!paramsParsed || !bodyParsed) return;
  try {
    const booking = await submitManualPayment(paramsParsed.id, bodyParsed);
    return res.json(booking);
  } catch (error) {
    return badRequest(res, (error as Error).message);
  }
}

export async function cancelBookingHandler(req: Request, res: Response) {
  const paramsParsed = parseOrBad(res, bookingIdSchema, req.params);
  if (!paramsParsed) return;
  try {
    const booking = await cancelBooking(paramsParsed.id);
    return res.json(booking);
  } catch (error) {
    return badRequest(res, (error as Error).message);
  }
}

export async function getTenantBookingsHandler(req: Request, res: Response) {
  const tenantId = pickParam(req.params.tenantId);
  const page = req.query.page ? parseInt(String(req.query.page)) : 1;
  const limit = req.query.limit ? parseInt(String(req.query.limit)) : 5;

  if (!tenantId) return badRequest(res, 'TenantId wajib diisi');
  try {
    const result = await getBookingsByTenantId(tenantId, page, limit);
    return res.json(result);
  } catch (error) {
    return badRequest(res, (error as Error).message);
  }
}

export async function getSuccessfulBookingsHandler(req: Request, res: Response) {
  const userId = pickParam(req.params.userId);
  if (!userId) return badRequest(res, 'UserId wajib diisi');
  try {
    const bookings = await getSuccessfulBookingsByUserId(userId);
    return res.json(bookings);
  } catch (error) {
    return badRequest(res, (error as Error).message);
  }
}

export async function getRoomAvailabilityHandler(req: Request, res: Response) {
  const roomId = pickParam(req.params.roomId);
  const startDate = req.query.startDate ? new Date(String(req.query.startDate)) : undefined;
  const endDate = req.query.endDate ? new Date(String(req.query.endDate)) : undefined;

  if (!roomId) return badRequest(res, 'RoomId wajib diisi');
  if (!startDate || !endDate) return badRequest(res, 'StartDate dan EndDate wajib diisi');

  try {
    const availability = await getRoomAvailability(roomId, startDate, endDate);
    return res.json(availability);
  } catch (error) {
    return badRequest(res, (error as Error).message);
  }
}

export async function confirmPaymentHandler(req: Request, res: Response) {
  const paramsParsed = parseOrBad(res, bookingIdSchema, req.params);
  const tenantId = pickParam(req.body.tenantId);
  if (!paramsParsed || !tenantId) return badRequest(res, 'BookingId dan TenantId wajib diisi');
  try {
    const booking = await confirmPayment(paramsParsed.id, tenantId);
    return res.json(booking);
  } catch (error) {
    return badRequest(res, (error as Error).message);
  }
}

export async function rejectPaymentHandler(req: Request, res: Response) {
  const paramsParsed = parseOrBad(res, bookingIdSchema, req.params);
  const tenantId = pickParam(req.body.tenantId);
  if (!paramsParsed || !tenantId) return badRequest(res, 'BookingId dan TenantId wajib diisi');
  try {
    const booking = await rejectPayment(paramsParsed.id, tenantId);
    return res.json(booking);
  } catch (error) {
    return badRequest(res, (error as Error).message);
  }
}

export async function tenantCancelBookingHandler(req: Request, res: Response) {
  const paramsParsed = parseOrBad(res, bookingIdSchema, req.params);
  const tenantId = pickParam(req.body.tenantId);
  if (!paramsParsed || !tenantId) return badRequest(res, 'BookingId dan TenantId wajib diisi');
  try {
    const booking = await tenantCancelBooking(paramsParsed.id, tenantId);
    return res.json(booking);
  } catch (error) {
    return badRequest(res, (error as Error).message);
  }
}
