import { Router } from 'express';
import {
  createAvailabilityHandler,
  bulkAvailabilityHandler,
  getAvailabilitiesHandler,
  createSeasonalRateHandler,
  getSeasonalRatesHandler,
  updateSeasonalRateHandler,
  deleteSeasonalRateHandler,
} from '../controllers/availability.controller.js';
import { verifyToken, requireRole } from '../middlewares/auth.middleware.js';

const availabilityRouter = Router();

availabilityRouter.get('/availabilities', getAvailabilitiesHandler);
availabilityRouter.post('/availabilities', verifyToken as any, requireRole('TENANT') as any, createAvailabilityHandler as any);
availabilityRouter.post('/availabilities/bulk', verifyToken as any, requireRole('TENANT') as any, bulkAvailabilityHandler as any);

availabilityRouter.get('/seasonal-rates', getSeasonalRatesHandler);
availabilityRouter.post('/seasonal-rates', verifyToken as any, requireRole('TENANT') as any, createSeasonalRateHandler as any);
availabilityRouter.patch('/seasonal-rates/:id', verifyToken as any, requireRole('TENANT') as any, updateSeasonalRateHandler as any);
availabilityRouter.delete('/seasonal-rates/:id', verifyToken as any, requireRole('TENANT') as any, deleteSeasonalRateHandler as any);

export { availabilityRouter };
