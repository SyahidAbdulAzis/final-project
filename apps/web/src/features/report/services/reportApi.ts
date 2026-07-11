import { apiClient } from '../../../lib/axios.js';

export interface SalesReportByProperty {
  propertyId: string;
  propertyName: string;
  totalSales: number;
  transactionCount: number;
  bookings: Array<{
    id: string;
    userId: string;
    userName: string;
    checkIn: string;
    checkOut: string;
    totalPrice: number;
    status: string;
    createdAt: string;
  }>;
}

export interface SalesReportByUser {
  userId: string;
  userName: string;
  userEmail: string;
  totalSales: number;
  transactionCount: number;
  bookings: Array<{
    id: string;
    propertyName: string;
    checkIn: string;
    checkOut: string;
    totalPrice: number;
    status: string;
    createdAt: string;
  }>;
}

export interface SalesReportByTransaction {
  id: string;
  propertyName: string;
  userName: string;
  userEmail: string;
  checkIn: string;
  checkOut: string;
  totalPrice: number;
  status: string;
  createdAt: string;
}

export interface SalesChartItem {
  propertyId: string;
  propertyName: string;
  totalSales: number;
  percentage: number;
}

export async function getSalesChartData(
  tenantId: string,
  startDate?: string,
  endDate?: string,
) {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);

  const { data } = await apiClient.get<SalesChartItem[]>(
    `/reports/tenant/${tenantId}/sales/chart?${params.toString()}`
  );
  return data;
}

export interface PropertyAvailabilityData {
  propertyId: string;
  propertyName: string;
  propertyCity: string;
  rooms: Array<{
    roomId: string;
    roomName: string;
    bookings: Array<{
      id: string;
      checkIn: string;
      checkOut: string;
      status: string;
    }>;
  }>;
}

export async function getSalesReportByProperty(
  tenantId: string,
  startDate?: string,
  endDate?: string,
  sortBy?: 'date' | 'totalSales'
) {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  if (sortBy) params.append('sortBy', sortBy);

  const { data } = await apiClient.get<SalesReportByProperty[]>(
    `/reports/tenant/${tenantId}/sales/property?${params.toString()}`
  );
  return data;
}

export async function getSalesReportByUser(
  tenantId: string,
  startDate?: string,
  endDate?: string,
  sortBy?: 'date' | 'totalSales'
) {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  if (sortBy) params.append('sortBy', sortBy);

  const { data } = await apiClient.get<SalesReportByUser[]>(
    `/reports/tenant/${tenantId}/sales/user?${params.toString()}`
  );
  return data;
}

export async function getSalesReportByTransaction(
  tenantId: string,
  startDate?: string,
  endDate?: string,
  sortBy?: 'date' | 'totalSales'
) {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  if (sortBy) params.append('sortBy', sortBy);

  const { data } = await apiClient.get<SalesReportByTransaction[]>(
    `/reports/tenant/${tenantId}/sales/transaction?${params.toString()}`
  );
  return data;
}

export async function getPropertyAvailabilityCalendar(
  tenantId: string,
  startDate: string,
  endDate: string
) {
  const params = new URLSearchParams();
  params.append('startDate', startDate);
  params.append('endDate', endDate);

  const { data } = await apiClient.get<PropertyAvailabilityData[]>(
    `/reports/tenant/${tenantId}/property-availability?${params.toString()}`
  );
  return data;
}
