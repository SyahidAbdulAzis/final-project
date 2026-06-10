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
roomRouter.get('/properties/:propertyId/rooms', getRoomsByPropertyHandler);
roomRouter.post('/rooms', verifyToken, requireRole('TENANT'), createRoomHandler);
roomRouter.patch('/rooms/:id', verifyToken, requireRole('TENANT'), updateRoomHandler);
roomRouter.delete('/rooms/:id', verifyToken, requireRole('TENANT'), deleteRoomHandler);

export { roomRouter };
