import { useCallback, useEffect, useState } from 'react';
import type { CustomerOrder } from './customerTypes';
import { getCustomerOrders } from './customerApi';

export function useCustomerOrders() {
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCustomerOrders();
      setOrders(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to load orders');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    Promise.resolve().then(() => void reload());
  }, [reload]);

  const clearOrders = useCallback(() => setOrders([]), []);

  return { clearOrders, orders, setOrders, loading, error, reload };
}
