import { apiRequest } from '@/services/api';

export type Period = 'today' | 'week' | 'month';
export type ShopReport = {
  period: Period; sales: number; orders: number; average: number;
  labels: string[]; values: number[]; peakLabel: string | null;
  movers: { name: string; units: number; revenue: number }[];
};
export type ReportExport = { id: string; period: Period; sales: number; orders: number; csv: string; createdAt?: string };

export const getReport = (period: Period) => apiRequest<ShopReport>(`/api/reports/shop?period=${period}`);
export const getExports = () => apiRequest<ReportExport[]>('/api/reports/shop/exports');
export const createExport = (period: Period) =>
  apiRequest<ReportExport>('/api/reports/shop/exports', { method: 'POST', body: JSON.stringify({ period }) });
export const deleteExport = (id: string) => apiRequest<{ id: string }>(`/api/reports/shop/exports/${id}`, { method: 'DELETE' });
