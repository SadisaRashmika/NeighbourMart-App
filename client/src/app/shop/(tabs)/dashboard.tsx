import { router } from 'expo-router';
import { ActivityIndicator, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/common/Button';
import { RoleHeader } from '@/components/common/RoleHeader';
import { DashboardCard } from '@/components/shop/DashboardCard';
import { stockState } from '@/features/shop/shopTypes';
import { useDashboard } from '@/features/shop/useDashboard';

export default function ShopDashboard() {
  const d = useDashboard();
  if (d.loading) return <ActivityIndicator color="#138A43" size="large" style={{ flex: 1 }} />;

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <View style={styles.fixedHeader}><RoleHeader location={d.shop?.address ?? 'Shop location'} role="shop" /></View>
      <ScrollView contentContainerStyle={styles.screen} style={{ backgroundColor: '#F4F5FB' }}>
      {d.error && <TouchableOpacity onPress={d.reload}><Text style={styles.error}>{d.error} - tap to retry</Text></TouchableOpacity>}

      <View style={styles.hero}>
        <Text style={styles.shopName}>{d.shop?.name ?? 'My shop'}</Text>
        <Text style={styles.mute}>{d.shop?.address}</Text>
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.bold}>Accepting Orders</Text>
            <Text style={styles.mute}>{d.shop?.acceptingOrders ? 'Visible to neighbours' : 'Hidden - you are closed'}</Text>
          </View>
          <Switch onValueChange={d.toggleAccepting} trackColor={{ true: '#138A43' }} value={d.shop?.acceptingOrders ?? false} />
        </View>
      </View>

      <Text style={styles.h2}>Today&apos;s Pulse</Text>
      <View style={styles.grid}>
        <DashboardCard note="Completed today" title="Total Sales" value={`LKR ${d.stats.sales.toLocaleString('en-US')}`} />
        <DashboardCard note={`${d.stats.fresh} new, ${d.stats.packing} preparing`} title="Active Orders" value={`${d.stats.active} pending`} />
        <DashboardCard note="Handed over today" title="Fulfilled" value={`${d.stats.fulfilled} orders`} />
        <DashboardCard note="Needs restocking" title="Low Stock" tone={d.stats.alerts.length ? 'alert' : 'default'} value={`${d.stats.alerts.length} alerts`} />
      </View>

      <Text style={styles.h2}>Live Orders to Pack</Text>
      {d.toPack.length === 0 && <Text style={styles.mute}>No orders waiting. New pre-orders will show up here.</Text>}
      {d.toPack.map((o) => (
        <View key={o.id} style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.bold}>#{o.orderNumber} {o.customerName}</Text>
            <Text style={styles.total}>LKR {o.total.toLocaleString('en-US')}</Text>
          </View>
          <Text style={styles.mute}>{o.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}</Text>
          <Button
            label={o.status === 'new' ? 'Accept Order' : 'Mark Ready'}
            onPress={() => d.advance(o.id, o.status === 'new' ? 'preparing' : 'ready')}
            style={{ marginTop: 10 }}
          />
        </View>
      ))}
      <Button label="View all orders" onPress={() => router.push('/shop/orders')} style={styles.ghost} />

      <Text style={styles.h2}>Inventory Alerts ({d.stats.alerts.length})</Text>
      {d.stats.alerts.length === 0 && <Text style={styles.mute}>All items are well stocked.</Text>}
      {d.stats.alerts.slice(0, 4).map((i) => (
        <View key={i.id} style={[styles.card, styles.row]}>
          <View style={{ flex: 1 }}>
            <Text style={styles.bold}>{i.name}</Text>
            <Text style={{ color: stockState(i) === 'out' ? '#E11D48' : '#B45309' }}>
              {stockState(i) === 'out' ? 'Out of stock' : `Only ${i.stock} left`}
            </Text>
          </View>
          <Button label="Restock +10" onPress={() => d.restock(i)} style={styles.small} />
        </View>
      ))}

      <Button label="View Daily Reports" onPress={() => router.push('/shop/reports')} style={{ marginTop: 16 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: '#F4F5FB', flex: 1 },
  fixedHeader: { backgroundColor: '#F4F5FB', paddingHorizontal: 16, paddingTop: 8 },
  screen: { gap: 8, padding: 14, paddingBottom: 40 },
  error: { color: '#E11D48' },
  hero: { backgroundColor: '#E3F6EA', borderRadius: 16, gap: 8, padding: 16 },
  shopName: { fontSize: 20, fontWeight: '800' },
  row: { alignItems: 'center', flexDirection: 'row', gap: 8, justifyContent: 'space-between' },
  h2: { fontSize: 16, fontWeight: '800', marginTop: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  card: { backgroundColor: '#fff', borderColor: '#E5E7EB', borderRadius: 16, borderWidth: 1, padding: 14 },
  bold: { fontWeight: '800' },
  mute: { color: '#667085', fontSize: 13 },
  total: { color: '#0B6B3A', fontWeight: '800' },
  small: { minHeight: 40, paddingHorizontal: 12 },
  ghost: { backgroundColor: '#4B5563' },
});
