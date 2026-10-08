import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function ShopTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#047857',
        tabBarInactiveTintColor: '#57534E',
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600', marginTop: 1 },
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#D6D3D1',
          borderTopWidth: 1,
          height: 72,
          paddingBottom: 8,
          paddingTop: 8,
        },
      }}
    >
      <Tabs.Screen name="dashboard" options={{ tabBarIcon: ({ color, focused }) => <Ionicons color={color} name={focused ? 'home' : 'home-outline'} size={27} />, title: 'Home' }} />
      <Tabs.Screen name="stock" options={{ tabBarIcon: ({ color, focused }) => <Ionicons color={color} name={focused ? 'clipboard' : 'clipboard-outline'} size={26} />, title: 'Stock' }} />
      <Tabs.Screen name="orders" options={{ tabBarIcon: ({ color, focused }) => <Ionicons color={color} name={focused ? 'receipt' : 'receipt-outline'} size={26} />, title: 'Orders' }} />
      <Tabs.Screen name="settings" options={{ tabBarIcon: ({ color, focused }) => <Ionicons color={color} name={focused ? 'settings' : 'settings-outline'} size={28} />, title: 'Settings' }} />
    </Tabs>
  );
}
