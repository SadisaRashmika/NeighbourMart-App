import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { getReport, type ShopReport } from './reportApi';
import { getMyShop, getShopOrders, getStockItems, updateMyShop, updateOrderStatus, updateStockItem } from './shopApi';
import { stockState, type OrderStatus, type ShopOrder, type ShopProfile, type StockItem } from './shopTypes';

const isToday = (iso?: string) => !!iso && new Date(iso).toDateString() === new Date().toDateString();

export function useDashboard() {
  const [shop, setShop] = useState<ShopProfile | null>(null);
  const [orders, setOrders] = useState<ShopOrder[]>([]);
  const [items, setItems] = useState<StockItem[]>([]);
  const [report, setReport] = useState<ShopReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const [s, o, i] = await Promise.all([getMyShop(), getShopOrders(), getStockItems()]);
      setShop(s); setOrders(o); setItems(i);
      getReport('today').then(setReport).catch(() => setReport(null)); // chart is optional
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not load dashboard'); }
    finally { setLoading(false); }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const run = useCallback(async (action: () => Promise<unknown>) => {
    try { await action(); await load(); } catch (e) { setError(e instanceof Error ? e.message : 'Action failed'); }
  }, [load]);

  const done = orders.filter((o) => o.status === 'completed' && isToday(o.createdAt));
  const stats = {
    sales: done.reduce((a, o) => a + o.total, 0),
    fulfilled: done.length,
    active: orders.filter((o) => o.status === 'new' || o.status === 'preparing').length,
    fresh: orders.filter((o) => o.status === 'new').length,
    packing: orders.filter((o) => o.status === 'preparing').length,
    alerts: items.filter((i) => stockState(i) !== 'in'),
  };

  return {
    shop, items, report, loading, error, reload: load, stats,
    toPack: orders.filter((o) => o.status === 'new' || o.status === 'preparing').slice(0, 3),
    toggleAccepting: (v: boolean) => run(() => updateMyShop({ acceptingOrders: v })),
    advance: (id: string, next: OrderStatus) => run(() => updateOrderStatus(id, next)),
    restock: (item: StockItem, units = 10) => run(() => updateStockItem(item.id, { stock: item.stock + units })),
  };
}
