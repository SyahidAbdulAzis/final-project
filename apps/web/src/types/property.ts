export type PropertyQuery = {
  city: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  page: number;
  take: number;
};

export type PropertyItem = {
  id: string;
  name: string;
  city: string;
  category: string;
  description: string;
  price: number;
  imageUrl: string;
  available: boolean;
  rating?: number;
};

export type PropertyMeta = {
  page: number;
  take: number;
  total: number;
  totalPages: number;
};

export type PropertyResponse = {
  data: PropertyItem[];
  meta: PropertyMeta;
};
