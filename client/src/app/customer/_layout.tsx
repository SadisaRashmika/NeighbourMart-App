import { Redirect, Stack } from 'expo-router';
import { LoadingIndicator } from '@/components/common/LoadingIndicator';
import { useAuth } from '@/features/auth/useAuth';

export default function CustomerLayout() {
  const { isLoading, token, user } = useAuth();
  if (isLoading) return <LoadingIndicator />;
  if (!token || !user) return <Redirect href="/(auth)/login" />;
  if (user.role !== 'customer') return <Redirect href="/shop/dashboard" />;
  return <Stack screenOptions={{ headerShown: false }} />;
}
