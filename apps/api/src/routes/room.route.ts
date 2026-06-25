import { Router } from 'express';
import {
  getAllRoomsHandler,
  getRoomByIdHandler,
  createRoomHandler,
  updateRoomHandler,
  deleteRoomHandler,
  getRoomsByPropertyHandler,
} from '../controllers/room.controller.js';
import { verifyToken, requireRole } from '../middlewares/auth.middleware.js';

const roomRouter = Router();

roomRouter.get('/rooms', getAllRoomsHandler);
roomRouter.get('/rooms/:id', getRoomByIdHandler);
roomRouter.get('/properties/:propertyId/rooms', verifyToken as any, requireRole('TENANT') as any, getRoomsByPropertyHandler as any);
roomRouter.post('/rooms', verifyToken as any, requireRole('TENANT') as any, createRoomHandler as any);
roomRouter.patch('/rooms/:id', verifyToken as any, requireRole('TENANT') as any, updateRoomHandler as any);
roomRouter.delete('/rooms/:id', verifyToken as any, requireRole('TENANT') as any, deleteRoomHandler as any);

export { roomRouter };
