export type ShopOrder = {
  id: string;
  customerName: string;
  status: 'new' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  total: number;
};

export type StockItem = {
  id: string;
  name: string;
  price: number;
  stock: number;
  available: boolean;
};
