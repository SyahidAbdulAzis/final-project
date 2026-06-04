import { Request, Response } from 'express';
import { getAllRooms, getRoomById } from '../services/room.service.js';

function badRequest(res: Response, message: string) {
  return res.status(400).json({ message });
}

export async function getAllRoomsHandler(req: Request, res: Response) {
  try {
    const rooms = await getAllRooms();
    return res.json(rooms);
  } catch (error) {
    return badRequest(res, (error as Error).message);
  }
}

export async function getRoomByIdHandler(req: Request, res: Response) {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  if (!id) return badRequest(res, 'Id wajib diisi');
  try {
    const room = await getRoomById(id);
    if (!room) return badRequest(res, 'Room tidak ditemukan');
    return res.json(room);
  } catch (error) {
    return badRequest(res, (error as Error).message);
  }
}
