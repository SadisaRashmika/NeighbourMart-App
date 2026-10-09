import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ActivityIndicator, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/common/Button';
import { RoleHeader } from '@/components/common/RoleHeader';
import { DashboardCard } from '@/components/shop/DashboardCard';
import { ActionButton, Pill, SectionTitle, Thumb } from '@/components/shop/ShopUI';
import { T, emojiFor, money, shadow, timeAgo } from '@/components/shop/shopTheme';
import { stockState } from '@/features/shop/shopTypes';
import { useDashboard } from '@/features/shop/useDashboard';

export default function ShopDashboard() {
  const d = useDashboard();
  if (d.loading) return <ActivityIndicator color={T.green2} size="large" style={{ backgroundColor: T.bg, flex: 1 }} />;

  const name = d.shop?.name ?? 'My shop';
  const initials = name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  const accepting = d.shop?.acceptingOrders ?? false;
  const values = d.report?.values ?? [];
  const max = Math.max(1, ...values);
  const isLow = (itemName: string) => d.items.some((p) => p.name === itemName && stockState(p) !== 'in');

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <View style={styles.fixedHeader}><RoleHeader location={d.shop?.address ?? 'Shop location'} role="shop" /></View>
      <ScrollView contentContainerStyle={styles.screen} style={{ backgroundColor: '#F4F5FB' }}>
      {d.error && <TouchableOpacity onPress={d.reload}><Text style={styles.error}>{d.error} - tap to retry</Text></TouchableOpacity>}

      <View style={[s.hero, shadow]}>
        <View style={s.row}>
          <View style={s.avatar}><Text style={s.avatarText}>{initials}</Text></View>
          <View style={{ flex: 1, gap: 4 }}>
            <Pill bg="#CFF3DC" fg={T.green} icon="shield-checkmark" text="Verified Merchant" />
            <Text style={s.shopName}>{name}</Text>
            <Text style={s.mute}>{d.shop?.address}</Text>
          </View>
          <Pill bg={accepting ? '#BBF7D0' : T.redBg} fg={accepting ? T.green : T.red} text={accepting ? 'Open' : 'Closed'} />
        </View>
        <View style={s.toggleBox}>
          <View style={{ flex: 1 }}>
            <Text style={s.bold}>Accepting Orders</Text>
            <Text style={s.mute}>{accepting ? 'Active & visible on Neighbourhood map' : 'Hidden - customers cannot order'}</Text>
          </View>
          <Switch onValueChange={d.toggleAccepting} thumbColor="#fff" trackColor={{ false: '#D0D5DD', true: T.green2 }} value={accepting} />
        </View>
      </View>

      <Text style={styles.h2}>Today&apos;s Pulse</Text>
      <View style={styles.grid}>
        <DashboardCard note="Completed today" title="Total Sales" value={`LKR ${d.stats.sales.toLocaleString('en-US')}`} />
        <DashboardCard note={`${d.stats.fresh} new, ${d.stats.packing} preparing`} title="Active Orders" value={`${d.stats.active} pending`} />
        <DashboardCard note="Handed over today" title="Fulfilled" value={`${d.stats.fulfilled} orders`} />
        <DashboardCard note="Needs restocking" title="Low Stock" tone={d.stats.alerts.length ? 'alert' : 'default'} value={`${d.stats.alerts.length} alerts`} />
      </View>

      <SectionTitle action={`View All (${d.stats.active})`} dot="#F59E0B" onAction={() => router.push('/shop/orders')} title="Live Orders to Pack" />
      {d.toPack.length === 0 && <View style={[s.card, shadow]}><Text style={s.mute}>No orders waiting. New pre-orders will show up here.</Text></View>}
      {d.toPack.map((o) => (
        <View key={o.id} style={[s.card, shadow]}>
          <View style={[s.row, { justifyContent: 'space-between' }]}>
            <View style={s.row}>
              <Text style={s.chip}>#{o.orderNumber}</Text>
              <Text style={s.orderName}>{o.customerName}</Text>
            </View>
            <Pill bg={T.redBg} fg={T.red} icon="time-outline" text={timeAgo(o.createdAt) || 'Now'} />
          </View>
          <View style={{ gap: 6, marginVertical: 10 }}>
            {o.items.map((i) => {
              const low = isLow(i.name);
              return (
                <View key={i.name} style={[s.line, low && s.lineLow]}>
                  <Text style={s.qty}>{i.quantity}x</Text>
                  <Text numberOfLines={1} style={s.lineName}>{emojiFor('', i.name)} {i.name}</Text>
                  {low && <Text style={s.lowTag}>LOW STOCK</Text>}
                  <Text style={s.mute}>{money(i.quantity * i.unitPrice)}</Text>
                </View>
              );
            })}
          </View>
          <View style={[s.row, { justifyContent: 'space-between', marginBottom: 12 }]}>
            <Text style={s.mute}>Pay at Pickup: <Text style={s.bold}>Counter Cash</Text></Text>
            <Text style={s.total}>{money(o.total)}</Text>
          </View>
          <View style={s.row}>
            <ActionButton label="Details" onPress={() => router.push('/shop/orders')} style={{ flex: 1 }} tone="soft" />
            <ActionButton
              icon={o.status === 'new' ? 'checkmark-circle-outline' : 'bag-check-outline'}
              label={o.status === 'new' ? 'Accept Order' : 'Mark Ready'}
              onPress={() => d.advance(o.id, o.status === 'new' ? 'preparing' : 'ready')}
              style={{ flex: 1.4 }}
            />
          </View>
        </View>
      ))}

      <SectionTitle action="View All" dot={T.red} onAction={() => router.push('/shop/stock')} title={`Inventory Alerts (${d.stats.alerts.length})`} />
      {d.stats.alerts.length === 0 && <View style={[s.card, shadow]}><Text style={s.mute}>All items are well stocked.</Text></View>}
      {d.stats.alerts.slice(0, 4).map((i) => {
        const out = stockState(i) === 'out';
        return (
          <View key={i.id} style={[s.alertCard, { backgroundColor: out ? '#FFF1F3' : '#FFFBEB', borderColor: out ? '#FBB6C2' : T.amberLine }]}>
            <Thumb emoji={emojiFor(i.category, i.name)} size={48} />
            <View style={{ flex: 1, gap: 3 }}>
              <Text numberOfLines={1} style={s.bold}>{i.name}</Text>
              <Text style={s.mute}>{out ? '0 units on shelf' : `Only ${i.stock} remaining`}</Text>
              <Pill bg={out ? T.redBg : T.amberBg} fg={out ? T.red : T.amber} text={out ? 'Out of Stock' : 'Low Stock'} />
            </View>
            <ActionButton label={out ? 'Update' : 'Restock'} onPress={() => d.restock(i)} style={{ minHeight: 40 }} tone={out ? 'danger' : 'soft'} />
          </View>
        );
      })}

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
  card: { backgroundColor: T.card, borderRadius: 20, gap: 4, marginBottom: 12, padding: 14 },
  chip: { backgroundColor: '#FDE9D0', borderRadius: 8, color: '#92400E', fontSize: 12, fontWeight: '800', overflow: 'hidden', paddingHorizontal: 8, paddingVertical: 3 },
  orderName: { color: T.ink, fontSize: 16, fontWeight: '800' },
  line: { alignItems: 'center', flexDirection: 'row', gap: 8, paddingVertical: 2 },
  lineLow: { backgroundColor: '#FFFBEB', borderColor: T.amberLine, borderRadius: 10, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 8 },
  qty: { backgroundColor: '#F2F4F7', borderRadius: 6, color: T.slate, fontSize: 11, fontWeight: '800', overflow: 'hidden', paddingHorizontal: 6, paddingVertical: 2 },
  lineName: { color: T.ink, flex: 1, fontSize: 14 },
  lowTag: { backgroundColor: T.amberBg, borderRadius: 6, color: T.amber, fontSize: 9, fontWeight: '800', overflow: 'hidden', paddingHorizontal: 5, paddingVertical: 2 },
  total: { color: T.green, fontSize: 19, fontWeight: '800' },
  alertCard: { alignItems: 'center', borderRadius: 16, borderWidth: 1, flexDirection: 'row', gap: 10, marginBottom: 10, padding: 12 },
  perfIcon: { alignItems: 'center', backgroundColor: T.mint, borderRadius: 12, height: 40, justifyContent: 'center', width: 40 },
  chart: { alignItems: 'flex-end', flexDirection: 'row', gap: 6, height: 110, justifyContent: 'space-between', marginVertical: 12 },
  barCol: { alignItems: 'center', flex: 1, justifyContent: 'flex-end' },
  bar: { borderRadius: 6, width: '78%' },
  axis: { color: T.mute, fontSize: 9, marginTop: 4 },
});
