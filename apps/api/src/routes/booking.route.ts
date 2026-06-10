import { Router } from 'express';
import {
  createBookingHandler,
  getBookingHandler,
  getUserBookingsHandler,
  getRoomBookingsHandler,
  updateBookingHandler,
  deleteBookingHandler,
  getAllBookingsHandler,
  submitManualPaymentHandler,
} from '../controllers/booking.controller.js';

const bookingRouter = Router();

bookingRouter.post('/bookings', createBookingHandler);
bookingRouter.get('/bookings', getAllBookingsHandler);
bookingRouter.get('/bookings/:id', getBookingHandler);
bookingRouter.get('/bookings/user/:userId', getUserBookingsHandler);
bookingRouter.get('/bookings/room/:roomId', getRoomBookingsHandler);
bookingRouter.put('/bookings/:id', updateBookingHandler);
bookingRouter.delete('/bookings/:id', deleteBookingHandler);
bookingRouter.post('/bookings/:id/manual-payment', submitManualPaymentHandler);

export { bookingRouter };
