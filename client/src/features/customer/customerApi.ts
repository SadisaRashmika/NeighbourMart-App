import { apiRequest } from '@/services/api';
import type { CustomerOrder, Product } from './customerTypes';

export function getProducts() {
  return apiRequest<Product[]>('/api/products');
}

export function getCustomerOrders() {
  return apiRequest<CustomerOrder[]>('/api/orders/mine');
}
