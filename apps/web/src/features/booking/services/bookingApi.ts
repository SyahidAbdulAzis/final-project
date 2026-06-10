import { apiClient } from '../../../lib/axios.js';
import type { BookingRequest, BookingResponse, ManualPaymentRequest } from '../../../types/booking.js';

export async function createBooking(bookingData: BookingRequest) {
  const { data } = await apiClient.post<BookingResponse>('/bookings', bookingData);
  return data;
}

export async function getBookingById(id: string) {
  const { data } = await apiClient.get<BookingResponse>(`/bookings/${id}`);
  return data;
}

export async function getUserBookings(userId: string) {
  const { data } = await apiClient.get<BookingResponse[]>(`/bookings/user/${userId}`);
  return data;
}

export async function submitManualPayment(bookingId: string, paymentData: ManualPaymentRequest) {
  const { data } = await apiClient.post<BookingResponse>(`/bookings/${bookingId}/manual-payment`, paymentData);
  return data;
}
