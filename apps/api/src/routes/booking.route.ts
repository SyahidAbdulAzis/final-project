import { Router } from 'express';
import {
  createBookingHandler,
  getBookingHandler,
  getUserBookingsHandler,
  getSuccessfulBookingsHandler,
  getRoomBookingsHandler,
  getRoomAvailabilityHandler,
  getTenantBookingsHandler,
  updateBookingHandler,
  deleteBookingHandler,
  getAllBookingsHandler,
  submitManualPaymentHandler,
  cancelBookingHandler,
  confirmPaymentHandler,
  rejectPaymentHandler,
  tenantCancelBookingHandler,
} from '../controllers/booking.controller.js';
import { verifyToken, requireRole } from '../middlewares/auth.middleware.js';

const bookingRouter = Router();

bookingRouter.post('/bookings', createBookingHandler);
bookingRouter.get('/bookings', getAllBookingsHandler);
bookingRouter.get('/bookings/:id', getBookingHandler);
bookingRouter.get('/bookings/user/:userId', getUserBookingsHandler);
bookingRouter.get('/bookings/user/:userId/successful', getSuccessfulBookingsHandler);
bookingRouter.get('/bookings/room/:roomId', getRoomBookingsHandler);
bookingRouter.get('/bookings/room/:roomId/availability', getRoomAvailabilityHandler);
bookingRouter.get('/bookings/tenant/:tenantId', verifyToken as any, requireRole('TENANT') as any, getTenantBookingsHandler as any);
bookingRouter.put('/bookings/:id', updateBookingHandler);
bookingRouter.delete('/bookings/:id', deleteBookingHandler);
bookingRouter.post('/bookings/:id/manual-payment', submitManualPaymentHandler);
bookingRouter.post('/bookings/:id/cancel', cancelBookingHandler);
bookingRouter.post('/bookings/:id/confirm-payment', confirmPaymentHandler);
bookingRouter.post('/bookings/:id/reject-payment', rejectPaymentHandler);
bookingRouter.post('/bookings/:id/tenant-cancel', tenantCancelBookingHandler);

export { bookingRouter };
