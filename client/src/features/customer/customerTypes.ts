export type Product = {
  id: string;
  name: string;
  price: number;
  available: boolean;
  stock?: number;
  category?: string;
  shopId?: string;
};

export type CartItem = {
  product: Product;
  quantity: number;
  needsReplacement?: boolean;
};

export type CustomerOrder = {
  id: string;
  status: 'pending' | 'accepted' | 'preparing' | 'ready' | 'picked-up' | 'cancelled';
  total: number;
  customerName?: string;
  shop?: { id: string; name: string; address: string } | null;
  items?: { productId: string; name: string; quantity: number; unitPrice: number }[];
  pickupSlot?: { id: string; date: string; startTime: string; endTime: string } | null;
  pickupNote?: string;
  paymentMethod?: string;
  lastStatusUpdateAt?: string;
};
