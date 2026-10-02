import { createContext, useCallback, useMemo, useState, type PropsWithChildren } from 'react';
import type { CartItem, Product } from '@/features/customer/customerTypes';

type CartContextValue = {
  items: CartItem[];
  addItem: (product: Product) => void;
  clearCart: () => void;
};

export const CartContext = createContext<CartContextValue>({
  items: [],
  addItem: () => undefined,
  clearCart: () => undefined,
});

export function CartProvider({ children }: PropsWithChildren) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = useCallback((product: Product) => {
    setItems((current) => {
      const existing = current.find((item) => item.product.id === product.id);
      if (!existing) return [...current, { product, quantity: 1 }];
      return current.map((item) =>
        item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      );
    });
  }, []);

  const clearCart = useCallback(() => setItems([]), []);
  const value = useMemo(() => ({ addItem, clearCart, items }), [addItem, clearCart, items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
