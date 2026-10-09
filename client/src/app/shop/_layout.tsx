import { Redirect, Stack } from 'expo-router';
import { LoadingIndicator } from '@/components/common/LoadingIndicator';
import { useAuth } from '@/features/auth/useAuth';

export default function ShopLayout() {
  const { isLoading, token, user } = useAuth();
  if (isLoading) return <LoadingIndicator />;
  if (!token || !user) return <Redirect href="/(auth)/login" />;
  if (user.role !== 'shop') return <Redirect href="/customer/dashboard" />;
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="product-form" options={{ presentation: 'modal' }} />
    </Stack>
  );
}
