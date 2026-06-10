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
  getBookingsByRoomId,
  updateBooking,
  deleteBooking,
  getAllBookings,
  submitManualPayment,
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
  if (!userId) return badRequest(res, 'UserId wajib diisi');
  try {
    const bookings = await getBookingsByUserId(userId);
    return res.json(bookings);
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
