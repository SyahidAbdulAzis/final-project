export type BookingRequest = {
  userId: string;
  roomId: string;
  checkIn: string;
  checkOut: string;
  totalPrice: number;
  proofUrl?: string;
};

export type BookingResponse = {
  id: string;
  userId: string;
  roomId: string;
  checkIn: string;
  checkOut: string;
  totalPrice: number;
  status: 'MENUNGGU_PEMBAYARAN' | 'MENUNGGU_KONFIRMASI' | 'DIKONFIRMASI' | 'DIBATALKAN' | 'KADALUARSA';
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    photoUrl: string;
  };
  room: {
    id: string;
    name: string;
    description: string;
    basePrice: number;
    maxGuests: number;
    property: {
      id: string;
      name: string;
      city: string;
      address: string;
      images: { url: string }[];
    };
  };
  payment?: {
    id: string;
    bookingId: string;
    proofUrl: string;
    uploadedAt: string;
  };
};

export type ManualPaymentRequest = {
  proofUrl: string;
};
