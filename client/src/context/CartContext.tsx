import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import type { CartItem, Product } from "@/features/customer/customerTypes";
import { AuthContext } from "./AuthContext";
import {
  deleteBasket,
  getBasket,
  removeItem,
  updateItem,
  type Basket,
} from "@/features/customer/cartApi";

type CartContextValue = {
  items: CartItem[];
  addItem: (product: Product) => Promise<void>;
  clearCart: () => Promise<void>;
  refresh: () => Promise<void>;
  changeQuantity: (id: string, quantity: number) => Promise<void>;
  remove: (id: string) => Promise<void>;
  basket: Basket;
  busy: boolean;
  error: string;
};

export const CartContext = createContext<CartContextValue>({
  items: [],
  addItem: async () => undefined,
  clearCart: async () => undefined,
  refresh: async () => undefined,
  changeQuantity: async () => undefined,
  remove: async () => undefined,
  basket: { items: [], total: 0, shop: null },
  busy: false,
  error: "",
});

export function CartProvider({ children }: PropsWithChildren) {
  const { user } = useContext(AuthContext);
  const [basket, setBasket] = useState<Basket>({
    items: [],
    total: 0,
    shop: null,
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const run = useCallback(async (action: () => Promise<Basket>) => {
    setBusy(true);
    setError("");
    try {
      setBasket(await action());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to update basket");
      throw e;
    } finally {
      setBusy(false);
    }
  }, []);
  const refresh = useCallback(() => run(getBasket), [run]);
  useEffect(() => {
    let active = true;
    const request =
      user?.role === "customer"
        ? getBasket()
        : Promise.resolve({ items: [], total: 0, shop: null });
    request
      .then((data) => {
        if (active) setBasket(data);
      })
      .catch((e) => {
        if (active)
          setError(e instanceof Error ? e.message : "Unable to load basket");
      });
    return () => {
      active = false;
    };
  }, [user?.id, user?.role]);

  const addItem = useCallback(
    (product: Product) =>
      run(() =>
        updateItem(
          product.id,
          (basket.items.find((i) => i.product.id === product.id)?.quantity ??
            0) + 1,
        ),
      ),
    [basket.items, run],
  );
  const clearCart = useCallback(() => run(deleteBasket), [run]);
  const changeQuantity = useCallback(
    (id: string, q: number) => run(() => updateItem(id, q)),
    [run],
  );
  const remove = useCallback((id: string) => run(() => removeItem(id)), [run]);
  const value = useMemo(
    () => ({
      addItem,
      clearCart,
      items: basket.items,
      basket,
      busy,
      error,
      refresh,
      changeQuantity,
      remove,
    }),
    [addItem, clearCart, basket, busy, error, refresh, changeQuantity, remove],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
