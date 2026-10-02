import { StyleSheet, Text, View } from 'react-native';
import type { CartItem as CartItemType } from '@/features/customer/customerTypes';

export function CartItem({ item }: { item: CartItemType }) {
  return (
    <View style={styles.row}>
      <Text style={styles.name}>{item.product.name}</Text>
      <Text style={styles.quantity}>x{item.quantity}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10 },
  name: { color: '#101828', fontWeight: '600' },
  quantity: { color: '#138A43', fontWeight: '700' },
});
