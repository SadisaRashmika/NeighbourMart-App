import { useCallback, useState } from 'react';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Text, View } from 'react-native';
import { cash, ErrorNotice, p, PrimaryAction, PrototypePage } from './PrototypeUI';
import { getOrder, setOrderStatus } from '@/features/customer/orderIntegrationApi';
import type { CustomerOrder } from '@/features/customer/customerTypes';
const next: Record<string, CustomerOrder['status'] | undefined> = { pending: 'accepted', accepted: 'preparing', preparing: 'ready', ready: 'picked-up' };
const labels: Record<string, string> = { accepted: 'Accept order', preparing: 'Start preparing', ready: 'Mark ready for pickup', 'picked-up': 'Confirm collected' };
export function IntegratedOrderDetails({ owner = false }: { owner?: boolean }) {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const [order, setOrder] = useState<CustomerOrder | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const load = useCallback(async () => { setBusy(true); setError(''); try { setOrder(await getOrder(orderId)); } catch (e) { setError(e instanceof Error ? e.message : 'Unable to load order'); } finally { setBusy(false); } }, [orderId]);
  useFocusEffect(useCallback(() => { void load(); const timer = setInterval(() => void load(), 15000); return () => clearInterval(timer); }, [load]));
  const update = async (status: CustomerOrder['status']) => { setBusy(true); setError(''); try { setOrder(await setOrderStatus(orderId, status)); } catch (e) { setError(e instanceof Error ? e.message : 'Unable to update order'); } finally { setBusy(false); } };
  const status = order ? next[order.status] : undefined;
  return <PrototypePage footer={!owner}><ErrorNotice message={error} /><Text style={p.title}>{owner ? 'Customer order' : 'Order Tracking & Pickup'}</Text><PrimaryAction label="Back to orders" onPress={() => router.navigate(owner ? '/shop/orders' : '/customer/orders')} />{busy && <ActivityIndicator />}{order && <>
    <View style={p.card}><Text selectable style={p.heading}>Order {order.id.slice(-8).toUpperCase()}</Text><Text style={p.price}>{order.status === 'ready' ? 'Ready for pickup' : order.status.replace('-', ' ').toUpperCase()}</Text><Text style={p.text}>{order.shop?.name} • {order.shop?.address}</Text>{owner && <Text style={p.text}>Customer: {order.customerName}</Text>}<Text style={p.text}>Updated: {order.lastStatusUpdateAt ? new Date(order.lastStatusUpdateAt).toLocaleString() : '—'}</Text>{order.pickupSlot && <Text style={p.heading}>{order.pickupSlot.date} • {order.pickupSlot.startTime}–{order.pickupSlot.endTime}</Text>}<Text style={p.text}>{order.pickupNote || 'Counter collection'}</Text><Text style={p.text}>Payment on collection: {order.paymentMethod?.toUpperCase()}</Text></View>
    <View style={p.card}>{order.items?.map(item => <View key={item.productId} style={p.row}><Text style={[p.text, { flex: 1 }]}>{item.name} × {item.quantity}</Text><Text style={p.name}>{cash(item.unitPrice * item.quantity)}</Text></View>)}<View style={p.row}><Text style={p.heading}>Total including fees / discount</Text><Text style={p.price}>{cash(order.total)}</Text></View></View>
    {owner && status && <PrimaryAction label={labels[status]} disabled={busy} onPress={() => void update(status)} />}
    {owner && ['pending', 'accepted', 'preparing'].includes(order.status) && <PrimaryAction label="Reject / cancel order" secondary disabled={busy} onPress={() => void update('cancelled')} />}
  </>}<PrimaryAction label="Refresh status" disabled={busy} onPress={() => void load()} /></PrototypePage>;
}
