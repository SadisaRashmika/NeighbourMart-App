import { apiRequest } from '@/services/api';
import type { ShopOrder, StockItem } from './shopTypes';

export function getShopOrders() {
  return apiRequest<ShopOrder[]>('/api/orders/shop');
}

export function getStockItems() {
  return apiRequest<StockItem[]>('/api/products/shop');
}
