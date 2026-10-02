import { Tabs } from 'expo-router';

export default function AppTabs() {
  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="explore" options={{ title: 'Explore' }} />
      <Tabs.Screen name="customer-dashboard" options={{ href: null }} />
      <Tabs.Screen name="shop-dashboard" options={{ href: null }} />
      <Tabs.Screen name="customer-signup" options={{ href: null }} />
      <Tabs.Screen name="shop-signup" options={{ href: null }} />
      <Tabs.Screen name="product-details" options={{ href: null }} />
      <Tabs.Screen name="cart" options={{ href: null }} />
      <Tabs.Screen name="substitution" options={{ href: null }} />
      <Tabs.Screen name="pickup-time" options={{ href: null }} />
      <Tabs.Screen name="order-tracking" options={{ href: null }} />
      <Tabs.Screen name="customer-settings" options={{ href: null }} />
      <Tabs.Screen name="shop-stock" options={{ href: null }} />
      <Tabs.Screen name="shop-orders" options={{ href: null }} />
    </Tabs>
  );
}
