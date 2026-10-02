import { useState } from 'react';
import type { StockItem } from './shopTypes';

export function useStock() {
  const [items, setItems] = useState<StockItem[]>([]);

  return { items, setItems };
}
