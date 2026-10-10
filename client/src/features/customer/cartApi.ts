import { apiRequest } from "@/services/api";
import type { CartItem, CustomerOrder, Product, SubstitutePreference } from "./customerTypes";
export type Basket = {
  subtotal?: number;
  packingFee?: number;
  communityDiscount?: number;
  items: CartItem[];
  total: number;
  shop: { id: string; name: string; address: string } | null;
};
export type PickupSlot = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  remaining: number;
};
export const getBasket = () => apiRequest<Basket>("/api/cart");
export const updateItem = (id: string, quantity: number, substitute?: SubstitutePreference) =>
  apiRequest<Basket>(`/api/cart/items/${id}`, {
    method: "PUT",
    body: JSON.stringify({ quantity, substitute }),
  });
export const removeItem = (id: string) =>
  apiRequest<Basket>(`/api/cart/items/${id}`, { method: "DELETE" });
export const deleteBasket = () =>
  apiRequest<Basket>("/api/cart", { method: "DELETE" });
export const getReplacements = (id: string) =>
  apiRequest<Product[]>(`/api/cart/items/${id}/replacements`);
export const approveReplacement = (id: string, replacementId: string) =>
  apiRequest<Basket>(`/api/cart/items/${id}/replacement`, {
    method: "POST",
    body: JSON.stringify({ replacementId }),
  });
export const getPickupSlots = () =>
  apiRequest<PickupSlot[]>("/api/cart/pickup-slots");
export const placeOrder = (input: {
  pickupSlotId: string;
  checkoutKey: string;
  pickupNote: string;
  paymentMethod: string;
}) =>
  apiRequest<CustomerOrder>("/api/cart/checkout", {
    method: "POST",
    body: JSON.stringify(input),
  });
