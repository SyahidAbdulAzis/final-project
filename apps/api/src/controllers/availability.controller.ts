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
import { badRequest, pickParam, parseOrBad } from '../utils/controller.utils.js';

export async function createAvailabilityHandler(req: Request, res: Response) {
  const parsed = parseOrBad(res, availabilityCreateSchema, req.body);
  if (!parsed) return;
  try {
    const item = await createAvailability({
      ...parsed,
      date: new Date(parsed.date),
      isAvailable: parsed.isAvailable ?? true,
    });
    return res.status(201).json(item);
  } catch (error) {
    return badRequest(res, (error as Error).message);
  }
}

export async function bulkAvailabilityHandler(req: Request, res: Response) {
  const parsed = parseOrBad(res, availabilityBulkSchema, req.body);
  if (!parsed) return;
  try {
    const items = await bulkAvailability({
      roomId: parsed.roomId,
      dates: parsed.dates.map((d: string) => new Date(d)),
      isAvailable: parsed.isAvailable ?? true,
    });
    return res.status(201).json(items);
  } catch (error) {
    return badRequest(res, (error as Error).message);
  }
}

export async function getAvailabilitiesHandler(req: Request, res: Response) {
  const roomId = pickParam(String(req.query.roomId));
  if (!roomId) return badRequest(res, 'Room ID wajib diisi');
  try {
    const items = await getAvailabilitiesByRoom(roomId);
    return res.json(items);
  } catch (error) {
    return badRequest(res, (error as Error).message);
  }
}

export async function createSeasonalRateHandler(req: Request, res: Response) {
  const parsed = parseOrBad(res, seasonalRateCreateSchema, req.body);
  if (!parsed) return;
  try {
    const item = await createSeasonalRate({
      ...parsed,
      startDate: new Date(parsed.startDate),
      endDate: new Date(parsed.endDate),
    });
    return res.status(201).json(item);
  } catch (error) {
    return badRequest(res, (error as Error).message);
  }
}

export async function getSeasonalRatesHandler(req: Request, res: Response) {
  const roomId = pickParam(String(req.query.roomId));
  if (!roomId) return badRequest(res, 'Room ID wajib diisi');
  try {
    const items = await getSeasonalRatesByRoom(roomId);
    return res.json(items);
  } catch (error) {
    return badRequest(res, (error as Error).message);
  }
}

export async function updateSeasonalRateHandler(req: Request, res: Response) {
  const id = pickParam(req.params.id);
  if (!id) return badRequest(res, 'Id wajib diisi');
  const parsed = parseOrBad(res, seasonalRateUpdateSchema, req.body);
  if (!parsed) return;
  try {
    const data: Parameters<typeof updateSeasonalRate>[1] = {};
    if (parsed.name) data.name = parsed.name;
    if (parsed.startDate) data.startDate = new Date(parsed.startDate);
    if (parsed.endDate) data.endDate = new Date(parsed.endDate);
    if (parsed.adjustmentType) data.adjustmentType = parsed.adjustmentType;
    if (parsed.adjustmentValue !== undefined) data.adjustmentValue = parsed.adjustmentValue;
    const item = await updateSeasonalRate(id, data);
    return res.json(item);
  } catch (error) {
    return badRequest(res, (error as Error).message);
  }
}

export async function deleteSeasonalRateHandler(req: Request, res: Response) {
  const id = pickParam(req.params.id);
  if (!id) return badRequest(res, 'Id wajib diisi');
  try {
    await deleteSeasonalRate(id);
    return res.json({ message: 'Tarif musim berhasil dihapus' });
  } catch (error) {
    return badRequest(res, (error as Error).message);
  }
}
