import { apiRequest } from '@/services/api';
import type { CustomerOrder } from './customerTypes';
export const getOrder = (id: string) => apiRequest<CustomerOrder>(`/api/orders/${id}`);
export const setOrderStatus = (id: string, status: CustomerOrder['status']) => apiRequest<CustomerOrder>(`/api/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
