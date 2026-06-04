import { Request, Response } from 'express';
import { getAllUsers, getUserById } from '../services/user.service.js';

function badRequest(res: Response, message: string) {
  return res.status(400).json({ message });
}

export async function getAllUsersHandler(req: Request, res: Response) {
  try {
    const users = await getAllUsers();
    return res.json(users);
  } catch (error) {
    return badRequest(res, (error as Error).message);
  }
}

export async function getUserByIdHandler(req: Request, res: Response) {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  if (!id) return badRequest(res, 'Id wajib diisi');
  try {
    const user = await getUserById(id);
    if (!user) return badRequest(res, 'User tidak ditemukan');
    return res.json(user);
  } catch (error) {
    return badRequest(res, (error as Error).message);
  }
}
