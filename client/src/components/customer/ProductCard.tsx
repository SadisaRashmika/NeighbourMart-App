import { StyleSheet, Text, View } from 'react-native';
import type { Product } from '@/features/customer/customerTypes';

export function ProductCard({ product }: { product: Product }) {
  return (
    <View style={styles.card}>
      <Text style={styles.name}>{product.name}</Text>
      <Text style={styles.meta}>LKR {product.price.toFixed(2)}</Text>
      <Text style={styles.meta}>{product.available ? 'In stock' : 'Out of stock'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#FFFFFF', borderColor: '#E4E7EC', borderRadius: 12, borderWidth: 1, gap: 4, padding: 14 },
  name: { color: '#101828', fontSize: 16, fontWeight: '700' },
  meta: { color: '#667085', fontSize: 13 },
});
