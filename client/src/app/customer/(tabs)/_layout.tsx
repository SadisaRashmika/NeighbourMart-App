import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function CustomerTabsLayout() {
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: '#138A43',
      tabBarInactiveTintColor: '#667085',
      tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      tabBarStyle: { backgroundColor: '#FFFFFF', borderTopColor: '#E4E8EF', borderTopWidth: 1, height: 82, paddingBottom: 17, paddingTop: 7 },
    }}>
      <Tabs.Screen name="dashboard" options={{ title: 'Home', tabBarIcon: ({ color, size }) => <Ionicons color={color} name="home-outline" size={size} /> }} />
      <Tabs.Screen name="cart" options={{ title: 'Cart', tabBarIcon: ({ color, size }) => <Ionicons color={color} name="cart-outline" size={size} /> }} />
      <Tabs.Screen name="orders" options={{ title: 'Orders', tabBarIcon: ({ color, size }) => <Ionicons color={color} name="receipt-outline" size={size} /> }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings', tabBarIcon: ({ color, size }) => <Ionicons color={color} name="settings-outline" size={size} /> }} />
    </Tabs>
  );
}
