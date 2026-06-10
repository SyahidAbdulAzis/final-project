import { useState } from 'react';
import { createBooking } from '../services/bookingApi.js';
import type { BookingRequest, BookingResponse } from '../../../types/booking.js';

export function useBooking() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitBooking = async (bookingData: BookingRequest): Promise<BookingResponse | null> => {
    setLoading(true);
    setError(null);
    try {
      const result = await createBooking(bookingData);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal membuat booking');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { submitBooking, loading, error };
}
