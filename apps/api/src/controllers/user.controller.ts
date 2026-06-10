import { Request, Response } from 'express';
import { z } from 'zod';
import { getAllUsers, getUserById } from '../services/user.service.js';
import { badRequest, parseOrBad, notFound } from '../utils/controller.utils.js';

const userIdSchema = z.object({ id: z.string().min(1) });

export async function getAllUsersHandler(req: Request, res: Response) {
  try {
    const users = await getAllUsers();
    return res.json(users);
  } catch (error) {
    return badRequest(res, (error as Error).message);
  }
}

export async function getUserByIdHandler(req: Request, res: Response) {
  const parsed = parseOrBad(res, userIdSchema, req.params);
  if (!parsed) return;
  try {
    const user = await getUserById(parsed.id);
    if (!user) return notFound(res, 'User tidak ditemukan');
    return res.json(user);
  } catch (error) {
    return badRequest(res, (error as Error).message);
  }
}
