import { apiClient } from '../../../lib/axios.js';

export async function getProperties(params?: {
  page?: number;
  take?: number;
  city?: string;
  name?: string;
  category?: string;
  sortBy?: string;
  order?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
}) {
  const { data } = await apiClient.get('/properties', { params });
  return data;
}

export async function getPropertyDetail(id: string) {
  const { data } = await apiClient.get(`/properties/${id}`);
  return data;
}

export async function getCategories() {
  const { data } = await apiClient.get('/categories');
  return data;
}

export async function createCategory(name: string) {
  const { data } = await apiClient.post('/categories', { name });
  return data;
}

export async function updateCategory(id: string, name: string) {
  const { data } = await apiClient.patch(`/categories/${id}`, { name });
  return data;
}

export async function deleteCategory(id: string) {
  const { data } = await apiClient.delete(`/categories/${id}`);
  return data;
}

export async function getTenantProperties() {
  const { data } = await apiClient.get('/tenant/properties');
  return data;
}

export async function createProperty(propertyData: {
  name: string; city: string; address: string; province?: string;
  latitude?: number; longitude?: number; description?: string;
  categoryId: string; images?: string[];
}) {
  const { data } = await apiClient.post('/properties', propertyData);
  return data;
}

export async function updateProperty(id: string, propertyData: Partial<{
  name: string; city: string; address: string; province: string;
  latitude: number; longitude: number; description: string; categoryId: string;
}>) {
  const { data } = await apiClient.patch(`/properties/${id}`, propertyData);
  return data;
}

export async function deleteProperty(id: string) {
  const { data } = await apiClient.delete(`/properties/${id}`);
  return data;
}

export async function createRoom(roomData: {
  propertyId: string; name: string; description?: string;
  basePrice: number; maxGuests?: number;
}) {
  const { data } = await apiClient.post('/rooms', roomData);
  return data;
}

export async function updateRoom(id: string, roomData: Partial<{
  name: string; description: string; basePrice: number; maxGuests: number;
}>) {
  const { data } = await apiClient.patch(`/rooms/${id}`, roomData);
  return data;
}

export async function deleteRoom(id: string) {
  const { data } = await apiClient.delete(`/rooms/${id}`);
  return data;
}

export async function getRoomsByProperty(propertyId: string) {
  const { data } = await apiClient.get(`/properties/${propertyId}/rooms`);
  return data;
}

export async function setAvailability(availabilityData: {
  roomId: string; date: string; isAvailable: boolean;
}) {
  const { data } = await apiClient.post('/availabilities', availabilityData);
  return data;
}

export async function bulkAvailability(bulkData: {
  roomId: string; dates: string[]; isAvailable: boolean;
}) {
  const { data } = await apiClient.post('/availabilities/bulk', bulkData);
  return data;
}

export async function getAvailabilities(roomId: string) {
  const { data } = await apiClient.get('/availabilities', { params: { roomId } });
  return data;
}

export async function createSeasonalRate(rateData: {
  roomId: string; name: string; startDate: string; endDate: string;
  adjustmentType: 'NOMINAL' | 'PERCENTAGE'; adjustmentValue: number;
}) {
  const { data } = await apiClient.post('/seasonal-rates', rateData);
  return data;
}

export async function getSeasonalRates(roomId: string) {
  const { data } = await apiClient.get('/seasonal-rates', { params: { roomId } });
  return data;
}

export async function updateSeasonalRate(id: string, rateData: Partial<{
  name: string; startDate: string; endDate: string;
  adjustmentType: 'NOMINAL' | 'PERCENTAGE'; adjustmentValue: number;
}>) {
  const { data } = await apiClient.patch(`/seasonal-rates/${id}`, rateData);
  return data;
}

export async function deleteSeasonalRate(id: string) {
  const { data } = await apiClient.delete(`/seasonal-rates/${id}`);
  return data;
}
