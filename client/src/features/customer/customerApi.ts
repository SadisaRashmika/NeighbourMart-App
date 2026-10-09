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
