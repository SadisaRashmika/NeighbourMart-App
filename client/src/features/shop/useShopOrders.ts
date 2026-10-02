import { useState } from 'react';
import type { ShopOrder } from './shopTypes';

export function useShopOrders() {
  const [orders, setOrders] = useState<ShopOrder[]>([]);

  return { orders, setOrders };
}
