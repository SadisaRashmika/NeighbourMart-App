import { createContext, useCallback, useMemo, useState, type PropsWithChildren } from 'react';
import type { CartItem, Product, SubstitutePreference } from '@/features/customer/customerTypes';

type CartContextValue = {
  items: CartItem[];
  addItem: (product: Product, quantity: number, substitute?: SubstitutePreference, shopName?: string) => void;
  updateQuantity: (productId: string, delta: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
};

export const CartContext = createContext<CartContextValue>({
  items: [],
  addItem: () => undefined,
  updateQuantity: () => undefined,
  removeItem: () => undefined,
  clearCart: () => undefined,
});

export function CartProvider({ children }: PropsWithChildren) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = useCallback((product: Product, quantity: number, substitute?: SubstitutePreference, shopName?: string) => {
    setItems((current) => {
      const existing = current.find((item) => item.product.id === product.id);
      if (!existing) return [...current, { product, quantity, substitute, shopName }];
      return current.map((item) =>
        item.product.id === product.id ? { ...item, quantity: item.quantity + quantity, substitute, shopName } : item
      );
    });
  }, []);

  const updateQuantity = useCallback((productId: string, delta: number) => {
    setItems((current) => current.map(item => {
      if (item.product.id === productId) {
        return { ...item, quantity: Math.max(1, item.quantity + delta) };
      }
      return item;
    }));
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((current) => current.filter(item => item.product.id !== productId));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);
  
  const value = useMemo(() => ({ addItem, updateQuantity, removeItem, clearCart, items }), [addItem, updateQuantity, removeItem, clearCart, items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
