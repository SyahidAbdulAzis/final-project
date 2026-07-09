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
availabilityRouter.post('/availabilities', verifyToken, requireRole('TENANT'), createAvailabilityHandler);
availabilityRouter.post('/availabilities/bulk', verifyToken, requireRole('TENANT'), bulkAvailabilityHandler);

availabilityRouter.get('/seasonal-rates', getSeasonalRatesHandler);
availabilityRouter.post('/seasonal-rates', verifyToken, requireRole('TENANT'), createSeasonalRateHandler);
availabilityRouter.patch('/seasonal-rates/:id', verifyToken, requireRole('TENANT'), updateSeasonalRateHandler);
availabilityRouter.delete('/seasonal-rates/:id', verifyToken, requireRole('TENANT'), deleteSeasonalRateHandler);

export { availabilityRouter };
