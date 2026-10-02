export type Product = {
  id: string;
  name: string;
  price: number;
  available: boolean;
};

export type CartItem = {
  product: Product;
  quantity: number;
};

export type CustomerOrder = {
  id: string;
  status: 'pending' | 'accepted' | 'preparing' | 'ready' | 'picked-up' | 'cancelled';
  total: number;
};
