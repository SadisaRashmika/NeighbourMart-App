import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RoleHeader } from '@/components/common/RoleHeader';
import { getCustomerOrders } from '@/features/customer/customerApi';
import type { CustomerOrder } from '@/features/customer/customerTypes';

const activeStatuses = new Set(['pending', 'accepted', 'preparing', 'ready']);
const statusCopy: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: 'Order received', color: '#855300', bg: '#FFF0DA' },
  accepted: { label: 'Accepted', color: '#855300', bg: '#FFF0DA' },
  preparing: { label: 'Being packed', color: '#855300', bg: '#FFF0DA' },
  ready: { label: 'Ready for pickup', color: '#006B2C', bg: '#DDF8E7' },
  'picked-up': { label: 'Picked up', color: '#475467', bg: '#EEF0F4' },
  cancelled: { label: 'Cancelled', color: '#BA1A1A', bg: '#FFE5E2' },
};
const money = (value: number) => `LKR ${value.toLocaleString('en-LK')}`;
const pickup = (order: CustomerOrder) => order.pickupSlot
  ? `${new Date(order.pickupSlot.date).toLocaleDateString('en-LK', { month: 'short', day: 'numeric' })} · ${order.pickupSlot.startTime}`
  : 'Counter pickup';

export default function CustomerOrders() {
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [tab, setTab] = useState<'active' | 'history'>('active');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const load = useCallback(async (quiet = false) => {
    if (quiet) setRefreshing(true); else setLoading(true);
    setError('');
    try { setOrders(await getCustomerOrders()); }
    catch (e) { setError(e instanceof Error ? e.message : 'Unable to load orders'); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);
  useFocusEffect(useCallback(() => { void load(); }, [load]));
  const shown = useMemo(() => orders.filter((order) => tab === 'active' ? activeStatuses.has(order.status) : !activeStatuses.has(order.status)), [orders, tab]);
  const actionCount = orders.reduce((count, order) => count + (order.pendingSubstitutions ?? 0), 0);

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safe}>
      <View style={styles.header}><RoleHeader role="customer" location="Your pickup orders" /></View>
      <FlatList
        data={shown}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void load(true)} tintColor="#006B2C" />}
        ListHeaderComponent={<>
          <Text style={styles.title}>Your Orders</Text>
          <Text style={styles.subtitle}>Track packing progress and collect with your pickup pass.</Text>
          {actionCount > 0 && <View style={styles.alert}><Ionicons name="alert-circle" size={20} color="#855300" /><Text style={styles.alertText}>{actionCount} substitution {actionCount === 1 ? 'decision needs' : 'decisions need'} your attention</Text></View>}
          <View style={styles.tabs}>
            {(['active', 'history'] as const).map((key) => <Pressable key={key} onPress={() => setTab(key)} style={[styles.tab, tab === key && styles.tabOn]}><Text style={[styles.tabText, tab === key && styles.tabTextOn]}>{key === 'active' ? 'Active' : 'History'}</Text></Pressable>)}
          </View>
          {error ? <Pressable onPress={() => void load()} style={styles.error}><Text style={styles.errorText}>{error} · Tap to retry</Text></Pressable> : null}
          {loading ? <ActivityIndicator color="#006B2C" style={{ marginTop: 30 }} /> : null}
        </>}
        ListEmptyComponent={!loading ? <View style={styles.empty}><Ionicons name="receipt-outline" size={42} color="#98A2B3" /><Text style={styles.emptyTitle}>No {tab} orders</Text><Text style={styles.subtitle}>{tab === 'active' ? 'Your new pickup orders will appear here.' : 'Completed and cancelled orders will appear here.'}</Text></View> : null}
        renderItem={({ item }) => {
          const status = statusCopy[item.status] ?? statusCopy.pending;
          return <Pressable onPress={() => router.push({ pathname: '/customer/order-tracking', params: { id: item.id } })} style={styles.card}>
            <View style={styles.row}><Text style={styles.number}>#{item.orderNumber ?? item.id.slice(-4).toUpperCase()}</Text><View style={[styles.badge, { backgroundColor: status.bg }]}><Text style={[styles.badgeText, { color: status.color }]}>{status.label}</Text></View></View>
            <Text style={styles.shop}>{item.shop?.name ?? 'Neighbourhood shop'}</Text>
            <View style={styles.meta}><Ionicons name="time-outline" size={15} color="#6E7B6C" /><Text style={styles.metaText}>{pickup(item)}</Text></View>
            <View style={styles.row}><Text style={styles.metaText}>{item.itemCount ?? 0} units · {item.paymentMethod?.toUpperCase() ?? 'CASH'}</Text><Text style={styles.total}>{money(item.total)}</Text></View>
            {(item.pendingSubstitutions ?? 0) > 0 && <View style={styles.pending}><Ionicons name="swap-horizontal" size={16} color="#855300" /><Text style={styles.pendingText}>Substitution approval required</Text></View>}
            <View style={styles.track}><Text style={styles.trackText}>View order & tracking</Text><Ionicons name="arrow-forward" size={17} color="#006B2C" /></View>
          </Pressable>;
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FAF8FF' }, header: { paddingHorizontal: 16, paddingTop: 8 }, content: { padding: 16, paddingBottom: 36, gap: 12 },
  title: { fontSize: 24, fontWeight: '800', color: '#131B2E' }, subtitle: { color: '#6E7B6C', fontSize: 13, lineHeight: 19 },
  alert: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FFF0DA', borderRadius: 12, padding: 12 }, alertText: { flex: 1, color: '#684000', fontWeight: '700', fontSize: 12 },
  tabs: { flexDirection: 'row', backgroundColor: '#F2F3FF', borderRadius: 12, padding: 4 }, tab: { flex: 1, alignItems: 'center', padding: 10, borderRadius: 9 }, tabOn: { backgroundColor: '#006B2C' }, tabText: { fontWeight: '700', color: '#6E7B6C' }, tabTextOn: { color: '#fff' },
  error: { backgroundColor: '#FFE5E2', borderRadius: 10, padding: 11 }, errorText: { color: '#BA1A1A', textAlign: 'center' },
  empty: { alignItems: 'center', gap: 8, padding: 40 }, emptyTitle: { color: '#131B2E', fontSize: 17, fontWeight: '800' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, gap: 9, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 5, elevation: 2 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }, number: { color: '#006B2C', fontWeight: '800', fontSize: 13 }, badge: { borderRadius: 99, paddingHorizontal: 9, paddingVertical: 5 }, badgeText: { fontWeight: '800', fontSize: 10 },
  shop: { color: '#131B2E', fontWeight: '800', fontSize: 17 }, meta: { flexDirection: 'row', alignItems: 'center', gap: 6 }, metaText: { color: '#6E7B6C', fontSize: 12 }, total: { color: '#006B2C', fontWeight: '800', fontSize: 17 },
  pending: { flexDirection: 'row', gap: 7, alignItems: 'center', padding: 9, backgroundColor: '#FFF7E9', borderRadius: 9 }, pendingText: { color: '#855300', fontSize: 12, fontWeight: '700' },
  track: { borderTopWidth: 1, borderTopColor: '#EEF0F4', paddingTop: 11, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, trackText: { color: '#006B2C', fontWeight: '800', fontSize: 13 },
});
