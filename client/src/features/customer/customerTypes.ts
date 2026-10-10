export type Shop = {
  id: string;
  name: string;
  category?: string;
  address: string;
  acceptingOrders: boolean;
};

export type Product = {
  id: string;
  name: string;
  price: number;
  available: boolean;
  stock: number;
  category: string;
  imageUrl?: string;
  shopId?: string;
};

export type SubstitutePreference = {
  enabled: boolean;
  type?: 'auto' | 'manual';
  title?: string;
  desc?: string;
  descType?: 'success' | 'warning' | 'neutral';
  note?: string;
};

export type CartItem = {
  product: Product;
  quantity: number;
  substitute?: SubstitutePreference;
  shopName?: string;
  needsReplacement?: boolean;
};

export type CustomerOrder = {
  id: string;
  status: 'pending' | 'accepted' | 'preparing' | 'ready' | 'picked-up' | 'cancelled';
  total: number;
};
