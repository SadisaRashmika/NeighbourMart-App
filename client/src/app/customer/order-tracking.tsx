import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RoleHeader } from '@/components/common/RoleHeader';
import { cancelCustomerOrder, getCustomerOrder } from '@/features/customer/customerApi';
import type { CustomerOrder } from '@/features/customer/customerTypes';

const closed = new Set(['picked-up', 'cancelled']);
const labels: Record<string, string> = { pending: 'Order Received', accepted: 'Accepted by Shop', preparing: 'Items Being Packed', ready: 'Ready at Pickup Counter', 'picked-up': 'Picked Up', cancelled: 'Cancelled' };
const money = (value: number) => `LKR ${value.toLocaleString('en-LK')}`;

export default function OrderTracking() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [order, setOrder] = useState<CustomerOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const load = useCallback(async () => {
    if (!id) return;
    try { setOrder(await getCustomerOrder(id)); setError(''); }
    catch (e) { setError(e instanceof Error ? e.message : 'Unable to load order'); }
    finally { setLoading(false); }
  }, [id]);
  useEffect(() => {
    if (!id) return;
    let active = true;
    getCustomerOrder(id).then((value) => { if (active) { setOrder(value); setError(''); } }).catch((e) => { if (active) setError(e instanceof Error ? e.message : 'Unable to load order'); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);
  useEffect(() => {
    if (!order || closed.has(order.status)) return;
    const timer = setInterval(() => void load(), 15000);
    return () => clearInterval(timer);
  }, [order, load]);
  const cancel = () => order && Alert.alert('Cancel order?', 'Reserved stock and pickup capacity will be released.', [
    { text: 'Keep order', style: 'cancel' },
    { text: 'Cancel order', style: 'destructive', onPress: async () => { try { setOrder(await cancelCustomerOrder(order.id)); } catch (e) { setError(e instanceof Error ? e.message : 'Unable to cancel order'); } } },
  ]);

  if (loading) return <ActivityIndicator color="#006B2C" size="large" style={styles.center} />;
  if (!order) return <View style={styles.center}><Text style={styles.error}>{error || 'Order not found'}</Text><Pressable onPress={() => void load()}><Text style={styles.link}>Retry</Text></Pressable></View>;
  const slot = order.pickupSlot;
  const passValue = `neighbourmart://pickup/${order.id}?token=${order.pickupPassToken ?? ''}`;
  return <SafeAreaView edges={['top', 'left', 'right']} style={styles.safe}>
    <View style={styles.header}>
      <Pressable accessibilityLabel="Back to orders" accessibilityRole="button" onPress={() => router.replace('/customer/orders')} style={styles.backButton}>
        <Ionicons name="arrow-back" size={19} color="#172B24" />
        <Text style={styles.backText}>Back to Orders</Text>
      </Pressable>
      <RoleHeader role="customer" location={`Order #${order.orderNumber ?? order.id.slice(-4).toUpperCase()}`} />
    </View>
    <ScrollView contentContainerStyle={styles.content}>
      {error ? <Pressable onPress={() => void load()} style={styles.errorBox}><Text style={styles.error}>{error} · Tap to retry</Text></Pressable> : null}
      <View style={[styles.live, order.status === 'cancelled' && styles.cancelled]}><View style={styles.pulse} /><View style={{ flex: 1 }}><Text style={styles.liveLabel}>LIVE ORDER STATUS</Text><Text style={styles.liveTitle}>{labels[order.status]}</Text></View><Ionicons name="refresh" size={20} color="#006B2C" onPress={() => void load()} /></View>
      <Text style={styles.title}>{order.status === 'ready' ? 'Pick up your order now' : order.status === 'picked-up' ? 'Order collected' : 'Pickup order in progress'}</Text>
      <View style={styles.card}><Text style={styles.cardTitle}>{order.shop?.name ?? 'Neighbourhood shop'}</Text><Text style={styles.muted}>{order.shop?.address}</Text>{slot && <Text style={styles.pickup}>{new Date(slot.date).toLocaleDateString('en-LK', { weekday: 'long', month: 'short', day: 'numeric' })} · {slot.startTime}–{slot.endTime}</Text>}<View style={styles.actions}>{order.shop?.phone && <Pressable style={styles.softButton} onPress={() => Linking.openURL(`tel:${order.shop?.phone}`)}><Ionicons name="call-outline" size={17} color="#006B2C" /><Text style={styles.softText}>Call Store</Text></Pressable>}<Pressable style={styles.softButton} onPress={() => Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.shop?.address ?? '')}`)}><Ionicons name="navigate-outline" size={17} color="#006B2C" /><Text style={styles.softText}>Directions</Text></Pressable></View></View>
      {order.status !== 'cancelled' && <View style={styles.pass}><Text style={styles.passLabel}>DIGITAL PICKUP PASS</Text><Text style={styles.passCode}>{order.pickupCode ?? '------'}</Text><Text style={styles.muted}>Show this code or QR at the pickup counter</Text>{order.pickupPassToken ? <View style={styles.qr}><QRCode value={passValue} size={150} color="#131B2E" backgroundColor="#FFFFFF" /></View> : null}</View>}
      <View style={styles.card}><Text style={styles.cardTitle}>Order progress</Text>{(order.timeline ?? []).map((event, index) => <View key={`${event.event}-${index}`} style={styles.timeline}><View style={styles.timelineDot}><Ionicons name="checkmark" size={12} color="#fff" /></View><View style={{ flex: 1 }}><Text style={styles.event}>{event.label}</Text>{event.description ? <Text style={styles.muted}>{event.description}</Text> : null}<Text style={styles.time}>{new Date(event.occurredAt).toLocaleString('en-LK')}</Text></View></View>)}</View>
      {(order.items ?? []).some((item) => item.substitution?.status === 'pending') && <View style={styles.warning}><Ionicons name="alert-circle" size={22} color="#855300" /><View style={{ flex: 1 }}><Text style={styles.warningTitle}>Substitution approval required</Text><Text style={styles.muted}>Review the shopkeeper’s replacement before packing continues.</Text></View></View>}
      <View style={styles.card}><Text style={styles.cardTitle}>Order items</Text>{(order.items ?? []).map((item) => <View key={item.productId} style={styles.item}><View style={{ flex: 1 }}><Text style={styles.itemName}>{item.quantity}× {item.name}</Text><Text style={styles.muted}>{money(item.unitPrice)} each</Text>{item.substitution?.status && item.substitution.status !== 'none' ? <Text style={styles.subStatus}>Substitution: {item.substitution.status}</Text> : null}</View><Text style={styles.amount}>{money(item.lineTotal)}</Text>{item.substitution?.status === 'pending' && <Pressable onPress={() => router.push({ pathname: '/customer/order-substitution' as never, params: { id: order.id, productId: item.productId } })}><Text style={styles.link}>Review</Text></Pressable>}</View>)}</View>
      <View style={styles.card}><Text style={styles.cardTitle}>Payment & total</Text><View style={styles.row}><Text style={styles.muted}>Method</Text><Text style={styles.itemName}>{order.paymentMethod?.toUpperCase()}</Text></View><View style={styles.row}><Text style={styles.muted}>Status</Text><Text style={styles.itemName}>{order.paymentStatus?.toUpperCase()}</Text></View><View style={styles.row}><Text style={styles.cardTitle}>Total</Text><Text style={styles.total}>{money(order.total)}</Text></View></View>
      {['pending', 'accepted'].includes(order.status) && <Pressable style={styles.cancelButton} onPress={cancel}><Text style={styles.cancelText}>Cancel Order</Text></Pressable>}
    </ScrollView>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FAF8FF' }, header: { paddingHorizontal: 16, paddingTop: 8 }, backButton: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6, alignSelf: 'flex-start' }, backText: { color: '#172B24', fontSize: 13, fontWeight: '800' }, content: { padding: 16, paddingBottom: 40, gap: 14 }, center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FAF8FF', gap: 12 },
  live: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 13, backgroundColor: '#DDF8E7', borderRadius: 14 }, cancelled: { backgroundColor: '#FFE5E2' }, pulse: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#00A344' }, liveLabel: { color: '#006B2C', fontSize: 10, fontWeight: '800' }, liveTitle: { color: '#131B2E', fontSize: 15, fontWeight: '800', marginTop: 2 }, title: { color: '#131B2E', fontSize: 24, fontWeight: '800' },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 16, gap: 10 }, cardTitle: { color: '#131B2E', fontSize: 16, fontWeight: '800' }, muted: { color: '#6E7B6C', fontSize: 12, lineHeight: 18 }, pickup: { color: '#006B2C', fontWeight: '800', fontSize: 13 }, actions: { flexDirection: 'row', gap: 8 }, softButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: '#F2F3FF', borderRadius: 10, padding: 10 }, softText: { color: '#006B2C', fontWeight: '800', fontSize: 12 },
  pass: { backgroundColor: '#F2F3FF', borderRadius: 16, padding: 18, alignItems: 'center', gap: 7 }, passLabel: { color: '#006B2C', fontSize: 11, fontWeight: '800', letterSpacing: 1 }, passCode: { color: '#131B2E', fontSize: 31, fontWeight: '900', letterSpacing: 6 }, qr: { backgroundColor: '#fff', padding: 12, borderRadius: 12, marginTop: 6 },
  timeline: { flexDirection: 'row', gap: 10, paddingBottom: 10 }, timelineDot: { width: 23, height: 23, borderRadius: 12, backgroundColor: '#006B2C', alignItems: 'center', justifyContent: 'center' }, event: { color: '#131B2E', fontWeight: '800', fontSize: 13 }, time: { color: '#98A2B3', fontSize: 10, marginTop: 2 },
  warning: { flexDirection: 'row', gap: 10, backgroundColor: '#FFF0DA', borderRadius: 13, padding: 13 }, warningTitle: { color: '#684000', fontWeight: '800', fontSize: 13 }, item: { flexDirection: 'row', alignItems: 'center', gap: 8, borderBottomWidth: 1, borderBottomColor: '#EEF0F4', paddingVertical: 8 }, itemName: { color: '#131B2E', fontWeight: '700', fontSize: 13 }, amount: { color: '#006B2C', fontWeight: '800' }, subStatus: { color: '#855300', fontSize: 11, marginTop: 3 }, link: { color: '#006B2C', fontWeight: '800' }, row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, total: { color: '#006B2C', fontSize: 22, fontWeight: '900' },
  cancelButton: { borderWidth: 1, borderColor: '#BA1A1A', borderRadius: 12, alignItems: 'center', padding: 14 }, cancelText: { color: '#BA1A1A', fontWeight: '800' }, errorBox: { backgroundColor: '#FFE5E2', padding: 10, borderRadius: 10 }, error: { color: '#BA1A1A', textAlign: 'center' },
});
