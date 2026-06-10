import { Request, Response } from 'express';
import {
  getAllRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
  getRoomsByProperty,
} from '../services/room.service.js';
import { roomCreateSchema, roomUpdateSchema } from '../validations/room.validation.js';
import type { AuthRequest } from '../middlewares/auth.middleware.js';
import { badRequest, pickParam, parseOrBad, notFound } from '../utils/controller.utils.js';

export async function getAllRoomsHandler(_req: Request, res: Response) {
  try {
    const rooms = await getAllRooms();
    return res.json(rooms);
  } catch (error) {
    return badRequest(res, (error as Error).message);
  }
}

export async function getRoomByIdHandler(req: Request, res: Response) {
  const id = pickParam(req.params.id);
  if (!id) return badRequest(res, 'Id wajib diisi');
  try {
    const room = await getRoomById(id);
    if (!room) return notFound(res, 'Room tidak ditemukan');
    return res.json(room);
  } catch (error) {
    return badRequest(res, (error as Error).message);
  }
}

export async function createRoomHandler(req: AuthRequest, res: Response) {
  const parsed = parseOrBad(res, roomCreateSchema, req.body);
  if (!parsed) return;
  try {
    const room = await createRoom({ ...parsed, description: parsed.description || '' });
    return res.status(201).json(room);
  } catch (error) {
    return badRequest(res, (error as Error).message);
  }
}

export async function updateRoomHandler(req: AuthRequest, res: Response) {
  const id = pickParam(req.params.id);
  if (!id) return badRequest(res, 'Id wajib diisi');
  const parsed = parseOrBad(res, roomUpdateSchema, req.body);
  if (!parsed) return;
  try {
    const room = await updateRoom(id, parsed);
    return res.json(room);
  } catch (error) {
    return badRequest(res, (error as Error).message);
  }
}

export async function deleteRoomHandler(req: AuthRequest, res: Response) {
  const id = pickParam(req.params.id);
  if (!id) return badRequest(res, 'Id wajib diisi');
  try {
    await deleteRoom(id);
    return res.json({ message: 'Room berhasil dihapus' });
  } catch (error) {
    return badRequest(res, (error as Error).message);
  }
}

export async function getRoomsByPropertyHandler(req: Request, res: Response) {
  const propertyId = pickParam(req.params.propertyId);
  if (!propertyId) return badRequest(res, 'Property ID wajib diisi');
  try {
    const rooms = await getRoomsByProperty(propertyId);
    return res.json(rooms);
  } catch (error) {
    return badRequest(res, (error as Error).message);
  }
}
