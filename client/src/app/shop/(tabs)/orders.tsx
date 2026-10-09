import { useCallback, useState } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { Text, View } from 'react-native';
import { cash, ErrorNotice, p, PrimaryAction, PrototypePage } from '@/components/customer/PrototypeUI';
import { getShopOrders } from '@/features/shop/shopApi';
import type { ShopOrder } from '@/features/shop/shopTypes';

export default function ShopOrders() {
  const [orders, setOrders] = useState<ShopOrder[]>([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const load = useCallback(async () => { setBusy(true); setError(''); try { setOrders(await getShopOrders()); } catch (e) { setError(e instanceof Error ? e.message : 'Unable to load orders'); } finally { setBusy(false); } }, []);
  useFocusEffect(useCallback(() => { void load(); return undefined; }, [load]));
  return <PrototypePage refreshing={busy} onRefresh={() => void load()}><Text style={p.title}>Shop Order Management</Text><ErrorNotice message={error} /><PrimaryAction label="Refresh orders" disabled={busy} onPress={() => void load()} />{!busy && !orders.length && <Text style={p.text}>No customer orders yet.</Text>}{orders.map(order => <View style={p.card} key={order.id}><Text style={p.heading}>{order.customerName} • {order.id.slice(-8).toUpperCase()}</Text><Text style={p.text}>{order.status.toUpperCase()}</Text><Text style={p.price}>{cash(order.total)}</Text><PrimaryAction label="View & manage order" onPress={() => router.push({ pathname: '/shop/order-details', params: { orderId: order.id } })} /></View>)}</PrototypePage>;
}
