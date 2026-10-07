import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { deleteStockItem, getStockItems, updateStockItem } from './shopApi';
import type { StockInput, StockItem } from './shopTypes';

export function useStock() {
  const [items, setItems] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      setItems(await getStockItems());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load stock');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  // Update with instant UI feedback; reload from server if it fails
  const patch = useCallback(async (id: string, change: Partial<StockInput>) => {
    setItems((list) => list.map((i) => (i.id === id ? { ...i, ...change } : i)));
    try { await updateStockItem(id, change); } catch (e) {
      setError(e instanceof Error ? e.message : 'Update failed');
      load();
    }
  }, [load]);

  const remove = useCallback(async (id: string) => {
    try { await deleteStockItem(id); setItems((list) => list.filter((i) => i.id !== id)); }
    catch (e) { setError(e instanceof Error ? e.message : 'Delete failed'); }
  }, []);

  return { items, loading, error, reload: load, patch, remove };
}
