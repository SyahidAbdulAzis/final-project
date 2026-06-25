import { apiClient } from '../../../lib/axios.js';

export type ReviewResponse = {
  id: string;
  bookingId: string;
  userId: string;
  rating: number;
  comment: string;
  tenantReply: string | null;
  repliedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export async function createReview(bookingId: string, data: { rating: number; comment: string }) {
  const response = await apiClient.post<ReviewResponse>(`/reviews/${bookingId}`, data);
  return response.data;
}

export async function getReview(bookingId: string) {
  const response = await apiClient.get<{ review: ReviewResponse | null }>(`/reviews/${bookingId}`);
  return response.data.review;
}
