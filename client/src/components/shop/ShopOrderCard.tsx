import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button } from '@/components/common/Button';
import type { OrderStatus, ShopOrder } from '@/features/shop/shopTypes';

type Props = {
  order: ShopOrder;
  onAdvance: (next: OrderStatus) => void;
  onCancel: () => void;
  onDelete: () => void;
};

const NEXT: Partial<Record<OrderStatus, { label: string; to: OrderStatus }>> = {
  new: { label: 'Accept Order', to: 'preparing' },
  preparing: { label: 'Mark Ready', to: 'ready' },
  ready: { label: 'Complete Handoff', to: 'completed' },
};

export function ShopOrderCard({ order, onAdvance, onCancel, onDelete }: Props) {
  const next = NEXT[order.status];
  const closed = order.status === 'completed' || order.status === 'cancelled';
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.number}>#{order.orderNumber}</Text>
        <Text style={styles.name}>{order.customerName}</Text>
      </View>
      <View style={styles.items}>
        {order.items.map((i) => (
          <View key={i.name} style={styles.row}>
            <Text style={{ flex: 1 }}>{i.quantity}x {i.name}</Text>
            <Text>LKR {(i.quantity * i.unitPrice).toLocaleString('en-US')}</Text>
          </View>
        ))}
      </View>
      <View style={[styles.row, { justifyContent: 'space-between', marginBottom: 12 }]}>
        <Text style={styles.mute}>Pay at pickup</Text>
        <Text style={styles.total}>LKR {order.total.toLocaleString('en-US')}</Text>
      </View>
      {next && <Button label={next.label} onPress={() => onAdvance(next.to)} />}
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
  card: { backgroundColor: '#fff', borderColor: '#E5E7EB', borderRadius: 16, borderWidth: 1, marginBottom: 12, padding: 14 },
  row: { alignItems: 'center', flexDirection: 'row', gap: 8 },
  number: { backgroundColor: '#FDE9D0', borderRadius: 8, fontWeight: '700', overflow: 'hidden', paddingHorizontal: 8, paddingVertical: 3 },
  name: { fontSize: 16, fontWeight: '800' },
  items: { backgroundColor: '#F4F5FB', borderRadius: 12, gap: 4, marginVertical: 10, padding: 10 },
  mute: { color: '#667085' },
  total: { color: '#0B6B3A', fontSize: 18, fontWeight: '800' },
  link: { alignItems: 'center', marginTop: 10, padding: 6 },
  danger: { color: '#E11D48', fontWeight: '700' },
});
