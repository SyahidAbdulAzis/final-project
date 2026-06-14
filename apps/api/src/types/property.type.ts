export type SortBy = 'name' | 'price';
export type Order = 'asc' | 'desc';

export type PropertyQuery = {
  page: number;
  take: number;
  city: string;
  name: string;
  category: string;
  sortBy: SortBy;
  order: Order;
  checkIn?: string;
  checkOut?: string;
  guests: number;
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
