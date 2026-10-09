export type ShopOrder = {
  id: string;
  customerName: string;
  status: 'pending' | 'accepted' | 'preparing' | 'ready' | 'picked-up' | 'cancelled';
  total: number;
};

export type StockItem = {
  id: string;
  name: string;
  price: number;
  stock: number;
  available: boolean;
};
