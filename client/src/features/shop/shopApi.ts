import { apiRequest } from '@/services/api';
import type { OrderStatus, ShopOrder, ShopOrderDetails, ShopProfile, ShopProfileUpdate, StockInput, StockItem } from './shopTypes';

const json = (method: string, body: unknown) => ({ method, body: JSON.stringify(body) });

// Shop profile (dashboard)
export const getMyShop = () => apiRequest<ShopProfile>('/api/shops/me');
export const updateMyShop = (patch: ShopProfileUpdate) => apiRequest<ShopProfile>('/api/shops/me', json('PATCH', patch));

// Stock: CRUD
export const getStockItems = () => apiRequest<StockItem[]>('/api/products/shop');
export const createStockItem = (data: StockInput) => apiRequest<StockItem>('/api/products', json('POST', data));
export const updateStockItem = (id: string, patch: Partial<StockInput>) => apiRequest<StockItem>(`/api/products/${id}`, json('PUT', patch));
export const deleteStockItem = (id: string) => apiRequest<{ id: string }>(`/api/products/${id}`, { method: 'DELETE' });

// Orders: CRUD
export const getShopOrders = () => apiRequest<ShopOrder[]>('/api/orders/shop');
export const createShopOrder = (customerName: string, items: { productId: string; quantity: number }[]) =>
  apiRequest<ShopOrder>('/api/orders/shop', json('POST', { customerName, items }));
export const updateOrderStatus = (id: string, status: OrderStatus) =>
  apiRequest<ShopOrder>(`/api/orders/${id}/status`, json('PATCH', { status }));
export const deleteShopOrder = (id: string) => apiRequest<{ id: string }>(`/api/orders/${id}`, { method: 'DELETE' });
export const getShopOrder = (id: string) => apiRequest<ShopOrderDetails>(`/api/orders/shop/${id}`);
export const proposeOrderSubstitution = (id: string, productId: string, replacementId: string, note?: string) =>
  apiRequest<ShopOrderDetails>(`/api/orders/${id}/items/${productId}/substitution`, json('POST', { replacementId, note }));
export const verifyOrderPickup = (id: string, value: string) =>
  apiRequest<ShopOrderDetails>(`/api/orders/${id}/verify-pickup`, json('POST', { value }));
export const confirmOrderPayment = (id: string) => apiRequest<ShopOrderDetails>(`/api/orders/${id}/payment`, { method: 'PATCH' });
export const completeOrderHandoff = (id: string) => apiRequest<ShopOrderDetails>(`/api/orders/${id}/complete-handoff`, { method: 'POST' });
