export type OrderStatus = 'new' | 'preparing' | 'ready' | 'completed' | 'cancelled';

export type ShopOrder = {
  id: string;
  orderNumber: string;
  customerName: string;
  status: OrderStatus;
  total: number;
  createdAt?: string;
  items: { name: string; quantity: number; unitPrice: number }[];
};

export type StockItem = {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  available: boolean;
};

export type StockInput = Omit<StockItem, 'id'>;
export type ShopProfile = { id: string; name: string; address: string; acceptingOrders: boolean };

export const LOW_STOCK_LIMIT = 5;
export const stockState = (item: StockItem): 'out' | 'low' | 'in' =>
  item.stock === 0 ? 'out' : item.stock <= LOW_STOCK_LIMIT ? 'low' : 'in';
