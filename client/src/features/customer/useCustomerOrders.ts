import { useCallback, useState } from 'react';
import type { CustomerOrder } from './customerTypes';

export function useCustomerOrders() {
  const [orders, setOrders] = useState<CustomerOrder[]>([]);

  const clearOrders = useCallback(() => setOrders([]), []);

  return { clearOrders, orders, setOrders };
}
