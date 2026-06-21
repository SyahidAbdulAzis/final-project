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

export async function getUserBookings(userId: string, page: number = 1, limit: number = 5) {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('limit', limit.toString());

  const { data } = await apiClient.get<{
    bookings: BookingResponse[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>(`/bookings/user/${userId}?${params.toString()}`);
  return data;
}

export async function submitManualPayment(bookingId: string, paymentData: ManualPaymentRequest) {
  const { data } = await apiClient.post<BookingResponse>(`/bookings/${bookingId}/manual-payment`, paymentData);
  return data;
}

export async function cancelBooking(bookingId: string) {
  const { data } = await apiClient.post<BookingResponse>(`/bookings/${bookingId}/cancel`);
  return data;
}

export async function getTenantBookings(tenantId: string, page: number = 1, limit: number = 5) {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('limit', limit.toString());

  const { data } = await apiClient.get<{
    bookings: BookingResponse[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>(`/bookings/tenant/${tenantId}?${params.toString()}`);
  return data;
}

export async function confirmPayment(bookingId: string, tenantId: string) {
  const { data } = await apiClient.post<BookingResponse>(`/bookings/${bookingId}/confirm-payment`, { tenantId });
  return data;
}

export async function rejectPayment(bookingId: string, tenantId: string) {
  const { data } = await apiClient.post<BookingResponse>(`/bookings/${bookingId}/reject-payment`, { tenantId });
  return data;
}

export async function tenantCancelBooking(bookingId: string, tenantId: string) {
  const { data } = await apiClient.post<BookingResponse>(`/bookings/${bookingId}/tenant-cancel`, { tenantId });
  return data;
}

export async function getSuccessfulBookings(userId: string) {
  const { data } = await apiClient.get<BookingResponse[]>(`/bookings/user/${userId}/successful`);
  return data;
}

export async function getRoomAvailability(roomId: string, startDate: string, endDate: string) {
  const params = new URLSearchParams();
  params.append('startDate', startDate);
  params.append('endDate', endDate);

  const { data } = await apiClient.get<Array<{ checkIn: string; checkOut: string }>>(
    `/bookings/room/${roomId}/availability?${params.toString()}`
  );
  return data;
}
