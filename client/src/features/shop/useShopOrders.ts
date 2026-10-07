import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { deleteShopOrder, getShopOrders, updateOrderStatus } from './shopApi';
import type { OrderStatus, ShopOrder } from './shopTypes';

export function useShopOrders() {
  const [orders, setOrders] = useState<ShopOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try { setError(null); setOrders(await getShopOrders()); }
    catch (e) { setError(e instanceof Error ? e.message : 'Could not load orders'); }
    finally { setLoading(false); }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const setStatus = useCallback(async (id: string, status: OrderStatus) => {
    setOrders((l) => l.map((o) => (o.id === id ? { ...o, status } : o)));
    try { await updateOrderStatus(id, status); }
    catch (e) { setError(e instanceof Error ? e.message : 'Update failed'); load(); }
  }, [load]);

  const remove = useCallback(async (id: string) => {
    try { await deleteShopOrder(id); setOrders((l) => l.filter((o) => o.id !== id)); }
    catch (e) { setError(e instanceof Error ? e.message : 'Delete failed'); }
  }, []);

  return { orders, loading, error, reload: load, setStatus, remove };
}
