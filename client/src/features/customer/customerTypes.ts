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
  orderNumber?: string;
  status: 'pending' | 'accepted' | 'preparing' | 'ready' | 'picked-up' | 'cancelled';
  total: number;
  subtotal?: number;
  packingFee?: number;
  communityDiscount?: number;
  itemCount?: number;
  paymentMethod?: 'cash' | 'card' | 'lankaqr';
  paymentStatus?: 'pending' | 'paid' | 'failed' | 'refunded';
  pickupNote?: string;
  pickupCode?: string;
  pickupPassToken?: string;
  pickupVerifiedAt?: string;
  pickedUpAt?: string;
  pendingSubstitutions?: number;
  shop?: { id: string; name?: string; address?: string; phone?: string };
  pickupSlot?: { id: string; date: string; startTime: string; endTime: string } | null;
  items?: CustomerOrderItem[];
  timeline?: OrderTimelineEvent[];
  createdAt?: string;
  updatedAt?: string;
};

export type OrderSubstitution = {
  status: 'none' | 'pending' | 'approved' | 'rejected' | 'expired';
  suggestedProduct?: string;
  suggestedName?: string;
  suggestedImageUrl?: string;
  suggestedUnitPrice?: number;
  priceDifference?: number;
  shopkeeperNote?: string;
  requestedAt?: string;
  expiresAt?: string;
  respondedAt?: string;
};

export type CustomerOrderItem = {
  productId: string;
  name: string;
  imageUrl?: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  substitutionPreference?: string;
  substitution?: OrderSubstitution;
};

export type OrderTimelineEvent = {
  event: string;
  label: string;
  description?: string;
  actor: 'customer' | 'shop' | 'system';
  occurredAt: string;
};
