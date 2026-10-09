import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ActivityIndicator, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
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
    <ScrollView contentContainerStyle={s.screen} style={{ backgroundColor: T.bg }}>
      {d.error && <TouchableOpacity onPress={d.reload}><Text style={s.error}>{d.error} - tap to retry</Text></TouchableOpacity>}

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

      <SectionTitle dot={T.green2} title="Today's Pulse" />
      <View style={s.grid}>
        <DashboardCard icon="cash-outline" note="Completed today" title="Total Sales" value={money(d.stats.sales)} />
        <DashboardCard accent="#D97706" icon="time-outline" note={`${d.stats.fresh} new - ${d.stats.packing} preparing`} title="Active Orders" value={`${d.stats.active} pending`} />
        <DashboardCard accent="#2563EB" icon="checkmark-done-outline" note="Handed over today" title="Fulfilled" value={`${d.stats.fulfilled} orders`} />
        <DashboardCard icon="alert-circle-outline" note="Needs restocking" title="Low Stock" tone={d.stats.alerts.length ? 'alert' : 'default'} value={`${d.stats.alerts.length} alerts`} />
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

      <View style={[s.card, shadow, { marginTop: 18 }]}>
        <View style={[s.row, { justifyContent: 'space-between' }]}>
          <View style={s.row}>
            <View style={s.perfIcon}><Ionicons color={T.green2} name="bar-chart-outline" size={20} /></View>
            <View>
              <Text style={s.bold}>Performance & Reports</Text>
              <Text style={s.mute}>Hourly rush and top sellers</Text>
            </View>
          </View>
          <Pill bg={T.mint} fg={T.green2} text="Live" />
        </View>
        {d.report?.peakLabel ? <Pill bg={T.amberBg} fg={T.amber} icon="flame-outline" text={`Peak ${d.report.peakLabel} (${max} orders)`} /> : null}
        <View style={s.chart}>
          {values.length === 0 && <Text style={s.mute}>Complete an order to see today's rush.</Text>}
          {values.map((v, i) => (
            <View key={d.report?.labels[i]} style={s.barCol}>
              <View style={[s.bar, { height: 8 + (v / max) * 70, backgroundColor: v === max && v > 0 ? T.green : '#A7E3BD' }]} />
              <Text style={s.axis}>{d.report?.labels[i]}</Text>
            </View>
          ))}
        </View>
        <ActionButton icon="document-text-outline" label="View Daily Reports" onPress={() => router.push('/shop/reports')} />
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  screen: { padding: 14, paddingBottom: 40 },
  error: { color: T.red, marginBottom: 8 },
  row: { alignItems: 'center', flexDirection: 'row', gap: 10 },
  hero: { backgroundColor: T.mint, borderColor: '#BFEBD0', borderRadius: 22, borderWidth: 1, gap: 12, padding: 16 },
  avatar: { alignItems: 'center', backgroundColor: T.green, borderRadius: 16, height: 56, justifyContent: 'center', width: 56 },
  avatarText: { color: '#fff', fontSize: 18, fontWeight: '800' },
  shopName: { color: T.ink, fontSize: 20, fontWeight: '800' },
  toggleBox: { alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.75)', borderRadius: 14, flexDirection: 'row', gap: 10, padding: 12 },
  mute: { color: T.mute, fontSize: 12 },
  bold: { color: T.ink, fontSize: 14, fontWeight: '800' },
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
