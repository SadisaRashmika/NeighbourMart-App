import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { OrderStatus, ShopOrder } from '@/features/shop/shopTypes';
import { ActionButton, Pill, type IconName } from './ShopUI';
import { T, emojiFor, money, shadow, timeAgo } from './shopTheme';

type Props = { order: ShopOrder; onAdvance: (next: OrderStatus) => void; onCancel: () => void; onDelete: () => void; onDetails: () => void };

const NEXT: Partial<Record<OrderStatus, { label: string; to: OrderStatus; icon: IconName }>> = {
  new: { label: 'Accept Order', to: 'preparing', icon: 'checkmark-circle-outline' },
  preparing: { label: 'Mark Ready', to: 'ready', icon: 'bag-check-outline' },
  ready: { label: 'Complete Handoff', to: 'completed', icon: 'hand-left-outline' },
};
const STATUS: Record<OrderStatus, { text: string; fg: string; bg: string }> = {
  new: { text: 'New', fg: T.green2, bg: T.mint }, preparing: { text: 'Preparing', fg: T.amber, bg: T.amberBg },
  ready: { text: 'Ready', fg: '#1D4ED8', bg: '#DBEAFE' }, completed: { text: 'Completed', fg: T.slate, bg: '#EEF0F4' },
  cancelled: { text: 'Cancelled', fg: T.red, bg: T.redBg },
};

export function ShopOrderCard({ order, onAdvance, onCancel, onDelete, onDetails }: Props) {
  const next = NEXT[order.status];
  const closed = order.status === 'completed' || order.status === 'cancelled';
  const st = STATUS[order.status];
  return (
    <View style={[styles.card, shadow]}>
      <View style={styles.head}>
        <View style={{ flex: 1, gap: 6 }}>
          <View style={styles.row}>
            <Text style={styles.number}>#{order.orderNumber}</Text>
            <Text numberOfLines={1} style={styles.name}>{order.customerName}</Text>
          </View>
          <Text style={styles.mute}>Pickup order - {timeAgo(order.createdAt) || 'recently'}</Text>
        </View>
        <Pill bg={st.bg} fg={st.fg} text={st.text} />
      </View>

      <View style={styles.items}>
        {order.items.map((i) => (
          <View key={i.name} style={styles.row}>
            <Text style={styles.qtyChip}>{i.quantity}x</Text>
            <Text style={{ fontSize: 14 }}>{emojiFor('', i.name)}</Text>
            <Text numberOfLines={1} style={styles.itemName}>{i.name}</Text>
            <Text style={styles.itemPrice}>{money(i.quantity * i.unitPrice)}</Text>
          </View>
        ))}
      </View>

      <View style={[styles.row, { justifyContent: 'space-between' }]}>
        <Text style={styles.mute}>Pay at Pickup: <Text style={styles.bold}>{order.paymentMethod?.toUpperCase() ?? 'CASH'}</Text></Text>
        <Text style={styles.total}>{money(order.total)}</Text>
      </View>

      {(order.pendingSubstitutions ?? 0) > 0 && <Text style={styles.pending}>Customer substitution response pending</Text>}
      <ActionButton icon="document-text-outline" label="Order Details" onPress={onDetails} tone="soft" />

      {next && <ActionButton icon={next.icon} label={next.label} onPress={() => onAdvance(next.to)} />}
      {!closed && (
        <TouchableOpacity onPress={onCancel} style={styles.link}><Text style={styles.danger}>Cancel order</Text></TouchableOpacity>
      )}
      {closed && (
        <TouchableOpacity onPress={onDelete} style={styles.link}><Text style={styles.danger}>Delete from history</Text></TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: T.card, borderRadius: 20, gap: 12, marginBottom: 14, padding: 14 },
  head: { alignItems: 'flex-start', flexDirection: 'row', gap: 8 },
  row: { alignItems: 'center', flexDirection: 'row', gap: 8 },
  number: { backgroundColor: '#FDE9D0', borderRadius: 8, color: '#92400E', fontSize: 12, fontWeight: '800', overflow: 'hidden', paddingHorizontal: 8, paddingVertical: 3 },
  name: { color: T.ink, flexShrink: 1, fontSize: 17, fontWeight: '800' },
  mute: { color: T.mute, fontSize: 12 },
  bold: { color: T.ink, fontWeight: '800' },
  items: { backgroundColor: '#F4F5FB', borderRadius: 14, gap: 8, padding: 12 },
  qtyChip: { backgroundColor: '#FDE9D0', borderRadius: 6, color: '#92400E', fontSize: 11, fontWeight: '800', overflow: 'hidden', paddingHorizontal: 6, paddingVertical: 2 },
  itemName: { color: T.ink, flex: 1, fontSize: 14 },
  itemPrice: { color: T.mute, fontSize: 13 },
  total: { color: T.green, fontSize: 20, fontWeight: '800' },
  link: { alignItems: 'center', padding: 4 },
  danger: { color: T.red, fontWeight: '800' },
  pending: { color: '#92400E', backgroundColor: '#FEF3C7', borderRadius: 9, padding: 9, fontWeight: '800', fontSize: 11 },
});
