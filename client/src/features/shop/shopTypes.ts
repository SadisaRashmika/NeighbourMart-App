export type OrderStatus = 'new' | 'preparing' | 'ready' | 'completed' | 'cancelled';

export type ShopOrder = {
  id: string;
  orderNumber: string;
  customerName: string;
  status: OrderStatus;
  total: number;
  createdAt?: string;
  items: { name: string; quantity: number; unitPrice: number }[];
  pickupSlot?: { id: string; date: string; startTime: string; endTime: string } | null;
  paymentMethod?: 'cash' | 'card' | 'lankaqr';
  paymentStatus?: 'pending' | 'paid' | 'failed' | 'refunded';
  pendingSubstitutions?: number;
};

export type ShopOrderDetails = {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone?: string;
  status: 'pending' | 'accepted' | 'preparing' | 'ready' | 'picked-up' | 'cancelled';
  total: number;
  subtotal: number;
  packingFee: number;
  communityDiscount: number;
  paymentMethod: 'cash' | 'card' | 'lankaqr';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  pickupNote?: string;
  pickupVerifiedAt?: string;
  pendingSubstitutions: number;
  pickupSlot?: { id: string; date: string; startTime: string; endTime: string } | null;
  items: {
    productId: string; category?: string; name: string; imageUrl?: string; quantity: number; unitPrice: number; lineTotal: number;
    substitutionPreference?: string;
    substitution?: { status: 'none' | 'pending' | 'approved' | 'rejected' | 'expired'; suggestedName?: string; shopkeeperNote?: string };
  }[];
  timeline: { event: string; label: string; description?: string; occurredAt: string }[];
};

export type StockItem = {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  available: boolean;
  imageUrl?: string;
};

export type StockInput = Omit<StockItem, 'id'>;
export type ShopProfile = { id: string; name: string; category?: string; address: string; phone?: string; acceptingOrders: boolean; openingTime: string; closingTime: string; pickupBufferMinutes: number; activeOrdersCap: number; autoSuggestSubstitutions: boolean; autoCancelExpiredPickups: boolean; pickupExpiryMinutes: number; acceptsCounterCash: boolean };
export type ShopProfileUpdate = Partial<Pick<ShopProfile, 'name' | 'category' | 'address' | 'phone' | 'acceptingOrders' | 'openingTime' | 'closingTime' | 'pickupBufferMinutes' | 'activeOrdersCap' | 'autoSuggestSubstitutions' | 'autoCancelExpiredPickups' | 'pickupExpiryMinutes' | 'acceptsCounterCash'>> & { ownerName?: string };

export const LOW_STOCK_LIMIT = 5;
export const stockState = (item: StockItem): 'out' | 'low' | 'in' =>
  item.stock === 0 ? 'out' : item.stock <= LOW_STOCK_LIMIT ? 'low' : 'in';
