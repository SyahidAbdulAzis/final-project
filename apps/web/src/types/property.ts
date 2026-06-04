export type SortField = 'name' | 'price';
export type SortOrder = 'asc' | 'desc';

export type PropertyQuery = {
  city: string;
  checkIn: string;
  duration: number;
  page: number;
  take: number;
  name: string;
  category: string;
  sortBy: SortField;
  order: SortOrder;
};

export type PropertyItem = {
  id: number;
  name: string;
  city: string;
  category: string;
  description: string;
  price: number;
  imageUrl: string;
  available: boolean;
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
