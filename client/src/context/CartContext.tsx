import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type PropsWithChildren } from 'react';
import { Alert } from 'react-native';
import type { CartItem, Product, SubstitutePreference } from '@/features/customer/customerTypes';
import { deleteBasket, getBasket, removeItem as deleteItem, updateItem, type Basket } from '@/features/customer/cartApi';
import { AuthContext } from './AuthContext';

type CartContextValue = {
  items: CartItem[];
  addItem: (product: Product, quantity: number, substitute?: SubstitutePreference, shopName?: string) => Promise<void>;
  updateQuantity: (productId: string, delta: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => Promise<void>;
  refresh: () => Promise<void>;
  changeQuantity: (id: string, quantity: number) => Promise<void>;
  remove: (id: string) => Promise<void>;
  basket: Basket;
  busy: boolean;
  error: string;
};
const empty: Basket = { items: [], total: 0, shop: null };
const noop = async () => undefined;
export const CartContext = createContext<CartContextValue>({ items: [], addItem: noop, updateQuantity: () => undefined, removeItem: () => undefined, clearCart: noop, refresh: noop, changeQuantity: noop, remove: noop, basket: empty, busy: false, error: '' });

export function CartProvider({ children }: PropsWithChildren) {
  const { user } = useContext(AuthContext);
  const [basket, setBasket] = useState<Basket>(empty);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const basketRef = useRef(basket);
  const queue = useRef<Promise<unknown>>(Promise.resolve());
  const identity = useRef(user?.id);

  const run = useCallback((action: () => Promise<Basket>) => {
    const customer = identity.current;
    const task = queue.current.catch(() => undefined).then(async () => {
      if (!customer || identity.current !== customer) return;
      setBusy(true);
      setError('');
      try {
        const result = await action();
        if (identity.current === customer) { basketRef.current = result; setBasket(result); }
      } catch (e) {
        if (identity.current === customer) setError(e instanceof Error ? e.message : 'Unable to update basket');
        throw e;
      } finally { setBusy(false); }
    });
    queue.current = task;
    return task;
  }, []);
  const refresh = useCallback(() => run(getBasket), [run]);
  useEffect(() => {
    identity.current = user?.id;
    basketRef.current = empty;
    const customer = user?.id;
    void Promise.resolve().then(() => {
      if (identity.current !== customer) return;
      setBasket(empty);
      setError('');
      if (user?.role === 'customer') void refresh().catch(() => undefined);
    });
  }, [user?.id, user?.role, refresh]);

  // Preserve the product screens' existing four-argument addItem contract.
  const addItem = useCallback((product: Product, quantity = 1, substitute?: SubstitutePreference, _shopName?: string) =>
    run(() => updateItem(product.id, (basketRef.current.items.find(i => i.product.id === product.id)?.quantity ?? 0) + quantity, substitute))
      .catch(e => { Alert.alert('Unable to add item', e instanceof Error ? e.message : 'Please try again'); }), [run]);
  const clearCart = useCallback(() => run(deleteBasket), [run]);
  const changeQuantity = useCallback((id: string, quantity: number) => run(() => updateItem(id, quantity)), [run]);
  const remove = useCallback((id: string) => run(() => deleteItem(id)), [run]);
  const updateQuantity = useCallback((id: string, delta: number) => {
    void run(() => updateItem(id, Math.max(1, (basketRef.current.items.find(i => i.product.id === id)?.quantity ?? 1) + delta))).catch(() => undefined);
  }, [run]);
  const removeItem = useCallback((id: string) => { void remove(id).catch(() => undefined); }, [remove]);
  const value = useMemo(() => ({ items: basket.items, basket, busy, error, addItem, clearCart, refresh, changeQuantity, remove, updateQuantity, removeItem }), [basket, busy, error, addItem, clearCart, refresh, changeQuantity, remove, updateQuantity, removeItem]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
