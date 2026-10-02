import { StyleSheet, Text, View } from 'react-native';
import type { ShopOrder } from '@/features/shop/shopTypes';

export function ShopOrderCard({ order }: { order: ShopOrder }) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Order {order.id}</Text>
      <Text style={styles.meta}>{order.customerName}</Text>
      <Text style={styles.status}>{order.status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderColor: '#E4E7EC', borderRadius: 12, borderWidth: 1, gap: 4, padding: 14 },
  title: { color: '#101828', fontWeight: '700' },
  meta: { color: '#667085' },
  status: { color: '#138A43', fontWeight: '700' },
});
