import { Request, Response } from 'express';
import {
  availabilityCreateSchema,
  availabilityBulkSchema,
  seasonalRateCreateSchema,
  seasonalRateUpdateSchema,
} from '../validations/availability.validation.js';
import {
  createAvailability,
  bulkAvailability,
  getAvailabilitiesByRoom,
  createSeasonalRate,
  getSeasonalRatesByRoom,
  updateSeasonalRate,
  deleteSeasonalRate,
} from '../services/availability.service.js';
import type { AuthRequest } from '../middlewares/auth.middleware.js';
import { badRequest, handleError, pickParam, parseOrBad } from '../utils/controller.utils.js';

export async function createAvailabilityHandler(req: AuthRequest, res: Response) {
  const parsed = parseOrBad(res, availabilityCreateSchema, req.body);
  if (!parsed) return;
  try {
    const item = await createAvailability(req.user!.id, {
      ...parsed,
      date: new Date(parsed.date),
      isAvailable: parsed.isAvailable ?? true,
    });
    return res.status(201).json(item);
  } catch (error) {
    return handleError(res, error);
  }
}

export async function bulkAvailabilityHandler(req: AuthRequest, res: Response) {
  const parsed = parseOrBad(res, availabilityBulkSchema, req.body);
  if (!parsed) return;
  try {
    const items = await bulkAvailability(req.user!.id, {
      roomId: parsed.roomId,
      dates: parsed.dates.map((d: string) => new Date(d)),
      isAvailable: parsed.isAvailable ?? true,
    });
    return res.status(201).json(items);
  } catch (error) {
    return handleError(res, error);
  }
}

export async function getAvailabilitiesHandler(req: Request, res: Response) {
  const roomId = pickParam(String(req.query.roomId));
  if (!roomId) return badRequest(res, 'Room ID wajib diisi');
  const page = Number(req.query.page) || 1;
  const take = Number(req.query.take) || 10;
  try {
    const all = await getAvailabilitiesByRoom(roomId);
    const total = all.length;
    const totalPages = Math.max(1, Math.ceil(total / take));
    const data = all.slice((page - 1) * take, page * take);
    return res.json({ data, meta: { page, take, total, totalPages } });
  } catch (error) {
    return handleError(res, error);
  }
}

export async function createSeasonalRateHandler(req: AuthRequest, res: Response) {
  const parsed = parseOrBad(res, seasonalRateCreateSchema, req.body);
  if (!parsed) return;
  try {
    const item = await createSeasonalRate(req.user!.id, {
      ...parsed,
      startDate: new Date(parsed.startDate),
      endDate: new Date(parsed.endDate),
    });
    return res.status(201).json(item);
  } catch (error) {
    return handleError(res, error);
  }
}

export async function getSeasonalRatesHandler(req: Request, res: Response) {
  const roomId = pickParam(String(req.query.roomId));
  if (!roomId) return badRequest(res, 'Room ID wajib diisi');
  const page = Number(req.query.page) || 1;
  const take = Number(req.query.take) || 10;
  try {
    const all = await getSeasonalRatesByRoom(roomId);
    const total = all.length;
    const totalPages = Math.max(1, Math.ceil(total / take));
    const data = all.slice((page - 1) * take, page * take);
    return res.json({ data, meta: { page, take, total, totalPages } });
  } catch (error) {
    return handleError(res, error);
  }
}

export async function updateSeasonalRateHandler(req: AuthRequest, res: Response) {
  const id = pickParam(req.params.id);
  if (!id) return badRequest(res, 'Id wajib diisi');
  const parsed = parseOrBad(res, seasonalRateUpdateSchema, req.body);
  if (!parsed) return;
  try {
    const data: Parameters<typeof updateSeasonalRate>[2] = {};
    if (parsed.name) data.name = parsed.name;
    if (parsed.startDate) data.startDate = new Date(parsed.startDate);
    if (parsed.endDate) data.endDate = new Date(parsed.endDate);
    if (parsed.adjustmentType) data.adjustmentType = parsed.adjustmentType;
    if (parsed.adjustmentValue !== undefined) data.adjustmentValue = parsed.adjustmentValue;
    const item = await updateSeasonalRate(id, req.user!.id, data);
    return res.json(item);
  } catch (error) {
    return handleError(res, error);
  }
}

export async function deleteSeasonalRateHandler(req: AuthRequest, res: Response) {
  const id = pickParam(req.params.id);
  if (!id) return badRequest(res, 'Id wajib diisi');
  try {
    await deleteSeasonalRate(id, req.user!.id);
    return res.json({ message: 'Tarif musim berhasil dihapus' });
  } catch (error) {
    return handleError(res, error);
  }
}
