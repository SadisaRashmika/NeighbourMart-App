import { useCallback, useState } from "react";
import { router, useFocusEffect } from "expo-router";
import { Text } from "react-native";
import { Button } from "@/components/common/Button";
import {
  Card,
  CheckoutPage,
  currency,
  Notice,
  ui,
} from "@/components/customer/CheckoutUI";
import { getCustomerOrders } from "@/features/customer/customerApi";
import type { CustomerOrder } from "@/features/customer/customerTypes";

export default function CustomerOrders() {
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const load = useCallback(async () => {
    setBusy(true);
    setError("");
    try {
      setOrders(await getCustomerOrders());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load orders");
    } finally {
      setBusy(false);
    }
  }, []);
  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );
  return (
    <CheckoutPage title="Your orders">
      <Notice message={error} />
      <Button
        label={busy ? "Loading…" : "Refresh orders"}
        disabled={busy}
        onPress={() => void load()}
      />
      {!orders.length && !busy && (
        <Text style={ui.text}>No confirmed orders yet.</Text>
      )}
      {orders.map((o) => (
        <Card key={o.id}>
          <Text selectable style={ui.heading}>
            Order {o.id.slice(-8).toUpperCase()}
          </Text>
          <Text style={ui.text}>Status: {o.status}</Text>
          <Text style={ui.price}>{currency(o.total)}</Text>
          <Button label="Track order & pickup" onPress={() => router.push({ pathname: '/customer/order-tracking', params: { orderId: o.id } })} />
        </Card>
      ))}
    </CheckoutPage>
  );
}
