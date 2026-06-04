import { Router } from 'express';
import { getAllRoomsHandler, getRoomByIdHandler } from '../controllers/room.controller.js';

const roomRouter = Router();

roomRouter.get('/rooms', getAllRoomsHandler);
roomRouter.get('/rooms/:id', getRoomByIdHandler);

export { roomRouter };
