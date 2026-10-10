import { apiRequest } from '@/services/api';
import type { CustomerOrder, Product, Shop } from './customerTypes';

export function getShops() {
  return apiRequest<Shop[]>('/api/shops');
}

export function getProducts(shopId?: string) {
  return apiRequest<Product[]>(`/api/products${shopId ? `?shopId=${shopId}` : ''}`);
}

export function getCustomerOrders() {
  return apiRequest<CustomerOrder[]>('/api/orders/mine');
}

export function getCustomerOrder(id: string) {
  return apiRequest<CustomerOrder>(`/api/orders/${id}`);
}

export function cancelCustomerOrder(id: string) {
  return apiRequest<CustomerOrder>(`/api/orders/${id}/cancel`, { method: 'PATCH' });
}

export function respondToOrderSubstitution(id: string, productId: string, decision: 'approved' | 'rejected') {
  return apiRequest<CustomerOrder>(`/api/orders/${id}/items/${productId}/substitution`, {
    method: 'PATCH', body: JSON.stringify({ decision }),
  });
}
