import { Ionicons } from '@expo/vector-icons';
import { router, usePathname } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const items = [
  { label: 'Home', path: '/shop/dashboard', icon: 'home' as const, outline: 'home-outline' as const },
  { label: 'Stock', path: '/shop/stock', icon: 'clipboard' as const, outline: 'clipboard-outline' as const },
  { label: 'Orders', path: '/shop/orders', icon: 'receipt' as const, outline: 'receipt-outline' as const },
  { label: 'Settings', path: '/shop/settings', icon: 'settings' as const, outline: 'settings-outline' as const },
];

export function ShopBottomNav() {
  const pathname = usePathname();
  return <View style={styles.bar}>{items.map((item) => {
    const focused = pathname.startsWith(item.path);
    return <TouchableOpacity accessibilityRole="tab" accessibilityState={{ selected: focused }} key={item.path} onPress={() => router.replace(item.path as never)} style={styles.item}><Ionicons color={focused ? '#047857' : '#57534E'} name={focused ? item.icon : item.outline} size={focused ? 27 : 26} /><Text style={[styles.label, { color: focused ? '#047857' : '#57534E' }]}>{item.label}</Text></TouchableOpacity>;
  })}</View>;
}

const styles = StyleSheet.create({
  bar: { backgroundColor: '#FFFFFF', borderTopColor: '#D6D3D1', borderTopWidth: 1, flexDirection: 'row', height: 72, paddingBottom: 8, paddingTop: 8 },
  item: { alignItems: 'center', flex: 1, justifyContent: 'center' },
  label: { fontSize: 12, fontWeight: '600', marginTop: 1 },
});
