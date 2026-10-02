import { StyleSheet, Text, View } from 'react-native';
import type { StockItem } from '@/features/shop/shopTypes';

export function StockItemCard({ item }: { item: StockItem }) {
  return (
    <View style={styles.card}>
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.stock}>{item.stock} units</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12 },
  name: { color: '#101828', fontWeight: '600' },
  stock: { color: '#138A43', fontWeight: '700' },
});
