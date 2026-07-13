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
  user?: { id: string; fullName: string; photoUrl: string };
  booking?: {
    room: {
      name: string;
      property: { id: string; name: string };
    };
  };
};

export async function createReview(bookingId: string, data: { rating: number; comment: string }) {
  const response = await apiClient.post<ReviewResponse>(`/reviews/${bookingId}`, data);
  return response.data;
}

export async function getReview(bookingId: string) {
  const response = await apiClient.get<{ review: ReviewResponse | null }>(`/reviews/${bookingId}`);
  return response.data.review;
}

export async function replyToReview(reviewId: string, data: { reply: string }) {
  const response = await apiClient.post<ReviewResponse>(`/reviews/${reviewId}/reply`, data);
  return response.data;
}

export async function getTenantReviews(page: number = 1, limit: number = 5) {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('limit', limit.toString());

  const { data } = await apiClient.get<{
    reviews: ReviewResponse[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>(`/reviews/tenant/all?${params.toString()}`);
  return data;
}
