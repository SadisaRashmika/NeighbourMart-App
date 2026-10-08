import Ionicons from '@expo/vector-icons/Ionicons';
import { router, usePathname } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const destinations = [
  { label: 'Home', path: '/customer/dashboard', icon: 'home-outline' },
  { label: 'Cart', path: '/customer/cart', icon: 'cart-outline' },
  { label: 'Orders', path: '/customer/orders', icon: 'receipt-outline' },
  { label: 'Settings', path: '/customer/settings', icon: 'settings-outline' },
] as const;

export function CustomerFooter() {
  const path = usePathname();
  const insets = useSafeAreaInsets();
  const active = path.includes('pickup-time') || path.includes('substitution') ? '/customer/cart' : path;
  return <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 8) }]}>
    {destinations.map(item => {
      const selected = active === item.path;
      const color = selected ? '#087C3B' : '#5B626F';
      return <Pressable key={item.path} accessibilityRole="tab" accessibilityLabel={item.label} accessibilityState={{ selected }} onPress={() => router.navigate(item.path)} style={styles.item}>
        <Ionicons name={item.icon} size={24} color={color} />
        <Text style={[styles.label, { color, fontWeight: selected ? '700' : '400' }]}>{item.label}</Text>
      </Pressable>;
    })}
  </View>;
}
const styles = StyleSheet.create({
  footer: { flexDirection: 'row', backgroundColor: '#F0F3F5', borderTopWidth: 1, borderTopColor: '#E6E7EE', paddingTop: 8 },
  item: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4, minHeight: 49 },
  label: { fontSize: 11 },
});
